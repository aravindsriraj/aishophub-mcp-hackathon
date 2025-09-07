import { useQuery } from "@tanstack/react-query";
import { Package, Download, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import jsPDF from "jspdf";
import type { Order, OrderItem, Product } from "@shared/schema";

export default function Orders() {
  const { data: orders = [], isLoading } = useQuery<(Order & { items: (OrderItem & { product: Product })[] })[]>({
    queryKey: ["/api/orders"]
  });

  const downloadInvoice = (order: Order & { items: (OrderItem & { product: Product })[] }) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text("Invoice", 105, 20, { align: "center" });
    
    pdf.setFontSize(12);
    pdf.text(`Order ID: ${order.id}`, 20, 40);
    pdf.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`, 20, 50);
    pdf.text(`Status: ${order.status}`, 20, 60);
    
    // Items table header
    pdf.setFontSize(10);
    pdf.text("Product", 20, 80);
    pdf.text("Quantity", 120, 80);
    pdf.text("Price", 150, 80);
    pdf.text("Total", 180, 80);
    
    // Items
    let yPosition = 90;
    order.items.forEach((item) => {
      const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
      const total = parseFloat(item.totalPrice.replace(/[^\d.]/g, ''));
      
      // Truncate long product names
      const productName = item.productName.length > 50 
        ? item.productName.substring(0, 50) + "..." 
        : item.productName;
      
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
    pdf.text(`Total Amount: ₹${order.totalAmount}`, 180, yPosition + 20, { align: "right" });
    
    // Save PDF
    pdf.save(`invoice_${order.id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">No Orders Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link href="/">
            <Button size="lg" data-testid="button-start-shopping">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Start Shopping
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
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">My Orders</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" data-testid={`order-${order.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300" data-testid={`text-order-date-${order.id}`}>
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      {order.status}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2" data-testid={`text-order-total-${order.id}`}>₹{order.totalAmount}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600"
                      onClick={() => downloadInvoice(order)}
                      data-testid={`button-download-invoice-${order.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start py-2" data-testid={`order-item-${item.id}`}>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2" data-testid={`text-item-name-${item.id}`}>{item.productName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Qty: {item.quantity} × ₹{parseFloat(item.price.replace(/[^\d.]/g, '')).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100" data-testid={`text-item-total-${item.id}`}>
                        ₹{parseFloat(item.totalPrice.replace(/[^\d.]/g, '')).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}