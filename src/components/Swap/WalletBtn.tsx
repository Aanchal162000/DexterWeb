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
import { BiChevronDown } from "react-icons/bi";
import { chainsLogo } from "@/constants/config";
import { useLoginContext } from "@/context/LoginContext";
import { MdContentCopy } from "react-icons/md";
import { HiOutlineExternalLink, HiOutlineLogout } from "react-icons/hi";
import { HiChevronUpDown } from "react-icons/hi2";

export default function WalletBtn({
  address,
  chain,
}: {
  address: string;
  chain: string | number;
}) {
  const router = useRouter();
  const formattedAddress = formatAddress(address, 4);
  const { setAddress } = useLoginContext();

  const copyAddressHandler = () => {
    toast.info("Address Copied");
    window.navigator.clipboard.writeText(address);
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left w-fit">
        <div>
          <MenuButton
            className="border border-prime-zinc-100 relative text-white h-11 text-sm w-48 flex items-center justify-between px-3
           rounded font-regular cursor-pointer gap-x-2 group"
          >
            <ImageNext
              src={chainsLogo[chain]}
              className="rounded-full size-5"
              alt="blockchain-icon"
            />
            <div className="text-[0.9375rem] ml-auto">{formattedAddress}</div>
            <HiChevronUpDown
              size="1.2rem"
              className="transition-all duration-300 rotate-0 group-aria-expanded:rotate-180!"
            />
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
          <MenuItems className="absolute right-0 mt-3 ring-1 ring-prime-zinc-200 shadow-md w-full focus:outline-none bg-black/25 backdrop-blur-sm text-white drop-shadow-xl overflow-hidden rounded text-sm font-medium z-50">
            <div>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-white/20 px-4 py-3.5 outline-none w-full border-b border-prime-zinc-100"
                  onClick={() => {
                    copyAddressHandler();
                  }}
                >
                  <p>Copy Address</p>
                  <MdContentCopy size="1.2rem" />
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-white/20 px-4 py-3.5 outline-none w-full border-b border-prime-zinc-100"
                  onClick={() => {
                    window.open(
                      "https://arbiscan.io/address/" + address,
                      "_blank"
                    );
                  }}
                >
                  <p>Explorer</p>
                  <HiOutlineExternalLink size="1.2rem" />
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-white/20 px-4 py-3.5 outline-none w-full border-b border-prime-zinc-100"
                  onClick={() => window.open("/", "_self")}
                >
                  <p>Disconnect</p>
                  <ImageNext
                    src="/common/Disconnect.png"
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
