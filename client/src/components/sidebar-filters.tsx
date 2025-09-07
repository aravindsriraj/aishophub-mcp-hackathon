import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Star, X } from "lucide-react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface SidebarFiltersProps {
  onCategoryChange: (category: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onRatingChange: (rating: string) => void;
  onClearFilters: () => void;
  selectedCategory: string;
  selectedRating: string;
  priceRange: { min: string; max: string };
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarFilters({ 
  onCategoryChange, 
  onPriceChange,
  onRatingChange,
  onClearFilters, 
  selectedCategory,
  selectedRating,
  priceRange,
  isOpen,
  onClose 
}: SidebarFiltersProps) {
  const [priceMin, setPriceMin] = useState(priceRange?.min || "");
  const [priceMax, setPriceMax] = useState(priceRange?.max || "");
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }
    for (let i = count; i < 5; i++) {
      stars.push(<Star key={i} className="h-3 w-3 text-muted-foreground" />);
    }
    return stars;
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      onCategoryChange(category);
    } else if (selectedCategory === category) {
      onCategoryChange("");
    }
  };

  const applyPriceFilter = () => {
    onPriceChange(priceMin, priceMax);
  };

  const handleRatingChange = (value: string) => {
    onRatingChange(value);
  };

  // Update local state when props change
  React.useEffect(() => {
    setPriceMin(priceRange.min);
    setPriceMax(priceRange.max);
  }, [priceRange]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Categories</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories?.map((category: string) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategory === category}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                data-testid={`checkbox-category-${category}`}
              />
              <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer truncate" title={category}>
                {category.replace(/&/g, ' & ').replace(/([A-Z])/g, ' $1').trim().replace(/\s+/g, ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Price Range</h3>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="text-sm"
              data-testid="input-price-min"
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="text-sm"
              data-testid="input-price-max"
            />
          </div>
          <Button 
            onClick={applyPriceFilter} 
            className="w-full" 
            size="sm"
            data-testid="button-apply-price"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">Rating</h3>
        <RadioGroup 
          className="space-y-2" 
          value={selectedRating} 
          onValueChange={handleRatingChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="5" id="rating-5" />
            <Label htmlFor="rating-5" className="flex items-center cursor-pointer">
              <div className="flex mr-2">
                {renderStars(5)}
              </div>
              <span className="text-sm">5 stars</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="rating-4" />
            <Label htmlFor="rating-4" className="flex items-center cursor-pointer">
              <div className="flex mr-2">
                {renderStars(4)}
              </div>
              <span className="text-sm">4+ stars</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="rating-3" />
            <Label htmlFor="rating-3" className="flex items-center cursor-pointer">
              <div className="flex mr-2">
                {renderStars(3)}
              </div>
              <span className="text-sm">3+ stars</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Clear Filters */}
      <Button 
        variant="outline" 
        onClick={onClearFilters} 
        className="w-full"
        data-testid="button-clear-filters"
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-card border-r border-border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
