"use client";
import {
  Dispatch,
  EffectCallback,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { ConnectorNotFoundError } from "wagmi";

import { toastError, toastInfo } from "@/utils/toast";
import { TrustWallet } from "@trustwallet/web3-react-trust-wallet";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { Account, ProviderRpcError, RpcError, WalletClient } from "viem";
import { initializeConnector } from "@web3-react/core";
import {
  INetworkData,
  IWalletProp,
  MetaSignatureError,
  TWalletsList,
} from "@/utils/interface";
import { sleepTimer } from "@/utils/helper";
import useEffectAsync from "@/hooks/useEffectAsync";
import { ethers } from "ethers";
import { createUser, loginUser } from "@/services/userService";
import { AxiosError } from "axios";
import useIsFirstEffect from "@/hooks/useIsFirstEffect";
import { chainNetworkParams, headerRoutes } from "@/constants/config";
import { getCrossPower } from "@/services/apiCross";
import { createWalletClient, custom } from "viem";
import { mainnet, base } from "viem/chains";
import "viem/window";

interface ILoginState {
  selectedWallet: IWalletProp | null;
  setSelectedWallet: (prop: any) => void;
  connectWallet: (walletName: string) => Promise<void>;
  currentStep: number;
  setCurrentStep: (prop: number) => void;
  loading: boolean;
  setLoading: (prop: boolean) => void;
  address: string | null;
  steps: string[];
  setSteps: Dispatch<SetStateAction<string[]>>;
  switchNetwork: (
    prop: number,
    callback?: EffectCallback
  ) => Promise<boolean | undefined>;
  currentProvider: any;
  networkData: INetworkData | null;
  setNetworkData: Dispatch<SetStateAction<INetworkData | null>>;
  setAddress: (prop: string | null) => void;
  crossPower: number;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  trigger: number;
  triggerAPIs: () => void;
  isWhitelisted: boolean;
  setIsWhitelisted: Dispatch<SetStateAction<boolean>>;
}

let ethereum: any = null;
if (typeof window !== "undefined") {
  ethereum = window?.ethereum;
}

const LoginContext = createContext<ILoginState>({} as ILoginState);

export function useLoginContext() {
  return useContext(LoginContext);
}

export default function LoginProvider({ children }: { children: ReactNode }) {
  const [selectedWallet, setSelectedWallet] = useState<IWalletProp | null>(
    null
  );
  const [address, setAddress] = useState<string | null>(null);
  const [currentConnector, setCurrentConnector] =
    useState<TWalletsList>("metamask");
  const [currentProvider, setCurrentProvider] = useState<any>(ethereum || null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [steps, setSteps] = useState<string[]>([
    "Select a wallet",
    "Create or connect wallet",
  ]);
  const [networkData, setNetworkData] = useState<INetworkData | null>(null);
  const [crossPower, setCrossPower] = useState<number>(0.0);
  const [activeTab, setActiveTab] = useState<string>(headerRoutes[1]?.name);
  const [trigger, setTrigger] = useState<number>(0);
  const isFirstLoad = useIsFirstEffect();
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [trustWallet] = initializeConnector<TrustWallet>(
    (actions) => new TrustWallet({ actions })
  );

  const triggerAPIs = () => setTrigger(trigger + 1);

  const connectMetamask = async () => {
    try {
      console.log("connect metamask");
      let justProvider =
        ethereum?.providers?.find((e: any) => e?.isMetaMask && e?._metamask) ||
        window?.ethereum;
      if (!justProvider) {
        throw new ConnectorNotFoundError("MetaMask is not installed.");
      }
      console.log("justProvider", justProvider);
      const client: WalletClient = await createWalletClient({
        transport: custom(justProvider, {
          retryCount: 3,
          retryDelay: 1000,
        }),
      });
      try {
        await client.switchChain({ id: base.id });
      } catch (e) {
        await client.addChain({ chain: base });
      }

      const [address] = await client.requestAddresses();

      await sleepTimer(1000);

      setAddress(address);
      setCurrentConnector("metamask");
      setCurrentProvider(justProvider);
      setLoading(false);
    } catch (error) {
      // console.log("metaee", error);
      if (error instanceof ConnectorNotFoundError) {
        toastInfo("Request installation");
        await sleepTimer(1500);
        window.open(`https://metamask.io/download/`);
      } else if (
        error?.toString().includes("ChainNotConfiguredForConnectorError")
      ) {
        // console.log("er", error)
        let switched = await switchNetwork(42161);
        if (switched) await connectMetamask();
      } else if (error instanceof RpcError) toastError(error?.shortMessage);
      else if (error instanceof AxiosError)
        toastError(
          error?.response?.data?.message?.toUpperCase() || error?.message
        );
      else if ((error as any)?.message) toastError((error as any)?.message);
      else toastError("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectTrustWallet = async () => {
    try {
      console.log("connect trust");
      await trustWallet.activate(42161);
      const currProvider = trustWallet.provider!;

      let justProvider =
        currProvider ||
        ethereum?.providers.find((e: any) => e?.isTrust) ||
        ethereum;
      let account = justProvider?.selectedAddress;

      let client: WalletClient;
      if (!account) {
        client = await createWalletClient({
          transport: custom(justProvider, {
            retryCount: 3,
            retryDelay: 1000,
          }),
        });
        try {
          await client.switchChain({ id: base.id });
        } catch (e) {
          try {
            await client.addChain({ chain: base });
          } catch (e) {
            setTimeout(
              async () => await client.switchChain({ id: base.id }),
              100
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("error", e);
          }
        }
        const [address] = await client?.requestAddresses();
        account = address;
      }

      await sleepTimer(1000);

      setCurrentProvider(justProvider);
      setAddress(account);
      setLoading(false);
      setCurrentConnector("trust");
    } catch (error) {
      toastError(
        (error as any)?.message
          ? `Error: ${(error as any)?.message}`
          : "Something went wrong"
      );
      console.log(error, "details");
    } finally {
      setLoading(false);
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectCoinbase = async () => {
    try {
      console.log("connect coinbase");
      const coinbaseConnector = new CoinbaseWalletConnector({
        options: {
          appName: "zkCrossDEX",
        },
      });
      const { account } = await coinbaseConnector.connect({ chainId: 42161 });
      let justProvider =
        (await coinbaseConnector.getProvider()) ||
        ethereum?.providers?.find((e: any) => e?.isCoinbaseWallet) ||
        ethereum;
      await sleepTimer(1000);

      setCurrentProvider(justProvider);
      setCurrentConnector("coinbase");
      setAddress(account);
      setLoading(false);
    } catch (error) {
      toastError(
        (error as any)?.reason
          ? `Error: ${(error as any)?.reason}`
          : error instanceof Error
          ? error?.message
          : "Something went wrong"
      );
      setLoading(false);
      console.log("error", error, "reason");
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectWalletConnect = async () => {
    try {
      const coinbaseConnector = new WalletConnectConnector({
        options: {
          projectId: "1e4b6054faba3bc73e6fa5945a3b3a61",
        },
      });
      const { account } = await coinbaseConnector.connect({ chainId: 42161 });
      let justProvider =
        (await coinbaseConnector.getProvider()) ||
        ethereum?.providers?.find((e: any) => e?.isWalletConnect) ||
        ethereum;
      await sleepTimer(1000);

      setCurrentProvider(justProvider);
      setCurrentConnector("walletConnect");
      setAddress(account);
      setLoading(false);
    } catch (error) {
      toastError(
        error instanceof Error ? error?.message : "Something went wrong"
      );
      setLoading(false);
      // console.log("error", Object.keys(error), error, [])
      setSteps(["Select a wallet", "Create or connect wallet"]);
    }
  };

  const connectWallet = async (walletName: string) => {
    setLoading(true);
    switch (walletName) {
      case "Metamask":
        await connectMetamask();
        break;
      case "Trust Wallet":
        await connectTrustWallet();
        break;
      case "Wallet Connect":
        await connectWalletConnect();
        break;
      case "Coinbase Wallet":
        await connectCoinbase();
        break;
      default:
        toastError("Currently not supported!");
        setLoading(false);
        break;
    }
  };

  /**
   * Function to switch network on current injected provider
   * @param chainId chainId in number format
   * @returns void
   */
  const switchNetwork = async (chainId: number, callback?: EffectCallback) => {
    if (!chainId) return;
    try {
      await currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
      });
      return true;
    } catch (e) {
      if ((e as any)?.code === 4001) {
        toastError("User rejected switching chains.");
      } else if ((e as any)?.code === 4902) {
        toastError("Chain not added to wallet. Initiating chain setup...", {
          autoClose: 2000,
        });
        await sleepTimer(1000);
        await addChainNetwork(chainId);
      } else if (e instanceof ProviderRpcError) {
        toastError(e?.message);
      } else {
        toastError("Something went wrong!");
        console.error(e);
      }
    } finally {
      callback?.();
      return false;
    }
  };

  const addChainNetwork = async (chainId: number) => {
    if (!chainId) return;
    try {
      await currentProvider.request({
        method: "wallet_addEthereumChain",
        params: [chainNetworkParams[chainId]], // getting params from config
      });
    } catch (e) {
      if (e instanceof ProviderRpcError && e?.code === 4001) {
        toastError("User rejected switching chains.");
      } else if (e instanceof ProviderRpcError) {
        toastError(e?.message);
      } else {
        toastError("Something went wrong!");
        console.error(e);
      }
    }
  };

  const loadWallet = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(currentProvider);
      const accounts = await provider.send("eth_requestAccounts", []);
      const { chainId } = await provider.getNetwork();
      const network = {
        account: accounts[0],
        provider: provider,
        chainId: chainId,
      };
      setNetworkData(network);
      return network;
    } catch (err) {}
  };

  useEffectAsync(async () => {
    if (isFirstLoad) return;

    // Run first time on every connection
    await loadWallet();

    if (!currentProvider && !address) return;

    currentProvider.on("chainChanged", (id: any) => {
      let chainId: any = id; //as CurrentProvider is giving hexDecimal network id
      loadWallet().then((res: any) => {
        console.log("Wallet Info Loaded", res);
      });
    });
  }, [address, currentProvider]);

  useEffectAsync(async () => {
    if (isFirstLoad || !address) return;
    try {
      const cross = await getCrossPower(address);
      setCrossPower(cross);
    } catch (error) {
      console.error(error);
    }
  }, [address, trigger]);

  return (
    <LoginContext.Provider
      value={{
        selectedWallet,
        setSelectedWallet,
        connectWallet,
        currentStep,
        setCurrentStep,
        loading,
        setLoading,
        address,
        setSteps,
        steps,
        switchNetwork,
        networkData,
        setNetworkData,
        currentProvider,
        setAddress,
        crossPower,
        activeTab,
        setActiveTab,
        trigger,
        triggerAPIs,
        isWhitelisted,
        setIsWhitelisted,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}
