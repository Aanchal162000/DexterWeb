import { ethers } from "ethers";
import buyAbi from "@/constants/abis/buy.json";
import { TokenOption } from "@/components/common/TokenSelector";
import { BuyContract } from "@/constants/config";


interface BuyTokenParams {
    amountIn: string;
    amountOutMin: string;
    path: string[];
    to: string;
    timestamp: number;
    provider: ethers.providers.Web3Provider;
    selectedToken: TokenOption;
}

class BuyService {
    private contract: string = BuyContract;
    private abi: ethers.ContractInterface = buyAbi;

    async buyToken(params: BuyTokenParams): Promise<ethers.providers.TransactionReceipt> {
        const contract = new ethers.Contract(
            this.contract,
            this.abi,
            params.provider.getSigner()
        );

        // First get amountsOut to know what we'll receive
        const amountInBN = ethers.utils.parseUnits(params.amountIn, 18);
        const amountsOut = await contract.getAmountsOut(amountInBN, params.path);
        // const amountOutMinBN = amountsOut[1];
        console.log("Expected output amount:", ethers.utils.formatUnits(amountsOut[1], 18));

        let tx;

        if (params.selectedToken.symbol === "VIRT") {
            try {
                // Execute the swap
                tx = await contract.swapExactTokensForTokens(
                    amountInBN,
                    amountsOut[1],
                    params.path,
                    params.to,
                    params.timestamp
                );
            } catch (error) {
                console.error("Error in VIRT swap:", error);
                throw error;
            }
        } else if (params.selectedToken.symbol === "ETH") {
            try {
                // Execute ETH swap with value parameter
                tx = await contract.swapExactETHForTokens(
                    amountsOut[1],
                    params.path,
                    params.to,
                    params.timestamp,
                    { value: amountInBN }
                );
            } catch (error) {
                console.error("Error in ETH swap:", error);
                throw error;
            }
        } else {
            throw new Error(`Unsupported token symbol: ${params.selectedToken.symbol}`);
        }

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        return receipt;
    }
}

// Export as singleton
const buyService = new BuyService();
export default buyService;
