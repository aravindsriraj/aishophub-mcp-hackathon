import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ShoppingCart, Package, ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import type { CartItem, Product } from "@shared/schema";

export default function Checkout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: cartItems = [], isLoading } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"]
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/checkout");
    },
    onSuccess: async (data) => {
      // Generate PDF invoice
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text("Invoice", 105, 20, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text(`Order ID: ${data.order.id}`, 20, 40);
      pdf.text(`Date: ${new Date(data.order.createdAt).toLocaleDateString()}`, 20, 50);
      pdf.text(`Status: ${data.order.status}`, 20, 60);
      
      // Items table header
      pdf.setFontSize(10);
      pdf.text("Product", 20, 80);
      pdf.text("Quantity", 120, 80);
      pdf.text("Price", 150, 80);
      pdf.text("Total", 180, 80);
      
      // Items
      let yPosition = 90;
      cartItems.forEach((item) => {
        const price = parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, ''));
        const total = price * item.quantity;
        
        // Truncate long product names
        const productName = item.product.productName.length > 50 
          ? item.product.productName.substring(0, 50) + "..." 
          : item.product.productName;
        
        pdf.text(productName, 20, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(`₹${price.toFixed(2)}`, 150, yPosition);
        pdf.text(`₹${total.toFixed(2)}`, 180, yPosition);
        
        yPosition += 10;
        
        // Add new page if needed
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      
      // Total
      pdf.setFontSize(12);
      pdf.text(`Total Amount: ₹${data.order.totalAmount}`, 180, yPosition + 20, { align: "right" });
      
      // Save PDF
      pdf.save(`invoice_${data.order.id}.pdf`);
      
      // Clear cart and show success message
      await queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your invoice has been downloaded. Thank you for your purchase!"
      });
      
      // Redirect to orders page
      setTimeout(() => {
        setLocation("/orders");
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message || "Failed to process checkout",
        variant: "destructive"
      });
    }
  });

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, ''));
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Add some items to your cart to proceed with checkout
          </p>
          <Link href="/shop">
            <Button size="lg" data-testid="button-continue-shopping">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/shop">
            <Button variant="ghost" className="mb-6" data-testid="button-back-to-cart">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shopping
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <ShoppingBag className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                  <CardDescription>Review your items before completing the purchase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => {
                    const price = parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, ''));
                    const total = price * item.quantity;
                    
                    return (
                      <div key={item.id} data-testid={`checkout-item-${item.productId}`}>
                        <div className="flex gap-4">
                          <img
                            src={item.product.imgLink || "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                            alt={item.product.productName}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-base text-gray-900 dark:text-white line-clamp-2" data-testid={`text-product-name-${item.productId}`}>
                              {item.product.productName}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Qty:</span>
                              <span className="font-medium text-sm" data-testid={`text-quantity-${item.productId}`}>{item.quantity}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">×</span>
                              <span className="font-medium text-sm">₹{price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid={`text-item-total-${item.productId}`}>
                              ₹{total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {item !== cartItems[cartItems.length - 1] && <Separator className="mt-4" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
            
            {/* Payment Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tax</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300">Total</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-amount">₹{calculateTotal()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Demo Mode:</strong> This will simulate a successful payment and generate an invoice PDF.
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                    data-testid="button-complete-order"
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Order
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="text-xs text-gray-500">Secured by</span>
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-8 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="w-8 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Free Delivery</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Estimated delivery in 3-5 business days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}