import { ethers } from "ethers";
import buyAbi from "@/constants/abis/buy.json";
import { TokenOption } from "@/components/common/TokenSelector";
import { BuyContract } from "@/constants/config";
import { useSwapContext } from "@/context/SwapContext";

interface BuyTokenParams {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  timestamp: number;
  provider: ethers.providers.Web3Provider;
  selectedToken: TokenOption;
  slippageTolerance?: number; // Optional slippage tolerance in percentage
}

class BuyService {
  private contract: string = BuyContract;
  private abi: ethers.ContractInterface = buyAbi;
  private readonly DEFAULT_SLIPPAGE = 0.5; // 0.5% default slippage

  async buyToken(
    params: BuyTokenParams
  ): Promise<ethers.providers.TransactionReceipt> {
    try {
      const contract = new ethers.Contract(
        this.contract,
        this.abi,
        params.provider.getSigner()
      );

      // First get amountsOut to know what we'll receive
      const amountInBN = ethers.utils.parseUnits(params.amountIn, 18);
      const amountsOut =
        Number(params.amountOutMin) != 0
          ? params.amountOutMin
          : await contract.getAmountsOut(amountInBN, params.path);

      if (!amountsOut || amountsOut.length < 2) {
        throw new Error("Invalid amounts out from contract");
      }

      console.log(
        "Expected output amount:",
        ethers.utils.formatUnits(amountsOut[1], 18)
      );

      // Calculate minimum amount out with slippage
      const slippage = params.slippageTolerance || this.DEFAULT_SLIPPAGE;
      const ammount =
        Number(params.amountOutMin) != 0 ? params.amountOutMin : amountsOut[1];

      // Reduce amount out by 1% for buffer
      const bufferAmount = ammount.mul(99).div(100); // 1% reduction

      let tx;
      const gasLimit = await this.estimateGasLimit(
        contract,
        params,
        amountInBN,
        bufferAmount
      );

      if (
        params.selectedToken.symbol === "VIRT" ||
        params.selectedToken.symbol === "GETVIRT"
      ) {
        tx = await contract.swapExactTokensForTokens(
          amountInBN,
          bufferAmount,
          params.path,
          params.to,
          params.timestamp,
          { gasLimit }
        );
      } else if (params.selectedToken.symbol === "ETH") {
        tx = await contract.swapExactETHForTokens(
          bufferAmount,
          params.path,
          params.to,
          params.timestamp,
          { value: amountInBN, gasLimit }
        );
      } else if (params.selectedToken.symbol === "GETETH") {
        tx = await contract.swapExactTokensForETH(
          amountInBN,
          bufferAmount,
          params.path,
          params.to,
          params.timestamp,
          { gasLimit }
        );
      } else {
        throw new Error(
          `Unsupported token symbol: ${params.selectedToken.symbol}`
        );
      }

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.error("Transaction failed:", error);
      if (error?.code === -32603) {
        throw new Error(
          "Transaction failed: Insufficient liquidity or slippage too high"
        );
      }
      throw error;
    }
  }

  private async estimateGasLimit(
    contract: ethers.Contract,
    params: BuyTokenParams,
    amountInBN: ethers.BigNumber,
    minAmountOut: ethers.BigNumber
  ): Promise<ethers.BigNumber> {
    try {
      let estimatedGas;
      if (
        params.selectedToken.symbol === "VIRT" ||
        params.selectedToken.symbol === "GETVIRT"
      ) {
        estimatedGas = await contract.estimateGas.swapExactTokensForTokens(
          amountInBN,
          minAmountOut,
          params.path,
          params.to,
          params.timestamp
        );
      } else if (params.selectedToken.symbol === "ETH") {
        estimatedGas = await contract.estimateGas.swapExactETHForTokens(
          minAmountOut,
          params.path,
          params.to,
          params.timestamp,
          { value: amountInBN }
        );
      } else {
        throw new Error(
          `Unsupported token symbol: ${params.selectedToken.symbol}`
        );
      }

      // Add 30% buffer to the estimated gas
      const gasWithBuffer = estimatedGas.mul(130).div(100);
      return gasWithBuffer;
    } catch (error) {
      console.warn("Gas estimation failed, using default gas limit");
      return ethers.utils.parseUnits("400000", 0); // Increased default gas limit
    }
  }
}

// Export as singleton
const buyService = new BuyService();
export default buyService;
