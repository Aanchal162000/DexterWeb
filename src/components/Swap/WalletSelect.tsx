import React, { useState, useRef, useEffect } from "react";

interface WalletOption {
  id: string;
  name: string;
  logo: string;
}

const walletOptions: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    logo: "/Login/Metamask.png",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    logo: "/Login/Coinbase.png",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    logo: "/Login/Walletconnect.png",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    logo: "/Login/Trustwallet.png",
  },
];

interface WalletSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const WalletSelect: React.FC<WalletSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedWallet = walletOptions.find((w) => w.id === value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-transparent border border-primary-100/40 rounded-lg cursor-pointer"
      >
        {selectedWallet ? (
          <div className="flex items-center gap-2">
            <img
              src={selectedWallet.logo}
              alt={selectedWallet.name}
              className="w-6 h-6"
            />
            <span className="text-white">{selectedWallet.name}</span>
          </div>
        ) : (
          <div className="text-gray-400">Select your wallet</div>
        )}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-4 h-4 text-white transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-primary-100/20 z-40 backdrop-blur-sm  bg-black/70 drop-shadow-lg ring-1 ring-primary-100/20 focus:outline-none text-left align-middle shadow-xl transition-all rounded-lg overflow-hidden ">
          {walletOptions.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => {
                onChange(wallet.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-primary-100/10 border-b border-primary-100/20 last:border-b-0"
            >
              <img src={wallet.logo} alt={wallet.name} className="w-6 h-6" />
              <span className="text-white">{wallet.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletSelect;
