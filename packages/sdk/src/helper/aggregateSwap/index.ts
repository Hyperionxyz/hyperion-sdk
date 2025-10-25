import {
  AptosScriptComposer,
  CallArgument,
} from "@aptos-labs/script-composer-sdk";
import { HyperionSDK, SDKOptions } from "../../";
import { AggregateSwapInfoResult } from "./type";
import {
  addressToObject,
  amountFA,
  depositExactFA,
  depositFA,
  extractFA,
  faAmountCheck,
  faSplitProportionally,
  getSender,
  mergeFA,
  withdrawFA,
  zeroFA,
} from "./utils";
import { cellanaSwap } from "./dex/cellana";
import { hyperionSwapFAToFA } from "./dex/hyperion";
import {
  thalaSwapExactInMeta,
  thalaSwapExactInStable,
  thalaSwapExactInWeighted,
} from "./dex/thalaswapV2";
import { emojiSwap } from "./dex/emoji";

export interface AggregateSwapRouteArgs {
  amount: string;
  from: string;
  input: string;
  slippage: string;
  to: string;
}

/**
 * Compose with Hyperion
 * @param builder The builder of the transaction
 * @param route The route of the swap
 * @param tokenIn The input token
 * @param sender The sender of the transaction
 * @param options The options of the SDK
 * @param partnershipId The partnership ID, only work on MAINNET
 * @returns The output token
 */
async function composeWithHyperion(
  builder: AptosScriptComposer,
  route: any,
  tokenIn: CallArgument,
  sender: CallArgument,
  options: SDKOptions,
  partnershipId?: string
): Promise<CallArgument> {
  let tokenOut: CallArgument;
  tokenOut = await hyperionSwapFAToFA(
    builder,
    sender.copy(),
    route.poolId,
    route.a2b,
    true,
    tokenIn,
    route.sqrtPriceLimit,
    options,
    partnershipId
  );

  return tokenOut;
}

/**
 * Compose with Cellana
 * @param builder The builder of the transaction
 * @param route The route of the swap
 * @param assetIn The input token
 * @returns The output token
 */
async function composeWithCellana(
  builder: AptosScriptComposer,
  route: any,
  assetIn: CallArgument
): Promise<CallArgument> {
  let isStable;
  if (route.poolType == "stable") {
    isStable = true;
  } else if (route.poolType == "unstable") {
    isStable = false;
  } else {
    throw "pool type mismatch";
  }

  let ret = await cellanaSwap(
    builder,
    assetIn,
    route.toToken.tokenType,
    isStable
  );
  return ret;
}

async function composeWithThalaSwapV2(
  builder: AptosScriptComposer,
  route: any,
  tokenIn: CallArgument
): Promise<CallArgument> {
  let tokenOut: CallArgument;

  if (route.poolType == "stable") {
    tokenOut = await thalaSwapExactInStable(
      builder,
      route.poolId,
      tokenIn,
      route.toToken.tokenType
    );
  } else if (route.poolType == "weighted") {
    tokenOut = await thalaSwapExactInWeighted(
      builder,
      route.poolId,
      tokenIn,
      route.toToken.tokenType
    );
  } else if (route.poolType == "meta") {
    tokenOut = await thalaSwapExactInMeta(
      builder,
      route.poolId,
      tokenIn,
      route.toToken.tokenType
    );
  } else {
    throw "type mismatch";
  }
  return tokenOut;
}

async function composeWithEmojiCoin(
  builder: AptosScriptComposer,
  route: any,
  tokenIn: CallArgument
): Promise<CallArgument> {
  let tokenOut = await emojiSwap(
    builder,
    route.firstType,
    route.secondType,
    tokenIn,
    route.poolId,
    route.isSell,
    route.integrator,
    route.integratorFee
  );

  return tokenOut;
}

async function compose(
  builder: AptosScriptComposer,
  route: any,
  tokenIn: CallArgument,
  sender: CallArgument,
  options: SDKOptions,
  partnershipId?: string
): Promise<CallArgument> {
  let ret;

  if (route.dexName == "Hyperion") {
    ret = await composeWithHyperion(
      builder,
      route,
      tokenIn,
      sender.copy(),
      options,
      partnershipId
    );
  } else if (route.dexName == "Cellana") {
    ret = await composeWithCellana(builder, route, tokenIn);
  } else if (route.dexName == "ThalaSwapV2") {
    ret = await composeWithThalaSwapV2(builder, route, tokenIn);
  } else if (route.dexName == "EmojiCoin") {
    ret = await composeWithEmojiCoin(builder, route, tokenIn);
  } else {
    throw "Dex Not Supported";
  }
  return ret;
}

async function bigRouteCompose(
  builder: AptosScriptComposer,
  routes: any,
  tokenIn: CallArgument,
  sender: CallArgument,
  options: SDKOptions,
  partnershipId?: string
): Promise<CallArgument> {
  // [[], [], []]
  for (const singlePair of routes) {
    let tokenOut: CallArgument;
    tokenOut = await zeroFA(builder, singlePair.toToken.tokenType);
    let ret = await compose(
      builder,
      singlePair,
      tokenIn,
      sender.copy(),
      options,
      partnershipId
    );
    await mergeFA(builder, tokenOut, ret);
    tokenIn = tokenOut;
  }
  return tokenIn;
}

export class AggregateSwapHelper {
  protected _sdk: HyperionSDK;

  constructor(sdk: HyperionSDK) {
    this._sdk = sdk;
  }

  /**
   * Fetch the aggregate swap route
   * @param args AggregateSwapRouteArgs
   * @param args.amount The amount of the input token
   * @param args.from The address of the input token
   * @param args.input The address of the input token, either equals to args.from or args.to
   * @param args.slippage The slippage tolerance
   * @param args.to The address of the output token
   * @returns
   */
  public async fetchAggregateSwapRoute(
    args: AggregateSwapRouteArgs
  ): Promise<AggregateSwapInfoResult> {
    // Build the query params
    const queryParams = new URLSearchParams({
      slippage: args.slippage.toString(),
      amount: args.amount.toString(),
      from: args.from,
      input: args.input,
      to: args.to,
    });

    // Fetch the aggregate swap route
    const ret = await fetch(
      `${this._sdk.sdkOptions.hyperionAPIHost}/base/aggregator/getAggRoute?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the request is successful
    if (!ret.ok) {
      throw new Error(
        `Failed to fetch aggregate swap route: ${ret.statusText}`
      );
    }

    // Return the response body
    return (await ret.json()) as AggregateSwapInfoResult;
  }

  /**
   * Generate the aggregate swap transaction script
   * @param args AggregateSwapInfoResult & { builder: AptosScriptComposer; partnershipId?: string }
   * @param args.builder The builder of the transaction
   * @param args.partnershipId The partnership ID, only work on MAINNET
   * @returns The transaction script
   */
  async generateAggregateSwapTransactionScript(
    args: AggregateSwapInfoResult & {
      builder: AptosScriptComposer;
      partnershipId?: string;
    }
  ) {
    const { builder } = args;
    let sender = await getSender(builder);
    let amountIn: number;
    if (args.exactIn) {
      amountIn = Number(args.fromTokenAmount);
    } else {
      amountIn = Number(args.maxFromTokenAmount);
    }

    let amountInArg: CallArgument;
    let tokenIn: CallArgument;

    let metadata = await addressToObject(
      builder,
      "0x1::fungible_asset::Metadata",
      args.fromToken.address
    );
    tokenIn = await withdrawFA(builder, metadata, amountIn);
    amountInArg = await amountFA(builder, tokenIn);

    const tokenOut = await zeroFA(builder, args.toToken.address);
    for (const route of args.quotes.route as any[]) {
      let routeTokenIn: CallArgument;
      routeTokenIn = await extractFA(builder, tokenIn, route.amountIn);

      let ret = await bigRouteCompose(
        builder,
        route.routeTaken,
        routeTokenIn,
        sender.copy(),
        this._sdk.sdkOptions,
        args.partnershipId
      );
      // merge token together
      await mergeFA(builder, tokenOut, ret);
      // console.log("aaaaa");
    }

    if (args.exactIn) {
      await faAmountCheck(builder, tokenOut, Number(args.minToTokenAmount));
      await depositFA(builder, sender.copy(), tokenOut);

      await depositFA(builder, sender.copy(), tokenIn);
    } else {
      let percentage = 0;
      await faAmountCheck(builder, tokenOut, Number(args.toTokenAmount));
      await depositExactFA(
        builder,
        sender.copy(),
        tokenOut,
        Number(args.toTokenAmount)
      );

      let tokenInRefund: CallArgument;
      tokenInRefund = await zeroFA(builder, args.fromToken.address);
      amountInArg = await amountFA(builder, tokenOut);
      for (const route of args.quotes.refundRoute as any[]) {
        let routeTokenIn: CallArgument;
        let percentageIn = route.percentage;
        percentage += percentageIn;
        if (percentage == 100) percentageIn = 100;
        routeTokenIn = await faSplitProportionally(
          builder,
          tokenOut,
          amountInArg.copy(),
          percentageIn
        );

        let ret = await bigRouteCompose(
          builder,
          route.routeTaken,
          routeTokenIn,
          sender.copy(),
          this._sdk.sdkOptions,
          args.partnershipId
        );
        await mergeFA(builder, tokenInRefund, ret);
      }
      await depositFA(builder, sender.copy(), tokenOut);
      await depositFA(builder, sender.copy(), tokenIn);
      await depositFA(builder, sender.copy(), tokenInRefund);
      if (percentage != 100) throw "not 100% refund";
    }
  }
}
