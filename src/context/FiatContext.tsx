"use client";

import { Transak, TransakConfig } from "@transak/transak-sdk";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSwapContext } from "./SwapContext";
import { toastError, toastInfo, toastSuccess } from "@/utils/toast";
import { networkCards, transakCoinMapping } from "@/constants/config";
import { AxiosError } from "axios";
import apiTransak from "@/services/apiTransak";
import { useLoginContext } from "./LoginContext";
import { ICoin } from "@/utils/interface";
import useIsFirstEffect from "@/hooks/useIsFirstEffect";
import { useDebounce } from "use-debounce";
import useTimer from "@/hooks/useTimer";
import useEffectAsync from "@/hooks/useEffectAsync";
import { toNumFixed } from "@/utils/helper";

interface IFiatState {
  transakStatus: "idle" | "processing" | "completed";
  transakOrderId: string | null;
  getFiatSwappedPrice: any;
  setTransakStatus: Dispatch<
    SetStateAction<"idle" | "processing" | "completed">
  >;
  triggerOrderInitiate: () => Promise<void>;
  triggerOrderSuccess: () => Promise<void>;
  resetFiatStates: () => void;
  timerMM: any;
  timerSS: any;
  openFiatModal: boolean;
  setOpenFiatModal: Dispatch<SetStateAction<boolean>>;
}

const FiatContext = createContext<IFiatState>({} as IFiatState);

export function useFiatContext() {
  return useContext(FiatContext);
}

export default function FiatProvider({ children }: { children: ReactNode }) {
  const {
    selectedCoin,
    fromAmount,
    setIsFinalStep,
    isApproved,
    continueTransaction,
    approveAmount,
    selectedToCoin,
    selectedNetwork,
    isFiatBridge,
    setIsFiatBridge,
    setFromAmount,
    setIsTypingLoading,
    selectedToNetwork,
    setToAmount,
  } = useSwapContext();

  const [transakStatus, setTransakStatus] = useState<
    "idle" | "processing" | "completed"
  >("idle");
  const [transakOrderId, setTransakOrderId] = useState<string | null>(null);
  const [debouncedFiatAmount] = useDebounce(fromAmount, 1000);
  const [openFiatModal, setOpenFiatModal] = useState(false);

  const [accessToken, setAccessToken] = useState<string | null>();
  const { timerMM, timerSS, setIsActive, isActive } = useTimer(10 * 60 * 1000);

  //To remove functional useEffects from running on mount, and only on dependency trigger
  const isFirstLoad = useIsFirstEffect();

  const { networkData } = useLoginContext();

  const transakConfig: TransakConfig = apiTransak.generateConfig({
    defaultFiatCurrency: selectedCoin?.shortName,
    network: "arbitrum",
    // defaultCryptoAmount: fromAmount,
    defaultFiatAmount: fromAmount,
    cryptoCurrencyCode: selectedToCoin?.shortName,
    walletAddress: networkData?.account,
    defaultPaymentMethod: "credit_debit_card",
    sdkName: "@transak/transak-sdk",
  });

  const transak = new Transak(transakConfig);

  //Widget Closed by User
  Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, (data) => {
    toastError("Transak Widget Closed!");
    transak.close();
    console.log("widget closed", data);
    setTransakStatus("idle");
    setOpenFiatModal(false);
  });

  // After Order Created with Success or Pending
  Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
    console.log(orderData);
    setTransakOrderId(orderData?.status?.id);
    if (
      orderData?.status?.status === "COMPLETED" ||
      orderData?.status?.status === "PAYMENT_DONE_MARKED_BY_USER"
    ) {
      toastSuccess("Buying Fiat Completed Successfully");
      setTransakStatus("completed");
      // resetFiatStates();
      // setIsFinalStep(true);
      // if (networkData?.chainId === selectedNetwork?.id) {
      //   setTimeout(() => (isApproved ? continueTransaction() : approveAmount()), 3000);
      // }
    } else if (orderData?.status?.status === "PROCESSING") {
      setIsActive(true); // Start TIMER ---------------
      setTransakStatus("processing");
      // setIsFinalStep(true);
    } else {
      toastSuccess("Order Status: " + orderData?.status?.status);
      toastInfo(
        "Try swap manually after order completion,You might have received USDC on Stellar chain.",
        {
          autoClose: false,
        }
      );
      setTransakStatus("idle");
    }
    closeTransak();
  });

  // Trigger for successful order
  const triggerOrderSuccess = async () => {
    setTransakStatus("completed");
    // if (networkData?.chainId === selectedNetwork?.id) {
    //   setTimeout(async () => (isApproved ? await continueTransaction() : await approveAmount()), 5000);
    // } else {
    // setIsFiatBridge(true);
    // }
  };

  const initiateTransak = () => {
    transak.init();
  };

  const closeTransak = () => {
    transak.close();
  };

  const triggerOrderInitiate = async () => {
    await new Promise((r) => setTimeout(r, 3000));
    initiateTransak();
  };

  const getFiatSwappedPrice = async () => {
    if (!fromAmount || !selectedToCoin || !selectedCoin) {
      console.log("Please provide all values to get Fiat Price !!!");
      return;
    }

    try {
      setIsTypingLoading(true);
      const data = await apiTransak.getCurrencyPrices({
        fiatCurrency: selectedCoin?.shortName,
        cryptoCurrency: selectedToCoin?.shortName,
        isBuyOrSell: "BUY",
        fiatAmount: Number(fromAmount),
        network: selectedToNetwork?.name?.toLowerCase(),
        defaultPaymentMethod: "credit_debit_card",
      });
      // return data.response?.cryptoAmount
      setIsTypingLoading(false);
      setToAmount(Number(toNumFixed(data?.response?.cryptoAmount)));
    } catch (error) {
      if (error instanceof AxiosError)
        toastError(error?.response?.data?.error?.message);
      if (error instanceof Error) toastError(error?.message);
      toastError("Fiat Swap API Error");
      setIsTypingLoading(false);
      setToAmount(0);
      console.log("Fiat swap error", error);
    }
  };

  //Trigger every min to check for order
  useEffectAsync(async () => {
    if (!accessToken) {
      const access = await apiTransak.getAccessToken();
      setAccessToken(access);
    }
    if (Number(timerMM) + 1 && isActive) {
      toastInfo("Fetching Order Details");
      const orderDetail = await apiTransak.getOrderById(
        accessToken as string,
        transakOrderId as string
      );
      if (orderDetail?.data?.status === "COMPLETED") {
        setIsActive(false);
        triggerOrderSuccess();
      }
    }
    if (!isActive && Number(timerMM) >= 7) {
      setIsActive(false);
      setIsFinalStep(false);
      toastError("Please try swap manually when order gets completed.");
    }
  }, [timerMM]);

  useEffect(() => {
    if (isFirstLoad || !isFiatBridge) return;
    getFiatSwappedPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoin, debouncedFiatAmount, selectedToCoin]);

  const resetFiatStates = () => {
    setTransakStatus("idle");
    setIsTypingLoading(false);
    setIsActive(false);
    setIsFinalStep(false);
    setIsFiatBridge(false);
  };

  return (
    <FiatContext.Provider
      value={{
        transakStatus,
        transakOrderId,
        getFiatSwappedPrice,
        setTransakStatus,
        triggerOrderInitiate,
        triggerOrderSuccess,
        resetFiatStates,
        timerMM,
        timerSS,
        setOpenFiatModal,
        openFiatModal,
      }}
    >
      {children}
    </FiatContext.Provider>
  );
}
