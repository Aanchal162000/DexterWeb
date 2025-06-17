import { ethers } from "ethers";
import { SnipeContract, VIRTUALS_TOKEN_ADDRESS } from "@/constants/config";
import snipeAbi from "@/constants/abis/snipe.json";
import { QuoteRequestParams } from "./interfaces";

interface AgentRequest {
  genesisId: string;
  name: string;
  // walletAddress: string;
  // token: "eth" | "virtual";
  // amount: string;
  launchTime: Date;
  marketCap: string;
  txHash: string;
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

interface AgentStatusResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    genesisId: string;
    walletAddress: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface IUserDeposit {
  amount: string;
  marketCap: string;
  token: "eth" | "virtual";
  depositTxHash: string;
}

interface ITransaction {
  status: "not_started" | "pending" | "completed" | "failed" | "withdrawn";
  hash: string;
}

interface ITimestamps {
  createdAt: string;
  updatedAt: string;
}

interface IAgentTransaction {
  agentId: string;
  agentName: string;
  genesisId: string;
  launchTime: string;
  agentStatus: string;
  userDeposit: IUserDeposit;
  transaction: ITransaction;
  timestamps: ITimestamps;
}

interface ITransactionResponse {
  success: boolean;
  message: string;
  data: {
    walletAddress: string;
    transactions: IAgentTransaction[];
    pagination: {
      totalCount: number;
      currentCount: number;
      limit: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
      hasPrevious: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
  };
}

interface WithdrawApiParams {
  txHash: string;
  genesisId: string;
}

class AgentService {
  private static instance: AgentService;
  private loading: boolean = false;
  private contract: string = SnipeContract;
  private abi: ethers.ContractInterface = snipeAbi;
  private readonly BASE_URL =
    "https://web3.okx.com/priapi/v1/dx/trade/multi/outer/v3/quote/snap-mode";
  private readonly DEFAULT_SLIPPAGE = 0.1;
  private readonly DEFAULT_SLIPPAGE_TYPE = 1;
  private readonly DEFAULT_PMM = 1;
  private readonly DEFAULT_GAS_DROP_TYPE = 0;
  private readonly DEFAULT_FORBIDDEN_BRIDGE_TYPES = 0;

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

  public async withdraw(
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
      console.log("amount", amount, amountInWei);

      let tx;

      tx = await contract.withdraw(tokenAddress, amountInWei);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error("Error in withdraw:", error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  public async createAgent(data: AgentRequest): Promise<AgentResponse> {
    try {
      this.loading = true;

      const response = await fetch(
        "https://dexters-backend.zkcross.exchange/api/agent/subscribe",
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

  public async checkAgentStatus(
    genesisId: string,
    walletAddress: string
  ): Promise<AgentStatusResponse> {
    try {
      this.loading = true;

      const response = await fetch(
        `https://dexters-backend.zkcross.exchange/api/agent/${genesisId}/status/${walletAddress}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check agent status");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while checking agent status";
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      this.loading = false;
    }
  }

  private buildQueryString(params: QuoteRequestParams): string {
    const queryParams = new URLSearchParams({
      chainId: params.chainId.toString(),
      toChainId: params.toChainId.toString(),
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      amount: params.amount,
      userWalletAddress: params.userWalletAddress,
      slippage: (params.slippage || this.DEFAULT_SLIPPAGE).toString(),
      slippageType: (
        params.slippageType || this.DEFAULT_SLIPPAGE_TYPE
      ).toString(),
      pmm: (params.pmm || this.DEFAULT_PMM).toString(),
      gasDropType: (
        params.gasDropType || this.DEFAULT_GAS_DROP_TYPE
      ).toString(),
      forbiddenBridgeTypes: (
        params.forbiddenBridgeTypes || this.DEFAULT_FORBIDDEN_BRIDGE_TYPES
      ).toString(),
      dexIds: params.dexIds,
      t: (params.timestamp || Date.now()).toString(),
    });

    return queryParams.toString();
  }

  async getQuote(params: QuoteRequestParams): Promise<any> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await fetch(`${this.BASE_URL}?${queryString}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();

      if (data.code !== 0) {
        throw new Error(`API error: ${data.message}`);
      }

      return data.data?.singleChainSwapInfo?.minimumReceived;
    } catch (error) {
      console.error("Error fetching quote:", error);
      throw error;
    }
  }

  // Helper method to validate token addresses
  validateTokenAddresses(fromToken: string, toToken: string): boolean {
    return (
      /^0x[a-fA-F0-9]{40}$/.test(fromToken) &&
      /^0x[a-fA-F0-9]{40}$/.test(toToken)
    );
  }

  // Helper method to format amount based on token decimals
  formatAmount(amount: string, decimals: number): string {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        throw new Error("Invalid amount");
      }
      return parsedAmount.toFixed(decimals);
    } catch (error) {
      console.error("Error formatting amount:", error);
      throw error;
    }
  }

  public async getUserTransactions(
    walletAddress: string
  ): Promise<ITransactionResponse> {
    try {
      const response = await fetch(
        `https://dexters-backend.zkcross.exchange/api/user-transactions/${walletAddress}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  }

  public async notifyWithdraw(
    params: WithdrawApiParams
  ): Promise<AgentResponse> {
    try {
      this.loading = true;

      const response = await fetch(
        "https://dexters-backend.zkcross.exchange/api/agent/withdraw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to notify withdraw");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while notifying withdraw";
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
