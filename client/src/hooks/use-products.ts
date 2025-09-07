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

const SEMANTIC_SEARCH_API = "https://product-search.replit.app/search";
const API_TOKEN = "*ULXrUUDkkjRheg3cjpQAcBbzGgffZBn!32ssr8JRW9VERcVmweQqGnYi!Y8jcPnG";

export function useProducts(
  page: number, 
  limit: number, 
  search?: string, 
  category?: string, 
  sortBy?: string,
  priceMin?: string,
  priceMax?: string,
  rating?: string
) {
  return useQuery<ProductsResponse>({
    queryKey: ['/api/products', { page, limit, search, category, sortBy, priceMin, priceMax, rating }],
    queryFn: async () => {
      // Use semantic search if search query is provided
      if (search && search.trim()) {
        try {
          // First, get product IDs from semantic search
          const semanticResponse = await fetch(SEMANTIC_SEARCH_API, {
            method: "POST",
            headers: {
              "accept": "application/json",
              "Authorization": `Bearer ${API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: search,
              n_results: 100, // Get more results to apply filters
            }),
          });

          if (!semanticResponse.ok) {
            throw new Error("Semantic search failed");
          }

          const semanticData = await semanticResponse.json();
          const semanticProducts = semanticData.products || [];
          
          // Extract product IDs from semantic search results
          const productIds = semanticProducts.map((p: any) => p.id);
          
          if (productIds.length === 0) {
            return {
              products: [],
              pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
              },
            };
          }
          
          // Fetch actual products from our database using the IDs
          const params = new URLSearchParams();
          params.append('ids', productIds.join(','));
          if (category) params.append('category', category);
          if (sortBy) params.append('sortBy', sortBy);
          if (priceMin) params.append('priceMin', priceMin);
          if (priceMax) params.append('priceMax', priceMax);
          if (rating) params.append('rating', rating);
          
          const productsResponse = await fetch(`/api/products/by-ids?${params}`);
          if (!productsResponse.ok) {
            throw new Error('Failed to fetch products by IDs');
          }
          
          const productsData = await productsResponse.json();
          let products = productsData.products || productsData || [];
          
          // Maintain the order from semantic search results
          const productMap = new Map(products.map((p: Product) => [p.id, p]));
          const orderedProducts = productIds
            .map((id: string) => productMap.get(id))
            .filter((p: Product | undefined): p is Product => p !== undefined);
          
          // Apply additional filters if provided
          let filteredProducts = orderedProducts;
          
          if (category) {
            filteredProducts = filteredProducts.filter((p: Product) => p.category === category);
          }
          
          if (priceMin || priceMax) {
            filteredProducts = filteredProducts.filter((p: Product) => {
              const price = parseInt(p.discountedPrice?.replace(/[^0-9]/g, '') || '0');
              const min = priceMin ? parseInt(priceMin) : 0;
              const max = priceMax ? parseInt(priceMax) : Infinity;
              return price >= min && price <= max;
            });
          }
          
          if (rating) {
            filteredProducts = filteredProducts.filter((p: Product) => {
              const productRating = parseFloat(p.rating || '0');
              return productRating >= parseFloat(rating);
            });
          }
          
          // Apply sorting if specified (overrides semantic search order)
          if (sortBy) {
            filteredProducts.sort((a: Product, b: Product) => {
              switch (sortBy) {
                case 'price_asc':
                  return parseInt(a.discountedPrice?.replace(/[^0-9]/g, '') || '0') - 
                         parseInt(b.discountedPrice?.replace(/[^0-9]/g, '') || '0');
                case 'price_desc':
                  return parseInt(b.discountedPrice?.replace(/[^0-9]/g, '') || '0') - 
                         parseInt(a.discountedPrice?.replace(/[^0-9]/g, '') || '0');
                case 'rating':
                  return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
                default:
                  return 0;
              }
            });
          }
          
          // Paginate results
          const startIdx = (page - 1) * limit;
          const paginatedProducts = filteredProducts.slice(startIdx, startIdx + limit);
          
          return {
            products: paginatedProducts,
            pagination: {
              page,
              limit,
              total: filteredProducts.length,
              totalPages: Math.ceil(filteredProducts.length / limit),
            },
          };
        } catch (error) {
          console.error('Semantic search failed, falling back to regular search:', error);
          // Fall back to regular search if semantic search fails
        }
      }
      
      // Regular product browsing without semantic search
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (sortBy) params.append('sortBy', sortBy);
      if (priceMin) params.append('priceMin', priceMin);
      if (priceMax) params.append('priceMax', priceMax);
      if (rating) params.append('rating', rating);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });
}
