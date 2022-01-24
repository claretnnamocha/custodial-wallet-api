export interface CreateRequest {
  userId: string;
}

export interface GetRequest {
  userId: string;
  walletId: string;
}

export interface Erc20ToEth {
  amount: number;
  userId: string;
  currency: string;
}

export interface SendErc20Token {
  amount: number;
  userId: string;
  to: string;
  chargeFromAmount: boolean;
  currency: string;
}
