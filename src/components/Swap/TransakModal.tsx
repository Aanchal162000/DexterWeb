import { IoIosArrowRoundBack } from "react-icons/io";
import ImageNext from "../common/ImageNext";
import { useFiatContext } from "@/context/FiatContext";

export default function TransakModal() {
  const { setTransakStatus, transakStatus, timerMM, timerSS } =
    useFiatContext();
  return (
    <div className="flex flex-col h-full w-full max-h-[340px] overflow-y-auto">
      <div className="relative flex flex-col flex-1 rounded px-2 pb-12 pt-4 size-full overflow-x-hidden overflow-y-hidden">
        {/* Buy from Heading */}
        {/* <div className="flex flex-row px-2 py-3 items-center w-full">
          <button className="opacity-30 disabled:opacity-30">
            <IoIosArrowRoundBack size="1.8rem" />
          </button>
          <p className="text-white text-base md:text-lg font-bold -translate-x-2 m-auto">Transak Swap Widget</p>
        </div> */}
        <div className="flex-1 flex items-center justify-center">
          <ImageNext
            src="/common/Loading.svg"
            className="m-auto size-[15.625rem]"
            alt="loading"
          />
          <div className="absolute text-white flex items-center flex-col justify-center text-center">
            {transakStatus === "completed" ? (
              <p>
                Completed Order.
                <br />
                Redirecting to convert!
              </p>
            ) : transakStatus === "processing" ? (
              <p>
                Processing Order... <br />
                Time elapsed:[{timerMM}:{timerSS}] <br />
                Please wait!!
              </p>
            ) : (
              <p>
                Opening widget...
                <br />
                Please wait!!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
