import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Header } from "@/components/header";
import { CartSidebar } from "@/components/cart-sidebar";
import { AuthModal } from "@/components/auth-modal";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wishlist() {
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = async (productId: string, productName: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      await addToCart({ productId, quantity: 1 });
      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: "Removed from wishlist",
        description: `${productName} has been removed from your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCartClick={() => setShowCart(true)} 
        onAuthClick={() => setShowAuth(true)}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to shopping
          </Button>
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems?.length || 0} {wishlistItems?.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wishlistItems && wishlistItems.length > 0 ? (
          // Wishlist items
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <Link href={`/product/${item.product.id}`}>
                  <div className="relative">
                    <img
                      src={item.product.imgLink || "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                      alt={item.product.productName}
                      className="w-full h-48 object-cover"
                      data-testid={`img-wishlist-${item.product.id}`}
                    />
                    {item.product.discountPercentage && (
                      <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                        {item.product.discountPercentage} OFF
                      </div>
                    )}
                  </div>
                </Link>
                
                <CardContent className="p-4">
                  <Link href={`/product/${item.product.id}`}>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors" data-testid={`text-name-${item.product.id}`}>
                      {item.product.productName}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg font-bold text-primary" data-testid={`text-price-${item.product.id}`}>
                      {item.product.discountedPrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {item.product.actualPrice}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(item.product.id, item.product.productName)}
                      disabled={cartLoading}
                      data-testid={`button-add-cart-${item.product.id}`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveFromWishlist(item.product.id, item.product.productName)}
                      data-testid={`button-remove-wishlist-${item.product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Empty state
          <Card className="max-w-md mx-auto">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start adding products you love to your wishlist!
              </p>
              <Link href="/">
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <CartSidebar 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </div>
  );
}