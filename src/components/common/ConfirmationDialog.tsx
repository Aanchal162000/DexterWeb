import React from "react";
import DialogContainer from "../Swap/DialogContainer";
import { FaArrowRight } from "react-icons/fa6";
import { IVirtual } from "@/utils/interface";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  fromAmount?: number;
  toAmount?: number;
  fromToken?: IVirtual;
  toToken?: IVirtual;
  fromNetwork?: {
    name: string;
  };
  toNetwork?: {
    name: string;
  };
  transactionType?: "Cross-Chain Swap" | "On-Chain Swap";
  estimatedTime?: string;
  transactionFees?: {
    amount: number;
    token: string;
  };
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  fromAmount,
  toAmount,
  fromToken,
  toToken,
  fromNetwork,
  toNetwork,
  transactionType,
  estimatedTime,
  transactionFees,
}) => {
  if (!isOpen) return null;

  return (
    <DialogContainer setClose={onClose} title={title}>
      <div className="size-full flex flex-col z-10 px-5 gap-3 py-5">
        {fromToken && toToken && (
          <div className="w-[100%] px-[5%] pt-2 pb-4 flex flex-row items-center justify-evenly rounded text-white">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <img
                  src={fromToken.image.url}
                  alt="coin-logo"
                  className="w-7 h-7 object-contain rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-sm leading-none">{fromToken.symbol}</p>
                  {fromNetwork && (
                    <caption className="text-[0.625rem]">
                      {fromNetwork.name}
                    </caption>
                  )}
                </div>
              </div>
              {fromAmount && (
                <p className="text-sm text-center">
                  {fromAmount} {fromToken.symbol}
                </p>
              )}
            </div>
            <FaArrowRight />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <img
                  src={toToken.image.url}
                  alt="coin-logo"
                  className="w-7 h-7 object-contain rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-sm leading-none">{toToken.symbol}</p>
                  {toNetwork && (
                    <caption className="text-[0.625rem]">
                      {toNetwork.name}
                    </caption>
                  )}
                </div>
              </div>
              {toAmount && (
                <p className="text-sm text-center">
                  {toAmount} {toToken.symbol}
                </p>
              )}
            </div>
          </div>
        )}

        {transactionType && (
          <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
            <div className="opacity-60">Type</div>
            <div>{transactionType}</div>
          </div>
        )}

        {transactionFees && (
          <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
            <div className="opacity-60">Transaction Fees</div>
            <div>
              {transactionFees.amount.toFixed(
                transactionFees.amount > 0.0001 ? 4 : 6
              )}{" "}
              {transactionFees.token}
            </div>
          </div>
        )}

        {estimatedTime && (
          <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
            <div className="opacity-60">Estimated Time</div>
            <div>{estimatedTime}</div>
          </div>
        )}

        <div className="w-full mt-4 flex gap-3 items-center justify-center">
          <button
            className="flex-1 py-2 px-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white"
            onClick={onClose}
          >
            {cancelButtonText}
          </button>
          <button
            className="flex-1 py-2 px-4 bg-primary-100 text-black rounded-lg hover:brightness-125 transition-all"
            onClick={onConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </DialogContainer>
  );
};

export default ConfirmationDialog;
