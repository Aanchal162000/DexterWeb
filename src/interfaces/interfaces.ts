import {
  OnLoadingComplete,
  PlaceholderValue,
} from "next/dist/shared/lib/get-img-props";
import { ethers } from "ethers";

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

export interface INetworkCard {
  name: string;
  status: "active" | "inactive" | "coming-soon";
  image: string;
  id: number | string;
  explorer?: string;
  code: string;
}
export type Tabs = "Trade" | "Alerts" | "Support" | "DCA" | "Snipe";
export interface INetworkData {
  account: string;
  provider: ethers.providers.Web3Provider;
  chainId: string | number;
}
