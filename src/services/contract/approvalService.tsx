import { ethers } from "ethers";
import { BuyContract, VIRTUALS_TOKEN_ADDRESS } from "@/constants/config";
import ERC20ABI from "@/constants/abis/erc20Abi.json";
import { toast } from "react-toastify";

interface ApprovalParams {
  tokenAddress: string;
  amount: string;
  provider: ethers.providers.Web3Provider;
  decimals?: number;
  spenderAddress?: string; // Optional: defaults to BuyContract
}

class ApprovalService {
  async balanceOf(params: Omit<ApprovalParams, "amount">): Promise<string> {
    try {
      const { tokenAddress, provider, decimals = 18 } = params;

      // Get signer and address
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Create token contract instance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20ABI,
        provider
      );

      // Get balance of user address
      const balance = await tokenContract.balanceOf(address);

      // Format and return balance
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error checking balance:", error);
      throw error;
    }
  }

  async checkAllowance(
    params: Omit<ApprovalParams, "amount">
  ): Promise<string> {
    try {
      const { tokenAddress, provider, spenderAddress = BuyContract } = params;

      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20ABI,
        provider
      );

      const allowance = await tokenContract.allowance(address, spenderAddress);
      return ethers.utils.formatUnits(allowance, params.decimals || 18);
    } catch (error) {
      console.error("Error checking allowance:", error);
      throw error;
    }
  }

  async approveToken(
    params: ApprovalParams
  ): Promise<ethers.providers.TransactionReceipt> {
    try {
      const {
        tokenAddress,
        amount,
        provider,
        decimals = 18,
        spenderAddress = BuyContract,
      } = params;

      // Get signer
      const signer = provider.getSigner();

      // Create token contract instance
      const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);

      // Add 3% buffer to approval amount (same as in SwapContext)
      const bufferedAmount = Number((Number(amount) * 103) / 100).toFixed(6);

      // Show processing toast
      toast.loading("Approving transaction...");

      // Call approve on the token contract
      const tx = await tokenContract.approve(
        spenderAddress,
        ethers.utils.parseUnits(String(bufferedAmount), decimals)
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      toast.success("Approval successful!");

      return receipt;
    } catch (error: any) {
      // Handle specific error cases
      if (error?.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user");
      } else {
        toast.error(`Error: ${error?.reason || "Something went wrong"}`);
      }

      console.error("Error approving token:", error);
      throw error;
    }
  }

  async approveVirtualToken(
    amount: string,
    provider: ethers.providers.Web3Provider,
    tokenAddress: string,
    spenderAddress: string
  ): Promise<ethers.providers.TransactionReceipt> {
    return this.approveToken({
      tokenAddress: tokenAddress,
      amount,
      provider,
      decimals: 18, // Virtual Token decimals
      spenderAddress: spenderAddress ? spenderAddress : BuyContract,
    });
  }
}

// Export as singleton
const approvalService = new ApprovalService();
export default approvalService;
