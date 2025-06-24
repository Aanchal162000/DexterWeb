import React, { useEffect } from "react";
import { HiOutlineExternalLink } from "react-icons/hi";

interface EventData {
  genesisId: string;
  name: string;
  symbol: string;
  startsAt: string;
  description: string;
  isVerified: boolean;
  imageUrl: string;
}

interface NotificationDetailsProps {
  eventData: EventData;
  onClose: () => void;
}

const NotificationDetails: React.FC<NotificationDetailsProps> = ({
  eventData,
  onClose,
}) => {
  useEffect(() => {
    console.log("eventData", eventData);
  }, []);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#15181B] border border-primary-100/30 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Agent Details</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <img
            src={eventData.imageUrl}
            alt={eventData.name}
            className="w-20 h-20 rounded-full object-cover border border-primary-100/30"
          />
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Name</span>
              <span className="text-white font-medium">{eventData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Symbol</span>
              <span className="text-white font-medium">{eventData.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Genesis ID</span>
              <span className="text-white font-medium">
                {eventData.genesisId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Starts At</span>
              <span className="text-white font-medium">
                {new Date(eventData.startsAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Verified</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  eventData.isVerified
                    ? "bg-green-600 text-white"
                    : "bg-gray-600 text-white"
                }`}
              >
                {eventData.isVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
          <div className="w-full">
            <span className="text-white/70 text-sm">Description</span>
            <p className="text-white mt-1 text-sm whitespace-pre-line">
              {eventData.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
