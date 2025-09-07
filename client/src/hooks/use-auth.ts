import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { signInSchema, signUpSchema } from "@shared/schema";
import { z } from "zod";

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          localStorage.removeItem('auth_token');
          return null;
        }
        
        const data = await response.json();
        return data.user;
      } catch (error) {
        localStorage.removeItem('auth_token');
        return null;
      }
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData): Promise<AuthResponse> => {
      const response = await apiRequest('POST', '/api/auth/signin', data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData): Promise<AuthResponse> => {
      const response = await apiRequest('POST', '/api/auth/signup', data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(['/api/auth/me'], data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiRequest('POST', '/api/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    },
    onSettled: () => {
      localStorage.removeItem('auth_token');
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  return {
    user,
    isLoading: isLoadingUser || signInMutation.isPending || signUpMutation.isPending || signOutMutation.isPending,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
  };
}
