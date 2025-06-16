import React, { useState, useRef } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { Info } from "lucide-react";

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

function CreateLoop() {
    const { balances, isLoading: isBalanceLoading } = useWalletBalance();

    // States for Max Amount section
    const [amount, setAmount] = useState("");
    const [selectedVitualtoken, setSelectedVitualtoken] = useState<SelectedToken>({
        name: "Virtuals",
        symbol: "VIRT",
        logo: "https://static.cx.metamask.io/api/v1/tokenIcons/8453/0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b.png",
        balance: "0",
    });
    const [selectedtokenRecommed, setSelectedtokenRecommed] = useState<SelectedToken>({
        name: "Virtuals",
        symbol: "VIRT",
        logo: "https://static.cx.metamask.io/api/v1/tokenIcons/8453/0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b.png",
        balance: "0",
    });
    const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
    const [isRemmCoinOpen, setIsRemmCoinOpen] = useState(false);
    const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // States for Timeline section
    const [timelineDays, setTimelineDays] = useState(2);

    // States for Token Selection
    const [selectedTokenOption, setSelectedTokenOption] = useState("WAI Combinator (WAI)");
    const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);

    // States for Amount Recommendation
    const [recommendedAmount, setRecommendedAmount] = useState("707.55");

    const coinSelectRef = useRef<HTMLDivElement>(null);
    const tokenDropdownRef = useRef<HTMLDivElement>(null);
    const recommendedUnitRef = useRef<HTMLDivElement>(null);

    const tokenSelectionOptions = ["WAI Combinator (WAI)", "Other Token"];

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

    const handleTokenSelect = (token: TokenOption) => {
        setSelectedVitualtoken(token);
        setIsFromCoinOpen(false);
    };

    const handleRemmTokenSelect = (token: TokenOption) => {
        setSelectedtokenRecommed(token);
        setIsRemmCoinOpen(false);
    };

    const handlePercentageClick = (percentage: number) => {
        setSelectedPercentage(percentage);
        const balance = selectedVitualtoken?.symbol === "ETH" ? balances.ETH : balances.VIRT;
        const calculatedAmount = (Number(balance) * percentage) / 100;
        setAmount(calculatedAmount.toString());
    };

    const formatNumberWithCommas = (num: number | string) => {
        return Number(num).toLocaleString();
    };

    const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(1, Math.min(60, Number(e.target.value)));
        setTimelineDays(value);
    };

    const handleTimelineSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTimelineDays(Number(e.target.value));
    };

    const handleCreateLoop = () => {
        console.log("Creating loop with:", {
            amount,
            selectedToken: selectedVitualtoken,
            timeline: timelineDays,
            tokenSelection: selectedTokenOption,
            recommendedAmount,
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-gradient-to-br from-primary-100/40 via-20% via-transparent to-transparent rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-teal-300/50">
                <h2 className="sm:text-base text-sm font-semibold text-primary-100">Max Volume</h2>
                <button className="opacity-80 text-xs">Reset</button>
            </div>

            {/* Max Amount Section - Keep existing */}
            <div className="px-8 py-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Max Volume
                </label>
                <div className="relative items-center justify-center">
                    <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
                        <div className="relative w-full flex flex-row items-center justify-between">
                            <input
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={isLoading || isProcessing}
                                className=" py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter amount"
                            />
                            <button className="flex items-center gap-2" onClick={() => setIsFromCoinOpen((prev) => !prev)}>
                                {selectedVitualtoken?.logo && <img src={selectedVitualtoken.logo} alt={selectedVitualtoken.symbol} className="w-6 h-6 rounded-full" />}
                                <span className="text-primary-100 text-sm">{selectedVitualtoken?.symbol || "VIRT"}</span>
                                <button className="text-primary-100 hover:text-primary-100/80 transition-colors">
                                    <TiArrowSortedDown className="size-5" />
                                </button>
                            </button>
                        </div>
                    </div>
                    {/* Token Selector Dropdown */}
                    {isFromCoinOpen && (
                        <div ref={coinSelectRef} className="absolute z-[100] right-0  mt-2 w-48 overflow-auto border border-primary-100/20 backdrop-blur-sm bg-black/40 drop-shadow-lg rounded shadow-lg max-h-[200px]" style={{ top: "100%" }}>
                            <div className="py-1">
                                {tokenOptions.map((token) => (
                                    <button
                                        key={token.symbol}
                                        onClick={() => handleTokenSelect(token)}
                                        disabled={token.symbol === "DEXTER" || isBalanceLoading}
                                        className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex border-b last:border-b-0 border-primary-100/20 items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{token.symbol}</span>
                                            <span className="text-xs text-gray-400">
                                                Balance: {isBalanceLoading ? <div className="inline-block animate-spin rounded-full h-2 w-2 border-b-2 border-gray-400"></div> : Number(token.balance).toFixed(6)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="py-2 flex justify-between gap-2 text-xs">
                    <p className="text-gray-400 mb-1">Total Staked: $80,687</p>
                    <p className="text-primary-100 hover:text-primary-100/80 cursor-pointer">Stake <span className="text-white"> $59,313</span> more to maximize Points earnings</p>
                </div>
            </div>
            <div className="flex items-start justify-between gap-5 flex-nowrap px-8">
                {/* Timeline Section */}
                <div className="flex flex-col w-full">
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-2">
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
                        <input type="range" min="1" max="60" value={timelineDays} onChange={handleTimelineSliderChange} className="w-full h-[1px] bg-primary-100/80 rounded-lg appearance-none cursor-pointer slider z-10" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                        {[1, 10, 20, 30, 40, 50, 60].map((i, index) => (
                            <span className="relative before:content-[''] before:w-[1px] before:h-[4px] before:bg-primary-100/80 before:rounded-full before:absolute before:top-[-4px] before:-translate-y-1/2 before:left-1/2">{i}</span>
                        ))}
                    </div>
                </div>

                {/* Token Selection */}
                <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Selection</label>
                    <div className="relative">
                        <button onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)} className="w-full border border-primary-100/70 rounded px-4 py-3 bg-transparent text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold">WAI</div>
                                <span className="text-xs">{selectedTokenOption}</span>
                            </div>
                            <TiArrowSortedDown className="size-5 text-primary-100" />
                        </button>
                        {isTokenDropdownOpen && (
                            <div ref={tokenDropdownRef} className="absolute z-[100] w-full mt-2 border border-primary-100/20 backdrop-blur-sm bg-black/40 drop-shadow-lg rounded shadow-lg">
                                <div className="py-1">
                                    {tokenSelectionOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setSelectedTokenOption(option);
                                                setIsTokenDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 border-b last:border-b-0 border-primary-100/20"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Amount Recommendation */}
            <div className="px-8 py-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount Recommendation</label>
                <div className="relative items-center justify-center">
                    <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
                        <div className="relative w-full flex flex-row items-center justify-between">
                            <input
                                value={recommendedAmount}
                                onChange={(e) => setRecommendedAmount(e.target.value)}
                                disabled={isLoading || isProcessing}
                                className="py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Enter amount"
                            />
                            <button className="flex items-center gap-2" onClick={() => setIsRemmCoinOpen((prev) => !prev)}>
                                {selectedtokenRecommed?.logo && <img src={selectedtokenRecommed.logo} alt={selectedtokenRecommed.symbol} className="w-6 h-6 rounded-full" />}
                                <span className="text-primary-100 text-sm">{selectedtokenRecommed?.symbol || "VIRT"}</span>
                                <button className="text-primary-100 hover:text-primary-100/80 transition-colors">
                                    <TiArrowSortedDown className="size-5" />
                                </button>
                            </button>
                        </div>
                    </div>
                    {/* Token Selector Dropdown */}
                    {isRemmCoinOpen && (
                        <div ref={recommendedUnitRef} className="absolute z-[100] right-0  mt-2 w-48 overflow-auto border border-primary-100/20 backdrop-blur-sm bg-black/40 drop-shadow-lg rounded shadow-lg max-h-[200px]" style={{ bottom: "100%" }}>
                            <div className="py-1">
                                {tokenOptions.map((token) => (
                                    <button
                                        key={token.symbol}
                                        onClick={() => handleRemmTokenSelect(token)}
                                        disabled={token.symbol === "DEXTER" || isBalanceLoading}
                                        className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex border-b last:border-b-0 border-primary-100/20 items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{token.symbol}</span>
                                            <span className="text-xs text-gray-400">
                                                Balance: {isBalanceLoading ? <div className="inline-block animate-spin rounded-full h-2 w-2 border-b-2 border-gray-400"></div> : Number(token.balance).toFixed(6)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="text-gray-400 text-xs mt-1">Available: 20,657.24 – 64,993.34</div>
            </div>

            {/* Create Loop Button */}
            <div className="px-8 pt-4 pb-3">
                <button
                    onClick={handleCreateLoop}
                    disabled={isLoading || isProcessing}
                    className="w-full bg-primary-100 hover:bg-primary-100/80 disabled:bg-primary-100/50 text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                    Create Loop
                </button>
            </div>

            {/* Footer Note */}
            <div className="px-8 pb-4">
                <div className="text-xs text-gray-400 flex items-center gap-2">
                    <Info className="size-4" /> Each swap includes a 1% Virtuals tax, 0.1%–5% slippage, and a 0.3% Dexter execution fee.
                </div>
            </div>
        </div>
    );
}

export default CreateLoop;
