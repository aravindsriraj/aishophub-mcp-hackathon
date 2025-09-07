import { 
  users, 
  products, 
  cartItems, 
  sessions,
  wishlistItems,
  orders,
  orderItems,
  type User, 
  type InsertUser, 
  type Product, 
  type CartItem, 
  type InsertCartItem,
  type Session,
  type WishlistItem,
  type InsertWishlistItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, desc, asc, count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(
    page: number, 
    limit: number, 
    search?: string, 
    category?: string, 
    sortBy?: string,
    priceMin?: string,
    priceMax?: string,
    rating?: string
  ): Promise<{ products: Product[], total: number }>;
  getProduct(id: string): Promise<Product | undefined>;
  getCategories(): Promise<string[]>;
  
  // Cart methods
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(userId: string, item: InsertCartItem): Promise<CartItem>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Session methods
  createSession(userId: string): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  
  // Wishlist methods
  getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(userId: string, item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;
  
  // Order methods
  createOrder(userId: string, orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getOrder(orderId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  updateOrderInvoiceUrl(orderId: string, invoiceUrl: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getProducts(
    page: number, 
    limit: number, 
    search?: string, 
    category?: string, 
    sortBy?: string,
    priceMin?: string,
    priceMax?: string,
    rating?: string
  ): Promise<{ products: Product[], total: number }> {
    const conditions = [];
    
    if (search) {
      const searchCondition = ilike(products.productName, `%${search}%`);
      conditions.push(searchCondition);
    }
    
    if (category) {
      // Match the category segment anywhere in the hierarchical category string
      const categoryCondition = ilike(products.category, `%${category}%`);
      conditions.push(categoryCondition);
    }
    
    // Price filter
    if (priceMin || priceMax) {
      if (priceMin) {
        conditions.push(sql`CAST(REPLACE(REPLACE(${products.discountedPrice}, '₹', ''), ',', '') AS NUMERIC) >= ${parseInt(priceMin)}`);
      }
      if (priceMax) {
        conditions.push(sql`CAST(REPLACE(REPLACE(${products.discountedPrice}, '₹', ''), ',', '') AS NUMERIC) <= ${parseInt(priceMax)}`);
      }
    }
    
    // Rating filter
    if (rating) {
      const minRating = parseFloat(rating);
      conditions.push(sql`${products.rating} >= ${minRating}`);
    }
    
    const whereCondition = conditions.length > 0 
      ? (conditions.length === 1 ? conditions[0] : and(...conditions))
      : undefined;
    
    // Build queries directly
    let productsQuery = db.select().from(products);
    let countQuery = db.select({ count: count() }).from(products);
    
    if (whereCondition) {
      productsQuery = productsQuery.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    // Apply sorting
    if (sortBy === 'price-low') {
      productsQuery = productsQuery.orderBy(asc(sql`CAST(REPLACE(REPLACE(${products.discountedPrice}, '₹', ''), ',', '') AS NUMERIC)`));
    } else if (sortBy === 'price-high') {
      productsQuery = productsQuery.orderBy(desc(sql`CAST(REPLACE(REPLACE(${products.discountedPrice}, '₹', ''), ',', '') AS NUMERIC)`));
    } else if (sortBy === 'rating' || sortBy === 'rating-high') {
      productsQuery = productsQuery.orderBy(desc(products.rating));
    } else if (sortBy === 'rating-low') {
      productsQuery = productsQuery.orderBy(asc(products.rating));
    } else {
      productsQuery = productsQuery.orderBy(desc(products.id));
    }
    
    const [productsResult, totalResult] = await Promise.all([
      productsQuery.limit(limit).offset((page - 1) * limit),
      countQuery
    ]);
    
    return {
      products: productsResult,
      total: totalResult[0].count as number
    };
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getCategories(): Promise<string[]> {
    const result = await db
      .selectDistinct({ category: products.category })
      .from(products);
    
    // Extract all unique category segments from hierarchical categories
    const uniqueCategories = new Set<string>();
    
    result.forEach(row => {
      if (row.category) {
        // Split by '|' to get individual category segments
        const segments = row.category.split('|');
        segments.forEach(segment => {
          const trimmed = segment.trim();
          if (trimmed) {
            uniqueCategories.add(trimmed);
          }
        });
      }
    });
    
    // Convert to array and sort
    return Array.from(uniqueCategories).sort();
  }

  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));
    
    return result.map(row => ({
      ...row.cart_items,
      product: row.products
    }));
  }

  async addToCart(userId: string, item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, item.productId)));
    
    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + item.quantity })
        .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, item.productId)))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cartItems)
        .values({ ...item, userId })
        .returning();
      return newItem;
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeFromCart(userId, productId);
      return undefined;
    }
    
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .returning();
    
    return updatedItem || undefined;
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async createSession(userId: string): Promise<Session> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const [session] = await db
      .insert(sessions)
      .values({ userId, token, expiresAt })
      .returning();
    
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), sql`${sessions.expiresAt} > NOW()`));
    
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]> {
    const result = await db
      .select()
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt));
    
    return result.map(row => ({
      ...row.wishlist_items,
      product: row.products
    }));
  }

  async addToWishlist(userId: string, item: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists in wishlist
    const [existingItem] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, item.productId)));
    
    if (existingItem) {
      return existingItem;
    }
    
    const [newItem] = await db
      .insert(wishlistItems)
      .values({ ...item, userId })
      .returning();
    
    return newItem;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const [item] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
    
    return !!item;
  }

  async createOrder(userId: string, orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Create the order
    const [order] = await db
      .insert(orders)
      .values({ ...orderData, userId })
      .returning();
    
    // Create order items
    if (items.length > 0) {
      await db
        .insert(orderItems)
        .values(items.map(item => ({ ...item, orderId: order.id })));
    }
    
    return order;
  }

  async getOrders(userId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    // Get all orders for the user
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));
        
        return {
          ...order,
          items: items.map(item => ({
            ...item.order_items,
            product: item.products
          }))
        };
      })
    );
    
    return ordersWithItems;
  }

  async getOrder(orderId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    if (!order) return undefined;
    
    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    
    return {
      ...order,
      items: items.map(item => ({
        ...item.order_items,
        product: item.products
      }))
    };
  }

  async updateOrderInvoiceUrl(orderId: string, invoiceUrl: string): Promise<void> {
    await db
      .update(orders)
      .set({ invoiceUrl })
      .where(eq(orders.id, orderId));
  }
}

export const storage = new DatabaseStorage();
