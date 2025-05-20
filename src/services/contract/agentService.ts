import { ethers } from "ethers";
import { SnipeContract, VIRTUALS_TOKEN_ADDRESS } from "@/constants/config";
import snipeAbi from "@/constants/abis/snipe.json";

interface AgentRequest {
  genesisId: string;
  name: string;
  walletAddress: string;
  token: "eth" | "virtual";
  amount: string;
  launchTime: Date;
}

interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface DepositParams {
  tokenAddress: string;
  amount: string;
  provider: ethers.providers.Web3Provider;
}

class AgentService {
  private static instance: AgentService;
  private loading: boolean = false;
  private contract: string = SnipeContract;
  private abi: ethers.ContractInterface = snipeAbi;

  private constructor() {}

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public async deposit(
    params: DepositParams
  ): Promise<ethers.providers.TransactionReceipt> {
    try {
      this.loading = true;
      const { tokenAddress, amount, provider } = params;

      // Create contract instance with signer
      const contract = new ethers.Contract(
        this.contract,
        this.abi,
        provider.getSigner()
      );

      // Convert amount to wei (18 decimals)
      const amountInWei = ethers.utils.parseUnits(amount, 18);

      // Check if it's ETH deposit
      const isEth = tokenAddress != VIRTUALS_TOKEN_ADDRESS;

      let tx;
      if (isEth) {
        // For ETH deposits, send with value
        tx = await contract.deposit(tokenAddress, amountInWei, {
          value: amountInWei,
        });
      } else {
        // For token deposits
        tx = await contract.deposit(tokenAddress, amountInWei);
      }

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("Error in deposit:", error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  public async createAgent(data: AgentRequest): Promise<AgentResponse> {
    try {
      this.loading = true;

      const response = await fetch(
        "https://655a-2401-4900-8840-2429-434a-bfee-9674-4ebf.ngrok-free.app/api/agent/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create agent");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while creating agent";
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      this.loading = false;
    }
  }
}

export const agentService = AgentService.getInstance();
