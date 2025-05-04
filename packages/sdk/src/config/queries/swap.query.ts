import { gql } from "graphql-request";

export const QuerySwapAmount = gql`
  query querySwapAmount(
    $from: String = ""
    $to: String = ""
    $amount: String = ""
    $flag: String = ""
    $safeMode: Boolean = true
  ) {
    api {
      getSwapInfo(
        from: $from
        to: $to
        amount: $amount
        flag: $flag
        safeMode: $safeMode
      ) {
        amountOut
        amountIn
        path
      }
    }
  }
`;
