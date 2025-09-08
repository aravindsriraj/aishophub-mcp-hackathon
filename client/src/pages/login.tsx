import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Mail, Lock, User, Sparkles } from "lucide-react";
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

  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press Escape to clear form
      if (e.key === 'Escape') {
        if (mode === 'signin') {
          signInForm.reset();
        } else {
          signUpForm.reset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, signInForm, signUpForm]);

  const handleSignIn = async (data: SignInData) => {
    try {
      await signIn(data);
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      setLocation("/shop");
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
      setLocation("/shop");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="animated-gradient absolute inset-0 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
      </div>
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <Card className="w-full max-w-md glass-dark relative z-10 shadow-2xl animate-fadeIn">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center space-x-3 mb-6 animate-fadeIn">
            <div className="btn-gradient text-white rounded-xl p-3 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <ShoppingBag className="h-7 w-7 animate-pulse" />
            </div>
            <span className="text-3xl font-bold text-gradient">ShopHub</span>
          </div>
          <CardTitle className="text-2xl font-bold mb-2" data-testid="auth-title">
            {mode === "signin" ? "Welcome Back" : "Join ShopHub"}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === "signin" 
              ? "Sign in to continue your shopping journey"
              : "Create an account to start shopping amazing products"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "signin" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 glass">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...signInForm.register("email")}
                    className="glass focus:scale-[1.02] transition-transform"
                    autoComplete="email"
                    autoFocus
                    aria-required="true"
                    aria-invalid={!!signInForm.formState.errors.email}
                    aria-describedby={signInForm.formState.errors.email ? "email-error" : undefined}
                    data-testid="input-email"
                  />
                {signInForm.formState.errors.email && (
                  <p id="email-error" role="alert" className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.email.message}
                  </p>
                )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...signInForm.register("password")}
                    className="glass focus:scale-[1.02] transition-transform"
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={!!signInForm.formState.errors.password}
                    aria-describedby={signInForm.formState.errors.password ? "password-error" : undefined}
                    data-testid="input-password"
                  />
                {signInForm.formState.errors.password && (
                  <p id="password-error" role="alert" className="text-sm text-destructive mt-1">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-gradient text-white hover:scale-[1.02] transition-transform py-6 text-lg font-semibold" 
                  disabled={isLoading}
                  data-testid="button-signin"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...signUpForm.register("name")}
                    className="glass focus:scale-[1.02] transition-transform"
                    autoComplete="name"
                    autoFocus
                    aria-required="true"
                    aria-invalid={!!signUpForm.formState.errors.name}
                    aria-describedby={signUpForm.formState.errors.name ? "name-error" : undefined}
                    data-testid="input-name"
                  />
                {signUpForm.formState.errors.name && (
                  <p id="name-error" role="alert" className="text-sm text-destructive mt-1">
                    {signUpForm.formState.errors.name.message}
                  </p>
                )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
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
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
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
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    {...signUpForm.register("confirmPassword")}
                    className="glass focus:scale-[1.02] transition-transform"
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
                  className="w-full btn-gradient text-white hover:scale-[1.02] transition-transform py-6 text-lg font-semibold" 
                  disabled={isLoading}
                  data-testid="button-signup"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
