import React from "react";
import { HiOutlineExternalLink } from "react-icons/hi";

interface EventData {
  agentId: string;
  agentName: string;
  genesisId: string;
  tokenAddress: string;
  txHash: string;
  blockNumber: number;
  userAmount: string;
  userMarketCap: string;
  virtualPrice: string;
}

interface NotificationDetailsProps {
  eventData: EventData;
  onClose: () => void;
}

const NotificationDetails: React.FC<NotificationDetailsProps> = ({
  eventData,
  onClose,
}) => {
  const formatAmount = (amount: string) => {
    return parseFloat(amount) / 1e18;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#15181B] border border-primary-100/30 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Event Details</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm">Agent Name</p>
              <p className="text-white">{eventData.agentName}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Agent ID</p>
              <p className="text-white">{eventData.agentId}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Genesis ID</p>
              <p className="text-white">{eventData.genesisId}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Block Number</p>
              <p className="text-white">{eventData.blockNumber}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">User Amount</p>
              <p className="text-white">{formatAmount(eventData.userAmount)}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Market Cap</p>
              <p className="text-white">
                ${parseFloat(eventData.userMarketCap).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Virtual Price</p>
              <p className="text-white">
                {parseFloat(eventData.virtualPrice).toFixed(6)}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-white/70 text-sm">Token Address</p>
            <div className="flex items-center space-x-2">
              <p className="text-white text-sm break-all">
                {eventData.tokenAddress}
              </p>
              <button
                onClick={() =>
                  window.open(
                    `https://basescan.org/address/${eventData.tokenAddress}`,
                    "_blank"
                  )
                }
                className="text-primary-100 hover:text-primary-100/80"
              >
                <HiOutlineExternalLink size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-white/70 text-sm">Transaction Hash</p>
            <div className="flex items-center space-x-2">
              <p className="text-white text-sm break-all">{eventData.txHash}</p>
              <button
                onClick={() =>
                  window.open(
                    `https://basescan.org/tx/${eventData.txHash}`,
                    "_blank"
                  )
                }
                className="text-primary-100 hover:text-primary-100/80"
              >
                <HiOutlineExternalLink size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
