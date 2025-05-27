export const calculateTokenPrice = (
  virtualTokenValue: string | number,
  mcapInVirtual: number
): number => {
  if (!virtualTokenValue || !mcapInVirtual) return 0;

  const tokenValue =
    typeof virtualTokenValue === "string"
      ? parseFloat(virtualTokenValue)
      : virtualTokenValue;

  // Convert from wei (1e18) to ether
  const tokenValueInEther = tokenValue / 1e18;

  // Calculate price in USD
  return tokenValueInEther * mcapInVirtual;
};

export const calculateTotalSupply = (
  fdv: number,
  tokenPrice: number
): number => {
  if (!fdv || !tokenPrice) return 0;
  return fdv / tokenPrice;
};

export const calculatePrice24hAgo = (
  currentPrice: number,
  priceChangePercent: number
): number => {
  if (!currentPrice || !priceChangePercent) return 0;
  return currentPrice / (1 + priceChangePercent / 100);
};

export const formatTokenAmount = (
  amount: number | string,
  decimals: number = 6
): string => {
  if (!amount) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return num.toFixed(decimals);
};

export const formatCurrency = (
  amount: number | string,
  decimals: number = 2
): string => {
  if (!amount) return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";

  // For very small numbers, use more decimals
  if (num < 0.001) {
    return `$${num.toExponential(decimals)}`;
  }

  // For very large numbers, use K/M/B/T suffixes
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(decimals)}T`;
  }
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(decimals)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(decimals)}M`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(decimals)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (
  value: number | string,
  decimals: number = 2
): string => {
  if (!value) return "0.00%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00%";
  return `${num >= 0 ? "+" : ""}${num.toFixed(decimals)}%`;
};

// Helper function to convert wei to ether
export const weiToEther = (wei: string | number): number => {
  if (!wei) return 0;
  const weiNum = typeof wei === "string" ? parseFloat(wei) : wei;
  if (isNaN(weiNum)) return 0;
  return weiNum / 1e18;
};

// Helper function to format large numbers with suffixes
export const formatLargeNumber = (
  num: number | string,
  decimals: number = 2
): string => {
  if (!num) return "0";
  const value = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(value)) return "0";

  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(decimals)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return Math.floor(value).toString();
};
