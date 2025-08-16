/**
 * Set of tokens that can be bridged between chains
 * @description Token config
 */
export const TOKENS: BridgeToken[] = [
  {
    // name of the token on Aptos
    name: "Hyperion",
    // symbol of the token on Aptos
    symbol: "RION",
    // token info on different chains
    chain: {
      aptos: {
        // address of the token on Aptos
        address:
          "0x435ad41e7b383cef98899c4e5a22c8dc88ab67b22f95e5663d6c6649298c3a9d",
        // address of the oft contract on Aptos
        oftContractAddress:
          "0xa5730bea43e0ab75fd2c2f56b542dd06fbe7d3f80bea1ecaebfa121b06de2c4d",
        // logo of the token
        logo: "https://assets.hyperion.xyz/aptos-token/main/logos/RION.svg",
        // decimals of the token
        decimals: 6,
      },
      bsc: {
        // address of the token on BSC
        address: "0xc0c240c870606a5cb3150795e2d0dfff9f1f7456",
        // decimals of the token
        decimals: 18,
      },
    },
  },
];
