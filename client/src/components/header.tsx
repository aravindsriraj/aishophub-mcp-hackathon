import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingBag, Search, ShoppingCart, User, Moon, Sun, LogOut, Heart, UserCircle, Package, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onSearch: (value: string) => void;
  onCartToggle: () => void;
  onAuthToggle: () => void;
  searchValue?: string;
}

export function Header({ onSearch, onCartToggle, onAuthToggle, searchValue = "" }: HeaderProps) {
  const [searchInput, setSearchInput] = useState(searchValue);
  const { user, signOut } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full glass-dark border-b border-border/50 shadow-lg transition-all duration-300" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/shop" aria-label="ShopHub Home">
            <div className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform duration-300" data-testid="logo-link">
              <div className="btn-gradient text-white rounded-lg p-2 shadow-lg">
                <ShoppingBag className="h-5 w-5 animate-pulse" />
              </div>
              <span className="text-2xl font-bold text-gradient">ShopHub</span>
            </div>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8" id="main-content">
            <div className="relative w-full">
              <form onSubmit={handleSearch} className="flex items-center gap-2" role="search">
                <div className="relative flex-1">
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Search products with AI..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 glass border-input focus:border-purple-500 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                    aria-label="Search products using AI"
                    aria-describedby="search-button"
                    data-testid="input-search-desktop"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                <Button
                  type="submit"
                  size="default"
                  id="search-button"
                  className="ai-search-button h-10 px-4 rounded-md flex items-center justify-center whitespace-nowrap ripple"
                  aria-label="Search with AI"
                  data-testid="button-search-desktop"
                >
                  <Sparkles className="h-4 w-4 mr-1.5 text-white sparkle-icon" aria-hidden="true" />
                  <span className="text-white font-medium">AI Search</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4" role="navigation" aria-label="Main navigation">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hover:scale-110 transition-transform duration-300"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'dark'}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 animate-spin-slow" aria-hidden="true" /> : <Moon className="h-4 w-4 animate-pulse" aria-hidden="true" />}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:scale-110 transition-transform duration-300"
              onClick={onCartToggle}
              aria-label={`Shopping cart with ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
              aria-haspopup="dialog"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center badge-animate" aria-label={`${cartItemCount} items in cart`} data-testid="cart-count">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    aria-label="User menu"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    data-testid="button-user-menu"
                  >
                    <User className="h-4 w-4 mr-2" aria-hidden="true" />
                    <span className="hidden md:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" role="menu" aria-label="User menu options">
                  <DropdownMenuItem role="menuitem" data-testid="menu-profile">
                    <UserCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild role="menuitem" data-testid="menu-wishlist">
                    <Link href="/wishlist" aria-label="Go to wishlist">
                      <Heart className="h-4 w-4 mr-2" aria-hidden="true" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild role="menuitem" data-testid="menu-orders">
                    <Link href="/orders" aria-label="View your orders">
                      <Package className="h-4 w-4 mr-2" aria-hidden="true" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild role="menuitem" data-testid="menu-settings">
                    <Link href="/settings" aria-label="Account settings">
                      <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator role="separator" />
                  <DropdownMenuItem onClick={handleSignOut} role="menuitem" aria-label="Sign out of your account" data-testid="menu-logout">
                    <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={onAuthToggle} 
                size="sm" 
                className="btn-gradient text-white hover:scale-105 transition-transform duration-300 ripple" 
                aria-label="Sign in to your account"
                data-testid="button-signin"
              >
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2" role="search" aria-label="Mobile search">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search products with AI..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 h-10"
              aria-label="Search products using AI"
              aria-describedby="mobile-search-button"
              data-testid="input-search-mobile"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <Button
            type="submit"
            size="default"
            id="mobile-search-button"
            className="ai-search-button h-10 px-3 rounded-md flex items-center justify-center text-xs whitespace-nowrap ripple"
            aria-label="Search with AI"
            data-testid="button-search-mobile"
          >
            <Sparkles className="h-3 w-3 mr-1 text-white sparkle-icon" aria-hidden="true" />
            <span className="text-white">AI Search</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
