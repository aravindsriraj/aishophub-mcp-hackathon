import { 
  users, 
  products, 
  cartItems, 
  sessions,
  type User, 
  type InsertUser, 
  type Product, 
  type CartItem, 
  type InsertCartItem,
  type Session 
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
  getProducts(page: number, limit: number, search?: string, category?: string, sortBy?: string): Promise<{ products: Product[], total: number }>;
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

  async getProducts(page: number, limit: number, search?: string, category?: string, sortBy?: string): Promise<{ products: Product[], total: number }> {
    let query = db.select().from(products);
    let countQuery = db.select({ count: count() }).from(products);
    
    const conditions = [];
    
    if (search) {
      const searchCondition = ilike(products.productName, `%${search}%`);
      conditions.push(searchCondition);
    }
    
    if (category) {
      const categoryCondition = ilike(products.category, `%${category}%`);
      conditions.push(categoryCondition);
    }
    
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    // Apply sorting
    if (sortBy === 'price-low') {
      query = query.orderBy(asc(sql`CAST(REPLACE(REPLACE(${products.discountedPrice}, '₹', ''), ',', '') AS INTEGER)`));
    } else if (sortBy === 'price-high') {
      query = query.orderBy(desc(sql`CAST(REPLACE(REPLACE(${products.discountedPrice}, '₹', ''), ',', '') AS INTEGER)`));
    } else if (sortBy === 'rating') {
      query = query.orderBy(desc(products.rating));
    } else {
      query = query.orderBy(desc(products.id));
    }
    
    const [productsResult, totalResult] = await Promise.all([
      query.limit(limit).offset((page - 1) * limit),
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
      .from(products)
      .orderBy(asc(products.category));
    
    return result.map(row => row.category);
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
}

export const storage = new DatabaseStorage();
