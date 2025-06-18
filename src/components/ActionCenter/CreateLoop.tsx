import React, { useState, useRef, useEffect } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { Info } from "lucide-react";
import { actionService } from "../../services/contract/actionService";
import { useActionContext } from "../../context/ActionContext";
import { toastError, toastSuccess } from "../../utils/toast";
import { useSentientVirtuals } from "../../hooks/useSentientVirtuals";
import { usePrototypeVirtuals } from "../../hooks/usePrototypeVirtuals";
import { useTokenPrices } from "../../hooks/useTokenPrices";
import useDebounce from "../../hooks/useDebounce";
import useClickOutside from "../../hooks/useClickOutside";

interface TokenOption {
  name: string;
  symbol: string;
  logo: string;
  balance: string;
}

interface SelectedToken {
  name: string;
  symbol: string;
  logo: string;
  balance: string;
}

interface TokenSelectionOption {
  address: string;
  name: string;
  logo: string;
  symbol: string;
}

function CreateLoop() {
  const { balances, isLoading: isBalanceLoading } = useWalletBalance();
  const { authToken, totalStaked } = useActionContext();
  const { virtuals: sentientVirtuals } = useSentientVirtuals();
  const { virtuals: prototypeVirtuals } = usePrototypeVirtuals();
  const { prices } = useTokenPrices();

  // States for Max Amount section
  const [amount, setAmount] = useState("");

  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const [isRemmCoinOpen, setIsRemmCoinOpen] = useState(false);
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // States for Timeline section
  const [timelineDays, setTimelineDays] = useState(2);

  // States for Token Selection
  const [selectedTokenOptions, setSelectedTokenOptions] = useState<
    TokenSelectionOption[]
  >([]);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);

  // States for Amount Recommendation
  const [recommendedAmount, setRecommendedAmount] = useState("707.55");
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);

  const coinSelectRef = useRef<HTMLDivElement>(null);
  const tokenDropdownRef = useRef<HTMLDivElement>(null);
  const recommendedUnitRef = useRef<HTMLDivElement>(null);

  // Add click outside handlers
  useClickOutside(coinSelectRef, () => setIsFromCoinOpen(false));
  useClickOutside(tokenDropdownRef, () => setIsTokenDropdownOpen(false));
  useClickOutside(recommendedUnitRef, () => setIsRemmCoinOpen(false));

  // Combine all virtuals into token selection options
  const tokenSelectionOptions: TokenSelectionOption[] = [
    ...sentientVirtuals.map((v) => ({
      name: v.name,
      logo: v.image?.url || "/Networks/ETH.png",
      symbol: v.symbol,
      address: v.contractAddress!,
    })),
    ...prototypeVirtuals.map((v) => ({
      name: v.name,
      logo: v.image?.url || "/Networks/ETH.png",
      symbol: v.symbol,
      address: v.contractAddress!,
    })),
  ];

  const tokenOptions: TokenOption[] = [
    {
      name: "Virtuals",
      symbol: "VIRT",
      logo: "https://static.cx.metamask.io/api/v1/tokenIcons/8453/0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b.png",
      balance: balances.VIRT || "0",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      logo: "/Networks/ETH.png",
      balance: balances.ETH || "0",
    },
    {
      name: "Dexter",
      symbol: "DEXTER",
      logo: "/Trade/dexterLogo.png",
      balance: "0",
    },
  ];
  const [selectedVitualtoken, setSelectedVitualtoken] = useState<SelectedToken>(
    tokenOptions[0]
  );
  const [selectedtokenRecommed, setSelectedtokenRecommed] =
    useState<SelectedToken>(tokenOptions[0]);

  // Add effect to update balance when balances are loaded
  useEffect(() => {
    if (!isBalanceLoading) {
      setSelectedtokenRecommed((prev) => ({
        ...prev,
        balance: balances[prev.symbol] || "0",
      }));
    }
  }, [isBalanceLoading, balances]);

  // Debounce the amount value
  const debouncedAmount = useDebounce(amount, 500); // 500ms delay

  // Effect to fetch recommended volume when debounced amount changes
  useEffect(() => {
    const fetchRecommendedVolume = async () => {
      if (!debouncedAmount || isNaN(Number(debouncedAmount)) || !authToken)
        return;

      setIsLoadingRecommended(true);
      try {
        const response = await actionService.getRecommendedVolume({
          timelineDays: timelineDays,
          tokenCount: selectedTokenOptions.length,
        });
        console.log("Response", response);

        if (response.success) {
          setRecommendedAmount(
            response.data.calculations.baseRecommendedVolumeVIRTUAL.toFixed(4)
          );
        }
      } catch (error) {
        console.error("Error fetching recommended volume:", error);
        toastError("Failed to fetch recommended volume");
      } finally {
        setIsLoadingRecommended(false);
      }
    };

    fetchRecommendedVolume();
  }, [debouncedAmount, timelineDays, selectedTokenOptions.length, authToken]);

  const handleTokenSelect = (token: TokenOption) => {
    setSelectedVitualtoken(token);
    setIsFromCoinOpen(false);
  };

  const handleRemmTokenSelect = (token: TokenOption) => {
    setSelectedtokenRecommed(token);
    setIsRemmCoinOpen(false);
  };

  const formatNumberWithCommas = (num: number | string) => {
    return Number(num).toLocaleString();
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(60, Number(e.target.value)));
    setTimelineDays(value);
  };

  const handleTimelineSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTimelineDays(Number(e.target.value));
  };

  // Set default amount when component mounts or virtual price changes
  useEffect(() => {
    if (prices?.BASE?.virtual) {
      const defaultAmount = (59.313 / prices.BASE.virtual).toFixed(6);
      setAmount(defaultAmount);
    }
  }, [prices?.BASE?.virtual]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleCreateLoop = async () => {
    if (!amount || !recommendedAmount) {
      toastError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);

    try {
      if (!authToken) {
        toastError("Please authenticate first");
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      // Prepare the request data
      const startLoopRequest = {
        tokenList: selectedTokenOptions.map((token) => ({
          address: token.address,
          name: token.name,
          imageUrl: token.logo,
        })),
        maxVolumeInVirtual: amount,
        recommendedVolumeInVirtual: recommendedAmount,
        timelineDays: timelineDays,
      };

      console.log("Creating loop with:", startLoopRequest);

      const response = await actionService.startLoop(
        startLoopRequest,
        authToken
      );

      if (response.success) {
        toastSuccess("Loop created successfully!");
        // Reset form or redirect as needed
        setAmount("");
        setRecommendedAmount("0.0");
        setTimelineDays(2);
      } else {
        toastError(response.message || "Failed to create loop");
      }
    } catch (error: any) {
      console.error("Error creating loop:", error);
      toastError("Failed to create loop. Please try again.");
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-primary-100/40 via-20% via-transparent to-transparent rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-teal-300/50">
        <h2 className="sm:text-base text-sm font-semibold text-primary-100">
          Max Volume
        </h2>
        <button className="opacity-80 text-gray-500 text-sm">Reset</button>
      </div>

      {/* Max Amount Section - Keep existing */}
      <div className="px-8 py-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Max Volume
        </label>
        <div className="relative items-center justify-center">
          <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
            <div className="relative w-full flex flex-row items-center justify-between">
              <input
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                disabled={isLoading || isProcessing}
                className="py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter amount"
                type="text"
                inputMode="decimal"
              />
              <button
                className="flex items-center gap-2"
                onClick={() => setIsFromCoinOpen((prev) => !prev)}
              >
                {selectedVitualtoken?.logo && (
                  <img
                    src={selectedVitualtoken.logo}
                    alt={selectedVitualtoken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-primary-100 text-sm">
                  {selectedVitualtoken?.symbol || "VIRT"}
                </span>
                <button className="text-primary-100 hover:text-primary-100/80 transition-colors">
                  <TiArrowSortedDown className="size-5" />
                </button>
              </button>
            </div>
          </div>
          {/* Token Selector Dropdown */}
          {isFromCoinOpen && (
            <div
              ref={coinSelectRef}
              className="absolute z-[100] right-0  mt-2 w-48 overflow-auto border border-primary-100/20 backdrop-blur-sm bg-black/40 drop-shadow-lg rounded shadow-lg max-h-[200px]"
              style={{ top: "100%" }}
            >
              <div className="py-1">
                {tokenOptions.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    disabled={token.symbol === "DEXTER" || isBalanceLoading}
                    className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex border-b last:border-b-0 border-primary-100/20 items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-gray-400">
                        Balance:{" "}
                        {isBalanceLoading ? (
                          <div className="inline-block animate-spin rounded-full h-2 w-2 border-b-2 border-gray-400"></div>
                        ) : (
                          Number(token.balance).toFixed(6)
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="py-2 flex justify-between gap-2 text-xs">
          <p className="text-gray-400 mb-1">
            Total Staked: ${formatNumberWithCommas(totalStaked)}
          </p>
          <p className="text-primary-100 hover:text-primary-100/80 cursor-pointer animate-blinker">
            Stake <span className="text-white"> $59,313</span> more to maximize
            Points earnings
          </p>
        </div>
      </div>
      <div className="flex items-start justify-between gap-5 flex-nowrap px-8">
        {/* Timeline Section */}
        <div className="flex flex-col w-full">
          <label
            htmlFor="timeline"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Timeline (Days)
          </label>
          <div className="relative items-center justify-center">
            <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
              <div className="relative w-full flex flex-row items-center justify-between">
                <input
                  id="timeline"
                  type="number"
                  min="1"
                  max="60"
                  value={timelineDays}
                  onChange={handleTimelineChange}
                  disabled={isLoading || isProcessing}
                  className="py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter days"
                />
                <span className="text-primary-100 text-sm">days</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2.5 my-1.5">
            <input
              type="range"
              min="1"
              max="60"
              value={timelineDays}
              onChange={handleTimelineSliderChange}
              className="w-full h-[1px] bg-primary-100/80 rounded-lg appearance-none cursor-pointer slider z-10"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            {[1, 10, 20, 30, 40, 50, 60].map((i, index) => (
              <span className="relative before:content-[''] before:w-[1px] before:h-[4px] before:bg-primary-100/80 before:rounded-full before:absolute before:top-[-4px] before:-translate-y-1/2 before:left-1/2">
                {i}
              </span>
            ))}
          </div>
        </div>

        {/* Token Selection */}
        <div className="flex flex-col w-full">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Selection
          </label>
          <div className="relative">
            <button
              onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
              className="w-full border border-primary-100/70 rounded px-4 py-3 bg-transparent text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-nowrap w-full pr-12">
                {selectedTokenOptions.length > 0 ? (
                  <>
                    <div className="flex items-center gap-1 bg-primary-100/10 rounded-full px-2 py-1 flex-shrink-0">
                      <img
                        src={selectedTokenOptions[0].logo}
                        alt={selectedTokenOptions[0].symbol}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs whitespace-nowrap">
                        {selectedTokenOptions[0].symbol}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTokenOptions((prev) =>
                            prev.filter(
                              (t) => t.symbol !== selectedTokenOptions[0].symbol
                            )
                          );
                        }}
                        className="text-primary-100 hover:text-primary-100/80 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                    {selectedTokenOptions.length > 1 && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        +{selectedTokenOptions.length - 1} more
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-primary-100/20 flex items-center justify-center flex-shrink-0"></div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      Select Token
                    </span>
                  </>
                )}
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <TiArrowSortedDown className="size-5 text-primary-100" />
              </div>
            </button>
            {isTokenDropdownOpen && (
              <div
                ref={tokenDropdownRef}
                className="absolute z-[100] w-full mt-1 border border-primary-100/20 backdrop-blur-sm bg-black/40 drop-shadow-lg rounded shadow-lg max-h-[300px] overflow-y-auto"
              >
                <div className="py-1">
                  {tokenSelectionOptions.map((option) => {
                    const isSelected = selectedTokenOptions.some(
                      (token) => token.symbol === option.symbol
                    );
                    return (
                      <button
                        key={option.name}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTokenOptions((prev) =>
                              prev.filter(
                                (token) => token.symbol !== option.symbol
                              )
                            );
                          } else {
                            setSelectedTokenOptions((prev) => [
                              ...prev,
                              option,
                            ]);
                          }
                        }}
                        className={`w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 border-b last:border-b-0 border-primary-100/20 flex items-center gap-2 ${
                          isSelected ? "bg-primary-100/20" : ""
                        }`}
                      >
                        <img
                          src={option.logo}
                          alt={option.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{option.symbol}</span>
                        {isSelected && (
                          <span className="ml-auto text-primary-100">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amount Recommendation */}
      <div className="px-8 py-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount Recommendation
        </label>
        <div className="relative items-center justify-center">
          <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
            <div className="relative w-full flex flex-row items-center justify-between">
              <input
                value={
                  isLoadingRecommended ? "Calculating..." : recommendedAmount
                }
                onChange={(e) => setRecommendedAmount(e.target.value)}
                disabled={isLoading || isProcessing || isLoadingRecommended}
                className="py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter amount"
              />
              <button
                className="flex items-center gap-2"
                onClick={() => setIsRemmCoinOpen((prev) => !prev)}
              >
                {selectedtokenRecommed?.logo && (
                  <img
                    src={selectedtokenRecommed.logo}
                    alt={selectedtokenRecommed.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-primary-100 text-sm">
                  {selectedtokenRecommed?.symbol || "VIRT"}
                </span>
                <button className="text-primary-100 hover:text-primary-100/80 transition-colors">
                  <TiArrowSortedDown className="size-5" />
                </button>
              </button>
            </div>
          </div>
          {/* Token Selector Dropdown */}
          {isRemmCoinOpen && (
            <div
              ref={recommendedUnitRef}
              className="absolute z-[100] right-0  mt-2 w-48 overflow-auto border border-primary-100/20 backdrop-blur-sm bg-black/40 drop-shadow-lg rounded shadow-lg max-h-[200px]"
              style={{ bottom: "100%" }}
            >
              <div className="py-1">
                {tokenOptions.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleRemmTokenSelect(token)}
                    disabled={token.symbol === "DEXTER" || isBalanceLoading}
                    className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex border-b last:border-b-0 border-primary-100/20 items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      className="w-6 h-6 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {token.symbol}
                      </span>
                      <span className="text-xs text-gray-400">
                        Balance:{" "}
                        {isBalanceLoading ? (
                          <div className="inline-block animate-spin rounded-full h-2 w-2 border-b-2 border-gray-400"></div>
                        ) : (
                          Number(token.balance).toFixed(6)
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          {isBalanceLoading ? (
            <div className="inline-block animate-spin rounded-full h-2 w-2 border-b-2 border-gray-400"></div>
          ) : (
            `Available: ${Number(selectedtokenRecommed.balance).toFixed(6)}`
          )}
        </div>
      </div>

      {/* Create Loop Button */}
      <div className="px-8 pt-4 pb-3">
        <button
          onClick={handleCreateLoop}
          disabled={
            isLoading ||
            isProcessing ||
            !amount ||
            selectedTokenOptions.length === 0 ||
            Number(amount) > Number(selectedVitualtoken.balance)
          }
          className="w-full bg-primary-100 hover:bg-primary-100/80 disabled:bg-primary-100/50 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading || isProcessing
            ? "Processing..."
            : !amount
            ? "Enter Amount"
            : selectedTokenOptions.length === 0
            ? "Select Token"
            : Number(amount) > Number(selectedVitualtoken.balance)
            ? "Insufficient Balance"
            : "Create Loop"}
        </button>
      </div>

      {/* Footer Note */}
      <div className="px-8 pb-4">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <Info className="size-4" /> Each swap includes a 1% Virtuals tax,
          0.1%–5% slippage, and a 0.3% Dexter execution fee.
        </div>
      </div>
    </div>
  );
}

export default CreateLoop;
