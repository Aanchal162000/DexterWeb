
export const sleepTimer = async (milliseconds: number): Promise<unknown> =>
  await new Promise((resolve) => setTimeout(resolve, milliseconds));

export function addCommas(number: number): string {
  let parts = number.toString().split(".");
  let integerPart = parts[0];
  let decimalPart = parts[1] || "";

  let reversedInteger: any = integerPart.split("").reverse().join("");
  let commaInteger: any = reversedInteger.match(/\d{1,3}/g).join(",");

  let result = commaInteger.split("").reverse().join("");
  if (decimalPart !== "") {
    result += "." + decimalPart;
  }

  // Return the final result
  return result;
}

export const ParseEthUtil = (amount: any, decimal: any): number => {
  let response: number = Number(amount) * 10 ** decimal;
  return response;
};

export const ParseWeiUtil = (amount: any, decimal: any): number => {
  let response: number = Number(amount) / 10 ** decimal;
  return response;
};

export function formatAddress(address?: string | null, subLength: number = 6): string | null {
  if (!address) return null;
  return `${address.slice(0, subLength)}....${address.slice(-subLength)}`;
}

export function numberWithCommas(input: number | string): string {
  // console.log("com", input);
  const firstHalf = input.toString().split(".")[0];
  const secondHalf = input.toString().split(".")[1];
  return [firstHalf.replace(/\B(?=(\d{3})+(?!\d))/g, ","), secondHalf].join(".");
}

export function numberToMask(input: number | string): string {
  return input.toString().replace(/\d/g, "X");
}

export function addTrailZeros(input: any, desiredFrontLength: number, desiredBackLength: number): string {
  if (!input) return "0.0";
  const firstHalf = input.toString().split(".")[0];
  const secondHalf = Number(input)?.toFixed(desiredBackLength).toString().split(".")[1];
  return [firstHalf.toString().padStart(desiredFrontLength, "0"), secondHalf].join(".");
}

export function truncateToFixed(num: any, decimals: any) {
  const factor = Math.pow(10, decimals);
  return Math.floor(num * factor) / factor;
}

export const formatPrecision = (num: number) => {
  if (isNaN(num)) return num;
  return Number(num) < 1.00 && Number(num) !== 0 ? Number(num).toFixed(4) : Number(num).toFixed(2)
};

export const formatNumber = (e: any) => {
  // console.log("formate:", e)
  let val = String(e);
  val = val.replace(/[^0-9.]/g, "");
  if (val === ".") return "0.";
  if (!val.includes(".") && val.endsWith("0") && Number(val) === 0) return "0";
  if (!val.includes(".")) val = val.replace(/^0+/, "");
  if (val.slice(0, -1).includes(".") && val.endsWith(".")) val = val.slice(0, -1);
  return val;
};

export const toNumFixed = (n: number | string) => Number(n).toFixed(Number(n) > 1 && Number(n) < 0 ? 2 : Number(n) > 0.0001 ? 4 : 6);
