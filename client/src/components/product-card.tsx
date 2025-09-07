import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Plus, ShoppingCart } from "lucide-react";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const { addToCart, isLoading } = useCart();
  const { toast } = useToast();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground" />);
    }

    return stars;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

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

  const getImageSrc = () => {
    if (imageError || !product.imgLink) {
      return "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
    }
    // Handle both external URLs and local generated images
    if (product.imgLink.startsWith('http://') || product.imgLink.startsWith('https://')) {
      return product.imgLink;
    }
    // For local generated images
    return product.imgLink;
  };

  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300" data-testid={`card-product-${product.id}`}>
        <Link href={`/product/${product.id}`}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <img
                  src={getImageSrc()}
                  alt={product.productName}
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImageError(true)}
                  data-testid={`img-product-${product.id}`}
                />
                {product.discountPercentage && (
                  <Badge variant="destructive" className="absolute top-1 left-1 text-xs">
                    {product.discountPercentage} OFF
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {product.rating && (
                      <>
                        <div className="flex" data-testid={`rating-${product.id}`}>
                          {renderStars(parseFloat(product.rating.toString()))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.ratingCount})
                        </span>
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-wishlist-${product.id}`}>
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-name-${product.id}`}>
                  {product.productName}
                </h3>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1" data-testid={`text-category-${product.id}`}>
                  {product.category}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
                      {product.discountedPrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {product.actualPrice}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    disabled={isLoading}
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden" data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={getImageSrc()}
            alt={product.productName}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            data-testid={`img-product-${product.id}`}
          />
          {product.discountPercentage && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              {product.discountPercentage} OFF
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              {product.rating && (
                <>
                  <div className="flex" data-testid={`rating-${product.id}`}>
                    {renderStars(parseFloat(product.rating.toString()))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.ratingCount})
                  </span>
                </>
              )}
            </div>
          </div>
          
          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-name-${product.id}`}>
            {product.productName}
          </h3>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2" data-testid={`text-category-${product.id}`}>
            {product.category}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
                {product.discountedPrice}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {product.actualPrice}
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading}
              data-testid={`button-add-cart-${product.id}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
