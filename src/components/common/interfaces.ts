import { Dispatch, SetStateAction } from "react";
import { Signer } from "ethers";
import { INetworkCard, IVirtual } from "@/utils/interface";

export interface ConfirmationDialogProps {
  setIsConfirmPop: Dispatch<SetStateAction<boolean>>;
  selectedCoin: IVirtual;
  fromAmount: string;
  selectedToCoin: IVirtual;
  selectedToNetwork: INetworkCard;
  selectedNetwork: INetworkCard;
  isConvert: boolean;
  isApproved: boolean;
  isSwapped: boolean;
  isTokenRelease: boolean;
  setIsFinalStep: Dispatch<SetStateAction<boolean>>;
  resetSwapStates: () => void;
  walletAddress: string;
  signer: Signer;
  setIsApproved: Dispatch<SetStateAction<boolean>>;
  continueTransaction: () => void;
  toAmount: string;
  approvalHash: string | null;
  setApprovalHash: Dispatch<SetStateAction<string | null>>;
  swapHash: string | null;
  setSwapHash: Dispatch<SetStateAction<string | null>>;
  releaseHash: string | null;
  setReleaseHash: Dispatch<SetStateAction<string | null>>;
}
