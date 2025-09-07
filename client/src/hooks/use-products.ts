import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useProducts(page: number, limit: number, search?: string, category?: string, sortBy?: string) {
  return useQuery<ProductsResponse>({
    queryKey: ['/api/products', { page, limit, search, category, sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (sortBy) params.append('sortBy', sortBy);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });
}
