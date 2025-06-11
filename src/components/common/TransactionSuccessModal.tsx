import React from "react";
import { toastSuccess } from "@/utils/toast";
import CopyTooltip from "./CopyTooltip";

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionHash: string;
  explorerUrl: string;
  title?: string;
  message?: string;
}

const TransactionSuccessModal: React.FC<TransactionSuccessModalProps> = ({
  isOpen,
  onClose,
  transactionHash,
  explorerUrl,
  title = "Transaction Successful",
  message = "Your transaction has been completed successfully!",
}) => {
  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(transactionHash);
    toastSuccess("Transaction Hash Copied");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[95%] max-w-md rounded-xl bg-primary-100/10 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/20 p-4">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-white/80">{message}</p>

          {/* Transaction Hash */}
          <div className="rounded-lg bg-white/5 p-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-white/60">Transaction Hash</span>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">
                  {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                </span>
                <div className="flex items-center gap-2">
                  <CopyTooltip onClick={handleCopyHash} />
                  <a
                    href={`${explorerUrl}/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary-100 hover:text-primary-200 transition-colors"
                  >
                    View
                    <img
                      src="/trx/Explore.png"
                      alt="explorer"
                      className="h-3 w-3"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-2 w-full rounded-md bg-primary-100 py-2 text-white transition-colors hover:bg-primary-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccessModal;
