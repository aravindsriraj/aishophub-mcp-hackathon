import { useState } from "react";
import { Header } from "@/components/header";
import { SidebarFilters } from "@/components/sidebar-filters";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";
import { CartSidebar } from "@/components/cart-sidebar";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Grid, List } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [rating, setRating] = useState("");

  const { data: productsData, isLoading } = useProducts(page, 20, search, category, sortBy, priceRange.min, priceRange.max, rating);
  const { user } = useAuth();

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handlePriceFilter = (min: string, max: string) => {
    setPriceRange({ min, max });
    setPage(1);
  };

  const handleRatingFilter = (value: string) => {
    setRating(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSortBy("relevance");
    setPriceRange({ min: "", max: "" });
    setRating("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground page-transition">
      <Header 
        onSearch={handleSearch}
        onCartToggle={() => setShowCart(true)}
        onAuthToggle={() => setShowAuth(true)}
        searchValue={search}
      />
      
      {/* Hero Section */}
      {!search && !category && page === 1 && (
        <section className="relative overflow-hidden px-4 py-12 mb-8">
          <div className="animated-gradient absolute inset-0 opacity-10"></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn" 
                style={{animation: "fadeIn 0.8s ease-out"}}>
              Discover Amazing Products
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" 
               style={{animation: "fadeIn 0.8s ease-out 0.2s both"}}>
              Shop the latest trends with AI-powered search and personalized recommendations
            </p>
            <div className="flex gap-4 justify-center" 
                 style={{animation: "fadeIn 0.8s ease-out 0.4s both"}}>
              <Button 
                className="btn-gradient text-white px-8 py-6 text-lg"
                onClick={() => document.getElementById('search-input')?.focus()}
              >
                Start Shopping
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-6 text-lg glass-dark hover:scale-105 transition-transform"
                onClick={() => setShowMobileFilters(true)}
              >
                Browse Categories
              </Button>
            </div>
          </div>
        </section>
      )}
      
      <div className="flex min-h-screen">
        <SidebarFilters
          onCategoryChange={handleCategoryFilter}
          onPriceChange={handlePriceFilter}
          onRatingChange={handleRatingFilter}
          onClearFilters={clearFilters}
          selectedCategory={category}
          selectedRating={rating}
          priceRange={priceRange}
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
        />
        
        <main className="flex-1 p-4 lg:p-6 page-transition">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="page-transition">
              <h1 className="text-3xl font-bold mb-2" data-testid="page-title">
                {search ? `Search Results for "${search}"` : 
                 category ? category : 
                 'All Products'}
              </h1>
              <p className="text-muted-foreground" data-testid="products-count">
                {productsData ? 
                  `Showing ${((page - 1) * 20) + 1}-${Math.min(page * 20, productsData.pagination.total)} of ${productsData.pagination.total} products` :
                  'Loading...'
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowMobileFilters(true)}
                data-testid="button-mobile-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating-high">Rating: High to Low</SelectItem>
                  <SelectItem value="rating-low">Rating: Low to High</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Toggle */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="space-y-4 glass-dark rounded-lg p-4 skeleton">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ))}
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state">
              <p className="text-muted-foreground text-lg">No products found</p>
              <Button onClick={clearFilters} className="mt-4" data-testid="button-clear-filters">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 mb-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {productsData?.products.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`
                  }}
                >
                  <ProductCard
                    product={product}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={productsData.pagination.totalPages}
              total={productsData.pagination.total}
              limit={20}
              onPageChange={setPage}
            />
          )}
        </main>
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
