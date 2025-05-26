import { ICoin } from "@/utils/interface";
import clsx from "clsx";
import ImageNext from "../common/ImageNext";
import { useFiatContext } from "../../context/FiatContext";
import { IoClose } from "react-icons/io5";
import { useSwapContext } from "../../context/SwapContext";
import { Dispatch, SetStateAction } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";

function OldView({
  popularCrypto,
  allCrypto,
  setViewAll,
  setIsCoinOpen,
  setFromCoinSearch,
  isFiatBridge,
  setSelectedCoin,
  fromOrTo,
}: {
  popularCrypto: ICoin[];
  allCrypto: ICoin[];
  setViewAll: Dispatch<SetStateAction<boolean>>;
  setIsCoinOpen: Dispatch<SetStateAction<boolean>>;
  setFromCoinSearch: Dispatch<SetStateAction<string | undefined>>;
  isFiatBridge: boolean;
  setSelectedCoin: Dispatch<SetStateAction<ICoin | null>>;
  fromOrTo: "FromSelection" | "ToSelection";
}) {
  const {
    selectedCoin: selectedFromCoin,
    selectedToCoin,
    setSelectedCoin: setSelectedFromCoin,
    setSelectedToCoin,
    selectedNetwork,
    selectedToNetwork,
    setFromAmount,
  } = useSwapContext();

  let virtualList = ["heading", ...allCrypto];
  let isPopularSkipped = true;
  if (allCrypto?.length > 10) {
    isPopularSkipped = false;
    virtualList?.unshift(...["heading", ...popularCrypto]);
  }

  const Row = ({ index, style }: { index: number; style: any }) => {
    let currentElement = virtualList[index];
    let isHeading =
      typeof currentElement === "string" && currentElement === "heading";

    if (isHeading)
      return (
        <div
          className="flex justify-between text-[0.8rem] font-semibold items-center pt-3 pb-2"
          style={style}
        >
          <p>
            {index === 0 && !isPopularSkipped ? "Popular" : "All"}{" "}
            {isFiatBridge && fromOrTo === "FromSelection"
              ? "Currencies"
              : "Cryptocurrencies"}
          </p>
        </div>
      );

    return (
      <button
        key={index}
        style={style}
        disabled={
          selectedFromCoin?.shortName ===
            (virtualList as ICoin[])[index]?.shortName &&
          selectedNetwork === selectedToNetwork &&
          fromOrTo === "ToSelection"
        }
        className={clsx(
          "flex flex-row py-2.5 px-2 items-center text-sm justify-between gap-2 border-[1.5px] border-transparent hover:border-prime-zinc-100 w-full hover:bg-white/15 rounded disabled:opacity-50",
          fromOrTo === "ToSelection" &&
            selectedNetwork === selectedToNetwork &&
            selectedFromCoin?.shortName ===
              (virtualList as ICoin[])[index]?.shortName
            ? "bg-white/15"
            : null
        )}
        onClick={() => {
          if (
            selectedToCoin?.shortName ===
              (virtualList as ICoin[])[index]?.shortName &&
            selectedNetwork === selectedToNetwork &&
            fromOrTo === "FromSelection"
          )
            setSelectedToCoin(null);
          if (
            selectedFromCoin?.shortName ===
              (virtualList as ICoin[])[index]?.shortName &&
            selectedNetwork === selectedToNetwork &&
            fromOrTo === "ToSelection"
          )
            setSelectedFromCoin(null);
          setSelectedCoin((virtualList as ICoin[])[index]);
          setIsCoinOpen(false);
          setFromCoinSearch("");
        }}
      >
        <div className="flex gap-3 items-center justify-between">
          <div>
            <ImageNext
              src={(virtualList as ICoin[])[index]?.logo}
              className={clsx(
                "size-7 overflow-hidden",
                !(isFiatBridge && fromOrTo === "FromSelection") &&
                  "bg-white rounded-full"
              )}
              alt="all-crypto"
            />
          </div>
          <span className="w-full flex justify-center items-center text-left font-semibold">
            {(virtualList as ICoin[])[index]?.shortName}
          </span>
        </div>
        <span>{(virtualList as ICoin[])[index]?.name}</span>
      </button>
    );
  };

  if (!allCrypto?.length || !popularCrypto?.length) return null;
  return (
    <>
      {/* <div className="flex justify-between text-[0.8rem] font-semibold items-center mt-2 mb-3">
        <p>Popular {isFiatBridge && fromOrTo === "FromSelection" ? "Currencies" : "Cryptocurrencies"}</p>
      </div>
      <div className="flex flex-col gap-1 w-full h-auto">
        {popularCrypto?.map((crypto: ICoin, index: number) => (
          <button
            key={index}
            // disabled={selectedCoin?.shortName === crypto?.shortName && fromOrTo === "FromSelection" || selectedToCoin?.shortName === crypto?.shortName && fromOrTo === "ToSelection"}
            className={clsx(
              "flex py-2.5 px-2 items-center text-sm justify-between space-y-2 border-[1.5px] border-transparent hover:border-prime-zinc-100 w-full hover:bg-white/15 rounded disabled:opacity-50"
            )}
            onClick={() => {
              if (selectedToCoin?.shortName === crypto?.shortName && selectedNetwork === selectedToNetwork && fromOrTo === "FromSelection")
                setSelectedToCoin(null);
              if (
                selectedFromCoin?.shortName === crypto?.shortName &&
                selectedNetwork === selectedToNetwork &&
                fromOrTo === "ToSelection"
              ) {
                setFromAmount(0);
                setSelectedFromCoin(null);
              }
              isFiatBridge && fromOrTo === "FromSelection" ? setSelectedFiatCoin(crypto) : setSelectedCoin(crypto);
              setIsCoinOpen(false);
              setFromCoinSearch("");
            }}>
            <div className="flex gap-2">
              <div>
                <ImageNext
                  src={crypto?.logo}
                  className={clsx("size-7 overflow-hidden", !(isFiatBridge && fromOrTo === "FromSelection") && "bg-white rounded-full")}
                  alt="all-crypto"
                />
              </div>
              <span className=" w-full flex justify-center items-center text-left font-semibold">{crypto?.shortName}</span>
            </div>
            <span>{crypto?.name}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[0.8rem] font-semibold items-center mt-4 mb-3">
        <p>All {isFiatBridge && fromOrTo === "FromSelection" ? "Currencies" : "Cryptocurrencies"}</p>
      </div> */}
      <div className="flex-1 size-full">
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="List"
              height={height}
              itemCount={virtualList?.length}
              itemSize={(index) =>
                typeof virtualList[index] === "string" ? 28 : 43
              }
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
        {/* {allCrypto?.map((crypto: ICoin, index: number) => (
          <button
            key={index}
            // disabled={selectedCoin?.shortName === crypto?.shortName && fromOrTo === "FromSelection" || selectedToCoin?.shortName === crypto?.shortName && fromOrTo === "ToSelection"}
            className={clsx(
              "flex py-2.5 px-2 items-center text-sm justify-between space-y-2 border-[1.5px] border-transparent hover:border-prime-zinc-100 w-full hover:bg-white/15 rounded disabled:opacity-50"
            )}
            onClick={() => {
              if (selectedToCoin?.shortName === crypto?.shortName && selectedNetwork === selectedToNetwork && fromOrTo === "FromSelection")
                setSelectedToCoin(null);
              if (selectedFromCoin?.shortName === crypto?.shortName && selectedNetwork === selectedToNetwork && fromOrTo === "ToSelection")
                setSelectedFromCoin(null);
              isFiatBridge && fromOrTo === "FromSelection" ? setSelectedFiatCoin(crypto) : setSelectedCoin(crypto);
              setIsCoinOpen(false);
              setFromCoinSearch("");
            }}>
            <div className="flex gap-2">
              <div>
                <ImageNext
                  src={crypto?.logo}
                  className={clsx("size-7 overflow-hidden", !(isFiatBridge && fromOrTo === "FromSelection") && "bg-white rounded-full")}
                  alt="all-crypto"
                />
              </div>
              <span className=" w-full flex justify-center items-center text-left font-semibold">{crypto?.shortName}</span>
            </div>
            <span>{crypto?.name}</span>
          </button>
        ))} */}
      </div>
    </>
  );
}

export default OldView;
