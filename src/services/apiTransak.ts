import { Transak } from "@transak/transak-sdk";
import axios from "axios";

if (!process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT) {
  console.log("Transak ENV Not Found");
}

const isProd = process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT === "production";

const apiURL = isProd ? process.env.NEXT_PUBLIC_TRANSAK_PROD_URL : process.env.NEXT_PUBLIC_TRANSAK_STAG_URL;
const apiKey = isProd ? process.env.NEXT_PUBLIC_TRANSAK_PROD_KEY : process.env.NEXT_PUBLIC_TRANSAK_STAG_KEY;
const apiSecret = isProd ? process.env.NEXT_PUBLIC_TRANSAK_PROD_SECRET : process.env.NEXT_PUBLIC_TRANSAK_STAG_SECRET;

const generateConfig = (params: any) => {
  return {
    apiKey: apiKey,
    environment: isProd ? Transak.ENVIRONMENTS.PRODUCTION : Transak.ENVIRONMENTS.STAGING,
    hideMenu: true,
    ...params,
  };
};

const getAccessToken = async () => {
  try {
    const { data } = await axios.post(
      `${apiURL}/partners/api/v2/refresh-token`,
      { apiKey },
      {
        headers: {
          accept: "application/json",
          "api-secret": apiSecret,
          "content-type": "application/json",
        },
      }
    );
    return data?.data?.accessToken;
  } catch (err) {
    console.error(`err`, err instanceof Error ? err?.message : err);
  }
};

const getOrderById = async (accessToken: string, orderId: string | number) => {
  try {
    const { data } = await axios.get(`${apiURL}/partners/api/v2/order/${orderId}`, {
      headers: {
        accept: "application/json",
        "access-token": accessToken,
      },
    });
    return data;
  } catch (err) {
    console.error(`err`, err, err instanceof Error ? err?.message : err);
  }
};

const getCurrencyPrices = async (params: any) => {
  try {
    const { data } = await axios.get(`${apiURL}/api/v2/currencies/price`, {
      params: {
        ...params,
        partnerApiKey: apiKey,
      },
    });
    return data;
  } catch (err) {
    console.error(`err`, err instanceof Error ? err?.message : err);
    throw err;
  }
};

const apiTransak = {
  getAccessToken,
  getCurrencyPrices,
  getOrderById,
  generateConfig,
};

export default apiTransak;
