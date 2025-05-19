import { Fragment } from "react";
import {
  Menu,
  Transition,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import Image from "next/image";
import { HiChevronUpDown } from "react-icons/hi2";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { HiCheck } from "react-icons/hi";

interface TokenOption {
  name: string;
  symbol: string;
  logo: string;
  balance: number;
}

const defaultToken: TokenOption = {
  name: "Dexter",
  symbol: "DEXTER",
  logo: "/Trade/dexterLogo.png",
  balance: 1412912,
};

const TokenSelector = () => {
  const [selectedToken, setSelectedToken] = useLocalStorage<TokenOption>(
    "default-token",
    defaultToken
  );

  const tokenOptions: TokenOption[] = [
    defaultToken,
    {
      name: "Virtuals",
      symbol: "VIRT",
      logo: "/Networks/Base.png",
      balance: 500000,
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      logo: "/Networks/ETH.png",
      balance: 2.5,
    },
  ];

  const currentToken = selectedToken || defaultToken;

  return (
    <Menu as="div" className="relative inline-block text-left w-fit">
      <div>
        <MenuButton className="flex w-[160px] flex-row p-2 items-center justify-between space-x-3 bg-primary-100/10 text-white text-base text-center font-bold rounded-md hover:bg-primary-100/20 transition-colors duration-200 group border border-primary-100/20">
          <Image
            alt={currentToken.name}
            src={currentToken.logo}
            width={20}
            height={20}
            className="rounded-full"
          />
          <div className="flex flex-row space-x-1 justify-center items-center">
            <p className="text-white font-semibold text-sm">
              {currentToken.balance.toLocaleString()}
            </p>
            <p className="text-primary-100 font-medium text-[10px]">
              {currentToken.symbol}
            </p>
            <HiChevronUpDown
              size="1.2rem"
              className="text-primary-100 transition-all duration-300 rotate-0 group-aria-expanded:rotate-180"
            />
          </div>
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
        <MenuItems className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-[#15181B] shadow-lg ring-1 ring-primary-100/20 focus:outline-none backdrop-blur-sm">
          <div className="py-1">
            {tokenOptions.map((token) => (
              <MenuItem key={token.symbol}>
                {({ active }) => (
                  <button
                    onClick={() => setSelectedToken(token)}
                    className={`${
                      active ? "bg-primary-100/10" : ""
                    } flex w-full items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-primary-100/5 transition-colors duration-200`}
                  >
                    <div className="flex items-center">
                      <Image
                        alt={token.name}
                        src={token.logo}
                        width={20}
                        height={20}
                        className="mr-3 rounded-full"
                      />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{token.name}</span>
                        <span className="text-xs text-primary-100">
                          {token.balance.toLocaleString()} {token.symbol}
                        </span>
                      </div>
                    </div>
                    {token.symbol === currentToken.symbol && (
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary-100 mr-2" />
                        <HiCheck className="h-4 w-4 text-primary-100" />
                      </div>
                    )}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default TokenSelector;
