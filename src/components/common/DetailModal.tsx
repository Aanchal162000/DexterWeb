import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IGenesis, IVirtual } from "@/utils/interface";
import Image from "next/image";
import {
  FaExternalLinkAlt,
  FaTwitter,
  FaTelegram,
  FaGlobe,
} from "react-icons/fa";
import { BsCopy } from "react-icons/bs";
import { toast } from "react-toastify";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IGenesis | IVirtual;
  type: "genesis" | "virtual";
}

interface DisplayData {
  name: string;
  symbol: string;
  description: string;
  image?: {
    url: string;
  };
  contractAddress?: string;
  startsAt?: string;
  endsAt?: string;
  price?: number;
  maxSubscribers?: number;
  subscribers?: number;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const renderLinks = () => {
    const links = [];
    if (type === "virtual" && "socials" in data) {
      const socials = data.socials?.VERIFIED_LINKS;
      if (socials?.WEBSITE) {
        links.push(
          <a
            key="website"
            href={socials.WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-cyan-500 transition-colors"
          >
            <FaGlobe className="w-4 h-4" />
            <span>Website</span>
          </a>
        );
      }
      if (socials?.TWITTER) {
        links.push(
          <a
            key="twitter"
            href={socials.TWITTER}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-cyan-500 transition-colors"
          >
            <FaTwitter className="w-4 h-4" />
            <span>Twitter</span>
          </a>
        );
      }
    }
    return links;
  };

  const getDisplayData = (): DisplayData => {
    if (type === "genesis") {
      const genesis = data as IGenesis;
      return {
        name: genesis.virtual.name,
        symbol: genesis.virtual.symbol,
        description: genesis.virtual.description,
        image: genesis.virtual.image,
        contractAddress: genesis.genesisAddress,
        startsAt: genesis.startsAt,
        endsAt: genesis.endsAt,
      };
    } else {
      const virtual = data as IVirtual;
      return {
        name: virtual.name,
        symbol: virtual.symbol,
        description: virtual.description,
        image: virtual.image,
        contractAddress: virtual.contractAddress,
        price: virtual.price,
        maxSubscribers: virtual.maxSubscribers,
        subscribers: virtual.subscribers,
      };
    }
  };

  const displayData = getDisplayData();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-primary-100/10 border border-cyan-500/30 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-white"
                  >
                    {type === "genesis" ? "Genesis Details" : "Virtual Details"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500/30">
                      <Image
                        src={displayData.image?.url || "/placeholder.png"}
                        alt={displayData.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-white">
                          {displayData.name}
                        </h4>
                        <span className="text-sm text-gray-400">
                          ${displayData.symbol}
                        </span>
                        <FaExternalLinkAlt className="w-4 h-4 text-gray-400 cursor-pointer hover:text-cyan-500" />
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {displayData.description}
                      </p>
                    </div>
                  </div>

                  {/* Contract Address */}
                  <div className="bg-[#2A2A2A] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        Contract Address
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">
                          {displayData.contractAddress?.slice(0, 6)}...
                          {displayData.contractAddress?.slice(-4)}
                        </span>
                        <BsCopy
                          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-cyan-500"
                          onClick={() =>
                            copyToClipboard(displayData.contractAddress || "")
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-4">
                    {type === "genesis" &&
                      displayData.startsAt &&
                      displayData.endsAt && (
                        <>
                          <div className="bg-[#2A2A2A] rounded-lg p-4">
                            <span className="text-sm text-gray-400">
                              Start Date
                            </span>
                            <p className="text-sm text-white mt-1">
                              {new Date(displayData.startsAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-[#2A2A2A] rounded-lg p-4">
                            <span className="text-sm text-gray-400">
                              End Date
                            </span>
                            <p className="text-sm text-white mt-1">
                              {new Date(displayData.endsAt).toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    {type === "virtual" && displayData.price !== undefined && (
                      <>
                        <div className="bg-[#2A2A2A] rounded-lg p-4">
                          <span className="text-sm text-gray-400">Price</span>
                          <p className="text-sm text-white mt-1">
                            {displayData.price} DEX
                          </p>
                        </div>
                        {displayData.maxSubscribers !== undefined &&
                          displayData.subscribers !== undefined && (
                            <div className="bg-[#2A2A2A] rounded-lg p-4">
                              <span className="text-sm text-gray-400">
                                Available Slots
                              </span>
                              <p className="text-sm text-white mt-1">
                                {displayData.maxSubscribers -
                                  displayData.subscribers}{" "}
                                remaining
                              </p>
                            </div>
                          )}
                      </>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex flex-wrap gap-4">{renderLinks()}</div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DetailModal;
