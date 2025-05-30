import { useFiatContext } from "@/context/FiatContext";
import { useLoginContext } from "@/context/LoginContext";
import { useSwapContext } from "@/context/SwapContext";
import { Dispatch, SetStateAction, useState } from "react";

function SwitcherButton({
  buttonText,
  setIsConfirmPop,
}: {
  buttonText: string;
  setIsConfirmPop: Dispatch<SetStateAction<boolean>>;
}) {
  const { networkData, switchNetwork } = useLoginContext();
  const {
    selectedCoin,
    fromAmount,
    fromTokenData,
    isFiatBridge,
    selectedNetwork,
    isApproved,
    continueTransaction,
    approveAmount,
  } = useSwapContext();
  const [loading, setLoading] = useState<boolean>(false);
  const isNotSwitch = Boolean(selectedNetwork?.id === networkData?.chainId);
  const isUnsufficientToken = Boolean(
    Number(fromAmount) != 0 &&
      !isNotSwitch &&
      Number(fromAmount) >= Number(fromTokenData?.balance!)
  );
  const { setTransakStatus, triggerOrderInitiate, setOpenFiatModal } =
    useFiatContext();

  async function continueOrApprove() {
    if (buttonText === "Buy") {
      // setTransakStatus("processing");
      setOpenFiatModal(true);
      await triggerOrderInitiate();
    }
    if (buttonText === "Trade") {
      if (isApproved) {
        setIsConfirmPop(true);
        // continueTransaction();
      } else {
        setIsConfirmPop(true);
        // approveAmount();
      }
    }
  }

  async function switchNetworkHandler(chainId: number) {
    try {
      setLoading(true);
      await switchNetwork(chainId, () => setLoading(false));
    } catch (e) {
      console.error("Switch error ", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isNotSwitch && !isFiatBridge ? (
        <button
          className={`w-full text-black disabled:text-white py-3 rounded text-base mt-6 justify-self-end bg-primary-100 animate-blinker`}
          onClick={() => switchNetworkHandler(selectedNetwork?.id as number)}
        >
          {loading ? "Switching..." : `Switch to ${selectedNetwork?.name}`}
        </button>
      ) : isUnsufficientToken && !isFiatBridge ? (
        <button
          disabled={true}
          className="disabled:bg-prime-gray-200 bg-primary-100 w-full text-black disabled:text-white py-3 rounded text-sm sm:text-base mt-6 justify-self-end"
        >
          Insufficient {selectedCoin?.shortName} Balance
        </button>
      ) : (
        <button
          onClick={() => continueOrApprove()}
          // disabled={isDisabled}
          className="disabled:bg-prime-gray-200 bg-primary-100 w-full text-black disabled:text-white py-3 rounded text-sm sm:text-base mt-6 justify-self-end"
        >
          {buttonText}
        </button>
      )}
    </>
  );
}

export default SwitcherButton;
