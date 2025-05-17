import { ICoin } from "@/utils/interface";
import clsx from "clsx";
import ImageNext from "../common/ImageNext";
import { useSwapContext } from "../../context/SwapContext";
import { useFiatContext } from "../../context/FiatContext";

function CondensedView({
  popularCrypto,
  allCrypto,
  setViewAll,
  setIsCoinOpen,
  setFromCoinSearch,
  isFiatBridge,
  setSelectedCoin,
  fromOrTo,
}: any) {
  const { selectedCoin, selectedToCoin } = useSwapContext();

  if (!allCrypto.length) return null;
  return (
    <>
      <div className="flex justify-between text-[1rem] font-semibold items-center mb-2">
        Popular{" "}
        {isFiatBridge && fromOrTo === "FromSelection"
          ? "Currency"
          : "Cryptocurrencies"}
      </div>
      <div className="border-[1px] border-[#15181B] rounded-sm flex flex-col h-auto w-full">
        {popularCrypto?.map((crypto: ICoin, index: number) => (
          <button
            key={index}
            disabled={
              selectedCoin?.shortName === crypto?.shortName ||
              selectedToCoin?.shortName === crypto?.shortName
            }
            className={clsx(
              "flex py-3 px-4 items-center border-b-[1px] border-b-[#15181B] flex-row justify-between hover:bg-white/15 rounded disabled:opacity-50"
            )}
            onClick={() => {
              setSelectedCoin(crypto);
              setIsCoinOpen(false);
              setFromCoinSearch("");
            }}
          >
            <div className="flex flex-row space-x-4 items-center justify-start">
              <ImageNext
                src={crypto?.logo}
                className="size-6"
                alt="popular-crypto"
                fullRadius={
                  isFiatBridge && fromOrTo === "FromSelection" ? false : true
                }
              />
              <span className=" w-[20%] text-sm text-left font-semibold">
                {crypto?.shortName}
              </span>
            </div>

            <span className="w-[50%] text-sm text-[#CDCECF] text-left font-normal flex justify-end">
              {crypto?.name}
            </span>
          </button>
        ))}

        {allCrypto?.length && (
          <div
            key="viewAll"
            className={clsx(
              "flex py-2 px-4 items-center border-b-[1px] border-b-[#15181B] cursor-pointer flex-row justify-between hover:bg-white/15 rounded"
            )}
          >
            <button
              className="w-full text-base text-left font-normal flex justify-start"
              onClick={() => setViewAll(true)}
            >
              View All {allCrypto.length} Tokens
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CondensedView;
