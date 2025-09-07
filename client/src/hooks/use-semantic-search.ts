import { useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";

interface SemanticSearchRequest {
  query: string;
  n_results?: number;
}

interface SemanticSearchResponse {
  products: Product[];
}

const SEMANTIC_SEARCH_API = "https://product-search.replit.app/search";
const API_TOKEN = "*ULXrUUDkkjRheg3cjpQAcBbzGgffZBn!32ssr8JRW9VERcVmweQqGnYi!Y8jcPnG";

export function useSemanticSearch() {
  return useMutation<SemanticSearchResponse, Error, SemanticSearchRequest>({
    mutationFn: async ({ query, n_results = 20 }) => {
      const response = await fetch(SEMANTIC_SEARCH_API, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Authorization": `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          n_results,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform semantic search");
      }

      const data = await response.json();
      
      // Map the response to match our Product interface if needed
      // Assuming the API returns products in a compatible format
      return {
        products: data.results || data.products || data,
      };
    },
  });
}