import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signInSchema, signUpSchema, insertCartItemSchema } from "@shared/schema";
import bcrypt from "bcrypt";

// Middleware to check authentication
async function requireAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
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

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const sortBy = req.query.sortBy as string;
      
      const result = await storage.getProducts(page, limit, search, category, sortBy);
      
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
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
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

  app.get("/api/categories", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
