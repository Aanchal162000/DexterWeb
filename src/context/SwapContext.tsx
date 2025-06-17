"use client";

import {
  ParseEthUtil,
  ParseWeiUtil,
  sleepTimer,
  toNumFixed,
} from "@/utils/helper";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLoginContext } from "./LoginContext";
import { ethers } from "ethers";
import {
  BRIDGEABI,
  alchemyProviderURL,
  arbitrumList,
  avalancheList,
  baseList,
  contractAddress,
  networkAbb,
  optimismList,
  tokenList,
} from "@/constants/config";
import {
  TOAST_ID,
  toastDismiss,
  toastError,
  toastInfo,
  toastProcess,
  toastSuccess,
  toastUpdate,
} from "@/utils/toast";
import axios, { AxiosError } from "axios";
import { ERC20ABI, apiUrls, networkCards } from "@/constants/config";
import {
  ICoin,
  INetworkCard,
  ISymbiosisSwapResponse,
  ITokenData,
} from "@/utils/interface";
import { useDebounce } from "use-debounce";
import useIsFirstEffect from "@/hooks/useIsFirstEffect";
import { getUSDPrices } from "@/services/apiCached";
import useEffectAsync from "@/hooks/useEffectAsync";
import { getEVMLiquidity } from "@/services/apiCross";
import { useWalletBalance } from "@/hooks/useWalletBalance";

export const isSymbiosisFlow = false; // For Pure Frontend Symbiosis Flow
export const isContractSymbiosisFlow = true; // For Contract Based Symbiosis Flow

export const defaultTokenA = baseList?.find(
  (item) => item?.shortName == "USDC"
)!;
export const defaultTokenB = baseList?.find(
  (item) => item?.shortName == "ETH"
)!;
export const baseNetwork = networkCards?.find((item) => item?.name == "Base")!;

interface TokenOption {
  name: string;
  symbol: string;
  logo: string;
  balance: string;
}

interface ISwapState {
  selectedCoin: ICoin | null;
  fromAmount: number | string;
  setIsFinalStep: Dispatch<SetStateAction<boolean>>;
  continueTransaction: () => Promise<void>;
  approveAmount: () => Promise<void>;
  selectedToCoin: ICoin | null;
  selectedNetwork: INetworkCard | null;
  setSelectedCoin: Dispatch<SetStateAction<ICoin | null>>;
  setSelectedNetwork: Dispatch<SetStateAction<INetworkCard | null>>;
  setSelectedToCoin: Dispatch<SetStateAction<ICoin | null>>;
  fromTokenData: ITokenData | null;
  isApproved: boolean;
  setIsFiatBridge: Dispatch<SetStateAction<boolean>>;
  isFiatBridge: boolean;
  toAmount: number;
  setFromAmount: Dispatch<SetStateAction<number | string>>;
  selectedToNetwork: INetworkCard | null;
  setSelectedToNetwork: Dispatch<SetStateAction<INetworkCard | null>>;
  isFinalStep: boolean;
  isConvert: boolean;
  swapHash: string | null;
  approvalHash: string | null;
  isSwapped: boolean;
  isTokenRelease: boolean;
  releaseHash: string | null;
  setIsTypingLoading: Dispatch<SetStateAction<boolean>>;
  isTypingLoading: boolean;
  resetSwapStates: () => void;
  toAddress: string | null;
  setToAddress: Dispatch<SetStateAction<string | null>>;
  usdPriceS1: number;
  usdPriceS2: number;
  transFee: number;
  fromToken2Bal: number | null;
  setToAmount: Dispatch<SetStateAction<number>>;
  errored: string | null;
  isBalanceLoading: boolean;
  selectedVitualtoken: TokenOption;
  setSelctedVirtualToken: Dispatch<SetStateAction<TokenOption>>;
  selectedPercentage: number | null;
  setSelectedPercentage: Dispatch<SetStateAction<number | null>>;
}

const SwapContext = createContext<ISwapState>({} as ISwapState);

export function useSwapContext() {
  return useContext(SwapContext);
}

export default function SwapProvider({ children }: { children: ReactNode }) {
  const { networkData, address, triggerAPIs, trigger, setActiveTab } =
    useLoginContext();

  const [selectedVitualtoken, setSelctedVirtualToken] = useState<TokenOption>({
    name: "Virtuals",
    symbol: "VIRT",
    logo: "https://static.cx.metamask.io/api/v1/tokenIcons/8453/0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b.png",
    balance: "0",
  });

  //states
  const [selectedCoin, setSelectedCoin] = useState<ICoin | null>(defaultTokenA);
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );
  const [selectedToCoin, setSelectedToCoin] = useState<ICoin | null>(
    defaultTokenB
  );
  const [selectedNetwork, setSelectedNetwork] = useState<INetworkCard | null>(
    baseNetwork
  );
  const [selectedToNetwork, setSelectedToNetwork] =
    useState<INetworkCard | null>(baseNetwork);
  const [fromAmount, setFromAmount] = useState<number | string>(0);
  const [toAmount, setToAmount] = useState<number>(0);
  const [toAddress, setToAddress] = useState<string | null>(address);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [errored, setErrored] = useState<string | null>(null);

  //Data States
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);

  const [fromTokenData, setFromTokenData] = useState<ITokenData | null>(null);
  const [fromToken2Bal, setFromToken2Bal] = useState<number | null>(null);

  //Flags
  const [isFiatBridge, setIsFiatBridge] = useState<boolean>(false);
  const [isSwapped, setIsSwapped] = useState<boolean>(false);
  const [isFinalStep, setIsFinalStep] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isConvert, setIsConvert] = useState<boolean>(false);
  const [isTokenRelease, setIsTokenRelease] = useState<boolean>(false);
  const [isTypingLoading, setIsTypingLoading] = useState<boolean>(false);
  const [isUsingOurBridge, setIsUsingOurBridge] = useState<boolean>(false);

  //Transaction Information
  const [approvalHash, setApprovalHash] = useState<string | null>(null);
  const [swapHash, setSwapHash] = useState<string | null>(null);
  const [releaseHash, setReleaseHash] = useState<string | null>(null);
  const [usdPriceS1, setUsdPriceS1] = useState<number>(0.0);
  const [usdPriceS2, setUsdPriceS2] = useState<number>(0.0);
  const [transFee, setTransFee] = useState<number>(0.0);

  const [debouncedFromAmount] = useDebounce(fromAmount, 1000);
  const isSameChain = selectedNetwork?.id === selectedToNetwork?.id;

  //Set USDC as middle token for Swap ( DAI(from) -> USDT(from as middle/to as middle) -> ARB(to) ) as per contract
  const usdcAdd = tokenList.find(
    (coin: any) =>
      coin.shortName === "USDC" && coin.chainId === Number(networkData?.chainId)
  )?.address;
  const arbUsdcAdd = arbitrumList.find(
    (coin: any) =>
      coin.shortName === "USDC" && coin.chainId === Number(networkData?.chainId)
  )?.address;
  const baseUsdcAdd = baseList.find(
    (coin: any) =>
      coin.shortName === "USDC" && coin.chainId === Number(networkData?.chainId)
  )?.address;
  const optUsdcAdd = optimismList.find(
    (coin: any) =>
      coin.shortName === "USDC" && coin.chainId === Number(networkData?.chainId)
  )?.address;
  const avalUsdcAdd = avalancheList.find(
    (coin: any) =>
      coin.shortName === "USDC" && coin.chainId === Number(networkData?.chainId)
  )?.address;
  const usdcPOL = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";

  //To remove functional useEffects from running on mount, and only on dependency trigger
  const isFirstLoad = useIsFirstEffect();

  const getFromData = async (
    forceToken: any = false,
    forceNetwork: any = false,
    forceContract: any = false
  ) => {
    if ((forceNetwork && !forceToken) || (forceToken && !forceNetwork)) return;
    setIsBalanceLoading(true);
    const isForcedNetwork = Boolean(forceToken && forceNetwork);
    let currentToken = forceToken ? forceToken : selectedCoin;
    let currentNetwork = forceNetwork ? forceNetwork : selectedNetwork;

    let currentApproveContract = forceContract
      ? forceContract
      : contractAddress[currentNetwork?.id!];
    // console.log("account getfrom", networkData, selectedNetwork, selectedCoin);
    if (forceToken && forceNetwork && !selectedToCoin && !selectedToNetwork) {
      console.log(
        "GetFromDataTokenB: No selected coin or network data or no network selected"
      );
      setFromToken2Bal(0);
      return;
    }
    if (
      !selectedCoin ||
      !networkData?.account ||
      !networkData?.provider ||
      !selectedNetwork
    ) {
      console.log(
        "GetFromData: No selected coin or network data or no network selected"
      );
      setFromTokenData({ approvedAmount: 0, balance: 0 });
      return;
    }
    try {
      const alchemyProvider = new ethers.providers.JsonRpcProvider(
        alchemyProviderURL[currentNetwork?.id!]
      );
      const currentProvider = alchemyProvider;
      const fromTokenContract = new ethers.Contract(
        currentToken?.address!,
        ERC20ABI,
        currentProvider
      );
      let approvedAmount = 0;
      let balance = 0;

      // If the selected coin is native coin, set the approved amount to 10e8 and the balance to the current ETH balance
      if (
        currentToken?.address!.toLowerCase() ==
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      ) {
        approvedAmount = 1000000000;
        balance =
          Number(await currentProvider?.getBalance(networkData?.account)) /
          10 ** 18;
      } else {
        //Set the approved amount to the allowance of the selected coin and the balance to the balance of the selected coin
        console.log(
          "allownce",
          currentProvider,
          currentToken?.address!,
          networkData?.account,
          currentApproveContract
        );
        approvedAmount =
          Number(
            await fromTokenContract.allowance(
              networkData?.account,
              currentApproveContract
            )
          ) /
          10 ** currentToken?.decimals!;
        balance =
          Number(await fromTokenContract.balanceOf(networkData?.account)) /
          10 ** currentToken?.decimals!;
      }
      console.log("running getFromData", {
        isForcedNetwork,
        fromTokenData: { approvedAmount, balance },
        forceToken,
        forceNetwork,
        forceContract,
        currentNetwork: currentNetwork?.id,
      });
      if (forceContract) {
        return { approvedAmount, balance };
      }
      if (isForcedNetwork) setFromToken2Bal(Number(balance));
      else setFromTokenData({ approvedAmount, balance });
    } catch (err) {
      console.log("getFromData Error: ", err);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  const approveAmount = async () => {
    setErrored(null);
    if (Number(fromTokenData?.balance) > Number(fromAmount)) {
      try {
        const Provider = networkData?.provider as ethers.providers.Web3Provider;
        const Signer = await Provider.getSigner();
        const fromTokenContract = await new ethers.Contract(
          selectedCoin?.address as string,
          ERC20ABI,
          Signer
        );
        toastProcess("Confirming Transaction");
        // console.log(contractAddress[selectedNetwork?.id!], selectedCoin?.address);
        const newAmount = Number((Number(fromAmount) * 103) / 100).toFixed(6);
        const res = await fromTokenContract.approve(
          contractAddress[selectedNetwork?.id!],
          ethers.utils.parseUnits(
            String(newAmount),
            Number(selectedCoin?.decimals!)
          )
        );
        setApprovalHash(res.hash);
        getTransactionReceiptMined(res.hash, "approved");
        if (isFiatBridge) {
          continueTransaction();
        }
      } catch (err) {
        toastError(
          (err as any)?.code === "ACTION_REJECTED"
            ? "Transaction Rejected by User"
            : `Error: ${(err as any)?.reason}` || "Something Went Wrong"
        );
        console.error("error in approve:", err);
        toastDismiss(TOAST_ID.PROCESS);
        await sleepTimer(3000);
        // setFiatProcessStep(0);
        setIsFinalStep(false);
      }
    } else {
      toastError("Insufficient Balance to Complete the Transaction");
      setErrored("Insufficient Balance to Complete the Transaction");
      await sleepTimer(3000);
      // setFiatProcessStep(0);
      setIsFinalStep(false);
    }
  };

  // <<******************* Swap Functions START *******************>> //

  const continueTransaction = async () => {
    setErrored(null);
    if (Number(fromTokenData?.balance) > Number(fromAmount)) {
      setIsFinalStep(true);
      try {
        setIsConvert(true);
        const res = isSymbiosisFlow
          ? await getSymbiosisSwapCalldata()
          : await getSwapData();
        isSymbiosisFlow
          ? await executeSymbiosisTransaction(res)
          : await sendTransaction(res);
      } catch (err: any) {
        setIsFinalStep(false);
        setIsConvert(false);
        const errorMessage =
          err instanceof Error
            ? err.message.split("(")[0]
            : typeof err === "string"
            ? err
            : "An unknown error occurred";
        toastError(errorMessage);
      }
    } else {
      toastError("Insufficient Balance to Complete the Transaction");
      setErrored("Insufficient Balance to Complete the Transaction");
      await sleepTimer(3000);
      setIsFinalStep(false);
    }
  };

  const getSwapData = async (): Promise<any | undefined> => {
    //First Step is to get callData and then return for lock in contract
    let { data: txData } = await axios.post(apiUrls.swidgeApi, {
      buyToken: isSameChain
        ? selectedToCoin?.address
        : selectedNetwork?.id == 42161
        ? arbUsdcAdd
        : selectedNetwork?.id == 8453
        ? baseUsdcAdd
        : selectedNetwork?.id == 10
        ? optUsdcAdd
        : selectedNetwork?.id == 43114
        ? avalUsdcAdd
        : selectedNetwork?.id == 137
        ? usdcPOL
        : usdcAdd, //usdc as intemediate for conversion so that contract swap it,
      sellToken: selectedCoin?.address,
      sellAmount: ParseEthUtil(
        fromAmount,
        selectedCoin?.decimals
      ).toLocaleString("en", { useGrouping: false }),
      chainId: networkAbb[Number(selectedNetwork?.id)].code,
    });
    //If no data is found, throw error
    if (!txData?.calldata) throw "No call data returned";

    return txData?.calldata;
  };

  const sendTransaction = async (data: any) => {
    try {
      const web3Provider =
        networkData?.provider as ethers.providers.Web3Provider;
      const signer = web3Provider.getSigner(toAddress as string);

      toastDismiss(TOAST_ID.PROCESS);
      toastProcess("Transaction in Progress");

      const bridgingContract = await new ethers.Contract(
        contractAddress[selectedNetwork?.id!],
        BRIDGEABI,
        signer
      );
      let bridgeData = null;
      console.log("calling contract", contractAddress[selectedNetwork?.id!]);

      if (isSameChain) {
        //Call Lock function
        const lockArgs = [data, toAddress];

        //For native tokens, add value param to the lock function
        if (
          selectedCoin?.address!.toLowerCase() ==
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ) {
          lockArgs.push({
            value: Math.floor(
              ParseEthUtil(fromAmount, selectedCoin?.decimals)
            )?.toString(),
          });
        }
        console.log(lockArgs);
        console.log({
          data: data,
          address: toAddress,
          gas: ethers.utils.formatEther(
            await bridgingContract.estimateGas.swap(...lockArgs)
          ),
        });
        // Call Swap function
        bridgeData = await bridgingContract.swap(...lockArgs);
      } else {
        const isUseAdminLiquidity = await canUseAdminLiquidity();
        if (isUsingOurBridge && !isUseAdminLiquidity) {
          throw new Error(
            "Liquidity changed just before transaction, Please retry!"
          );
        }
        //Call Lock function
        const lockArgs = [
          data,
          ethers.utils.formatBytes32String(
            networkAbb[Number(selectedToNetwork?.id)].code
          ),
          selectedToCoin?.address,
          toAddress,
          isContractSymbiosisFlow && !isUseAdminLiquidity ? 1 : 0,
          ethers.utils.formatBytes32String("dexter"),
        ];
        //https://www.devoven.com/encoding/string-to-bytes32

        //For native tokens, add value param to the lock function
        if (
          selectedCoin?.address!.toLowerCase() ==
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        ) {
          lockArgs.push({
            value: Math.floor(
              ParseEthUtil(fromAmount, selectedCoin?.decimals)
            )?.toString(),
          });
        }
        console.log("lokag", lockArgs);
        console.log({
          data: data,
          finalNet: selectedToNetwork?.id,
          finalCoin: selectedToCoin?.address,
          gas: ethers.utils.formatEther(
            await bridgingContract.estimateGas.lock(...lockArgs)
          ),
        });

        //Calling bridge lock function
        bridgeData = await bridgingContract.lock(...lockArgs);

        // Set swap only after hash generated for swap on contract, and show release process for lock function
        setIsSwapped(true);
        setSwapHash(bridgeData.hash);
      }
      // console.log(bridgeData);
      setIsFinalStep(true);
      getTransactionReceiptMined(bridgeData.hash, "continue");
    } catch (err) {
      setErrored(
        "Something Went Wrong. Please contact admin or write to help support."
      );
      console.log("error in send ", JSON.stringify(err), err);
      if ((err as any)?.error) {
        toastUpdate(TOAST_ID.PROCESS, {
          type: "error",
          render: `Transaction failed, Error : ${String(
            (err as any)?.error?.message
          )?.slice(0, 30)}`,
        });
      } else
        toastUpdate(TOAST_ID.PROCESS, {
          type: "error",
          render: `Transaction failed, Error : ${
            (err as any)?.data?.message ||
            (err as any)?.code?.slice(0, 30) ||
            (err as any)?.message
          }`,
        });
      setIsFinalStep(false);
    }
  };

  const getTransactionReceiptMined = async (
    txHash: string,
    type: "continue" | "approved"
  ) => {
    const intervalId = setInterval(async () => {
      const txReceipt = await isTransactionMined(txHash);

      // If no receipt, continue
      if (!txReceipt) return;

      // If got receipt, clear interval loop
      clearInterval(intervalId);

      // If tx status is 0(fail), throw error
      if (txReceipt.status === 0) {
        setIsFinalStep(false);
        toastUpdate(TOAST_ID.PROCESS, {
          type: "error",
          render: `Transaction Failed : Contract Failed to ${
            isSameChain ? "Swap" : "Lock"
          }. Please retry!`,
        });
        throw `Transaction Failed : ${txHash}`;
      }

      if (type === "continue") {
        if (isSameChain) {
          setIsSwapped(true);
          setSwapHash(txReceipt?.transactionHash);
          toastUpdate(TOAST_ID.PROCESS, {
            type: "success",
            render: `Tokens Swapped Successfully`,
          });
        } else {
          await handleRelease(txHash);
        }
      } else {
        toastUpdate(TOAST_ID.PROCESS, {
          type: "success",
          render: `Transaction Successful.`,
        });
        setIsApproved(true);
      }
    }, 5000);
  };

  const handleRelease = async (hash: any) => {
    setErrored(null);
    try {
      let releaseTxId = null;
      let recalls = 0;
      // Continuously check the status of the hash until the releaseHash is not found
      while (!releaseTxId) {
        await sleepTimer(15000);
        // Check if timer is up by 5 minutes
        // console.log("timer: ", recalls);
        if (recalls >= 80) {
          throw new Error(`Timeout ERR: Transaction release might take time.`);
        }
        const { data } = await axios.get(`${apiUrls.transApi}/${hash}`);
        if (data && data?.transaction) {
          // If some error remark is returned, print and exit
          if (data.transaction?.remarks?.includes("error"))
            throw new Error(`${data?.transaction?.remarks}`);
          // If hash found, continue the process
          if (data.transaction?.processed)
            releaseTxId = data?.transaction?.releaseHash;
        }
        recalls += 1;
      }
      setReleaseHash(releaseTxId);
      setIsTokenRelease(true);
      triggerAPIs();
      toastUpdate(TOAST_ID.PROCESS, {
        type: "success",
        render: `Tokens Released Successfully`,
      });
    } catch (err) {
      setErrored(
        "Something Went Wrong. Please contact admin or write to help support."
      );
      toastUpdate(TOAST_ID.PROCESS, {
        type: "error",
        render: (
          <>
            <div>
              Something Went Wrong!{" "}
              {(err as any)?.message?.toString()?.slice(0, 80)}. Please contact
              admin or write to help support. We will resolve it soon. Thanks.
              <br />
              <button
                onClick={() => handleSupportError((err as any)?.message)}
                className="text-xs px-2 py-0.5 border border-zinc-700 rounded-md"
              >
                Click here to write to support!
              </button>
            </div>
          </>
        ),
        autoClose: false,
      });
      console.error(err instanceof Error ? err.message : err);
      setIsTokenRelease(false);
    }
  };

  const isTransactionMined = async (
    txHash: string
  ): Promise<ethers.providers.TransactionReceipt | null> => {
    const web3Provider = networkData?.provider as ethers.providers.Web3Provider;
    // Get the transaction receipt for the given transaction hash
    const txReceipt = await web3Provider.getTransactionReceipt(txHash);
    // Check if the receipt has a block number
    if (txReceipt && txReceipt.blockNumber) {
      console.log("Receipt :: ", txReceipt);
      return txReceipt;
    }
    return null;
  };

  // <<******************* Swap Functions END *******************>> //

  // <<******************* New Symbiosis Flow Functions START *******************>> //

  const getSymbiosisChains = async (): Promise<any> => {
    try {
      const response = await axios.get(`${apiUrls.symbiosisBaseUrl}/v1/chains`);
      return response.data;
    } catch (err) {
      console.error("Error fetching Symbiosis chains:", err);
      throw err;
    }
  };

  const getSwapLimits = async (token: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${apiUrls.symbiosisBaseUrl}/v1/swap-limits`,
        {
          params: { token },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching swap limits:", err);
      throw err;
    }
  };

  const getSymbiosisSwapCalldata =
    async (): Promise<ISymbiosisSwapResponse> => {
      try {
        // Build the request body using current state values
        const requestBody = {
          tokenAmountIn: {
            address: selectedCoin?.address,
            amount: ParseEthUtil(fromAmount, selectedCoin?.decimals).toString(),
            chainId: Number(selectedNetwork?.id),
            decimals: selectedCoin?.decimals,
          },
          tokenOut: {
            chainId: Number(selectedToNetwork?.id),
            address: selectedToCoin?.address,
            decimals: selectedToCoin?.decimals,
          },
          from: address,
          to: toAddress,
          slippage: 50, // 0.5% expressed in basis points
        };

        const response = await axios.post(
          `${apiUrls.symbiosisBaseUrl}/v1/swap`,
          requestBody
        );
        if (!response.data?.tx.data)
          throw new Error("No calldata returned from Symbiosis swap API");
        return {
          tx: response.data.tx,
          approveTo: response.data.approveTo,
          fee: `${ParseWeiUtil(
            response.data.fee.amount,
            response.data.fee.decimals
          )}`,
          amountOut: ParseWeiUtil(
            response.data.tokenAmountOut.amount,
            response.data.tokenAmountOut.decimals
          ).toString(),
          amountOutMin: ParseWeiUtil(
            response.data.tokenAmountOutMin.amount,
            response.data.tokenAmountOutMin.decimals
          ).toString(),
        };
      } catch (err) {
        console.error("Error fetching Symbiosis swap calldata:", err);
        throw err;
      }
    };

  const executeSymbiosisTransaction = async (data: ISymbiosisSwapResponse) => {
    try {
      const web3Provider =
        networkData?.provider as ethers.providers.Web3Provider;
      const signer = web3Provider.getSigner(toAddress as string);

      const result = await getFromData(false, false, data?.approveTo);
      console.log("isapprovess", result, data);
      if (Number(result?.approvedAmount) < Number(fromAmount)) {
        try {
          const Provider =
            networkData?.provider as ethers.providers.Web3Provider;
          const Signer = await Provider.getSigner();
          const fromTokenContract = await new ethers.Contract(
            selectedCoin?.address as string,
            ERC20ABI,
            Signer
          );
          toastProcess("Approving Internal Contract!");
          // console.log(contractAddress[selectedNetwork?.id!], selectedCoin?.address);
          const res = await fromTokenContract.approve(
            data?.approveTo,
            ethers.utils.parseUnits(
              String(fromAmount),
              Number(selectedCoin?.decimals!)
            )
          );
          console.log("symbiosis hash app", res.hash);
          toastUpdate(TOAST_ID.PROCESS, {
            type: "success",
            render: `Approve Successfully`,
          });
          await res.wait();
        } catch (err) {
          console.log("error inside", err);
        }
      }

      toastDismiss(TOAST_ID.PROCESS);
      toastProcess("Transaction in Progress");

      const txResponse = await signer.sendTransaction(data?.tx);
      // Set swap only after hash generated for swap on contract, and show release process for lock function
      setIsSwapped(true);
      setSwapHash(txResponse.hash);
      // toastInfo("Transaction submitted, monitoring progress...");
      handleSwapProgress(String(selectedNetwork?.id), txResponse.hash);
    } catch (err: any) {
      console.error("Error executing Symbiosis transaction:", err);
      toastDismiss(TOAST_ID.PROCESS);
      toastError("Transaction failed");
      setIsFinalStep(false);
    }
  };
  useEffect(() => {
    setFromAmount(0);
    setSelectedPercentage(null);
    setToAmount(0);
  }, [networkData]);

  const handleSwapProgress = async (chainId: string, txHash: string) => {
    const url = `${apiUrls.symbiosisBaseUrl}/v1/tx/${chainId}/${txHash}`;
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(url);
        console.log("swap prog", response?.data);
        if (response.data && response.data.status.text === "Success") {
          clearInterval(intervalId);
          setReleaseHash(response.data.tx.hash);
          setIsTokenRelease(true);
          triggerAPIs();
          toastUpdate(TOAST_ID.PROCESS, {
            type: "success",
            render: `Tokens Released Successfully`,
          });
        }
      } catch (err) {
        toastUpdate(TOAST_ID.PROCESS, {
          type: "error",
          render: `Something Went Wrong. ${
            (err as any).message
          }. Please contact admin or write to help support. We will resolve it soon. Thanks.`,
          autoClose: false,
        });
        setIsTokenRelease(false);
      }
    }, 20000); // poll every 20 seconds
  };

  // <<******************* New Symbiosis Flow Functions END *******************>> //

  useEffect(() => {
    if (address && !toAddress) {
      setToAddress(address as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  //To update balance and approved amount on coin & network change
  useEffectAsync(async () => {
    if (isFirstLoad && !selectedNetwork && !selectedToNetwork) return;
    await getFromData();
    await getFromData(selectedToCoin, selectedToNetwork);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCoin,
    selectedToCoin,
    selectedNetwork,
    selectedToNetwork,
    networkData,
    trigger,
  ]);

  useEffect(() => {
    if (isFirstLoad) return;
    console.log(debouncedFromAmount, "debouncedFromAmount");
    getSwappedPrice(selectedCoin, selectedToCoin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoin, selectedToCoin, debouncedFromAmount]);

  useEffect(() => {
    Number(fromTokenData?.approvedAmount) >= Number(fromAmount)
      ? setIsApproved(true)
      : setIsApproved(false);
  }, [
    selectedNetwork,
    selectedToCoin,
    selectedCoin,
    fromTokenData,
    fromAmount,
  ]);

  const setMinUSDSwapAmt = async (): Promise<void> => {
    const myToken = selectedCoin?.shortName.toLowerCase() as string;
    const usdRate = await getUSDPrices(myToken);
    const oneUSDBalance = Number(Number(1 / usdRate) || 0).toFixed(4);
    setFromAmount(
      Number(oneUSDBalance)
        ? Number(Number(oneUSDBalance) + 0.0001).toFixed(4)
        : 0
    );
  };

  const canUseAdminLiquidity = async (): Promise<any> => {
    try {
      const myToken = selectedCoin?.coingeckoId?.toLowerCase();
      const usdRate = await getUSDPrices(myToken as string, true);
      const usdBalance = (fromAmount as number) * usdRate;
      const response = await getEVMLiquidity(
        networkAbb[selectedToNetwork?.id! as number].code
      );

      let isUseOurLiquidity = false;
      if (10 > Number(usdBalance)) {
        isUseOurLiquidity = true;
      }
      console.log(
        "can use admin liquidity",
        isUseOurLiquidity,
        " --other-- ",
        usdBalance,
        response.data?.usdcBalance,
        isUseOurLiquidity
      );
      return isUseOurLiquidity;
    } catch (err) {
      console.error("Error fetching Admin liquidity:", err);
      throw err;
    }
  };

  const handleSupportError = async (errorStack: string) => {
    setActiveTab("help-center");
    await sleepTimer(1500);
    const hashField = document.getElementsByName(
      "transhash"
    )[0] as HTMLInputElement;
    const addField = document.getElementsByName(
      "address"
    )[0] as HTMLInputElement;
    const messageField = document.getElementsByName(
      "message"
    )[0] as HTMLInputElement;
    if (hashField) {
      hashField.value = swapHash || "";
    }
    if (addField) {
      addField.value = toAddress || address || "";
    }
    if (messageField) {
      messageField.value =
        "This is to inform you that my transaction is struck and hoping it resolves sooner." +
        errorStack
          ? ` Error : ${errorStack}`
          : "";
    }
  };

  const checkMinUSDSwapAmt = async (
    isToToken: boolean = false,
    toAmt: number = 0
  ): Promise<void> => {
    // console.log("mincheck", isToToken, selectedCoin, selectedToCoin)
    const myToken = isToToken
      ? selectedToCoin?.coingeckoId?.toLowerCase()
      : selectedCoin?.coingeckoId?.toLowerCase();
    const usdRate = await getUSDPrices(myToken as string, true);
    const usdBalance = ((isToToken ? toAmt : fromAmount) as number) * usdRate;
    console.log("USD ", usdBalance, usdRate);
    if (isToToken) {
      setUsdPriceS2(usdBalance);
      return;
    } else setUsdPriceS1(usdBalance);

    const oneUSDBalance = Number(Number(1 / usdRate) || 0);
    const isUseAdminLiquidity = await canUseAdminLiquidity();
    setIsUsingOurBridge(isUseAdminLiquidity);

    const minLimit = isUseAdminLiquidity ? 1 : 4;
    console.log("current balance", oneUSDBalance, usdRate, usdBalance);
    let minAmount = Number(oneUSDBalance)
      ? Number(Number(oneUSDBalance * minLimit) + 0.000001).toFixed(6)
      : "0";

    // let isEth = selectedNetwork?.name == "Ethereum";
    if (usdBalance < minLimit) {
      setFromAmount(Number(minAmount).toFixed(6));
      throw new Error("transaction amount not in range");
    }
    // } else if ((usdBalance > 5 && !isEth) || (isEth && usdBalance > 10)) {
    //   let maxAmount = Number(oneUSDBalance) ? Number(Number(oneUSDBalance) - 0.000001).toFixed(6) : "0";
    //   let currentMax = isEth ? 10 : 5;
    //   setFromAmount(Number(Number(currentMax * +maxAmount)).toFixed(6));
    //   toastInfo(`Max transaction amount capped at ${currentMax} USD.`);
    //   throw new Error("transaction amount not in range");
    // }
  };

  // const priceSwapAPI = async () => {
  //   let { data: respData1 } = await axios.post(apiUrls.swidgeApi, {
  //     sellToken: selectedCoin?.address,
  //     sellAmount: String(ParseEthUtil(fromAmount, selectedCoin?.decimals)),
  //     chainId: networkAbb[Number(selectedNetwork?.id)].code,
  //     buyToken: usdtAdd,
  //   });

  //   if (!respData1.success) throw "Something went wrong";

  //   const usdtAddTo = (selectedToNetwork?.name === "Arbitrum" ? arbitrumList : tokenList).find(
  //     (network: any) => network.shortName === "USDC" && network.chainId === Number(selectedToNetwork?.id)
  //   )?.address;

  //   let { data: respData2 } = await axios.post(apiUrls.swidgeApi, {
  //     sellToken: usdtAddTo,
  //     sellAmount: String(respData1?.quote),
  //     chainId: networkAbb[Number(selectedToNetwork?.id)].code,
  //     buyToken: selectedToCoin?.address,
  //   });

  //   let res = respData2?.quote / 10 ** (selectedToCoin as ICoin)?.decimals!;
  //   res = res - res * (1.5 / 100);
  //   console.log("Swap api", res);
  // };

  const getSwappedPrice = async (fromCoin: any, toCoin: any): Promise<void> => {
    if (isFiatBridge) return;
    // setFromAmount(0.0);
    setUsdPriceS2(0.0);
    setUsdPriceS1(0.0);
    console.log("Provide all values to get Swap Price!!");
    if (!fromCoin || !toCoin || !selectedToCoin || !fromAmount) return;

    try {
      setIsTypingLoading(true);
      //Check minimum amount of 1 USD for transaction
      await checkMinUSDSwapAmt();

      let data: any;
      if (isSymbiosisFlow) {
        data = await getSymbiosisSwapCalldata();
        data = {
          success: "true",
          outputAmount: data?.amountOut,
          feeInUsd: data?.fee,
        };
      } else {
        if (isSameChain) {
          let result = await axios.get(apiUrls.convertApi, {
            params: {
              fromToken: selectedCoin?.shortName.toLowerCase(),
              toToken: selectedToCoin?.shortName.toLowerCase(),
              fromChain: selectedNetwork?.code,
              fromAmount: fromAmount,
              toChain: selectedToNetwork?.code,
            },
          });
          data = {
            ...result?.data,
            outputAmount: result?.data?.estimatedConversion,
            feeInUsd: result?.data?.fee,
          };
        } else {
          let result = await axios.get(apiUrls.estimateApi, {
            // instead of conversion api using estimate api now.
            params: {
              fromTokenSymbol: selectedCoin?.shortName.toLowerCase(),
              toTokenSymbol: selectedToCoin?.shortName.toLowerCase(),
              fromChain: selectedNetwork?.id,
              amount: fromAmount,
              toChain: selectedToNetwork?.id,
            },
          });
          data = result?.data;
        }
      }

      if (!data?.success) toastError("Token not found");

      //Convert to readable amount with decimals
      // let estimatedAmt = Number(data?.estimatedConversion) * Number(fromAmount);
      let estimatedAmt = Number(data?.outputAmount);

      console.log("Conversion price", estimatedAmt);
      setTransFee(Number(Number(data?.feeInUsd).toFixed(4)));
      setToAmount(Number(toNumFixed(estimatedAmt)));
      await checkMinUSDSwapAmt(true, Number(data?.outputAmount));
      // priceSwapAPI();
    } catch (err) {
      if (
        err instanceof Error &&
        err?.message === "transaction amount not in range"
      )
        return;
      if (err instanceof AxiosError)
        toastError(
          err?.response?.status === 500
            ? "Server Error"
            : (err?.response?.data as any)?.message
        );
      else toastError((err as any)?.message || "Something went wrong");
      console.log(err);
      setFromAmount(0);
      setUsdPrice(0);
      setToAmount(0);
    } finally {
      setIsTypingLoading(false);
    }
  };

  const resetSwapStates = () => {
    setIsApproved(false);
    setFromAmount(0);
    setToAmount(0);
    setIsConvert(false);
    setIsFinalStep(false);
    setIsSwapped(false);
    setIsTypingLoading(false);
    setIsTokenRelease(false);
    setApprovalHash("");
    setSwapHash("");
    setReleaseHash("");
    setToAddress(address);
    setErrored(null);
    triggerAPIs();
    setSelectedPercentage(null);
  };

  return (
    <SwapContext.Provider
      value={{
        selectedCoin,
        fromAmount,
        setIsFinalStep,
        isApproved,
        continueTransaction,
        approveAmount,
        selectedToCoin,
        selectedNetwork,
        setSelectedNetwork,
        setSelectedCoin,
        setSelectedToCoin,
        fromTokenData,
        setIsFiatBridge,
        isFiatBridge,
        toAmount,
        setFromAmount,
        selectedToNetwork,
        setSelectedToNetwork,
        releaseHash,
        isTokenRelease,
        isFinalStep,
        isConvert,
        swapHash,
        approvalHash,
        isSwapped,
        setIsTypingLoading,
        isTypingLoading,
        resetSwapStates,
        toAddress,
        setToAddress,
        usdPriceS1,
        usdPriceS2,
        transFee,
        fromToken2Bal,
        setToAmount,
        errored,
        isBalanceLoading,
        selectedVitualtoken,
        setSelctedVirtualToken,
        selectedPercentage,
        setSelectedPercentage,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}
