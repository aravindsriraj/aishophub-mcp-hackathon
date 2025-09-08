import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signInSchema, signUpSchema, insertCartItemSchema, insertWishlistItemSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import swaggerUi from "swagger-ui-express";
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

// Middleware to check authentication (supports both session tokens and API tokens)
async function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  // Check if it's an API token (starts with 'ak_')
  if (token.startsWith('ak_')) {
    const apiToken = await storage.getApiTokenByHash(token);
    if (!apiToken) {
      return res.status(401).json({ error: 'Invalid or expired API token' });
    }
    
    const user = await storage.getUser(apiToken.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Update last used timestamp
    await storage.updateApiTokenLastUsed(apiToken.id);
    
    req.user = user;
    req.apiToken = apiToken;
    next();
  } else {
    // Check session token
    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.session = session;
    next();
  }
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Swagger API Documentation - Load from openapi.yaml
  const openapiPath = path.join(process.cwd(), 'openapi.yaml');
  const openapiDocument = yaml.load(fs.readFileSync(openapiPath, 'utf8')) as any;
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AI ShopHub API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true
    }
  }));

  // Redirect root to login if not authenticated, otherwise to shop
  app.get('/', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.redirect('/login');
    }
    
    try {
      const session = await storage.getSession(token);
      if (!session) {
        return res.redirect('/login');
      }
      
      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.redirect('/login');
      }
      
      res.redirect('/shop');
    } catch (error) {
      res.redirect('/login');
    }
  });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const user = await storage.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      
      const session = await storage.createSession(user.id);
      
      res.json({ 
        user: { id: user.id, email: user.email, name: user.name },
        token: session.token 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create user' });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const data = signInSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const session = await storage.createSession(user.id);
      
      res.json({ 
        user: { id: user.id, email: user.email, name: user.name },
        token: session.token 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to sign in' });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteSession(req.session.token);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    res.json({ 
      user: { 
        id: req.user.id, 
        email: req.user.email, 
        name: req.user.name 
      } 
    });
  });

  // API Token management routes
  app.post("/api/tokens", requireAuth, async (req: any, res) => {
    try {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Token name is required' });
      }
      
      const result = await storage.createApiToken(req.user.id, name);
      
      res.json({
        token: result.token,
        apiToken: {
          id: result.apiToken.id,
          name: result.apiToken.name,
          createdAt: result.apiToken.createdAt,
          expiresAt: result.apiToken.expiresAt,
          lastUsedAt: result.apiToken.lastUsedAt
        },
        message: 'Save this token securely. You won\'t be able to see it again!'
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create API token' });
    }
  });

  app.get("/api/tokens", requireAuth, async (req: any, res) => {
    try {
      const tokens = await storage.getUserApiTokens(req.user.id);
      
      // Don't send the token hash, only metadata
      const sanitizedTokens = tokens.map(token => ({
        id: token.id,
        name: token.name,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        lastUsedAt: token.lastUsedAt
      }));
      
      res.json(sanitizedTokens);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch API tokens' });
    }
  });

  app.delete("/api/tokens/:tokenId", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteApiToken(req.params.tokenId, req.user.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete API token' });
    }
  });

  // Product routes
  app.get("/api/products", requireAuth, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const sortBy = req.query.sortBy as string;
      const priceMin = req.query.priceMin as string;
      const priceMax = req.query.priceMax as string;
      const rating = req.query.rating as string;
      
      const result = await storage.getProducts(page, limit, search, category, sortBy, priceMin, priceMax, rating);
      
      res.json({
        products: result.products,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch products' });
    }
  });

  // Semantic search proxy endpoint
  app.post("/api/semantic-search", requireAuth, async (req: any, res) => {
    try {
      const { query, n_results = 20 } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      // Call the semantic search API from backend to avoid CORS
      const response = await fetch('https://product-search.replit.app/search', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer *ULXrUUDkkjRheg3cjpQAcBbzGgffZBn!32ssr8JRW9VERcVmweQqGnYi!Y8jcPnG',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          n_results,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Semantic search API error:', errorText);
        return res.status(response.status).json({ error: 'Semantic search failed' });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('Error in semantic search:', error);
      res.status(500).json({ error: 'Failed to perform semantic search' });
    }
  });

  app.get("/api/products/by-ids", requireAuth, async (req: any, res) => {
    try {
      const { ids, category, sortBy, priceMin, priceMax, rating } = req.query;
      
      if (!ids || typeof ids !== 'string') {
        return res.status(400).json({ error: 'Product IDs are required' });
      }
      
      const productIds = ids.split(',').filter(id => id.trim());
      
      if (productIds.length === 0) {
        return res.json({ products: [] });
      }
      
      // Fetch products by IDs
      const products = await storage.getProductsByIds(productIds);
      
      // Apply filters
      let filteredProducts = products;
      
      if (category && typeof category === 'string') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      if ((priceMin || priceMax) && (typeof priceMin === 'string' || typeof priceMax === 'string')) {
        const min = priceMin ? parseInt(priceMin) : 0;
        const max = priceMax ? parseInt(priceMax) : Number.MAX_SAFE_INTEGER;
        filteredProducts = filteredProducts.filter(p => {
          const price = parseInt(p.discountedPrice?.replace(/[^0-9]/g, '') || '0');
          return price >= min && price <= max;
        });
      }
      
      if (rating && typeof rating === 'string') {
        const minRating = parseFloat(rating);
        filteredProducts = filteredProducts.filter(p => {
          const productRating = parseFloat(p.rating || '0');
          return productRating >= minRating;
        });
      }
      
      // Apply sorting
      if (sortBy && typeof sortBy === 'string') {
        filteredProducts.sort((a, b) => {
          switch (sortBy) {
            case 'price_asc':
              return parseInt(a.discountedPrice?.replace(/[^0-9]/g, '') || '0') - 
                     parseInt(b.discountedPrice?.replace(/[^0-9]/g, '') || '0');
            case 'price_desc':
              return parseInt(b.discountedPrice?.replace(/[^0-9]/g, '') || '0') - 
                     parseInt(a.discountedPrice?.replace(/[^0-9]/g, '') || '0');
            case 'rating':
              return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
            default:
              // Maintain original order from IDs
              return 0;
          }
        });
      } else {
        // Maintain the order of the input IDs
        const idOrder = new Map(productIds.map((id, index) => [id, index]));
        filteredProducts.sort((a, b) => {
          const aOrder = idOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const bOrder = idOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          return aOrder - bOrder;
        });
      }
      
      res.json({ products: filteredProducts });
    } catch (error: any) {
      console.error('Error fetching products by IDs:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get("/api/products/:id", requireAuth, async (req: any, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.get("/api/categories", requireAuth, async (req: any, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req: any, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  });

  app.post("/api/cart", requireAuth, async (req: any, res) => {
    try {
      const data = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(req.user.id, data);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to add to cart' });
    }
  });

  app.put("/api/cart/:productId", requireAuth, async (req: any, res) => {
    try {
      const quantity = parseInt(req.body.quantity);
      if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }
      
      const cartItem = await storage.updateCartItem(req.user.id, req.params.productId, quantity);
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ error: 'Failed to update cart item' });
    }
  });

  app.delete("/api/cart/:productId", requireAuth, async (req: any, res) => {
    try {
      await storage.removeFromCart(req.user.id, req.params.productId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to remove from cart' });
    }
  });

  app.delete("/api/cart", requireAuth, async (req: any, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", requireAuth, async (req: any, res) => {
    try {
      const wishlistItems = await storage.getWishlistItems(req.user.id);
      res.json(wishlistItems);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req: any, res) => {
    try {
      const data = insertWishlistItemSchema.parse(req.body);
      const wishlistItem = await storage.addToWishlist(req.user.id, data);
      res.json(wishlistItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to add to wishlist' });
    }
  });

  app.delete("/api/wishlist/:productId", requireAuth, async (req: any, res) => {
    try {
      await storage.removeFromWishlist(req.user.id, req.params.productId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
  });

  app.get("/api/wishlist/check/:productId", requireAuth, async (req: any, res) => {
    try {
      const isInWishlist = await storage.isInWishlist(req.user.id, req.params.productId);
      res.json({ isInWishlist });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to check wishlist status' });
    }
  });

  // Order routes
  app.post("/api/checkout", requireAuth, async (req: any, res) => {
    try {
      // Get user's cart items
      const cartItems = await storage.getCartItems(req.user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      
      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => {
        const price = parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, ''));
        return total + (price * item.quantity);
      }, 0).toFixed(2);
      
      // Create order items
      const orderItemsData = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.productName,
        price: item.product.discountedPrice,
        quantity: item.quantity,
        totalPrice: (parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, '')) * item.quantity).toFixed(2)
      }));
      
      // Create order
      const order = await storage.createOrder(
        req.user.id,
        { totalAmount, status: 'completed' },
        orderItemsData
      );
      
      // Clear cart after successful order
      await storage.clearCart(req.user.id);
      
      // Return order with items
      const orderWithItems = {
        ...order,
        items: orderItemsData
      };
      
      res.json({ 
        order: orderWithItems,
        message: 'Order placed successfully'
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Failed to process checkout' });
    }
  });

  app.get("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.get("/api/orders/:orderId", requireAuth, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Check if order belongs to user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  app.post("/api/orders/:orderId/invoice", requireAuth, async (req: any, res) => {
    try {
      const { invoiceUrl } = req.body;
      
      if (!invoiceUrl) {
        return res.status(400).json({ error: 'Invoice URL is required' });
      }
      
      // Update order with invoice URL
      await storage.updateOrderInvoiceUrl(req.params.orderId, invoiceUrl);
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update invoice URL' });
    }
  });

  // ===== NEW API ENDPOINTS WITH BASIC AUTH =====
  
  // List all available categories
  app.get("/filters/listCategories", requireAuth, async (req: any, res) => {
    try {
      const categories = await storage.getCategories();
      res.json({
        success: true,
        categories: categories
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch categories' 
      });
    }
  });

  // List all products in wishlist
  app.get("/wishlist/listProducts", requireAuth, async (req: any, res) => {
    try {
      const wishlistItems = await storage.getWishlistItems(req.user.id);
      res.json({
        success: true,
        products: wishlistItems.map(item => ({
          id: item.productId,
          name: item.product.productName,
          price: item.product.discountedPrice,
          originalPrice: item.product.actualPrice,
          category: item.product.category,
          addedAt: item.createdAt
        }))
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch wishlist products' 
      });
    }
  });

  // Add product to cart
  app.post("/cart/add/:productId", requireAuth, async (req: any, res) => {
    try {
      const productId = req.params.productId;
      const quantity = req.body.quantity || 1;
      
      // Check if product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          error: 'Product not found' 
        });
      }
      
      // Add to cart
      const cartItem = await storage.addToCart(req.user.id, {
        productId: productId,
        quantity: quantity
      });
      
      res.json({
        success: true,
        message: 'Product added to cart',
        cartItem: {
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          product: product
        }
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message || 'Failed to add product to cart' 
      });
    }
  });

  // Remove product from cart
  app.delete("/cart/remove/:productId", requireAuth, async (req: any, res) => {
    try {
      const productId = req.params.productId;
      
      await storage.removeFromCart(req.user.id, productId);
      
      res.json({
        success: true,
        message: 'Product removed from cart'
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to remove product from cart' 
      });
    }
  });

  // List all orders for the user
  app.get("/orders/myorders", requireAuth, async (req: any, res) => {
    try {
      const orders = await storage.getOrders(req.user.id);
      
      res.json({
        success: true,
        orders: orders.map(order => ({
          orderId: order.id,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          }))
        }))
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch orders' 
      });
    }
  });

  // Complete order (checkout)
  app.post("/orders/completeOrder", requireAuth, async (req: any, res) => {
    try {
      // Get user's cart items
      const cartItems = await storage.getCartItems(req.user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Cart is empty' 
        });
      }
      
      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => {
        const price = parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, ''));
        return total + (price * item.quantity);
      }, 0).toFixed(2);
      
      // Create order items
      const orderItemsData = cartItems.map(item => ({
        productId: item.productId,
        productName: item.product.productName,
        price: item.product.discountedPrice,
        quantity: item.quantity,
        totalPrice: (parseFloat(item.product.discountedPrice.replace(/[^\d.]/g, '')) * item.quantity).toFixed(2)
      }));
      
      // Create order
      const order = await storage.createOrder(
        req.user.id,
        { totalAmount, status: 'completed' },
        orderItemsData
      );
      
      // Clear cart after successful order
      await storage.clearCart(req.user.id);
      
      res.json({ 
        success: true,
        message: 'Order completed successfully',
        order: {
          orderId: order.id,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: orderItemsData
        }
      });
    } catch (error: any) {
      console.error('Complete order error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to complete order' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
