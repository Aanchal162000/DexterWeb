import { useLoginContext } from "../../context/LoginContext";
import { useSwapContext } from "../../context/SwapContext";
import { formatAddress } from "@/utils/helper";
import { IoClose } from "react-icons/io5";
import { MdAddCircleOutline } from "react-icons/md";

export default function AddressBox({
  isOpen,
  onToggle,
  setRecipientAddress,
}: {
  isOpen: boolean;
  onToggle: () => void;
  setRecipientAddress: (address: string) => void;
}) {
  const { toAddress, setToAddress } = useSwapContext();
  const { address } = useLoginContext();
  return (
    <div className="flex items-center justify-between text-sm my-4">
      <div className="text-prime-zinc-100 font-semibold">Recipient Address</div>
      {!toAddress || toAddress === address ? (
        <button
          disabled={isOpen}
          className="font-semibold flex items-center justify-center gap-2 !leading-none"
          onClick={onToggle}
        >
          <MdAddCircleOutline size="1rem" />
          Add Address
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span>{formatAddress(toAddress)}</span>
          <button
            onClick={() => {
              setToAddress(address);
              setRecipientAddress(address as string);
            }}
          >
            <IoClose size="1.2rem" />
          </button>
        </div>
      )}
    </div>
  );
}
