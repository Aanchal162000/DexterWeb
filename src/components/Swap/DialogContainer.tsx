import { useSwapContext } from "@/context/SwapContext";
import React from "react";
import { MdClose } from "react-icons/md";

function DialogContainer({
  children,
  setClose,
  title,
  confirmClose,
}: {
  children: React.ReactNode;
  setClose: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  confirmClose?: boolean;
}) {
  const [openPop, setOpenPop] = React.useState(false);
  const { isTokenRelease } = useSwapContext();
  return (
    <div className="z-40 flex h-full w-full flex-1 top-0 left-0 fixed bg-black/40 items-end justify-center">
      <div className="fixed mb-6 w-[calc(100%-3rem)] min-h-[312px] flex flex-col text-white backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl overflow-hidden">
        <h2 className="flex relative flex-col justify-center items-center text-center border-primary-100 w-[100%] h-[60px] text-sm md:text-base text-primary-100">
          {title}
          <button
            onClick={() =>
              confirmClose && !isTokenRelease
                ? setOpenPop(true)
                : setClose(false)
            }
            className="absolute right-3 top-4 p-1 text-base text-primary-100 flex justify-end"
          >
            <MdClose size={20} />
          </button>
        </h2>
        {children}
        {openPop && (
          <div className="absolute z-40 flex flex-col h-full w-full bg-black/70 items-center justify-center">
            <h6 className="text-xl mb-2">Are you sure ?</h6>
            <div className="text-sm text-center w-[70%]">
              Transaction will stop and data will be lost.
            </div>
            <div className="flex gap-2 mt-4 text-sm w-[60%]">
              <button
                className="w-full bg-blue-700 px-8 py-1 rounded filter hover:brightness-110"
                onClick={() => setClose(false)}
              >
                Confirm
              </button>
              <button
                className="w-full bg-blue-700 px-8 py-1 rounded filter hover:brightness-110"
                onClick={() => setOpenPop(false)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DialogContainer;
