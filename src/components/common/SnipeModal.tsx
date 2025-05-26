import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { agentService } from "@/services/contract/agentService";
import { toast } from "react-toastify";
import { useSwapContext } from "@/context/SwapContext";
import approvalService from "@/services/contract/approvalService";
import { SnipeContract, VIRTUALS_TOKEN_ADDRESS, WRAPPED_ETH_ADDRESS } from "@/constants/config";
import { useLoginContext } from "@/context/LoginContext";
import { TiArrowSortedDown } from "react-icons/ti";
import SliderHandler from "./Slider";
import { addCommas } from "@/utils/helper";

interface SnipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    genesisId: string;
    name: string;
    walletAddress: string;
    endsAt: string;
    fetchSubscriptionData: () => Promise<void>;
}

interface TokenOption {
    name: string;
    symbol: string;
    logo: string;
    balance: string;
}

const SnipeModal: React.FC<SnipeModalProps> = ({ isOpen, onClose, genesisId, name, walletAddress, endsAt, fetchSubscriptionData }) => {
    const { selectedVitualtoken, setSelctedVirtualToken } = useSwapContext();
    const { balances } = useWalletBalance();
    const balance = selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
    const calculatedAmount = (parseFloat(balance || "0") * 10) / 100;

    const [amount, setAmount] = useState(calculatedAmount.toFixed(4).toString());
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { networkData } = useLoginContext();
    const percentageButtons = [10, 25, 50, 100];
    const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
    const [marketCapBuyRange, setMarketCapBuyRange] = useState(1500000);

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
    ];

    const handleTokenSelect = (token: TokenOption) => {
        setSelctedVirtualToken(token);
        setIsFromCoinOpen(false);
        // Reset amount when token changes
        setAmount("");
    };
    useEffect(() => {
        handlePercentageClick(10);
    }, [balances]);

    useEffect(() => {
        setIsButtonDisabled(!amount || parseFloat(amount) <= 0 || isLoading || isProcessing);
    }, [amount, isLoading, isProcessing]);

    const handlePercentageClick = (percentage: number) => {
        if (!selectedVitualtoken || isLoading || isProcessing) return;
        const balance = selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
        const calculatedAmount = (parseFloat(balance || "0") * percentage) / 100;
        setAmount(calculatedAmount.toFixed(4).toString());
    };

    const handleSnipe = async () => {
        if (!selectedVitualtoken || isLoading || isProcessing) return;

        let approveToastId: string | number | null = null;
        let processToastId: string | number | null = null;

        try {
            setIsLoading(true);
            setIsProcessing(true);
            processToastId = toast.info("Processing Transaction...", {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            });

            const isEth = selectedVitualtoken.symbol === "ETH" ? true : false;

            if (!isEth) {
                try {
                    // approveToastId = toast.info("Checking token allowance...", {
                    //   autoClose: false,
                    //   closeOnClick: false,
                    //   closeButton: false,
                    // });
                    const allowance = await approvalService.checkAllowance({
                        tokenAddress: VIRTUALS_TOKEN_ADDRESS,
                        provider: networkData?.provider!,
                        spenderAddress: SnipeContract,
                    });

                    // If allowance is less than amount, approve first
                    if (Number(allowance) < Number(amount)) {
                        if (approveToastId) toast.dismiss(approveToastId);
                        approveToastId = toast.info("Approving token spend...", {
                            autoClose: false,
                            closeOnClick: false,
                            closeButton: false,
                        });
                        await approvalService.approveVirtualToken(amount.toString(), networkData?.provider!, VIRTUALS_TOKEN_ADDRESS, SnipeContract);
                        if (approveToastId) toast.dismiss(approveToastId);
                        toast.success("Token approved successfully!");
                    } else {
                        if (approveToastId) toast.dismiss(approveToastId);
                    }
                } catch (error: any) {
                    if (approveToastId) toast.dismiss(approveToastId);
                    toast.error("Failed to approve token: " + (error.message || "Unknown error"));
                    throw error;
                }
            }

            const receipt = await agentService.deposit({
                tokenAddress: isEth ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS,
                amount: amount,
                provider: networkData?.provider!,
            });

            if (receipt.transactionHash) {
                const response = await agentService.createAgent({
                    genesisId,
                    name,
                    walletAddress,
                    token: selectedVitualtoken.symbol === "ETH" ? "eth" : "virtual",
                    amount: ((Number(amount) - 0.003 * Number(amount)) * 10 ** 18).toString(),
                    launchTime: new Date(endsAt),
                });
                fetchSubscriptionData();

                if (!response.success) {
                    throw new Error(response.message);
                }
                if (processToastId) toast.dismiss(processToastId);
                toast.success("Snipe successful! 🎉");
                onClose();
            } else {
                if (processToastId) toast.dismiss(processToastId);
                toast.error("Snipe Failed!");
            }
        } catch (error) {
            if (approveToastId) toast.dismiss(approveToastId);
            if (processToastId) toast.dismiss(processToastId);
            console.error("Error in snipe:", error);
            toast.error(error instanceof Error ? error.message : "Failed to snipe");
        } finally {
            setIsLoading(false);
            setIsProcessing(false);
        }
    };

    return (
        <div className={`w-[95%] mx-auto transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="rounded-b-xl bg-primary-100/10 py-2 px-4">
                <div className="relative flex flex-col pt-3">
                    <div className="absolute top-3 right-1 flex justify-end items-start">
                        {/* <h3 className="text-lg font-semibold text-white">Snipe {name}</h3> */}
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <div className="">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                            Max Amount
                        </label>
                        <div className="relative items-center justify-center">
                            <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
                                <div className="relative w-full flex flex-row items-center justify-between px-2">
                                    <input
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        disabled={isLoading || isProcessing}
                                        className="w-full  py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Enter amount"
                                    />
                                    <div className="flex items-center gap-2">
                                        {selectedVitualtoken?.logo && <img src={selectedVitualtoken.logo} alt={selectedVitualtoken.symbol} className="w-6 h-6 rounded-full" />}
                                        <span className="text-primary-100 text-sm">{selectedVitualtoken?.symbol || "VIRT"}</span>
                                        <button onClick={() => setIsFromCoinOpen(true)} className="text-primary-100 hover:text-primary-100/80 transition-colors">
                                            <TiArrowSortedDown className="size-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Token Selector Dropdown */}
                        {isFromCoinOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-primary-100/20 rounded-lg shadow-lg z-10">
                                <div className="py-1">
                                    {tokenOptions.map((token) => (
                                        <button key={token.symbol} onClick={() => handleTokenSelect(token)} className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex items-center gap-2">
                                            <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{token.symbol}</span>
                                                <span className="text-xs text-gray-400">Balance: {Number(token.balance).toFixed(6)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center my-2">
                            <div className="text-gray-300 text-[11px] text-nowrap">Available: {selectedVitualtoken?.symbol === "ETH" ? Number(balances.ETH).toFixed(6) : Number(balances.VIRT).toFixed(6)}</div>
                            <div className="flex flex-row gap-1">
                                {percentageButtons.map((percentage) => (
                                    <button
                                        key={percentage}
                                        onClick={() => handlePercentageClick(percentage)}
                                        disabled={isLoading || isProcessing}
                                        className="text-white/80 text-[11px] rounded font-bold border border-[#818284] px-[0.1875rem]  disabled:bg-white/5 disabled:text-white/20"
                                    >
                                        {percentage}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                            Market Cap Buy Range
                        </label>
                        <div className="relative items-center justify-center">
                            <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
                                {/* <input
                                    id="amount"
                                    value={marketCapBuyRange}
                                    onChange={(e) => setMarketCapBuyRange(Number(e.target.value))}
                                    disabled={isLoading || isProcessing}
                                    className="w-full py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter amount"
                                /> */}
                                <span className="py-3">${addCommas(marketCapBuyRange)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center my-2 px-2">
                            <SliderHandler marketCapBuyRange={marketCapBuyRange} setMarketCapBuyRange={setMarketCapBuyRange} />
                        </div>
                    </div>
                    <div className="my-4 flex justify-center items-center relative w-full">
                        <button
                            onClick={handleSnipe}
                            disabled={isButtonDisabled}
                            className={`w-[80%] px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${isButtonDisabled ? "bg-gray-600 text-white cursor-not-allowed" : "bg-primary-100 text-black hover:bg-primary-100/90"}`}
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
                </div>
            </div>
        </div>
    );
};

export default SnipeModal;
