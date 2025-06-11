import useEffectAsync from "@/hooks/useEffectAsync";
import { toastError } from "@/utils/toast";
import { Dispatch, SetStateAction, useRef } from "react";
import {
  arbitrumList,
  chainsLogo,
  extraCoins,
  tokenList,
  tokenSymbolList,
} from "@/constants/config";
import { ParseWeiUtil } from "@/utils/helper";
import { getTransactionsAll } from "@/services/userService";
import { ITransactionData } from "@/utils/interface";
import dayjs from "@/services/dayjsConfig";

export default function useTransaction({
  transactionList,
  setLoading,
  address,
  currentPageNo,
  setTotalPages,
  setTransactionList,
  setBackgroundSync,
}: {
  transactionList: ITransactionData[] | null;
  setLoading: Dispatch<SetStateAction<boolean>>;
  address: string;
  currentPageNo: number;
  setTotalPages: Dispatch<SetStateAction<number | null>>;
  setTransactionList: Dispatch<SetStateAction<ITransactionData[] | null>>;
  setBackgroundSync: Dispatch<SetStateAction<boolean>>;
}) {
  const axiosRef: any = useRef(null);

  useEffectAsync(async () => {
    try {
      axiosRef.current?.abort();
      const controller = new AbortController();
      axiosRef.current = controller;

      !transactionList ? setLoading(true) : setBackgroundSync(true);
      // await sleepTimer(4000);
      let {
        bridgeTransactions,
        erc20Transactions,
        internalTransactions,
        transactionsCount,
      }: any = await getTransactionsAll({
        address: address as string,
        page: currentPageNo,
        itemsPerPage: 7,
        controller,
      });
      // console.log({ bridgeTransactions, erc20Transactions, internalTransactions, userTransactions, transactionsCount });
      setTotalPages(Math.ceil(transactionsCount / 7));
      const commonTokenList = [...tokenList, ...arbitrumList, ...extraCoins];
      let output: any = [];
      const bridge_contract = [
        "0x9f43F3636c34f4eC7d70993fe00B9AfEA0E541bC",
        "0x58c68FC527CBfbf7029197c8D50cdf39B83E3c85",
        "0x9f43f3636c34f4ec7d70993fe00b9afea0e541bc",
        "0x58c68fc527cbfbf7029197c8d50cdf39b83e3c85",
        "0x21568459854Adcda462F6D9C11ce4F157Dc70f93",
        "0x21568459854adcda462f6d9c11ce4f157dc70f93",
        "0xbE121263691552E8a981a13FBeaB4FAf84FA6cdD",
        "0x21568459854Adcda462F6D9C11ce4F157Dc70f93",
        "0xbE121263691552E8a981a13FBeaB4FAf84FA6cdD",
        "0x21568459854Adcda462F6D9C11ce4F157Dc70f93",
        "CAZB2F2GXXDTDZHY55K736BIEJVUYV6UYMKPZUW2VTSIJI3JL4NV42FC",
        "0x866d20476C1F85eAF2062c1303C201b2e08b8973",
        "0x19F3D4308E48a26F531D3235BE9aa1393E4Da194",
        "cazb2f2gxxdtdzhy55k736biejvuyv6uymkpzuw2vtsiji3jl4nv42fc",
        "0x866d20476c1f85eaf2062c1303c201b2e08b8973",
        "0x19f3d4308e48a26f531d3235be9aa1393e4da194",
        "0xB7C016d5C8c0243e008461e82b2C83682d63Bd57",
        "0xb7c016d5c8c0243e008461e82b2c83682d63bd57",
        "0xEAA25504596fFb6D6bEDfBe9458083323f6F425A",
        "0xeaa25504596ffb6d6bedfbe9458083323f6f425a",
        "0x44F357E5f021C8061969Aaa69F2d98FBb297EED7",
        "0x44f357e5f021c8061969aaa69f2d98fbb297eed7",
        "0x8042d3C1e09AAf362bF6930B10c80ac2b0A648B0",
        "0x8042d3c1e09aaf362bf6930b10c80ac2b0a648b0",
        "0xf8976F4F4F1c047891b994d34d32A3a8974721A9",
        "0xf8976f4f4f1c047891b994d34d32a3a8974721a9",
        "0xd385c30e1A47C4ce9385877e7951E98A46264e5F",
        "0xd385c30e1a47c4ce9385877e7951e98a46264e5f",
        "0x6d6e736414a2913e327853F87B5377702a7F9bc6",
        "0x6d6e736414a2913e327853F87B5377702a7F9bc6",
      ];
      let isAddressEqual = (a: string, b: string) =>
        a?.toString().toLowerCase() === b?.toString().toLowerCase();
      let duplicates: any = [];
      let outHashes: any = [];
      erc20Transactions?.forEach((trx: any) => {
        //IN-OUT
        let notBridgeTransaction = !(
          bridge_contract.includes(trx?.toAddress) ||
          bridge_contract.includes(trx?.fromAddress)
        );
        if (notBridgeTransaction) {
          if (trx?.fromAddress?.toUpperCase() === address?.toUpperCase()) {
            outHashes.push(trx?.hash);
            output.push({ ...trx, type: "out" });
          } else if (trx?.toAddress?.toUpperCase() === address?.toUpperCase()) {
            outHashes.push(trx?.hash);
            output.push({ ...trx, type: "in" });
          }
          return;
        }
        //SWAP
        if (
          internalTransactions?.some(
            (item: any) =>
              item.hash === trx?.hash &&
              !isAddressEqual(item.toAddress, trx.toAddress) &&
              isAddressEqual(item.chainId, trx.chainId)
          )
        ) {
          let trns = internalTransactions?.find(
            (item: any) =>
              item.hash === trx?.hash &&
              !isAddressEqual(item.toAddress, trx.toAddress) &&
              isAddressEqual(item.chainId, trx.chainId)
          );
          // console.log("swap", trns, trx);
          const chainObj = tokenSymbolList.find(
            (item) => item.conversionSymbol === trns?.chainId?.toLowerCase()
          );
          let isFromMyAddress = isAddressEqual(trx.fromAddress, address!);

          outHashes.push(trx?.hash);
          output.push({
            fromNetwork: chainObj?.code,
            toNetwork: chainObj?.code,
            fromTokenAddress: isFromMyAddress ? trx?.token : "NATIVE",
            toTokenAddress: isFromMyAddress ? "NATIVE" : trx?.token,
            srcAmount: isFromMyAddress ? trx?.value : trns?.value,
            swapAmount: isFromMyAddress ? trns?.value : trx?.value,
            timeStamp: trx.blockTimeStamp,
            hash: trx?.hash,
            type: "swap",
          });
          return;
        }
        if (
          erc20Transactions?.some(
            (item: any) =>
              item.hash === trx?.hash &&
              !isAddressEqual(item.toAddress, trx.toAddress) &&
              isAddressEqual(item.chainId, trx.chainId)
          )
        ) {
          let trns = erc20Transactions?.find(
            (item: any) =>
              item.hash === trx?.hash &&
              !isAddressEqual(item.toAddress, trx.toAddress) &&
              isAddressEqual(item.chainId, trx.chainId)
          );
          // console.log("swap", trns, trx);
          const chainObj = tokenSymbolList.find(
            (item) => item.conversionSymbol === trns?.chainId?.toLowerCase()
          );
          let isFromMyAddress = isAddressEqual(trx.fromAddress, address!);
          if (duplicates.includes(trx.hash)) return;
          duplicates.push(trx.hash);

          outHashes.push(trx?.hash);
          output.push({
            fromNetwork: chainObj?.code,
            toNetwork: chainObj?.code,
            fromTokenAddress: isFromMyAddress ? trx?.token : trns?.token,
            toTokenAddress: isFromMyAddress ? trns?.token : trx?.token,
            srcAmount: isFromMyAddress ? trx?.value : trns?.value,
            swapAmount: isFromMyAddress ? trns?.value : trx?.value,
            timeStamp: trx.blockTimeStamp,
            hash: trx?.hash,
            type: "swap",
          });
          return;
        }
      });
      bridgeTransactions?.forEach((item: any) => {
        //Bridge
        outHashes.push(...[item?.lockHash, item?.releaseHash]);
        output.push({ ...item, type: "bridge" });
      });

      output.sort((a: any, b: any) => {
        let aa =
          a?.blockTimestamp ||
          a?.blockTimeStamp ||
          a?.timestamp ||
          a?.timeStamp;
        let bb =
          b?.blockTimestamp ||
          b?.blockTimeStamp ||
          b?.timestamp ||
          b?.timeStamp;
        return Number(bb) - Number(aa);
      });
      //   console.log("output", output, loading);

      setTransactionList(
        output.map((order: any) => {
          // console.log(order);
          if (
            order?.type === "in" ||
            order?.type === "out" ||
            order?.type === "fail"
          ) {
            const chainObj = tokenSymbolList.find(
              (item) => item.conversionSymbol === order?.chainId?.toLowerCase()
            );
            const swapChainId = chainObj?.chainId;
            const fromTokenObj = commonTokenList.find(
              (token) =>
                isAddressEqual(
                  token.address!,
                  order?.token
                    ? order?.token
                    : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                ) && token.chainId === swapChainId
            );
            const toTokenObj = commonTokenList.find(
              (token) =>
                isAddressEqual(
                  token.address!,
                  order?.token
                    ? order?.token
                    : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                ) && token.chainId === swapChainId
            );
            let {
              value,
              hash,
              type,
              fromAddress,
              toAddress,
              blockTimestamp,
              blockTimeStamp,
            } = order;
            value = ParseWeiUtil(value, fromTokenObj?.decimals!);
            // console.log("tm", blockTimestamp, order);
            let timestamp = blockTimestamp || blockTimeStamp;
            return {
              fromAddress,
              toAddress,
              fromNetwork: chainObj?.code,
              toNetwork: chainObj?.code,
              fromToken: fromTokenObj?.shortName || "N/A",
              toToken: toTokenObj?.shortName || "N/A",
              srcAmount: value?.toString()
                ? parseFloat(value)?.toFixed(4)
                : "N/A",
              releaseAmount: "N/A",
              ago: dayjs(new Date(timestamp * 1000))
                .tz("Asia/Kolkata")
                .fromNow(),
              date: dayjs(new Date(timestamp * 1000))
                .tz("Asia/Kolkata")
                .format("hh:mm A, DD/MM/YYYY"),
              dateShort: dayjs(new Date(timestamp * 1000))
                .tz("Asia/Kolkata")
                .format("MMM D, YYYY"),
              processed: true,
              releaseHash: hash,
              type:
                order?.type === "out" && order?.value == 0 ? "approve" : type,
              imgFromToken: fromTokenObj?.logo as string,
              imgToToken: toTokenObj?.logo as string,
              imgFromNetwork: chainsLogo[swapChainId as number] as string,
              imgToNetwork: chainsLogo[swapChainId as number] as string,
            };
          }
          if (order?.type === "swap") {
            const swapChainId = tokenSymbolList.find(
              (item) => item.code === order?.fromNetwork?.toLowerCase()
            )?.chainId;
            const fromTokenObj = commonTokenList.find(
              (token) =>
                isAddressEqual(
                  token.address!,
                  order?.fromTokenAddress === "NATIVE"
                    ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                    : order?.fromTokenAddress
                ) && token.chainId === swapChainId
            );
            const toTokenObj = commonTokenList.find(
              (token) =>
                isAddressEqual(
                  token.address!,
                  order?.toTokenAddress === "NATIVE"
                    ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                    : order?.toTokenAddress
                ) && token.chainId === swapChainId
            );
            let { fromNetwork, toNetwork, srcAmount, swapAmount, hash } = order;
            srcAmount = ParseWeiUtil(order.srcAmount, fromTokenObj?.decimals!);
            swapAmount = ParseWeiUtil(order.swapAmount, toTokenObj?.decimals!);
            return {
              fromNetwork,
              toNetwork,
              fromToken: fromTokenObj?.shortName || "N/A",
              toToken: toTokenObj?.shortName || "N/A",
              srcAmount: srcAmount ? srcAmount?.toFixed(4) : "N/A",
              swapAmount: swapAmount ? swapAmount?.toFixed(4) : "N/A",
              ago: dayjs(new Date(order.timeStamp * 1000))
                .tz("Asia/Kolkata")
                .fromNow(),
              date: dayjs(new Date(order.timeStamp * 1000))
                .tz("Asia/Kolkata")
                .format("hh:mm A, DD/MM/YYYY"),
              dateShort: dayjs(new Date(order.timeStamp * 1000))
                .tz("Asia/Kolkata")
                .format("MMM D, YYYY"),
              processed: true,
              hash,
              type: "swap",
              imgFromToken: fromTokenObj?.logo as string,
              imgToToken: toTokenObj?.logo as string,
              imgFromNetwork: chainsLogo[swapChainId as number] as string,
              imgToNetwork: chainsLogo[swapChainId as number] as string,
            };
          }
          const fromChain = tokenSymbolList.find(
            (item) => item.code === order?.fromNetwork?.toLowerCase()
          )?.chainId;
          const fromTokenObj = commonTokenList.find(
            (token) =>
              token.shortName === order?.srcToken?.toUpperCase() &&
              token.chainId === fromChain
          );
          const toChain = tokenSymbolList.find(
            (item) => item.code === order?.toNetwork?.toLowerCase()
          )?.chainId;
          const toTokenObj = commonTokenList.find(
            (token) =>
              token.shortName === order?.toToken?.toUpperCase() &&
              token.chainId === toChain
          );
          const srcAmount = ParseWeiUtil(
            order.srcAmount,
            fromTokenObj?.decimals!
          );
          const releaseAmount = ParseWeiUtil(
            order.releaseAmount,
            toTokenObj?.decimals!
          );
          const {
            fromNetwork,
            toNetwork,
            srcToken,
            processed,
            lockHash,
            releaseHash,
          } = order;
          return {
            type: "bridge",
            fromNetwork,
            toNetwork,
            fromToken: fromTokenObj?.shortName || "N/A",
            toToken: toTokenObj?.shortName || "N/A",
            srcAmount: srcAmount ? srcAmount?.toFixed(4) : "N/A",
            releaseAmount: releaseAmount ? releaseAmount?.toFixed(4) : "N/A",
            srcToken,
            lockHash: lockHash,
            processed,
            ago: dayjs(new Date(order?.createdAt)).tz("Asia/Kolkata").fromNow(),
            date: dayjs(new Date(order?.createdAt))
              .tz("Asia/Kolkata")
              .format("hh:mm A, DD/MM/YYYY"),
            dateShort: dayjs(new Date(order?.createdAt))
              .tz("Asia/Kolkata")
              .format("MMM D, YYYY"),
            releaseHash: releaseHash,
            imgFromToken: fromTokenObj?.logo as string,
            imgToToken: toTokenObj?.logo as string,
            imgFromNetwork: chainsLogo[fromChain as number] as string,
            imgToNetwork: chainsLogo[toChain as number] as string,
          };
        })
      );
      setLoading(false);
      setBackgroundSync(false);

      // Clean up the axios request when the component is unmounted
      return () => {
        controller.abort();
      };
    } catch (error) {
      if ((error as any)?.code === "ERR_CANCELED") {
        console.log("Axios Request Cancelled");
        return;
      }

      setLoading(false);
      //ts-error
      if ((error as any)?.toString().includes("destructure")) return;
      if ((error as any)?.toString().includes("No Transactions found")) return;

      if (error instanceof Error) toastError(error?.message);
      else toastError("Something Went Wrong");
      console.log("transErr ", error);
    } finally {
      // setLoading(false);
    }
  }, [currentPageNo]);

  return;
}
