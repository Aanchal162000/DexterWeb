import {
  INetworkCard,
  ICoin,
  IArbCoin,
  TRoute,
  IRouter,
} from "@/utils/interface";

export const ERC20ABI = require("./abis/erc20Abi.json");
export const BRIDGEABI = require("./abis/bridgeContract.json");

export const tokenList: ICoin[] = require("./jsons/token_list.json");
export const fiatList = require("./jsons/fiat_list.json");
export const arbitrumList: IArbCoin[] = require("./jsons/arbitrum.json");
export const tokenPriceList = require("./jsons/token_price.json");
export const baseList: IArbCoin[] = require("./jsons/baseList.json");
export const avalancheList = require("./jsons/avalanche.json");
export const optimismList = require("./jsons/optimism.json");

export const socialData = [
  {
    src: "/socials/X.png",
    name: "Twitter",
    url: "https://twitter.com/zkCrossNetwork",
  },
  {
    src: "/socials/Telegram.png",
    name: "Telegram",
    url: "https://t.me/zkCrossNetwork",
  },
  {
    src: "/socials/Medium.png",
    name: "Medium",
    url: "https://zkcrossnetwork.medium.com",
  },
  {
    src: "/socials/LI.png",
    name: "Linkedin",
    url: "https://www.linkedin.com/company/zkcrossnetwork",
  },
  {
    src: "/socials/Discord.png",
    name: "Discord",
    url: "https://discord.zkCross.network",
  },
  {
    src: "/socials/YT.png",
    name: "Youtube",
    url: "https://www.youtube.com/@zkCrossNetwork",
  },
];

export const wallets = [
  {
    name: "Metamask",
    image: "/Metamask.png",
    url: "https://metamask.io/download/",
  },
  {
    name: "Trust Wallet",
    image: "/Trustwallet.png",
    url: "https://trustwallet.com/browser-extension",
  },
  {
    name: "Wallet Connect",
    image: "/Walletconnect.png",
    url: "https://walletconnect.com/",
  },
  {
    name: "Coinbase Wallet",
    image: "/Coinbase.png",
    url: "https://www.coinbase.com/en-gb/wallet/downloads",
  },
];

export const transakCoinMapping: { [key: string]: string } = {
  USDC: "polygon",
  POL: "polygon",
  ETH: "ethereum",
  BNB: "bsc",
};

export const apiUrls = {
  convertApi: "https://api.zkcross.network/api/v1/bridge/conversion",
  estimateApi: "https://api.zkcross.network/api/v1/bridge/arb/estimate",
  swidgeApi: "https://api.zkcross.network/api/v1/bridge/swap",
  transApi: "https://api.zkcross.network/api/v1/bridge/transaction",
  crossApi: "https://api.zkcross.network/api/v1/crossPower/address",
  symbiosisBaseUrl: "https://api.symbiosis.finance/crosschain",
};

export const networkAbb: {
  [key: number]: { code: string; conversionSymbol: string };
} = {
  1: {
    code: "eth",
    conversionSymbol: "eth",
  },
  56: {
    code: "bsc",
    conversionSymbol: "bsc",
  },
  137: {
    code: "poly",
    conversionSymbol: "polygon_pos",
  },
  42161: {
    code: "arb",
    conversionSymbol: "arb",
  },
  8453: {
    code: "base",
    conversionSymbol: "base",
  },
  10: {
    code: "op",
    conversionSymbol: "optimism",
  },
  43114: {
    code: "ava",
    conversionSymbol: "avalanche",
  },
};

export const tokenSymbolList = [
  {
    code: "eth",
    conversionSymbol: "eth",
    fullName: "Ethereum",
    chainId: 1,
  },
  {
    code: "bsc",
    conversionSymbol: "bsc",
    fullName: "Binance Smart Chain",
    chainId: 56,
  },
  {
    code: "poly",
    conversionSymbol: "polygon_pos",
    fullName: "Polygon",
    chainId: 137,
  },
  {
    code: "arb",
    conversionSymbol: "arbitrum",
    fullName: "Arbitrum",
    chainId: 42161,
  },
  {
    code: "op",
    conversionSymbol: "optimism",
    fullName: "Optimism",
    chainId: 10,
  },
  {
    code: "stellar",
    conversionSymbol: "stellar",
    fullName: "Stellar",
    chainId: "stellar",
  },
  {
    code: "base",
    conversionSymbol: "base",
    fullName: "Base",
    chainId: 8453,
  },
  {
    code: "ava",
    conversionSymbol: "avalanche",
    fullName: "Avalanche",
    chainId: 43114,
  },
];

export const coinDbConfig = [
  {
    token: "bnb",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chainId: "bsc",
  },
  {
    token: "eth",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chainId: "eth",
  },
  {
    token: "pol",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    chainId: "polygon_pos",
  },
  {
    token: "usdc",
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    chainId: "polygon_pos",
  },
  {
    token: "usdt",
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    chainId: "polygon_pos",
  },
  {
    token: "wbtc",
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    chainId: "polygon_pos",
  },
  {
    token: "arb",
    address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
    chainId: "eth",
  },
  {
    token: "arb",
    address: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    chainId: "arbitrum",
  },
  {
    token: "eth",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    chainId: "arbitrum",
  },
  {
    token: "dai",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    chainId: "polygon_pos",
  },
  {
    token: "eth",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    chainId: "optimism",
  },
  {
    token: "op",
    address: "0x4200000000000000000000000000000000000042",
    chainId: "optimism",
  },
];

export const extraCoins = [
  {
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    graphAddress: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    name: "Polygon",
    shortName: "MATIC",
    decimals: 18,
    logo: "/coins/MATIC.png",
    isMain: true,
    isStable: false,
    chainId: 137,
    coinId: "matic-network",
    onramper: true,
  },
  {
    address: "0x4200000000000000000000000000000000000042",
    graphAddress: "0x4200000000000000000000000000000000000042",
    name: "Optimism",
    shortName: "OP",
    decimals: 18,
    logo: "/coins/OP.png",
    isMain: false,
    isStable: false,
    chainId: 10,
    coinId: "optimism",
    onramper: false,
    onrapmerId: null,
  },
  {
    address: "native",
    graphAddress: "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA",
    name: "Stellar Lumens",
    shortName: "XLM",
    decimals: 7,
    logo: "/network/Stellar.png",
    isMain: true,
    isStable: false,
    chainId: "stellar",
    coinId: "XLM",
    onramper: false,
    onrapmerId: null,
  },
  {
    address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    graphAddress: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
    name: "USDC",
    shortName: "USDC",
    decimals: 7,
    logo: "https://stellar.myfilebase.com/ipfs/QmNcfZxs8e9uVyhEa3xoPWCsj3ZogGirtixMEC9Km4Fjm2",
    isMain: false,
    isStable: true,
    chainId: "stellar",
    coinId: "USDC",
    onramper: false,
    onrapmerId: null,
  },
];

export const networkCards: INetworkCard[] = [
  // {
  //   name: "Fiat",
  //   status: "active",
  //   image: "/Networks/Fiat.png",
  //   id: "Fiat",
  //   code: "fiat",
  // },
  {
    name: "Ethereum",
    status: "active",
    id: 1,
    image: "/Networks/ETH.png",
    explorer: "https://etherscan.io",
    code: "eth",
  },
  {
    name: "Polygon",
    status: "active",
    id: 137,
    image: "/Networks/Polygon.png",
    explorer: "https://polygonscan.com",
    code: "poly",
  },
  {
    name: "BSC",
    status: "active",
    id: 56,
    image: "/Networks/BSC.png",
    explorer: "https://bscscan.com",
    code: "bsc",
  },
  {
    name: "Base",
    status: "active",
    image: "/Networks/Base.png",
    id: 8453, //0x2105
    explorer: "https://basescan.org",
    code: "base",
  },
  {
    name: "Optimism",
    status: "active",
    image: "/Networks/Optimism.png",
    id: 10, //0xa
    explorer: "https://optimistic.etherscan.io",
    code: "op",
  },
  {
    name: "Avalanche",
    status: "active",
    image: "/Networks/Avalanche.png",
    id: 43114, //0xa86a
    explorer: "https://snowtrace.io",
    code: "ava",
  },
  {
    name: "Arbitrum",
    status: "active",
    image: "/Networks/Arbitrum.png",
    id: 42161, //42161(0xa4b1)
    explorer: "https://arbiscan.io",
    code: "arb",
  },
];

export const chainsLogo: any = {
  137: "/Networks/Polygon.png",
  56: "/Networks/BSC.png",
  1: "/Networks/ETH.png",
  42161: "/Networks/Arbitrum.png",
  10: "/Networks/Optimism.png",
  stellar: "/Networks/Stellar.png",
  43114: "/Networks/Avalanche.png",
  8453: "/Networks/Base.png",
};

export const contractAddress: { [key: string | number]: string } = {
  1: "0xB7C016d5C8c0243e008461e82b2C83682d63Bd57", //eth
  56: "0xEAA25504596fFb6D6bEDfBe9458083323f6F425A", //bnb
  137: "0x44F357E5f021C8061969Aaa69F2d98FBb297EED7", //poly
  42161: "0x8042d3C1e09AAf362bF6930B10c80ac2b0A648B0", //arb
  8453: "0xf8976F4F4F1c047891b994d34d32A3a8974721A9", //base
  10: "0xd385c30e1A47C4ce9385877e7951E98A46264e5F", //op
  43114: "0x6d6e736414a2913e327853F87B5377702a7F9bc6", //ava
};

export const alchemyProviderURL: { [key: string | number]: string } = {
  1: "https://eth-mainnet.g.alchemy.com/v2/N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6", //eth
  56: "https://bnb-mainnet.g.alchemy.com/v2/N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6", //bnb
  137: "https://polygon-mainnet.g.alchemy.com/v2/N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6", //poly
  42161:
    "https://arb-mainnet.g.alchemy.com/v2/N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6", //arb
  8453: "https://base-mainnet.g.alchemy.com/v2/N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6", //base
  10: "https://opt-mainnet.g.alchemy.com/v2/N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6", //op
  43114:
    "https://avax-mainnet.g.alchemy.com/v2/N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6", //ava
};

export const stringAppKeys = {
  title: "Arbitrum zkCrossDEX",
  subTitle: "Start your journey in DeFi with Arbitrum",
  isEVMNetwork: true,
};

export const allTopArbitrum = [
  "USDT",
  "USDC",
  "LINK",
  "UNI",
  "DAI",
  "ARB",
  "MKR",
  "LDO",
  "GRT",
  "GNO",
  "USDD",
  "LPT",
  "TUSD",
  "CRV",
  "COMP",
  "WOO",
  "GMX",
  "FXS",
  "WETH",
  "WBTC",
  "FRAX",
  "LRC",
  "SUSHI",
  "YFI",
  "BAL",
  "MAGIC",
  "COTI",
  "XAI",
  "POND",
  "CTSI",
  "CYBER",
  "CREAM",
  "CELR",
  "CQT",
  "JOE",
  "KNC",
  "LON",
  "SPELL",
  "SYN",
  "GNS",
  "STG",
  "HFT",
  "BNT",
  "DODO",
  "ETH",
];

//Chain info for adding new chain to the wallet
export const chainNetworkParams: { [key: number]: any } = {
  1: {
    chainId: "0x1", // 1 in hexadecimal
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  137: {
    chainId: "0x89", // 137 in hexadecimal
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "POL",
      symbol: "POL",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  56: {
    chainId: "0x38", // 56 in hexadecimal
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  42161: {
    chainId: "0xa4b1", // 42161 in hexadecimal
    chainName: "Arbitrum One",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
};

export const headerRoutes: IRouter[] = [
  {
    id: "trade",
    name: "Trade",
    isActive: true,
  },
  {
    id: "help-center",
    name: "Help Center",
    isActive: true,
  },
] as const;
