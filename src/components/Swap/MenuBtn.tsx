import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import {
  Menu,
  Transition,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { toast } from "react-toastify";
import ImageNext from "../common/ImageNext";
import { formatAddress } from "@/utils/helper";
import { BiChevronDown } from "react-icons/bi";
import { IoMenu } from "react-icons/io5";
import { chainsLogo } from "@/constants/config";
import { useLoginContext } from "../../context/LoginContext";
import { HiOutlineLogout, HiOutlineSupport } from "react-icons/hi";
import { AiOutlineDiscord } from "react-icons/ai";
import { GrDocumentText } from "react-icons/gr";

export default function MenuBtn() {
  const router = useRouter();

  return (
    <>
      <Menu as="div" className="relative inline-block text-left w-fit z-50">
        <MenuButton className="relative h-11 text-sm rounded font-regular cursor-pointer p-0 flex items-center">
          <IoMenu
            size="2.6rem"
            className="transition-all duration-300 rotate-0 text-[#686B6E]"
          />
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute right-0 mt-4 shadow-md ring-1 ring-prime-zinc-200 focus:outline-none bg-black/25 text-white drop-shadow-xl backdrop-blur-sm w-48 rounded text-sm font-medium z-50">
            <div>
              {/* <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-white/20 px-4 py-4 outline-none w-full z-40"
                  onClick={() => window.open("https://zkCross.network/help-center", "_blank")}>
                  <p>Help Center</p>
                  <ImageNext src="/common/HelpCenter.png" className="size-[1.2rem] object-contain" alt="cross-power" />
                </button>
              </MenuItem> */}
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-white/20 px-4 py-4 outline-none w-full z-50"
                  onClick={() =>
                    window.open("https://discord.zkCross.network", "_blank")
                  }
                >
                  <p>Discord Support</p>
                  <AiOutlineDiscord size="1.2rem" />
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-white/20 px-4 py-4 outline-none w-full z-40"
                  onClick={() =>
                    window.open(
                      "https://zkcross-network.gitbook.io/zkcrossnetwork",
                      "_blank"
                    )
                  }
                >
                  <p>Docs</p>
                  <GrDocumentText size="1.2rem" />
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  className="flex flex-row items-center justify-between hover:bg-white/20 px-4 py-4 outline-none w-full z-50"
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
