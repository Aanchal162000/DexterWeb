import { useState } from "react";
import { agentService } from "@/services/contract/agentService";
import { QuoteRequestParams } from "@/services/contract/interfaces";

interface UseQuoteReturn {
  quote: any | null;
  loading: boolean;
  error: string | null;
  getQuote: (params: QuoteRequestParams) => Promise<void>;
}

export const useQuote = (): UseQuoteReturn => {
  const [quote, setQuote] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = async (params: QuoteRequestParams) => {
    try {
      setLoading(true);
      setError(null);

      // Validate token addresses
      if (
        !agentService.validateTokenAddresses(
          params.fromTokenAddress,
          params.toTokenAddress
        )
      ) {
        throw new Error("Invalid token addresses");
      }

      const response = await agentService.getQuote(params);
      setQuote(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching quote"
      );
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    quote,
    loading,
    error,
    getQuote,
  };
};
