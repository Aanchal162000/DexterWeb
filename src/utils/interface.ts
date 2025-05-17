import { headerRoutes } from "@/constants/config";
import { ethers } from "ethers";
import {
  OnLoadingComplete,
  PlaceholderValue,
} from "next/dist/shared/lib/get-img-props";

export type TWalletsList = "metamask" | "trust" | "coinbase" | "walletConnect";

export interface IWalletProp {
  [x: string]: any;
}

export type TCustomImageProp = Omit<
  React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >,
  "height" | "width" | "loading" | "ref" | "alt" | "src" | "srcSet"
> & {
  src: string;
  alt: string;
  width?: number | `${number}` | undefined;
  height?: number | `${number}` | undefined;
  fill?: boolean | undefined;
  loader?: undefined;
  quality?: number | `${number}` | undefined;
  priority?: boolean | undefined;
  loading?: "eager" | "lazy" | undefined;
  placeholder?: PlaceholderValue | undefined;
  blurDataURL?: string | undefined;
  unoptimized?: boolean | undefined;
  overrideSrc?: string | undefined;
  onLoadingComplete?: OnLoadingComplete | undefined;
  layout?: string | undefined;
  objectFit?: string | undefined;
  objectPosition?: string | undefined;
  lazyBoundary?: string | undefined;
  lazyRoot?: string | undefined;
  isBg?: boolean;
  fullRadius?: boolean;
} & React.RefAttributes<HTMLImageElement | null>;

export type ICoin = {
  address?: string;
  graphAddress?: string;
  name: string;
  shortName: string;
  decimals?: number;
  logo: string;
  isMain?: boolean;
  isStable?: boolean;
  chainId?: number;
  coinId: string;
  onramper?: boolean;
  onrapmerId?: string;
  coingeckoId?: string;
};

export type ICoinNetwork = {
  logo: string;
  title: string;
  explorer: string;
  id: number | string;
  wallets: IWallet[];
};

export interface INetworkData {
  account: string;
  provider: ethers.providers.Web3Provider;
  chainId: string | number;
}

export interface IWallet {
  logo: string;
  title: string;
  url?: undefined;
}

export interface ITokenData {
  approvedAmount: number | bigint;
  balance: number | bigint;
}
export interface ISwapData {
  selectedFromToken: ICoin;
  selectedToToken: ICoin;
  tx: ITaxsationData;
  fromAmount: string;
  toAmount: string;
}

export interface ITaxsationData {
  to: string;
  data: string;
  gasLimit: number;
  gasPrice: any;
  value: string;
}

export interface INetworkCard {
  name: string;
  status: "active" | "inactive" | "coming-soon";
  image: string;
  id: number | string;
  explorer?: string;
  code: string;
}

export type IDialogToast = {
  heading: string;
  info: string;
  content: string;
};

export type IArbCoin = Omit<
  ICoin,
  "isMain" | "isStable" | "onramper" | "onrapmerId" | "graphAddress"
> & {
  coingeckoId?: string;
  aggregators?: string;
  storage?: any;
  iconUrlThumbnail: string;
};

interface IMetaSignature {
  code: number;
  message: string;
}

export class MetaSignatureError {
  code: number;
  message: string;

  constructor(data: IMetaSignature) {
    this.code = data.code;
    this.message = data.message;
  }
}

export interface IResponseHistoryData {
  historyTransactionCount: number;
  historyTransactions: IResponseTransactionData[];
}

export interface IResponseTransactionData {
  _id: string;
  lockId: string;
  fromNetwork: string;
  toNetwork: string;
  user: string;
  fromToken: string;
  toToken: string;
  lockHash: string;
  processed: boolean;
  blockNumber: string;
  transactionIndex: number;
  logIndex: number;
  timestamp: number;
  retries: number;
  lockAmount: string;
  createdAt: string;
  updatedAt: string;
  txNumber: number;
  __v: number;
  releaseAmount?: string;
  releaseHash?: string;
  srcToken: string;
  gasAmount: string;
  srcAmount: string;
}
export interface ITransactionData {
  fromNetwork: string;
  toNetwork: string;
  fromToken: string;
  toToken: string;
  srcAmount: string;
  releaseAmount?: string;
  srcToken: string;
  lockHash: string;
  processed: boolean;
  releaseHash?: string;
  imgFromToken: string;
  imgToToken: string;
  imgFromNetwork: string;
  imgToNetwork: string;
  date: string;
  ago: string;
  type: string;
  dateShort: string;
  fromAddress?: string;
  toAddress?: string;
  swapAmount?: string;
  hash?: string;
}
export interface IResponseAssets {
  tokenAddress: string;
  name: string;
  symbol: string;
  logo: string;
  thumbnail: string;
  decimals: number;
  balance: string;
  possibleSpam: boolean;
  verifiedContract: boolean;
  usdPrice: number;
  usdPrice24hrPercentChange: number;
  usdPrice24hrUsdChange: number;
  usdValue24hrUsdChange: number;
  usdValue: number;
  portfolioPercentage: number;
  balanceFormatted: string;
  nativeToken: boolean;
  chainSymbol: string;
  chainName: string;
}

export interface IResponseCoinDiff {
  address: string;
  chainId: string;
  difference: number;
  percentageDifference: number;
}
export interface IAssetsData {
  tokenAmount: any;
  usdAmount: string | number;
  perUsd: string | number;
  difference: string;
  percentageDifference: string;
  network: any;
  token: any;
  imgToken: any;
  imgNetwork: string;
}

export type TRoute = "Trade" | "Snipe" | "Alerts" | "DCA" | "Support";

export interface IRouter {
  id: string;
  name: TRoute;
  isActive: boolean;
}

export type IRouterKey = (typeof headerRoutes)[number]["id"];

export interface ISymbiosisSwapResponse {
  tx: {
    data: string;
    to: string;
    value: string;
    chainId: number;
  };
  approveTo: string;
  fee: string;
  amountOut: string;
  amountOutMin: string;
}
