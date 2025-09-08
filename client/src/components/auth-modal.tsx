import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
      onClose();
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
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const resetForms = () => {
    signInForm.reset();
    signUpForm.reset();
  };

  const handleModeToggle = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForms();
  };

  const handleClose = () => {
    onClose();
    resetForms();
    setMode("signin");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-dark">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 animate-fadeIn">
            <div className="btn-gradient text-white rounded-lg p-2 shadow-lg transform hover:scale-110 transition-transform">
              <ShoppingBag className="h-6 w-6 animate-pulse" />
            </div>
            <span className="text-2xl font-bold text-gradient">ShopHub</span>
          </div>
          <DialogTitle data-testid="auth-modal-title" className="text-gradient text-center">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin" 
              ? "Welcome back! Please sign in to your account."
              : "Join ShopHub to start shopping amazing products."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {mode === "signin" ? (
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  {...signInForm.register("email")}
                  className="glass focus:scale-[1.02] transition-transform"
                  data-testid="input-signin-email"
                />
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  {...signInForm.register("password")}
                  className="glass focus:scale-[1.02] transition-transform"
                  data-testid="input-signin-password"
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full btn-gradient text-white hover:scale-[1.02] transition-transform" 
                disabled={isLoading}
                data-testid="button-signin-submit"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  {...signUpForm.register("name")}
                  className="glass focus:scale-[1.02] transition-transform"
                  data-testid="input-signup-name"
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
                  className="glass focus:scale-[1.02] transition-transform"
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
                  className="glass focus:scale-[1.02] transition-transform"
                  data-testid="input-signup-password"
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  {...signUpForm.register("confirmPassword")}
                  className="glass focus:scale-[1.02] transition-transform"
                  data-testid="input-signup-confirm-password"
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full btn-gradient text-white hover:scale-[1.02] transition-transform" 
                disabled={isLoading}
                data-testid="button-signup-submit"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
              <Button
                variant="link"
                className="ml-1 p-0 h-auto"
                onClick={handleModeToggle}
                data-testid="button-toggle-auth-mode"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
