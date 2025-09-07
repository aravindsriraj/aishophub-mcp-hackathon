import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertWishlistItemSchema } from "@shared/schema";
import { z } from "zod";

export function useWishlist() {
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading, error } = useQuery({
    queryKey: ["/api/wishlist"],
    retry: false,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (item: z.infer<typeof insertWishlistItemSchema>) => {
      return await apiRequest("/api/wishlist", {
        method: "POST",
        body: JSON.stringify(item),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest(`/api/wishlist/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
  });

  const checkWishlistStatusQuery = (productId: string) => useQuery({
    queryKey: [`/api/wishlist/check/${productId}`],
    retry: false,
  });

  const toggleWishlist = async (productId: string) => {
    const isInWishlist = wishlistItems.some((item: any) => item.productId === productId);
    
    if (isInWishlist) {
      await removeFromWishlistMutation.mutateAsync(productId);
    } else {
      await addToWishlistMutation.mutateAsync({ productId });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item: any) => item.productId === productId);
  };

  return {
    wishlistItems,
    isLoading,
    error,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    toggleWishlist,
    isInWishlist,
    isToggling: addToWishlistMutation.isPending || removeFromWishlistMutation.isPending,
  };
}