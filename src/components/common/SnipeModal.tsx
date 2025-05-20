import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { agentService } from "@/services/contract/agentService";
import { toast } from "react-toastify";
import { useSwapContext } from "@/context/SwapContext";
import approvalService from "@/services/contract/approvalService";
import {
  SnipeContract,
  VIRTUALS_TOKEN_ADDRESS,
  WRAPPED_ETH_ADDRESS,
} from "@/constants/config";
import { useLoginContext } from "@/context/LoginContext";

interface SnipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  genesisId: string;
  name: string;
  walletAddress: string;
}

interface TokenOption {
  name: string;
  symbol: string;
  logo: string;
  balance: string;
}

const SnipeModal: React.FC<SnipeModalProps> = ({
  isOpen,
  onClose,
  genesisId,
  name,
  walletAddress,
}) => {
  const { selectedVitualtoken } = useSwapContext();
  const { balances } = useWalletBalance();
  const [amount, setAmount] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { networkData } = useLoginContext();
  const percentageButtons = [25, 50, 75, 100];

  useEffect(() => {
    setIsButtonDisabled(
      !amount || parseFloat(amount) <= 0 || isLoading || isProcessing
    );
  }, [amount, isLoading, isProcessing]);

  const handlePercentageClick = (percentage: number) => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;
    const balance =
      selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
    const calculatedAmount = (parseFloat(balance || "0") * percentage) / 100;
    setAmount(calculatedAmount.toString());
  };

  const handleSnipe = async () => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;

    try {
      setIsLoading(true);
      setIsProcessing(true);
      toast.info("Starting snipe process...", { autoClose: false });

      const isEth = selectedVitualtoken.symbol === "ETH" ? true : false;

      if (!isEth) {
        try {
          toast.info("Checking token allowance...");
          const allowance = await approvalService.checkAllowance({
            tokenAddress: VIRTUALS_TOKEN_ADDRESS,
            provider: networkData?.provider!,
            spenderAddress: SnipeContract,
          });

          // If allowance is less than amount, approve first
          if (Number(allowance) < Number(amount)) {
            toast.info("Approving token spend...");
            await approvalService.approveVirtualToken(
              amount.toString(),
              networkData?.provider!,
              VIRTUALS_TOKEN_ADDRESS,
              SnipeContract
            );
            toast.success("Token approved successfully!");
          }
        } catch (error: any) {
          toast.error(
            "Failed to approve token: " + (error.message || "Unknown error")
          );
          throw error;
        }
      }

      toast.info("Processing deposit...");
      const receipt = await agentService.deposit({
        tokenAddress: isEth ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS,
        amount: amount,
        provider: networkData?.provider!,
      });
      const amountConverted = (Number(amount) * 10 ** 18).toString();

      toast.info("Creating agent...");
      if (receipt.transactionHash) {
        const response = await agentService.createAgent({
          genesisId,
          name,
          walletAddress,
          token: selectedVitualtoken.symbol === "ETH" ? "eth" : "virtual",
          amount: (Number(amount) * 10 ** 18).toString(),
          launchTime: new Date(),
        });

        if (!response.success) {
          throw new Error(response.message);
        }
        toast.success("Snipe successful! 🎉");
      } else {
        toast.error("Snipe Failed!");
      }

      onClose();
    } catch (error) {
      console.error("Error in snipe:", error);
      toast.error(error instanceof Error ? error.message : "Failed to snipe");
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={isProcessing ? () => {} : onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#15181B] p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  Snipe {name}
                </Dialog.Title>

                <div className="mt-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isLoading || isProcessing}
                      className="w-full px-4 py-3 bg-[#1E2226] border border-primary-100/20 rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter amount"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      <span className="text-primary-100 text-sm">
                        {selectedVitualtoken?.symbol || "VIRT"}
                      </span>
                      <span className="text-gray-400 text-sm">
                        Balance:{" "}
                        {selectedVitualtoken?.symbol === "ETH"
                          ? Number(balances.ETH).toFixed(6)
                          : Number(balances.VIRT).toFixed(6)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {percentageButtons.map((percentage) => (
                      <button
                        key={percentage}
                        onClick={() => handlePercentageClick(percentage)}
                        disabled={isLoading || isProcessing}
                        className="px-4 py-2 bg-primary-100/10 hover:bg-primary-100/20 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSnipe}
                    disabled={isButtonDisabled}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      isButtonDisabled
                        ? "bg-gray-600 text-white cursor-not-allowed"
                        : "bg-primary-100 text-black hover:bg-primary-100/90"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Processing...
                      </div>
                    ) : isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Transaction in Progress...
                      </div>
                    ) : (
                      "Snipe"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SnipeModal;
