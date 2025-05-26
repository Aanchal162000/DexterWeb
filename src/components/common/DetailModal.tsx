import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IVirtual, IGenesis } from "@/utils/interface";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  FaExternalLinkAlt,
  FaTwitter,
  FaTelegram,
  FaGlobe,
} from "react-icons/fa";

import {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
} from "@/utils/tokenCalculations";
import { BsCopy } from "react-icons/bs";
import { toast } from "react-toastify";
import { useTokenMetrics } from "@/hooks/useTokenMetrics";
import Link from "next/link";

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

const isGenesis = (data: IVirtual | IGenesis): data is IGenesis => {
  return "virtual" in data;
};

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  const genesisData = isGenesis(data) ? data : undefined;
  const virtualData = isGenesis(data) ? data.virtual : data;
  const metrics = useTokenMetrics(virtualData, genesisData);

  const renderLinks = () => {
    const links = [];
    links.push(
      <Link
        key="Link"
        href={`https://app.virtuals.io/${
          type == "virtual" ? "virtuals" : "geneses"
        }/${type == "virtual" ? genesisData?.id : virtualData.id}`}
        rel="noopener noreferrer"
        target="_blank"
        className="flex items-center ml-2 gap-2 text-primary-100 hover:text-cyan-500 transition-colors"
      >
        Virtual Profile
      </Link>
    );
    if (type === "virtual" && "socials" in data) {
      const socials = data.socials?.VERIFIED_LINKS;
      if (socials?.WEBSITE) {
        links.push(
          <a
            key="website"
            href={socials.WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary-100 hover:text-cyan-500 transition-colors"
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
            className="flex items-center gap-2 text-primary-100 hover:text-cyan-500 transition-colors"
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 py-4">
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
              <Dialog.Panel className="w-full max-w-2xl sm:h-[80vh] h-[90vh] transform overflow-hidden rounded-2xl bg-[#15181B] p-6 text-left align-middle shadow-xl transition-all overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    {virtualData.name} Details
                  </Dialog.Title>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent text-primary-100 px-4 py-2 text-sm font-medium  hover:text-primary-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    X
                  </button>
                </div>

                <div className="mt-2 space-y-6">
                  {/* Token Image and Basic Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-500/30">
                      <Image
                        src={virtualData.image?.url || "/placeholder.png"}
                        alt={virtualData.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-white">
                        {virtualData.name}
                      </h4>
                      <p className="text-gray-400">{virtualData.symbol}</p>
                      {virtualData.contractAddress && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-400">
                            {virtualData.contractAddress}
                          </span>
                          <BsCopy
                            className="w-4 h-4 cursor-pointer text-white hover:text-cyan-500"
                            onClick={() =>
                              copyToClipboard(virtualData.contractAddress || "")
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Token Information */}
                  <div className="bg-[#1A1E23] rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-primary-100 mb-4">
                      Token Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Token Price</p>
                        <p className="text-white">
                          {data?.price
                            ? "$" +
                              data?.price!?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 5,
                              })
                            : "0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Market Cap</p>
                        <p className="text-white">
                          {formatCurrency(metrics.fdvUSD)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">FDV</p>
                        <p className="text-white">
                          {formatCurrency(metrics.fdvUSD)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">TVL</p>
                        <p className="text-white">
                          {formatCurrency(metrics.tvlUSD)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">24h Change</p>
                        <p
                          className={`${
                            metrics.priceChange24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {formatPercentage(metrics.priceChange24h)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">24h Volume</p>
                        <p className="text-white">
                          {formatCurrency(metrics.volume24hUSD)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Holders</p>
                        <p className="text-white">
                          {formatLargeNumber(metrics.holders)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {virtualData.description && (
                    <div className="bg-[#1A1E23] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-primary-100 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-300">{virtualData.description}</p>
                    </div>
                  )}

                  {/* Genesis Info */}
                  {genesisData && (
                    <div className="bg-[#1A1E23] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-primary-100 mb-4">
                        Genesis Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Start Date</p>
                          <p className="text-white">
                            {new Date(
                              genesisData.startsAt
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatDistanceToNow(
                              new Date(genesisData.startsAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">End Date</p>
                          <p className="text-white">
                            {new Date(genesisData.endsAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(genesisData.endsAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">
                            Total Participants
                          </p>
                          <p className="text-white">
                            {formatLargeNumber(genesisData.totalParticipants)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Status</p>
                          <p
                            className={`text-white ${
                              genesisData.status === "ACTIVE"
                                ? "text-green-500"
                                : genesisData.status === "ENDED"
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {genesisData.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">
                            Genesis Address
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm truncate">
                              {genesisData.genesisAddress}
                            </p>
                            <BsCopy
                              className="w-4 h-4 cursor-pointer hover:text-cyan-500"
                              onClick={() =>
                                copyToClipboard(genesisData.genesisAddress)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Points</p>
                          <p className="text-white">
                            {formatLargeNumber(genesisData.totalPoints)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Social Links */}
                <div className="flex flex-wrap gap-4 mt-2">{renderLinks()}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DetailModal;
