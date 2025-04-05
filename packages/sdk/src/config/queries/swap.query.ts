import { gql } from "graphql-request";

export const QuerySwapAmount = gql`
  query querySwapAmount(
    $from: String = ""
    $to: String = ""
    $amount: String = ""
    $flag: String = ""
  ) {
    api {
      getSwapInfo(from: $from, to: $to, amount: $amount, flag: $flag) {
        amountOut
        amountIn
        path
      }
    }
  }
`;
