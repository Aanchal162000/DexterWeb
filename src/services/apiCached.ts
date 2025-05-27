import Axios from "axios";
import {
  buildMemoryStorage,
  buildWebStorage,
  setupCache,
} from "axios-cache-interceptor";
import { baseURL } from "./userService";
import tokenPriceList from "@/constants/jsons/token_price.json";

const instance = Axios.create();

// Axios Cache Interceptor - as default uses im-memory-storage
export const axiosCache = setupCache(instance, {
  // debug: console.log,
  methods: ["get", "post"],
  storage:
    typeof window !== "undefined"
      ? buildWebStorage(window?.localStorage, "arbt-cache:")
      : buildMemoryStorage(false, false, false),
});

export const getUSDPrices = async (
  myToken: string,
  findByCode: boolean = false
) => {
  try {
    const coinId: any = findByCode
      ? myToken
      : tokenPriceList?.find((c: any) => c?.symbol === myToken)?.id;
    // const { data } = await axiosCache.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`, {
    //   id: "usd-rate",
    //   cache: {
    //     ttl: 3 * 60 * 1000, // 3 minutes
    //   },
    // });
    // https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd
    // https://api.coingecko.com/api/v3/simple/price?ids=${myToken}&vs_currencies=usd
    const { data } = await axiosCache.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        id: "usd-rate-" + myToken,
        cache: {
          ttl: 10 * 60 * 1000, // 10 minutes
        },
      }
    );

    console.log("my-tkn ", myToken, data?.[coinId].usd);
    return data?.[coinId].usd;
  } catch (error) {
    console.log("Error", error);
  }
};

//To Get Coin Change percentage update
export const getCoinChange = async () => {
  try {
    let { data } = await axiosCache.get(`${baseURL}/token/24hourChange`, {
      id: "coin-data",
      cache: {
        ttl: 3 * 60 * 1000, // 3 minutes
      },
    });
    // console.log("Response", data);
    if (!data?.success) throw data?.message;
    return data?.data;
  } catch (error: any) {
    console.log("Coin Update ERROR", error);
    return error;
  }
};

//To run transaction sync worker
export const runSyncWorker = async (address: string) => {
  try {
    let { data } = await axiosCache.post(
      `${baseURL}/wallet/balance/sync`,
      { walletAddress: address },
      {
        id: "worker-sync",
        cache: {
          ttl: 3 * 60 * 1000, // 3 minutes
        },
        headers: {
          "8GwoMh0WNpnlUJy": "zkcrossbackend",
        },
      }
    );
    // console.log("Response", data);
    if (!data?.success) throw data?.message;
    return data?.data;
  } catch (error: any) {
    console.log("Coin Update ERROR", error);
    return error;
  }
};
