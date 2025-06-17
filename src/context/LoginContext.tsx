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
import { actionService } from "@/services/contract/actionService";
import AccessService from "@/services/accessService";

const accessService = AccessService.getInstance();

import "viem/window";
import { useActionContext } from "./ActionContext";

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
  isEarlyAccessOpen: boolean;
  setIsEarlyAccessOpen: Dispatch<SetStateAction<boolean>>;
  userProfile: any;
  setUerProfile: Dispatch<any>;
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
  const [activeTab, setActiveTab] = useState<string>(headerRoutes[2]?.name);
  const [trigger, setTrigger] = useState<number>(0);
  const isFirstLoad = useIsFirstEffect();
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [isEarlyAccessOpen, setIsEarlyAccessOpen] = useState(false);

  const [userProfile, setUerProfile] = useState<any>(null);
  const [trustWallet] = initializeConnector<TrustWallet>(
    (actions) => new TrustWallet({ actions })
  );

  const triggerAPIs = () => setTrigger(trigger + 1);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { setAuthToken } = useActionContext();

  const getAuthToken = async (
    message: string,
    addressFetched: string
  ): Promise<string> => {
    let signature = "";
    try {
      const web3Provider = new ethers.providers.Web3Provider(currentProvider);
      const Signer = await web3Provider.getSigner();
      signature = await Signer.signMessage(message);

      const response = await actionService.createAuthToken({
        walletAddress: addressFetched!,
        message: message,
        signature: signature,
      });
      const authToken = response.data.data.authToken;
      setAuthToken(authToken);
      return authToken;
    } catch (error) {
      console.log("metaaaee", error);
      if ((error as AxiosError).code === "ERR_BAD_RESPONSE")
        toastError("Server is down. Please try again later.");
      if ((error as AxiosError).code === "ERR_NETWORK")
        toastError("Server CORS Error !");
      else toastError("Something went wrong");
      throw error;
    }
  };

  // For authentication  flow
  const setAuthentication = async (addressFetched: string) => {
    if (!addressFetched) {
      throw new Error("No wallet address available");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await actionService.generateMessage();

      if (response.success) {
        setMessage(response.data.message);
        const authToken = await getAuthToken(
          response.data.data.message,
          addressFetched
        );

        // Automatically call getUserInfo after getting token
        const userInfo = await accessService.getUserInfo(
          addressFetched,
          authToken
        );
        console.log("Profile", userInfo);
        if (userInfo.success) {
          setUerProfile(userInfo.data.user);

          if (userInfo.data.user.isWhitelisted) {
            setIsWhitelisted(true);
          } else {
            setIsWhitelisted(false);
            setIsEarlyAccessOpen(true);
          }
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Failed to generate message");
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectMetamask = async () => {
    try {
      console.log("connect metamask");
      let justProvider =
        ethereum?.providers?.find((e: any) => e?.isMetaMask && e?._metamask) ||
        window?.ethereum;
      if (!justProvider) {
        throw new ConnectorNotFoundError("MetaMask is not installed.");
      }

      // First disconnect any existing connection
      if (currentProvider) {
        try {
          await currentProvider.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
        } catch (error) {
          console.log("Error disconnecting:", error);
        }
      }

      // Request connection and get the currently selected account
      const [selectedAddress] = await justProvider.request({
        method: "eth_requestAccounts",
        params: [],
      });

      // Verify this is the currently selected account in MetaMask
      const currentAccounts = await justProvider.request({
        method: "eth_accounts",
      });
      if (currentAccounts[0] !== selectedAddress) {
        throw new Error("Selected account mismatch");
      }

      setAddress(selectedAddress);
      setAuthentication(selectedAddress);

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

      await sleepTimer(1000);

      setCurrentConnector("metamask");
      setCurrentProvider(justProvider);
      setLoading(false);
      return selectedAddress;
    } catch (error) {
      if (error instanceof ConnectorNotFoundError) {
        toastInfo("Request installation");
        await sleepTimer(1500);
        window.open(`https://metamask.io/download/`);
      } else if (
        error?.toString().includes("ChainNotConfiguredForConnectorError")
      ) {
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

    // Listen for chain changes
    currentProvider.on("chainChanged", (id: any) => {
      let chainId: any = id;
      loadWallet().then((res: any) => {
        console.log("Wallet Info Loaded", res);
      });
    });

    // Listen for account changes
    currentProvider.on("accountsChanged", async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        setAddress(null);
        setNetworkData(null);
        setCurrentProvider(null);
        setCurrentConnector("metamask");
      } else {
        // User switched accounts
        setAddress(accounts[0]);
        await loadWallet();
      }
    });

    // Cleanup function to remove event listeners
    return () => {
      if (currentProvider) {
        currentProvider.removeListener("chainChanged", () => {});
        currentProvider.removeListener("accountsChanged", () => {});
      }
    };
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
        isEarlyAccessOpen,
        setIsEarlyAccessOpen,
        userProfile,
        setUerProfile,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}
