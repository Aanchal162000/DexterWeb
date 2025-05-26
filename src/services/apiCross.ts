import axios from "axios";

export const baseURL = "https://api.zkcross.network/api/v1";

export const getCrossPower = async (address: string) => {
  try {
    const response: any = await axios.get(
      `https://api.zkcross.network/api/v1/crossPower/address/${address}`
    );
    return response.data?.totalCrossPower;
  } catch (error) {
    console.log("Error", error);
  }
};

export const getEVMLiquidity = async (chainId: string) => {
  try {
    let res = await axios.get(
      `${baseURL}/bridge/check/evm/admin/status?chainId=${chainId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    return res;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
    return error;
  }
};
