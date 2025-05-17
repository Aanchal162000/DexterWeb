import { ICoin } from "@/utils/interface";
import clsx from "clsx";
import ImageNext from "../common/ImageNext";
import { useFiatContext } from "@/contexts/FiatContext";
import { IoClose } from "react-icons/io5";
import { useSwapContext } from "@/contexts/SwapContext";

function FullView({ allCrypto, setViewAll, setIsCoinOpen, setFromCoinSearch, isFiatBridge, setSelectedCoin, fromOrTo }: any) {
  const { selectedCoin, selectedToCoin } = useSwapContext();

  if (!allCrypto.length) return null;
  return (
    <>
      <div className="flex justify-between text-[0.8rem] font-semibold items-center mt-2 mb-4">
        <p>All {isFiatBridge && fromOrTo === "FromSelection" ? "Currencies" : "Cryptocurrencies"}</p>
        <button onClick={() => setViewAll(false)}>
          <IoClose size="1.2rem" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2 w-full h-auto">
        {allCrypto?.map((crypto: ICoin, index: number) => (
          <button
            key={index}
            disabled={selectedCoin?.shortName === crypto?.shortName || selectedToCoin?.shortName === crypto?.shortName}
            className={clsx(
              "flex py-1 px-2 items-center justify-center space-y-2 border-[1.5px] border-[#686B6E] w-full h-[5rem] flex-col hover:bg-white/15 rounded-sm disabled:opacity-50"
            )}
            onClick={() => {
              setSelectedCoin(crypto);
              setIsCoinOpen(false);
              setFromCoinSearch("");
            }}>
            <ImageNext
              src={crypto?.logo}
              className="w-6 h-6 rounded-full"
              alt="all-crypto"
            />
            <span className=" w-full flex justify-center items-center text-xs text-left font-semibold">{crypto?.shortName}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default FullView;
