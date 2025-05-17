import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  tokenList,
  networkCards,
  fiatList,
  arbitrumList,
  baseList,
  avalancheList,
  optimismList,
} from "@/constants/config";
import { BiSearch } from "react-icons/bi";
import clsx from "clsx";
import { ICoin, INetworkCard } from "@/utils/interface";
import { useSwapContext } from "@/context/SwapContext";
import ImageNext from "../common/ImageNext";
import OldView from "./OldView";
import { TiArrowSortedDown } from "react-icons/ti";

const buyToArb = ["USDC", "ETH"];

// const arbitrumList = arbitrumFullList.filter((c: any) => allTopArbitrum.includes(c.shortName));

function SelectCoin({
  setIsCoinOpen,
  fromOrTo,
  setSelectedNetwork,
  selectedNetwork,
  setSelectedCoin,
  title,
}: {
  setIsCoinOpen: Dispatch<SetStateAction<boolean>>;
  fromOrTo: "FromSelection" | "ToSelection";
  setSelectedToNetwork: Dispatch<SetStateAction<INetworkCard | null>>;
  setSelectedNetwork: Dispatch<SetStateAction<INetworkCard | null>>;
  selectedNetwork: INetworkCard | null;
  setSelectedCoin: Dispatch<SetStateAction<ICoin | null>>;
  title: "Send From" | "Receive As";
}) {
  const [isNetworkOpen, setIsNetworkOpen] = useState<boolean>(false);
  const [fromCoinSearch, setFromCoinSearch] = useState<string | undefined>("");
  const {
    setIsFiatBridge,
    isFiatBridge,
    selectedNetwork: fromNetwork,
    selectedToNetwork: toNetwork,
    setSelectedNetwork: setFromNetwork,
    setSelectedToNetwork: setToNetwork,
    setSelectedCoin: setFromCoin,
    setSelectedToCoin: setToCoin,
  } = useSwapContext();
  const [viewAll, setViewAll] = useState<boolean>(false);

  const finalList = useMemo(
    () =>
      selectedNetwork?.name === "Arbitrum"
        ? isFiatBridge
          ? arbitrumList.filter((i) => buyToArb.includes(i?.shortName))
          : arbitrumList
        : selectedNetwork?.name === "Base"
        ? baseList
        : selectedNetwork?.name === "Avalanche"
        ? avalancheList
        : selectedNetwork?.name === "Optimism"
        ? optimismList
        : tokenList,
    [selectedNetwork, isFiatBridge]
  );

  const popularTokenArr = useMemo(() => {
    const tokenArr = [
      "TBC",
      "BNB",
      "USDC",
      "ETH",
      "POL",
      "USDT",
      "ARB",
      "AVAX",
      "OP",
    ];
    if (selectedNetwork?.name === "Arbitrum") {
      tokenArr.push("ARB");
    } else if (selectedNetwork?.name === "BSC") {
      tokenArr.push("UNI");
      tokenArr.push("USDC");
    }
    return tokenArr;
  }, [selectedNetwork]);

  const popularCrypto = useMemo(
    () =>
      (finalList as ICoin[])
        ?.filter((coin) => coin?.chainId === selectedNetwork?.id)
        ?.filter((coin) => popularTokenArr.includes(coin?.shortName))
        ?.filter(
          (coin) =>
            typeof fromCoinSearch === "undefined" ||
            coin?.shortName
              ?.toLowerCase()
              ?.includes(fromCoinSearch?.toLowerCase()) ||
            coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase())
        )
        .toSpliced(4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedNetwork, fromCoinSearch, fromOrTo]
  );

  const allCrypto = useMemo(
    () =>
      (finalList as ICoin[])
        ?.filter((coin) => coin?.chainId === selectedNetwork?.id)
        // ?.filter((coin) => !["TBC", "BNB", "USDC", "ETH", "POL", "USDT"].includes(coin?.shortName))
        ?.filter(
          (coin) =>
            typeof fromCoinSearch === "undefined" ||
            coin?.shortName
              ?.toLowerCase()
              ?.includes(fromCoinSearch?.toLowerCase()) ||
            coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase())
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedNetwork, fromCoinSearch, fromOrTo]
  );

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

  const popularFiatCurrency = useMemo(
    () =>
      (fiatCurrency as ICoin[])
        ?.filter(() => isFiatBridge && fromOrTo === "FromSelection")
        ?.filter((coin) =>
          ["USD", "GBP", "EUR", "INR"].includes(coin?.shortName)
        )
        ?.filter(
          (coin) =>
            typeof fromCoinSearch === "undefined" ||
            coin?.shortName
              ?.toLowerCase()
              ?.includes(fromCoinSearch?.toLowerCase()) ||
            coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase())
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFiatBridge, fromCoinSearch, fromOrTo]
  );

  const allFiatCurrency = useMemo(
    () =>
      (fiatCurrency as ICoin[])
        ?.filter(() => isFiatBridge && fromOrTo === "FromSelection")
        ?.filter(
          (coin) =>
            typeof fromCoinSearch === "undefined" ||
            coin?.shortName
              ?.toLowerCase()
              ?.includes(fromCoinSearch?.toLowerCase()) ||
            coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase())
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFiatBridge, fromCoinSearch, fromOrTo]
  );

  function onNetworkChange(network: INetworkCard) {
    if (fromOrTo === "FromSelection") {
      network?.name === "Fiat" ? setIsFiatBridge(true) : setIsFiatBridge(false);
    }
    // console.log("setting net", network);
    if (network?.name === "Fiat") {
      setSelectedCoin(
        arbitrumList.find(
          (token: ICoin) => token?.shortName === "USDC"
        ) as ICoin
      );
      setSelectedNetwork(networkCards[4]);
    } else {
      setSelectedNetwork(network);
    }
    // Check if selecting same network chain on both sides when it's not arbitrum
    // let isNetworkArbitrum = network?.name === "Arbitrum";
    // if (fromOrTo === "ToSelection" && !isNetworkArbitrum) {
    //   const isNetworkAlreadySelected = fromNetwork?.id === network?.id;
    //   if (isNetworkAlreadySelected || fromNetwork?.name !== "Arbitrum") {
    //     setFromNetwork(arbitrumNetwork);
    //     setFromCoin(defaultTokenB);
    //   }
    // } else if (fromOrTo === "FromSelection" && !isNetworkArbitrum) {
    //   const isNetworkAlreadySelected = toNetwork?.id === network?.id;
    //   if (isNetworkAlreadySelected || toNetwork?.name !== "Arbitrum") {
    //     setToNetwork(arbitrumNetwork);
    //     setToCoin(defaultTokenB);
    //   }
    // }
    setFromCoinSearch("");
    setSelectedCoin(null);
    setViewAll(false);
    // setIsCoinOpen(false);
    setIsNetworkOpen(false);
  }

  useEffect(() => {
    if (fromOrTo != "ToSelection" && !selectedNetwork) {
      setIsNetworkOpen(true);
    } else if (fromOrTo == "ToSelection" && !selectedNetwork) {
      setIsNetworkOpen(true);
    }
  }, []);

  return (
    <div className="w-full h-full bg-prime-background-200! bg-transparent z-10 rounded-b-md shadow-md rounded-md opacity-100 flex flex-col justify-between">
      {/* <p className="w-full px-4 mt-3 font-semibold text-base">Available Networks</p> */}
      {/* <div className="grid grid-cols-4 gap-x-2 gap-y-2 px-4 pt-3 pb-2">
        {networkCards.map((network, idx) => {
          const isDisabled = network?.name === "Fiat" && fromOrTo === "ToSelection";
          return (
            <button
              key={idx}
              className={clsx(
                "flex w-full py-3.5 shrink-0 flex-col items-center justify-center gap-2 border-[1.5px] rounded-md disabled:opacity-50 group relative",
                isFiatBridge && fromOrTo === "FromSelection"
                  ? network.name === "Fiat"
                    ? "border-prime-blue-100 bg-prime-zinc-400"
                    : "border-prime-zinc-100"
                  : network.id === selectedNetwork?.id
                  ? "border-prime-blue-100 bg-prime-zinc-400"
                  : "border-prime-zinc-100",
                fromOrTo == "ToSelection" && network.name === "Fiat" && "opacity-45"
              )}
              disabled={isDisabled}
              onClick={() => onNetworkChange(network)}>
              <ImageNext className="size-8 shrink-0" src={network?.image} alt="network-logo" />
              <span
                className={clsx(
                  `truncate text-xs w-[90%] text-center`,
                  isFiatBridge && fromOrTo === "FromSelection"
                    ? network.name === "Fiat"
                      ? "text-white"
                      : "text-[#686B6E]"
                    : selectedNetwork?.id == network.id
                    ? "text-white"
                    : "text-[#686B6E]"
                )}>
                {network?.name}
              </span>
              {isDisabled && (fromOrTo as any) === "FromSelection" && (
                <div className="absolute bottom-[-6px] text-center z-[200] left-1 w-[calc(100%-0.5rem)] bg-prime-zinc-400 rounded-full px-1.5 py-0.5 text-[7px]">
                  Coming Soon
                </div>
              )}
            </button>
          );
        })}
      </div> */}
      <div className="h-full mt-3 px-1 pb-3 overflow-hidden flex flex-col min-h-[420px] max-h-[440px]">
        <div className="h-fit flex gap-3 w-full px-3">
          {!isNetworkOpen && (
            <div className="flex items-center justify-between border border-[#818284] rounded-md px-3 py-1.5 w-full">
              <input
                placeholder="Search Tokens"
                className="p-1 bg-transparent w-[calc(100%)] !outline-none text-sm placeholder:text-[#999999]"
                value={fromCoinSearch}
                key="fromToken"
                autoFocus={true}
                onChange={(e) => {
                  setViewAll(true);
                  setFromCoinSearch(e.target.value);
                }}
              />
              <BiSearch size="1.3rem" />
            </div>
          )}
          {!isFiatBridge && (
            <button
              className={`relative rounded-md flex flex-row justify-between items-center w-full border px-2 border-[#818284] text-xs md:text-sm py-2  ${
                selectedNetwork ? "text-white" : "text-[#818284]"
              }`}
              // disabled={fromOrTo === "ToSelection"}
              onClick={() => setIsNetworkOpen(!isNetworkOpen)}
            >
              {selectedNetwork && !isNetworkOpen
                ? selectedNetwork?.name
                : "All Networks"}
              <TiArrowSortedDown className="size-4 md:size-5 object-contain opacity-80" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col h-full scrollbar-hide  overflow-y-scroll overflow-x-hidden px-3 mt-2">
          {/* {!viewAll ? (
            <CondensedView
              popularCrypto={isFiatBridge && fromOrTo === "FromSelection" ? popularFiatCurrency : popularCrypto}
              allCrypto={isFiatBridge && fromOrTo === "FromSelection" ? allFiatCurrency : allCrypto}
              setViewAll={setViewAll}
              setIsCoinOpen={setIsCoinOpen}
              setFromCoinSearch={setFromCoinSearch}
              isFiatBridge={isFiatBridge}
              setSelectedCoin={setSelectedCoin}
              fromOrTo={fromOrTo}
            />
          ) : (
            <FullView
              popularCrypto={isFiatBridge && fromOrTo === "FromSelection" ? popularFiatCurrency : popularCrypto}
              allCrypto={isFiatBridge && fromOrTo === "FromSelection" ? allFiatCurrency : allCrypto}
              setViewAll={setViewAll}
              setIsCoinOpen={setIsCoinOpen}
              setFromCoinSearch={setFromCoinSearch}
              isFiatBridge={isFiatBridge}
              setSelectedCoin={setSelectedCoin}
              fromOrTo={fromOrTo}
            />
          )} */}
          {isNetworkOpen ? (
            <NetworkView
              fromOrTo={fromOrTo}
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
              isFiatBridge={isFiatBridge}
              onNetworkChange={onNetworkChange}
              setIsCoinOpen={setIsCoinOpen}
            />
          ) : (
            <OldView
              popularCrypto={
                isFiatBridge && fromOrTo === "FromSelection"
                  ? popularFiatCurrency
                  : popularCrypto
              }
              allCrypto={
                isFiatBridge && fromOrTo === "FromSelection"
                  ? allFiatCurrency
                  : allCrypto
              }
              setViewAll={setViewAll}
              setIsCoinOpen={setIsCoinOpen}
              setFromCoinSearch={setFromCoinSearch}
              isFiatBridge={isFiatBridge}
              setSelectedCoin={setSelectedCoin}
              fromOrTo={fromOrTo}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function NetworkView({
  fromOrTo,
  selectedNetwork,
  setSelectedNetwork,
  isFiatBridge,
  onNetworkChange,
  setIsCoinOpen,
}: {
  fromOrTo: "FromSelection" | "ToSelection";
  selectedNetwork: INetworkCard | null;
  setSelectedNetwork: Dispatch<SetStateAction<INetworkCard | null>>;
  isFiatBridge: boolean;
  onNetworkChange: (network: INetworkCard) => void;
  setIsCoinOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex flex-col pt-3 pb-2">
      <div className="flex justify-between text-[0.8rem] font-semibold items-center px-1 pb-2">
        <p>Select Network</p>
      </div>
      {networkCards.map((network, idx) => {
        const isDisabled =
          network?.name === "Fiat" && fromOrTo === "ToSelection";
        return (
          <>
            <button
              key={idx}
              className={clsx(
                "flex py-2.5 px-2 items-center text-sm justify-between space-y-2 border-[1.5px] border-transparent hover:border-prime-zinc-100 w-full hover:bg-white/15 rounded disabled:opacity-50",
                network.id === selectedNetwork?.id && "bg-white/15"
              )}
              onClick={() => onNetworkChange(network)}
            >
              <div className="flex gap-3">
                <div>
                  <ImageNext
                    src={network?.image}
                    className={clsx("size-7 overflow-hidden")}
                    alt="network-logo"
                  />
                </div>
                <span className=" w-full flex justify-center items-center text-left font-semibold">
                  {network?.name}
                </span>
              </div>
            </button>
          </>
        );
      })}
    </div>
  );
}
export default SelectCoin;
