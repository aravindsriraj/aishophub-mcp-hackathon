import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    }
  };

  const calculateTotal = () => {
    if (!cartItems) return "₹0";
    
    const total = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.discountedPrice.replace(/[₹,]/g, ''));
      return sum + (price * item.quantity);
    }, 0);
    
    return `₹${total.toLocaleString()}`;
  };

  const parsePrice = (priceStr: string) => {
    return parseFloat(priceStr.replace(/[₹,]/g, ''));
  };

  if (!user) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-80 glass-dark" role="dialog" aria-label="Shopping cart">
          <SheetHeader>
            <SheetTitle data-testid="cart-title" className="text-gradient flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 animate-pulse" aria-hidden="true" />
            Shopping Cart
          </SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4" data-testid="text-signin-required">
                Please sign in to view your cart
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-80 flex flex-col glass-dark" role="dialog" aria-label="Shopping cart">
        <SheetHeader>
          <SheetTitle data-testid="cart-title" className="text-gradient flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 animate-pulse" aria-hidden="true" />
            Shopping Cart
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems?.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-empty-cart">
                  Your cart is empty
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems?.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center space-x-3 p-3 glass-dark rounded-lg hover:shadow-lg transition-all duration-300" 
                  data-testid={`cart-item-${item.productId}`}
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.1}s both` }}
                >
                  <img
                    src={item.product.imgLink || "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                    alt={`${item.product.productName} in cart`}
                    className="w-12 h-12 object-cover rounded"
                    loading="lazy"
                    data-testid={`img-cart-item-${item.productId}`}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors" data-testid={`text-item-name-${item.productId}`}>
                      {item.product.productName}
                    </h4>
                    <p className="text-xs text-gradient font-bold" data-testid={`text-item-price-${item.productId}`}>
                      {item.product.discountedPrice}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 hover:scale-110 transition-transform"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.product.productName}`}
                      data-testid={`button-decrease-${item.productId}`}
                    >
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    </Button>
                    <span className="text-sm w-8 text-center font-bold" aria-label={`Quantity: ${item.quantity}`} role="status" data-testid={`text-quantity-${item.productId}`}>
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 hover:scale-110 transition-transform"
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      data-testid={`button-increase-${item.productId}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive p-1 hover:scale-110 hover:bg-destructive/20 transition-all"
                    onClick={() => handleRemoveItem(item.productId)}
                    data-testid={`button-remove-${item.productId}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cartItems && cartItems.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold glass-dark rounded-lg p-3">
              <span>Total:</span>
              <span data-testid="text-cart-total" className="text-gradient text-xl">{calculateTotal()}</span>
            </div>
            <Button 
              className="w-full btn-gradient text-white hover:scale-[1.02] transition-transform" 
              size="lg" 
              data-testid="button-checkout"
              onClick={() => {
                onClose();
                setLocation("/checkout");
              }}
            >
              Proceed to Checkout
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onClose}
              data-testid="button-continue-shopping"
            >
              Continue Shopping
            </Button>
            <Separator />
            <Button 
              variant="destructive" 
              className="w-full hover:scale-[1.02] transition-transform" 
              onClick={handleClearCart}
              data-testid="button-clear-cart"
            >
              Clear Cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
