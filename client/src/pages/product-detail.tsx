import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, ShoppingCart, Star } from "lucide-react";
import { Header } from "@/components/header";
import { CartSidebar } from "@/components/cart-sidebar";
import { AuthModal } from "@/components/auth-modal";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { id } = useParams();
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', id],
  });

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!product) return;

    try {
      await addToCart({ productId: product.id, quantity: 1 });
      toast({
        title: "Added to cart",
        description: `${product.productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onSearch={() => {}}
          onCartToggle={() => setShowCart(true)}
          onAuthToggle={() => setShowAuth(true)}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4" data-testid="error-title">
              Product Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The product you're looking for doesn't exist.
            </p>
            <Link href="/shop">
              <Button data-testid="link-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={() => {}}
        onCartToggle={() => setShowCart(true)}
        onAuthToggle={() => setShowAuth(true)}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/shop">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <img
                    src={(imageError || !product.imgLink) ? "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400" : product.imgLink}
                    alt={product.productName}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={() => setImageError(true)}
                    data-testid="img-product"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex" data-testid="product-rating">
                  {product.rating && renderStars(parseFloat(product.rating.toString()))}
                </div>
                <span className="text-muted-foreground" data-testid="text-rating-count">
                  ({product.ratingCount} reviews)
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold" data-testid="text-product-name">
                {product.productName}
              </h1>

              {/* Category */}
              <Badge variant="secondary" data-testid="badge-category">
                {product.category}
              </Badge>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-primary" data-testid="text-discounted-price">
                  {product.discountedPrice}
                </span>
                <span className="text-xl text-muted-foreground line-through" data-testid="text-actual-price">
                  {product.actualPrice}
                </span>
                {product.discountPercentage && (
                  <Badge variant="destructive" data-testid="badge-discount">
                    {product.discountPercentage} OFF
                  </Badge>
                )}
              </div>

              {/* Description */}
              {product.aboutProduct && (
                <div>
                  <h3 className="font-semibold mb-2">About this product</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-description">
                    {product.aboutProduct}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </Button>
                <Button variant="outline" size="lg" data-testid="button-wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Product Link */}
              {product.productLink && (
                <a
                  href={product.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                  data-testid="link-product-external"
                >
                  View on Amazon →
                </a>
              )}
            </div>
          </div>
        ) : null}
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
