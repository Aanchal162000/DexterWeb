import { ERC20ABI } from "@/constants/config";
import Web3, { Transaction } from "web3";
import { ethers } from "ethers";

const CryptoJS = require("crypto-js");

interface OKXConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export const rpcConfig: { [key: string]: any } = {
  // Alchemy RPC endpoints with API key
  1: `https://eth-mainnet.g.alchemy.com/v2/UEV5ZjVmS6DzyJV3KUBThR9ot8e-77h0`,
  56: `https://bnb-mainnet.g.alchemy.com/v2/UEV5ZjVmS6DzyJV3KUBThR9ot8e-77h0`,
  137: `https://polygon-mainnet.g.alchemy.com/v2/UEV5ZjVmS6DzyJV3KUBThR9ot8e-77h0`,
  43114: `https://avax-mainnet.g.alchemy.com/v2/UEV5ZjVmS6DzyJV3KUBThR9ot8e-77h0`,
  10: `https://opt-mainnet.g.alchemy.com/v2/UEV5ZjVmS6DzyJV3KUBThR9ot8e-77h0`,
  8453: `https://base-mainnet.g.alchemy.com/v2/UEV5ZjVmS6DzyJV3KUBThR9ot8e-77h0`,
  42161: `https://arb-mainnet.g.alchemy.com/v2/UEV5ZjVmS6DzyJV3KUBThR9ot8e-77h0`,
  // Keep any other chains that might not be on Alchemy
  stellar: `https://mainnet.stellar.validationcloud.io/v1/9yVi48mHuKmpZ93vHAN53l7esd_r4ftsnlFS_LCz6-8`,
};

const OKX_CONFIG: OKXConfig = {
  apiKey: "07e956d1-664e-4fcb-b918-e980d9184729",
  secretKey: "3A4193E92078633B376FB4937899E4A2",
  baseUrl: "https://www.okx.ac",
};

export class TRXService {
  private static instance: TRXService;

  static getInstance(): TRXService {
    if (!TRXService.instance) {
      TRXService.instance = new TRXService();
    }
    return TRXService.instance;
  }

  async getHeaderParams(apiEndPoints: string, method: string, params: any) {
    try {
      const timestamp = new Date().toISOString().slice(0, -5) + "Z";
      const OKX_SIGN = "3A4193E92078633B376FB4937899E4A2";

      let message: any = timestamp + method + apiEndPoints;

      if (method === "GET" && params) {
        const queryParams = new URLSearchParams(params as any).toString();
        console.log("queryParams", queryParams);
        if (queryParams) {
          apiEndPoints += `?${queryParams}`;
        }

        message += `?${queryParams}`;
      }

      // 🔹 Modify only the POST request handling
      if (method === "POST" && params) {
        message += JSON.stringify(params);
      }
      console.log("meesage", message);

      const sign = CryptoJS.enc.Base64.stringify(
        CryptoJS.HmacSHA256(
          message,
          OKX_SIGN || "" // Secret Key
        )
      );

      const header = {
        "OK-ACCESS-PROJECT": "eef86aba59d93b4a8a90480e49d5d63b",
        "OK-ACCESS-KEY": "07e956d1-664e-4fcb-b918-e980d9184729",
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-SIGN": sign,
        "OK-ACCESS-PASSPHRASE": "Amit@1234",
        "Content-Type": "application/json",
      };
      return header;
    } catch (error) {
      console.log("Error while getting the header params : ", error);
    }
  }

  //Normal Swap
  async getSwapTransactionData(
    chainId: string,
    amount: string,
    fromTokenAddress: string,
    toTokenAddress: string,
    slippage: string,
    walletAddress: string
  ) {
    try {
      const params = {
        chainId: chainId,
        amount: amount,
        fromTokenAddress: fromTokenAddress.toLowerCase(),
        toTokenAddress: toTokenAddress.toLowerCase(),
        slippage: slippage,
        userWalletAddress: walletAddress,
      };

      const apiEndPoints = `/api/v5/dex/aggregator/swap`;
      const header = await this.getHeaderParams(apiEndPoints, "GET", params);
      console.log("header", header);
      const response = await fetch(
        `https://www.okx.ac${apiEndPoints}?${new URLSearchParams(params)}`,
        {
          method: "GET",
          headers: header,
        }
      );
      const dataRes = await response.json();
      console.log("response Swap", dataRes, dataRes?.data[0]?.routerResult);

      return dataRes?.data;
    } catch (error: any) {
      console.log("Error in getSwapTransactionData", error);
      throw new Error("Server Error, Please try again");
    }
  }

  // Method to check if token approval is needed
  async checkTokenAllowance(
    chainId: string,
    tokenAddress: string,
    userWalletAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<boolean> {
    try {
      // Skip approval check for native token (address is empty string or zero address)
      if (
        !tokenAddress ||
        tokenAddress.toLowerCase() ===
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      ) {
        return true;
      }

      // Remove decimal points from amount to avoid BigInt conversion errors
      const integerAmount = amount.split(".")[0];
      console.log(`Using integer amount for allowance check: ${integerAmount}`);

      // Create resilient Web3 connection
      let web3: Web3 | null = null;

      // Try all available RPCs for this chain
      const primaryRpc = rpcConfig[chainId];

      console.log(
        `Attempting to connect to primary RPC for allowance check on chain ${chainId}`
      );

      try {
        console.log(`Trying RPC endpoint for allowance check: ${primaryRpc}`);
        const provider = new Web3.providers.HttpProvider(primaryRpc, {
          timeout: 10000, // 10 second timeout for HTTP requests
        } as any);

        web3 = new Web3(provider);

        // Test the connection
        await web3.eth.getBlockNumber();
        console.log(
          `Successfully connected to primary RPC for allowance check: ${primaryRpc}`
        );
      } catch (error) {
        console.error(
          `Failed to connect to primary RPC ${primaryRpc} for allowance check:`,
          error instanceof Error ? error.message : error
        );
        web3 = null;
      }

      if (!web3) {
        throw new Error(
          `Failed to connect to primary RPC for chain ${chainId}. Please try again later.`
        );
      }

      const tokenContract = new web3.eth.Contract(ERC20ABI, tokenAddress);
      const allowance: any = await tokenContract.methods
        .allowance(userWalletAddress, spenderAddress)
        .call();

      console.log(`Current allowance: ${allowance}`);
      return BigInt(allowance) >= BigInt(integerAmount);
    } catch (error: any) {
      console.error("Error checking token allowance:", error);
      return false;
    }
  }

  //Approve Swap Data
  async approveTransaction(
    chainId: string,
    amount: string,
    fromTokenAddress: string,
    signer: ethers.providers.JsonRpcSigner,
    userWalletAddress: string
  ) {
    try {
      const params = {
        chainId: chainId,
        approveAmount: amount,
        tokenContractAddress: fromTokenAddress.toLowerCase(),
      };
      console.log("params", params);

      const apiEndPoints = `/api/v5/dex/aggregator/approve-transaction`;
      const header = await this.getHeaderParams(apiEndPoints, "GET", params);
      console.log("header", header);
      const response = await fetch(
        `https://www.okx.ac${apiEndPoints}?${new URLSearchParams(params)}`,
        {
          method: "GET",
          headers: header,
        }
      );
      const dataRes = await response.json();
      const approveData = dataRes?.data;
      console.log("response Approve", dataRes);
      if (!approveData || approveData.length === 0 || !approveData[0].data) {
        throw new Error("Invalid swap data received");
      }

      const approveDataTxInfo = approveData[0].data;

      const tokenContract = new ethers.Contract(
        fromTokenAddress,
        ERC20ABI,
        signer
      );

      // Use the actual amount passed to the function
      const tx = await tokenContract.approve(
        approveData[0]?.dexContractAddress,
        amount
      );

      const receipt = await tx.wait();
      console.log("Approval Transaction Hash:", receipt.transactionHash);
      return receipt?.transactionHash || null;
    } catch (error: any) {
      console.log("Error in approveTransaction", error);
      throw error;
    }
  }

  async executeSwapTransaction(
    chainId: string,
    amount: string,
    fromTokenAddress: string,
    toTokenAddress: string,
    slippage: string,
    userWalletAddress: string,
    signer: ethers.providers.JsonRpcSigner
  ) {
    try {
      console.log("swap Happening");
      const swapData = await this.getSwapTransactionData(
        chainId,
        amount,
        fromTokenAddress,
        toTokenAddress,
        slippage,
        userWalletAddress
      );

      if (!swapData || swapData.length === 0 || !swapData[0].tx) {
        throw new Error("Invalid swap data received");
      }

      const swapDataTxInfo = swapData[0].tx;
      const web3 = new Web3(rpcConfig[chainId]);

      const nonce = await web3.eth.getTransactionCount(
        userWalletAddress,
        "latest"
      );
      const ratio = BigInt(3) / BigInt(2);

      const tx = {
        from: userWalletAddress,
        data: swapDataTxInfo.data,
        gasPrice: (BigInt(swapDataTxInfo.gasPrice) * BigInt(ratio)).toString(),
        to: swapDataTxInfo.to,
        value: swapDataTxInfo.value,
        gasLimit: (
          Number(swapDataTxInfo.gas) +
          0.2 * Number(swapDataTxInfo.gas)
        ).toString(),
        nonce: nonce,
      };

      const signedTx = await signer.sendTransaction(tx);
      const receipt = await signedTx.wait();
      console.log("Transaction confirmed:", receipt);

      return { success: true, chainTxInfo: receipt };
    } catch (error: any) {
      console.error("Error executing swap transaction:", error);
      return { success: false, error: "Swap Failed" };
    }
  }
}

export default TRXService;
