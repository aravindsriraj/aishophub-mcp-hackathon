import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CartItem, Product, InsertCartItem } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

export function useCart() {
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return [];
      
      const response = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch cart');
      }
      
      return response.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (item: InsertCartItem) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  return {
    cartItems,
    isLoading: isLoading || addToCartMutation.isPending || updateQuantityMutation.isPending || removeFromCartMutation.isPending || clearCartMutation.isPending,
    addToCart: addToCartMutation.mutateAsync,
    updateQuantity: (productId: string, quantity: number) => updateQuantityMutation.mutateAsync({ productId, quantity }),
    removeFromCart: removeFromCartMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
  };
}
