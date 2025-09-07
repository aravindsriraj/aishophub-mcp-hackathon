import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Package className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart to proceed with checkout</p>
          <Link href="/">
            <Button data-testid="button-continue-shopping">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/cart">
          <Button variant="ghost" className="mb-6" data-testid="button-back-to-cart">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            {cartItems.map((item) => {
              const price = parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, ''));
              const total = price * item.quantity;
              
              return (
                <div key={item.id} className="flex justify-between items-start py-4 border-b" data-testid={`checkout-item-${item.productId}`}>
                  <div className="flex-1">
                    <h3 className="font-medium" data-testid={`text-product-name-${item.productId}`}>{item.product.productName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: <span data-testid={`text-quantity-${item.productId}`}>{item.quantity}</span> × ₹{price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" data-testid={`text-item-total-${item.productId}`}>₹{total.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total Amount:</span>
              <span data-testid="text-total-amount">₹{calculateTotal()}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This is a demo checkout. Clicking "Complete Order" will simulate a successful payment, 
                generate an invoice PDF, and clear your cart.
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
                  Processing...
                </>
              ) : (
                "Complete Order & Generate Invoice"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}