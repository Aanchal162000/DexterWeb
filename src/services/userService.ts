import axios from "axios";

export const baseURL = "https://api.zkcross.network/api/v1";

//To Login User
export const loginUser = async (request: {
  wallet: { signature: string; address: string; timestamp: number }[];
  chainType: "EVM" | "Non-EVM";
}) => {
  try {
    let { data } = await axios.post(`${baseURL}/user/login`, { ...request });
    console.log("Response", data);
    if (!data.success) throw `${data.message}`;
    return data;
  } catch (error: any) {
    console.log("Login User ERROR", error);
    throw error;
  }
};

//To Create User
export const createUser = async (request: { wallet: { signature: string; address: string; timestamp: number }[] }) => {
  try {
    let { data } = await axios.post(`${baseURL}/user/create`, { ...request });
    console.log("Response", data);
    return data;
  } catch (error: any) {
    console.log("Login User ERROR", error);
    return error;
  }
};

//To Connect Wallet(Send 2 Wallet)
export const connectWallet = async (request: any) => {
  try {
    let { data } = await axios.post(`${baseURL}/user/connectWallet`, { wallet: request.wallet });
    console.log("Response", data);
    return data;
  } catch (error: any) {
    console.log("Login User ERROR", error);
    return error;
  }
};

//To Merge Wallet(Send 2 Wallet)
export const mergeWallet = async (request: any) => {
  try {
    let { data } = await axios.post(`${baseURL}/user/mergeWallet`, { wallet: request.wallet });
    console.log("Response", data);
    return data;
  } catch (error: any) {
    console.log("Login User ERROR", error);
    return error;
  }
};

//To Update Wallet
export const updateWallet = async (request: any) => {
  try {
    let { data } = await axios.post(`${baseURL}/user/update`, { wallet: request.wallet, email: request.email, phone: request.phone });
    console.log("Response", data);
    return data;
  } catch (error: any) {
    console.log("Login User ERROR", error);
    return error;
  }
};

//To Get Assets and balance
export const getAssets = async (request: { address: string }) => {
  try {
    let res = await axios.get(`${baseURL}/wallet/assets/${request.address}`);
    console.log("Response", res);
    if (!res?.data?.success) throw res?.data?.message;
    return res?.data?.data;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
    return error;
  }
};

//To Get transaction history for a user
export const getTransactions = async (request: { address: string; page: number; itemsPerPage: number }) => {
  try {
    let res = await axios.get(`${baseURL}/wallet/history/${request.address}`, {
      params: { page: request.page, itemsPerPage: request.itemsPerPage },
    });
    console.log("Response", res);
    if (!res?.data?.success) throw res?.data?.message;
    return res?.data?.data;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
    return error;
  }
};

//To Get transaction history for a user
export const getTransactionsAll = async (request: {
  address: string;
  page: number;
  itemsPerPage: number;
  controller?: AbortController;
}) => {
  try {
    let res = await axios.get(`${baseURL}/wallet/transactions/all/${request.address}`, {
      params: { page: request.page, itemsPerPage: request.itemsPerPage },
      signal: request?.controller?.signal,
    });
    console.log("Response", res);
    if (!res?.data?.success || res?.data?.message === "No Transactions found") throw new Error(res?.data?.message);
    return res?.data;
  } catch (error: any) {
    throw error;
  }
};
