import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [, setLocation] = useLocation();
  const { signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const handleSignIn = async (data: SignInData) => {
    try {
      await signIn(data);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    try {
      await signUp(data);
      toast({
        title: "Account created!",
        description: "Welcome to ShopHub!",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-primary text-primary-foreground rounded-lg p-2">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">ShopHub</span>
          </div>
          <CardTitle data-testid="auth-title">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {mode === "signin" 
              ? "Welcome back! Please sign in to your account."
              : "Join ShopHub to start shopping amazing products."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "signin" ? (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...signInForm.register("email")}
                  data-testid="input-email"
                />
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...signInForm.register("password")}
                  data-testid="input-password"
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-signin"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  {...signUpForm.register("name")}
                  data-testid="input-name"
                />
                {signUpForm.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  {...signUpForm.register("email")}
                  data-testid="input-signup-email"
                />
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  {...signUpForm.register("password")}
                  data-testid="input-signup-password"
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  {...signUpForm.register("confirmPassword")}
                  data-testid="input-confirm-password"
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                className="ml-1 p-0 h-auto"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                data-testid="button-toggle-mode"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
          
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline" className="w-full" data-testid="link-home">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
