import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import {
  Menu,
  Transition,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { toast } from "react-toastify";
import ImageNext from "../common/ImageNext";
import { formatAddress } from "@/utils/helper";
import { BiChevronDown, BiTimer } from "react-icons/bi";
import { IoMenu } from "react-icons/io5";
import { TbAirBalloon } from "react-icons/tb";
import { useLoginContext } from "../../context/LoginContext";
import { HiChevronUpDown } from "react-icons/hi2";

export default function CrossBtn() {
  const { crossPower } = useLoginContext();

  return (
    <>
      <Menu as="div" className="relative inline-block text-left w-fit">
        <div>
          <MenuButton
            className="bg-prime-blue-100 relative text-white h-11 text-sm w-48 flex items-center justify-between px-3
           rounded font-regular cursor-pointer gap-x-2 group"
          >
            <ImageNext
              src="/common/Whitelogo.png"
              className="size-5 object-contain"
              alt="cross-power"
            />
            {/* <div className="flex items-center justify-center gap-2"> */}
            <p className="text-white text-base flex ml-auto">
              {parseFloat(String(crossPower)).toFixed(2)}{" "}
              <span className="text-[0.6875rem] ml-1 translate-y-[1px]">
                CP
              </span>
            </p>
            <HiChevronUpDown
              size="1.2rem"
              className="transition-all duration-300 rotate-0 group-aria-expanded:rotate-180!"
            />
            {/* </div> */}
          </MenuButton>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-3 shadow-md ring-1 ring-black/5 focus:outline-none bg-prime-blue-100 text-white drop-shadow-xl w-48 rounded text-sm font-medium z-50">
            <div>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-black/50 px-4 py-3.5 outline-none w-full border-b border-prime-zinc-50"
                  onClick={() =>
                    window.open(
                      "https://medium.com/@zkcrossnetwork/unlocking-rewards-with-cross-power-cp-on-partisia-zkcrossdex-c295680c18a6",
                      "_blank"
                    )
                  }
                >
                  <p>Earn Cross</p>
                  <ImageNext
                    src="/common/EarnCP.png"
                    className="size-[1.2rem] object-contain"
                    alt="cross-power"
                  />
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-black/50 px-4 py-3.5 outline-none w-full border-b border-prime-zinc-50"
                  onClick={() =>
                    window.open(
                      "https://zkcrossnetwork.medium.com/swap-and-earn-with-partisia-zkcrossdex-revolutionising-defi-transactions-2b6e959aaebc",
                      "_blank"
                    )
                  }
                >
                  <p>Airdrop</p>
                  <ImageNext
                    src="/common/Airdrop.png"
                    className="size-[1.2rem] object-contain"
                    alt="cross-power"
                  />
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-black/50 px-4 py-3.5 outline-none w-full"
                  onClick={() =>
                    window.open(
                      "https://zkcrossnetwork.medium.com/977013b4c3a1",
                      "_blank"
                    )
                  }
                >
                  <p>Token Sale</p>
                  <ImageNext
                    src="/common/TokenSale.png"
                    className="size-[1.2rem] object-contain"
                    alt="cross-power"
                  />
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </>
  );
}
