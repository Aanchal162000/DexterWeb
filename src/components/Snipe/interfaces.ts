import { IVirtual } from "@/utils/interface";

export interface SnipeSwapProps {
  virtuals: IVirtual[];
  prototypeVirtuals: IVirtual[];
  loading: boolean;
  prototypeLoading: boolean;
}

export interface SwapSectionProps {
  selectedVirtual: IVirtual | null;
  selectedToVirtual: IVirtual | null;
  fromAmount: number;
  toAmount: number;
  setIsFromCoinOpen: (value: boolean) => void;
  setIsToCoinOpen: (value: boolean) => void;
  setFromAmount: (value: number) => void;
  setToAmount: (value: number) => void;
  swapFields: () => void;
  buttonText: string;
  setIsConfirmPop: (value: boolean) => void;
  isBalanceLoading: boolean;
}

export interface VirtualTokenSelectorProps {
  setIsCoinOpen: (value: boolean) => void;
  fromOrTo: "FromSelection" | "ToSelection";
  setSelectedCoin: (coin: IVirtual) => void;
  title: string;
  sentientVirtuals: IVirtual[];
  prototypeVirtuals: IVirtual[];
  sentientLoading: boolean;
  prototypeLoading: boolean;
}

export interface AgentSectionProps {
  title: string;
  type: "genesis" | "prototype" | "sentient";
  data: any[];
  loading: boolean;
  error: string | null;
  subscriptionData?: any[];
  fetchSubscriptionData?: () => void;
  renderItem: (item: any) => React.ReactNode;
}
