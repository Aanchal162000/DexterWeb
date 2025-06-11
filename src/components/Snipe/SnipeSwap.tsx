import React, { useState, useEffect } from "react";
import { IVirtual } from "@/utils/interface";
import { useLoginContext } from "@/context/LoginContext";

import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "react-toastify";
import DialogContainer from "../Swap/DialogContainer";
import VirtualTokenSelector from "./VirtualTokenSelector";
import SwapSection from "./SwapSection";
import ConfirmationDialog from "../common/ConfirmationDialog";
import SnipeStatus from "./SnipeStatus";
import { networkCards } from "@/constants/config";

import { TRXService } from "@/services/transaction";
import useEffectAsync from "@/hooks/useEffectAsync";
import approvalService from "@/services/contract/approvalService";
import { ethers } from "ethers";
import { toastError, toastSuccess } from "@/utils/toast";

interface SnipeSwapProps {
  virtuals: IVirtual[];
  prototypeVirtuals: IVirtual[];
  loading: boolean;
  prototypeLoading: boolean;
  resetCount: number;
}

const SnipeSwap: React.FC<SnipeSwapProps> = ({
  virtuals,
  prototypeVirtuals,
  loading,
  prototypeLoading,
  resetCount,
}) => {
  const { networkData, triggerAPIs, address } = useLoginContext();
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const [isToCoinOpen, setIsToCoinOpen] = useState(false);
  const [fromAmount, setFromAmount] = useState<number | string>(0);
  const [toAmount, setToAmount] = useState<number | string>(0);
  const [buttonText, setButtonText] = useState<string>("Select Token");
  const [isConfirmPop, setIsConfirmPop] = useState<boolean>(false);
  const [isFinalStep, setIsFinalStep] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isConvert, setIsConvert] = useState<boolean>(false);
  const [isTokenRelease, setIsTokenRelease] = useState<boolean>(false);
  const [errored, setErrored] = useState<boolean>(false);
  const [approvalHash, setApprovalHash] = useState<string | null>(null);
  const [swapHash, setSwapHash] = useState<string | null>(null);
  const [releaseHash, setReleaseHash] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  const {
    balances,
    isLoading: balanceLoading,
    refetch: refetchBalances,
  } = useWalletBalance();

  const [selectedVirtual, setSelectedVirtual] = useState<IVirtual | null>(null);
  const [selectedToVirtual, setSelectedToVirtual] = useState<IVirtual | null>(
    null
  );

  useEffect(() => {
    if (virtuals.length) {
      setSelectedVirtual(virtuals[0]);
      setSelectedToVirtual(virtuals[1]);
    }
  }, []);

  useEffectAsync(async () => {
    if (selectedVirtual || selectedToVirtual) {
      setIsBalanceLoading(true);
      try {
        if (selectedVirtual) {
          const value = await approvalService.balanceOf({
            tokenAddress: selectedVirtual.contractAddress!,
            provider: networkData?.provider!,
          });
          selectedVirtual.userBalance = Number(value);
        }
        if (selectedToVirtual) {
          const value = await approvalService.balanceOf({
            tokenAddress: selectedToVirtual.contractAddress!,
            provider: networkData?.provider!,
          });
          selectedToVirtual.userBalance = Number(value);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setIsBalanceLoading(false);
      }
    }
  }, [selectedVirtual?.symbol, selectedToVirtual?.symbol]);

  const handleSwap = async () => {
    setIsFinalStep(true);
    if (!address || balanceLoading || !selectedVirtual || !selectedToVirtual) {
      toastError("Please connect your wallet and select a token");
      return;
    }

    if (
      !fromAmount ||
      !toAmount ||
      isNaN(Number(fromAmount)) ||
      isNaN(Number(toAmount))
    ) {
      toastError("Invalid amount values");
      return;
    }

    try {
      setIsConfirmPop(true);
      setIsFinalStep(true);
      setErrored(false);

      const trxService = TRXService.getInstance();
      const Provider = networkData?.provider as ethers.providers.Web3Provider;
      const signer = await Provider.getSigner(address!);
      setIsConvert(true);

      // Convert to wei without scientific notation
      const amountInWei = BigInt(
        Math.floor(Number(fromAmount) * 10 ** 18)
      ).toString();

      const result = await trxService.executeSwapTransaction(
        networkData?.chainId?.toString() || "1",
        amountInWei,
        selectedVirtual.contractAddress!,
        selectedToVirtual.contractAddress!,
        "0.5",
        address,
        signer!
      );

      if (result.success) {
        setIsTokenRelease(true);
        setReleaseHash(result?.chainTxInfo?.transactionHash!);
        setSwapHash(result?.chainTxInfo?.transactionHash!);
        triggerAPIs();
        toastSuccess("Swap transaction successful!");
        await refetchBalances();
      } else {
        throw new Error("Swap failed. Please try again.");
      }
    } catch (error) {
      console.error("Swap error:", error);
      toastError("Swap failed. Please try again.");
      setIsFinalStep(false);
      setIsTokenRelease(false);
      setIsConvert(false);
      setErrored(true);
    }
  };

  const resetSwapStates = () => {
    setFromAmount(0);
    setToAmount(0);
    setIsFinalStep(false);
    setIsApproved(false);
    setIsConvert(false);
    setIsTokenRelease(false);
    setErrored(false);
    setSelectedVirtual(null);
    setSelectedToVirtual(null);
    setSelectedPercentage(null);
    setSwapHash(null);
  };

  useEffect(() => {
    resetSwapStates();
  }, [resetCount]);

  const swapFields = () => {
    const tempFrom = selectedVirtual;
    const tempTo = selectedToVirtual;
    setSelectedVirtual(tempTo);
    setSelectedToVirtual(tempFrom);
  };

  const validationCheck = () => {
    if (loading) {
      setButtonText("Loading...");
    } else if (!selectedVirtual || !selectedToVirtual) {
      setButtonText("Select Token");
    } else if (fromAmount == 0 || toAmount == 0) {
      setButtonText("Enter Amount");
    } else {
      setButtonText("Trade");
    }
  };

  useEffect(() => {
    validationCheck();
  }, [selectedVirtual, selectedToVirtual, fromAmount, toAmount, loading]);

  useEffect(() => {
    if (selectedVirtual?.symbol == "ETH") {
      setIsApproved(true);
    } else {
      setIsApproved(false);
    }
  }, [selectedVirtual]);

  return (
    <div className="w-full h-full">
      <SwapSection
        selectedVirtual={selectedVirtual}
        selectedToVirtual={selectedToVirtual}
        fromAmount={fromAmount}
        toAmount={toAmount}
        setIsFromCoinOpen={setIsFromCoinOpen}
        setIsToCoinOpen={setIsToCoinOpen}
        setFromAmount={setFromAmount}
        setToAmount={setToAmount}
        swapFields={swapFields}
        buttonText={buttonText}
        setIsConfirmPop={setIsConfirmPop}
        isBalanceLoading={isBalanceLoading}
        resetSwapStates={resetSwapStates}
        selectedPercentage={selectedPercentage}
        setSelectedPercentage={setSelectedPercentage}
      />

      {isFromCoinOpen && (
        <DialogContainer
          setClose={() => setIsFromCoinOpen(false)}
          title="Select Token"
        >
          <VirtualTokenSelector
            setIsCoinOpen={setIsFromCoinOpen}
            fromOrTo="FromSelection"
            setSelectedCoin={setSelectedVirtual}
            title="Send From"
            sentientVirtuals={virtuals}
            prototypeVirtuals={prototypeVirtuals}
            sentientLoading={loading}
            prototypeLoading={prototypeLoading}
          />
        </DialogContainer>
      )}

      {isToCoinOpen && (
        <DialogContainer
          setClose={() => setIsToCoinOpen(false)}
          title="Select Token"
        >
          <VirtualTokenSelector
            setIsCoinOpen={setIsToCoinOpen}
            fromOrTo="ToSelection"
            setSelectedCoin={setSelectedToVirtual}
            title="Receive As"
            sentientVirtuals={virtuals}
            prototypeVirtuals={prototypeVirtuals}
            sentientLoading={loading}
            prototypeLoading={prototypeLoading}
          />
        </DialogContainer>
      )}

      {isConfirmPop && (
        <DialogContainer
          setClose={() => {
            setIsConfirmPop(false);
            if (isApproved) {
              setIsFinalStep(false);
              resetSwapStates();
            }
          }}
          confirmClose={isApproved && isTokenRelease}
          title={
            errored
              ? "Transaction Failed"
              : !isApproved
              ? "Transaction Approval"
              : isConvert
              ? isTokenRelease
                ? "Transaction Completed"
                : "Transaction In Progress"
              : "Transaction Confirmation"
          }
        >
          <ConfirmationDialog
            selectedCoin={selectedVirtual!}
            selectedNetwork={networkCards[3]}
            fromAmount={fromAmount.toString()}
            toAmount={toAmount.toString()}
            selectedToCoin={selectedToVirtual!}
            selectedToNetwork={networkCards[3]}
            isApproved={selectedVirtual?.symbol == "ETH" ? true : isApproved}
            continueTransaction={handleSwap}
            isConvert={isConvert}
            isSwapped={isTokenRelease}
            isTokenRelease={isTokenRelease}
            setIsFinalStep={setIsFinalStep}
            resetSwapStates={resetSwapStates}
            setIsApproved={setIsApproved}
            walletAddress={address!}
            signer={networkData?.provider.getSigner()!}
            setIsConfirmPop={setIsConfirmPop}
            approvalHash={approvalHash}
            swapHash={swapHash}
            setApprovalHash={setApprovalHash}
            setSwapHash={setSwapHash}
            releaseHash={releaseHash}
            setReleaseHash={setReleaseHash}
          />
        </DialogContainer>
      )}

      {isFinalStep && (
        <DialogContainer
          setClose={() => {
            setIsConfirmPop(false);
            setIsFinalStep(false);
            resetSwapStates();
          }}
          title={
            errored
              ? "Transaction Failed"
              : isConvert && (!isApproved || !isTokenRelease)
              ? "Transaction in Progress"
              : "Transaction Completed"
          }
          confirmClose={isConvert && (!isApproved || !isTokenRelease)}
        >
          <SnipeStatus
            selectedCoin={selectedVirtual!}
            selectedNetwork={networkCards[3]}
            fromAmount={fromAmount.toString()}
            toAmount={toAmount.toString()}
            selectedToCoin={selectedToVirtual!}
            selectedToNetwork={networkCards[3]}
            isApproved={isApproved}
            continueTransaction={handleSwap}
            isConvert={isConvert}
            isSwapped={isTokenRelease}
            isTokenRelease={isTokenRelease}
            setIsFinalStep={setIsFinalStep}
            resetSwapStates={resetSwapStates}
            setIsApproved={setIsApproved}
            walletAddress={address!}
            signer={networkData?.provider.getSigner()!}
            setIsConfirmPop={setIsConfirmPop}
            approvalHash={approvalHash}
            swapHash={swapHash}
            setApprovalHash={setApprovalHash}
            setSwapHash={setSwapHash}
            releaseHash={releaseHash}
            setReleaseHash={setReleaseHash}
          />
        </DialogContainer>
      )}
    </div>
  );
};

export default SnipeSwap;
