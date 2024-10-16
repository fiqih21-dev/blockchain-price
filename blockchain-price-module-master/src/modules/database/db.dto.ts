export interface IPrice {
  _id: string;
  network: string;
  tokenName: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: string;
  price: string;
}

export interface IAlert {
  _id: string;
  chain: string;
  dollar: string;
  email: string;
}
