import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { useSwapContext } from "../../context/SwapContext";
import {
  arbitrumList,
  baseList,
  fiatList,
  networkCards,
} from "@/constants/config";
import { ICoin, INetworkCard } from "@/utils/interface";
import { useFiatContext } from "../../context/FiatContext";
import { toNumFixed } from "@/utils/helper";

type TWidgetTabs = "swap" | "buy";

interface HeaderProps {
  selectedTab: TWidgetTabs;
  setSelectedTab: React.Dispatch<React.SetStateAction<TWidgetTabs>>;
}

const SwapHeader: React.FC<HeaderProps> = ({ selectedTab, setSelectedTab }) => {
  const {
    selectedCoin,
    setSelectedCoin,
    selectedNetwork,
    setSelectedNetwork,
    setSelectedToCoin,
    selectedToCoin,
    selectedToNetwork,
    setSelectedToNetwork,
    setIsFiatBridge,
    setFromAmount,
    isFiatBridge,
    setToAmount,
    toAmount,
  } = useSwapContext();
  const { transakStatus, resetFiatStates, setOpenFiatModal } = useFiatContext();

  function setTradeFields() {
    const baseNetwork = networkCards?.find(
      (item: INetworkCard) => item.name === "Base"
    );
    if (!baseNetwork) {
      console.error("Base network not found in networkCards");
      return;
    }

    const ethCoin = baseList?.find((item) => item.shortName === "ETH");
    const usdcCoin = baseList?.find((item) => item.shortName === "USDC");

    if (!ethCoin || !usdcCoin) {
      console.error("Required coins not found in arbitrumList");
      return;
    }

    setSelectedNetwork(baseNetwork);
    setSelectedCoin(ethCoin);
    setSelectedToNetwork(baseNetwork);
    setSelectedToCoin(usdcCoin);
    setIsFiatBridge(false);
    setFromAmount(0);
    setToAmount(0);
  }

  const fiatCurrency = useMemo(
    () =>
      fiatList?.response?.map(
        (item: any) =>
          ({
            name: item?.name,
            shortName: item?.symbol,
            decimals: 18,
            logo: `https://cdn.jsdelivr.net/gh/madebybowtie/FlagKit@2.2/Assets/SVG/${
              item?.symbol === "XCD"
                ? "DM"
                : item?.symbol === "ANG"
                ? "AW"
                : item?.symbol?.slice(0, 2)
            }.svg`,
          } as ICoin)
      ),
    []
  );

  function setBuyFields() {
    setSelectedNetwork({
      name: "Fiat",
      status: "active",
      image: "/networks/Fiat.png",
      id: "Fiat",
      code: "fiat",
    });
    setSelectedCoin(fiatCurrency.find((item: any) => item.shortName == "USD"));
    setSelectedToNetwork(networkCards?.find((item) => item?.name == "Base")!);
    setSelectedToCoin(baseList?.find((item) => item?.shortName == "ETH")!);
    setIsFiatBridge(true);
    setFromAmount(0);
  }

  useEffect(() => {
    if (selectedTab == "swap") {
      setTradeFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, isFiatBridge]);

  useEffect(() => {
    if (transakStatus === "completed")
      setTimeout(() => {
        let tempCoin = selectedToCoin;
        let tempAmount = toAmount;
        console.log("toAmount", tempAmount);
        resetFiatStates();
        setSelectedTab("swap");
        let arbitrumNetwork = networkCards?.find(
          (item) => item?.name == "Arbitrum"
        )!;
        setSelectedNetwork(arbitrumNetwork);
        setSelectedCoin(tempCoin);
        setSelectedToNetwork(arbitrumNetwork);
        setSelectedToCoin(
          arbitrumList?.find((item) => item?.shortName == "ARB")!
        );
        setIsFiatBridge(false);
        setFromAmount(toNumFixed(tempAmount));
        setOpenFiatModal(false);
      }, 4500);
  }, [transakStatus]);

  return (
    <div className="gap-x-5 flex flex-row items-center sm:justify-start justify-around border-[#818284] w-full px-8 py-6">
      {/* <button onClick={() => setSelectedTab("convert")} className={selectedTab === "convert" ? "active" : ""}>
      Convert
    </button> */}
      <button
        disabled={selectedTab === "swap"}
        className={`flex flex-row items-center justify-center font-semibold underline-offset-[0.625rem] text-sm sm:text-base ${
          selectedTab === "swap"
            ? "text-primary-100 underline"
            : "text-white/60"
        }`}
        onClick={() => {
          setSelectedTab("swap");
          setTradeFields();
        }}
      >
        Swap
      </button>
      {/* <div className="relative group"> */}
      <button
        disabled={selectedTab === "buy"}
        className={`flex flex-row items-center justify-center font-semibold underline-offset-[0.625rem] text-sm sm:text-base ${
          selectedTab === "buy" ? "text-primary-100 underline" : "text-white/60"
        }`}
        onClick={() => {
          setSelectedTab("buy");
          setBuyFields();
        }}
      >
        Buy
      </button>
      <button
        className="text-white/60 text-xs ml-auto"
        onClick={() => {
          if (selectedTab === "swap") {
            setTradeFields();
          } else {
            setBuyFields();
          }
        }}
      >
        Reset
      </button>
      {/* <div className="absolute z-50 group-hover:flex hidden -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap border border-white/20 text-xs">
          Coming Soon
        </div>
      </div> */}

      {/* <button onClick={() => setSelectedTab("buy")} className={selectedTab === "buy" ? "active" : ""}>
      Buy
    </button> */}
    </div>
  );
};

export default React.memo(SwapHeader);
