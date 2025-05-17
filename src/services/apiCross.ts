import axios from "axios";

export const getCrossPower = async (address: string) => {
  try {
    const response: any = await axios.get(`https://api.zkcross.network/api/v1/crossPower/address/${address}`);
    return response.data?.totalCrossPower;
  } catch (error) {
    console.log("Error", error);
  }
};
