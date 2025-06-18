import { useSwapContext } from "@/context/SwapContext";
import {
  ChangeEvent,
  Dispatch,
  RefObject,
  SetStateAction,
  useRef,
  useState,
} from "react";
import ImageNext from "../common/ImageNext";
import { fiatList } from "@/constants/config";
import {
  formatNumber,
  truncateToFixed,
  toNumFixed,
  formatNumberWithCommas,
} from "@/utils/helper";
import { IoInformationCircle } from "react-icons/io5";
import { TiArrowSortedDown } from "react-icons/ti";
import clsx from "clsx";

function SendFrom({
  setIsFromCoinOpen,
}: {
  setIsFromCoinOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    fromAmount,
    selectedCoin,
    selectedNetwork,
    setFromAmount,
    isFiatBridge,

    fromTokenData,
    usdPriceS1,
    isBalanceLoading,
  } = useSwapContext();
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const selectedFiat =
    fiatList &&
    fiatList?.response?.find(
      (item: any) => item?.symbol === selectedCoin?.shortName
    );

  //Selecting Card Payment Min Amount
  const minFiatAmount = selectedFiat
    ? Number(
        selectedFiat?.paymentOptions.some(
          (p: any) => p.id === "credit_debit_card"
        )
          ? selectedFiat?.paymentOptions.find(
              (p: any) => p.id === "credit_debit_card"
            )?.minAmount
          : selectedFiat?.paymentOptions[0].minAmount
      ).toFixed(2)
    : 0.0;

  const maxAmount = truncateToFixed(Number(fromTokenData?.balance ?? 0), 4);

  const inputRef: any = useRef(null);

  const handleFocus = (ref: RefObject<HTMLInputElement>) => {
    const input = ref.current;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length); // Set cursor at the end
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val: string = e.target.value;

    // Allow only numbers and one decimal point
    val = val.replace(/[^0-9.]/g, "");

    // Handle decimal point
    if (val === ".") val = "0.";

    // Remove leading zeros except for decimal numbers
    if (!val.includes(".")) {
      val = val.replace(/^0+/, "");
      if (val === "") val = "0";
    }

    // Ensure only one decimal point
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    setFromAmount(val);
  };

  const handlePercentCost = (value: number) => {
    if (value === 1) {
      let newValue = (value * (100 - 0.5)) / 100;
      setFromAmount(
        String(
          Number(newValue * Number(fromTokenData?.balance || 0)).toFixed(6)
        )
      );
      // }
    } else {
      setFromAmount(
        String(Number(value * Number(fromTokenData?.balance || 0)).toFixed(6))
      );
    }
  };

  return (
    <>
      <div
        className="border border-primary-100 rounded-lg py-3 px-4 mb-2 flex flex-col items-center gap-3"
        onClick={() => inputRef?.current?.focus()}
      >
        <div className="flex w-full items-center  text-prime-zinc-50  justify-between">
          <div className="text-zinc-400 text-sm flex gap-3 items-center justify-center">
            From{" "}
            {Boolean(selectedNetwork) && (
              <div className="flex gap-1">
                <img
                  src={selectedNetwork?.image}
                  alt="token icon"
                  className="w-4 h-4 object-contain rounded-full shrink-0"
                />
                <p className="text-white !leading-tight text-nowrap">
                  {selectedNetwork?.name}
                </p>
              </div>
            )}
          </div>
          {selectedNetwork?.name === "Fiat" && (
            <div className="grid grid-cols-1">
              <button
                className="text-white/80 text-xs rounded font-bold border border-[#818284] px-1 mx-0.5"
                onClick={() => setFromAmount(String(toNumFixed(minFiatAmount)))}
              >
                Minimum : {minFiatAmount}
              </button>
            </div>
          )}
          {selectedNetwork?.name != "Fiat" && (
            <div
              className={clsx(
                "relative grid grid-cols-4 gap-1 group translate-x-1",
                isBalanceLoading && "pointer-events-none"
              )}
            >
              <div className="absolute bottom-[calc(100%+4px)] border flex gap-1 border-white/30 left-1/2 transform text-xs -translate-x-1/2 px-2 py-1 bg-zinc-800/30 backdrop-blur-sm text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                <IoInformationCircle className="size-4" /> Gas fee/buffer will
                be adjusted.
              </div>
              {[0.1, 0.25, 0.5, 1].map((value) => (
                <button
                  key={value}
                  disabled={isBalanceLoading}
                  onClick={() => handlePercentCost(value)}
                  className="text-white/80 text-xs rounded font-bold border border-[#818284] px-[0.1875rem] mx-0.5 disabled:bg-white/5 disabled:text-white/20"
                >
                  {value * 100}%
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-full flex justify-between items-center">
          <button
            className={`flex flex-row w-full py-1 justify-start items-center cursor-pointer`}
            onClick={() => setIsFromCoinOpen(true)}
          >
            {selectedCoin?.logo && (
              <ImageNext
                src={selectedCoin?.logo!}
                className={clsx(
                  "size-9 overflow-hidden",
                  !isFiatBridge && "bg-white rounded-full"
                )}
                alt="coin-logo"
                fullRadius={!isFiatBridge}
              />
            )}
            <div className={`flex flex-col ${selectedCoin ? "ml-2" : ""} mr-1`}>
              <span className="text-base text-nowrap text-white font-bold !leading-tight">
                {selectedCoin?.shortName || "Select Token"}
              </span>
            </div>
            <TiArrowSortedDown className="text-prime-token-200 size-5" />
          </button>
          <input
            className="!outline-none text-white text-lg w-full placeholder:text-base text-right sm:font-bold [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent placeholder:text-prime-zinc-100"
            type="text"
            placeholder={isFocused ? `0.0` : "Enter Amount"}
            onFocus={(e: any) => setIsFocused(true)}
            onBlur={(e: any) => setIsFocused(false)}
            maxLength={8}
            // value={selectedNetwork?.name == "Fiat" ? fiatAmount : fromAmount}
            value={
              !Boolean(Number(fromAmount)) &&
              isFocused &&
              !String(fromAmount).includes(".")
                ? ""
                : fromAmount
            }
            onChange={handleInputChange}
          />
        </div>
        <div className="w-full flex flex-row flex-nowrap justify-between items-center text-white">
          {isBalanceLoading && selectedNetwork?.name != "Fiat" ? (
            <div className="flex flex-row gap-x-1 w-32 animate-blinker h-2 my-1 bg-white/20 rounded-lg text-xs text-zinc-300"></div>
          ) : selectedCoin && selectedNetwork?.name != "Fiat" ? (
            <div className="flex flex-row gap-x-1 w-full text-xs text-zinc-300">
              Available
              <span className="">
                {Number(fromTokenData?.balance).toFixed(6) || 0}
              </span>
              {selectedCoin?.shortName}
            </div>
          ) : (
            <div className="h-4"></div>
          )}
          {Boolean(fromAmount) &&
            selectedCoin &&
            !isFiatBridge &&
            Boolean(usdPriceS1) && (
              <div className="text-xs whitespace-nowrap ml-2">
                ~ $ {usdPriceS1.toFixed(2)}
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default SendFrom;
