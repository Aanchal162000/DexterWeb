import { useLoginContext } from "../../context/LoginContext";
import { useSwapContext } from "../../context/SwapContext";
import { Dialog, DialogPanel } from "@headlessui/react";
import { useEffect, useState } from "react";

export default function AddressModal({
  isModalOpen,
  onClose,
  recipientAddress,
  setRecipientAddress,
}: {
  isModalOpen: boolean;
  onClose: () => void;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
}) {
  const { setToAddress } = useSwapContext();
  const { address } = useLoginContext();
  const [checkedAddTick, setCheckedAddTick] = useState(false);

  useEffect(() => {
    if (address && !recipientAddress) {
      setRecipientAddress(address as string);
      setToAddress(address as string);
    }
  }, [address]);

  const onModalClose = () => {
    !recipientAddress && setRecipientAddress(address as string);
    // setCheckedAddTick(false);
    onClose();
  };

  return (
    <Dialog
      open={isModalOpen}
      as="div"
      onClose={onModalClose}
      className="fixed inset-0 z-[1001] focus:outline-none flex items-center justify-center backdrop-blur-sm"
    >
      <DialogPanel className="fixed gap-4 flex-col w-[min(500px,85vw)] text-white bg-prime-background rounded">
        <h3 className=" text-center font-bold border-b-[1px] border-prime-zinc-100 w-[100%] py-6 text-sm md:text-lg text-white">
          Recipient Address
        </h3>
        <div className="py-10 sm:px-16 px-4 flex flex-col items-center justify-center gap-6">
          <div className="flex w-full border gap-3 p-3 border-prime-zinc-200 rounded-sm">
            <input
              className="bg-transparent text-white w-full text-sm !outline-none placeholder:text-[#626262]"
              placeholder="Enter the recipient address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target?.value)}
            />
            <button
              className="outline-none font-normal text-sm"
              onClick={async () => {
                const clipboardCopiedText =
                  await navigator.clipboard.readText();
                setRecipientAddress(clipboardCopiedText);
              }}
            >
              Paste
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="checkbox"
              className="size-9 my-auto"
              checked={checkedAddTick}
              onChange={() => setCheckedAddTick((prev: boolean) => !prev)}
            />
            <p className="text-sm">
              Please ensure that the address is correct and not an exchange
              wallet. Any tokens sent to the wrong address will be impossible to
              retrieve.
            </p>
          </div>
          <button
            disabled={!checkedAddTick}
            className="py-3 px-16 bg-[#004ef5] rounded-sm w-fit mt-2 text-sm font-bold disabled:opacity-80 disabled:bg-[#3c3c3c]"
            onClick={() => {
              recipientAddress
                ? setToAddress(recipientAddress)
                : setToAddress(address);
              onModalClose();
            }}
          >
            Confirm
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
