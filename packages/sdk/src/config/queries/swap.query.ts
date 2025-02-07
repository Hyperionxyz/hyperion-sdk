import { gql } from "graphql-request";

export const QuerySwapAmount = gql`
  query querySwapAmount(
    $amountIn: String = ""
    $from: String = ""
    $to: String = ""
  ) {
    api {
      getSwapInfo(amountIn: $amountIn, from: $from, to: $to) {
        amountOut
        path
      }
    }
  }
`;
