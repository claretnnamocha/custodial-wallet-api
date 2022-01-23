export interface CreateRequest {
  userId: string;
}

export interface GetRequest {
  userId: string;
  walletId: string;
}

export interface Transfer {
  userId: string;
  to: string;
  amount: number;
  currency: string;
}

export interface Erc20ToEth {
  amount: number;
  userId: string;
  currency: string;
}
