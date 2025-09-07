import { db } from "./db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateImagePrompt(productName: string, category: string): string {
  // Clean up the product name for better prompts
  const cleanName = productName
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/[,]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .substring(0, 100); // Limit length
  
  // Extract key product type from category
  const categoryParts = category.split('|');
  const productType = categoryParts[categoryParts.length - 1] || categoryParts[0];
  
  return `Professional product photography of ${cleanName}, ${productType}, on clean white background, studio lighting, high quality, commercial product shot, crisp and clear, centered composition, e-commerce style`;
}

export async function ensureGeneratedImagesDir(): Promise<string> {
  const generatedImagesDir = path.join(__dirname, '..', 'attached_assets', 'generated_images');
  if (!fs.existsSync(generatedImagesDir)) {
    fs.mkdirSync(generatedImagesDir, { recursive: true });
  }
  return generatedImagesDir;
}

export async function checkAndGenerateImage(productId: string): Promise<string | null> {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (!product) {
      return null;
    }
    
    // Check if image is already generated
    if (product.imgLink && product.imgLink.includes('/generated_images/')) {
      return product.imgLink;
    }
    
    // Check if original image is broken
    const isBroken = !product.imgLink || 
                     product.imgLink.includes('/images/I/') ||
                     product.imgLink.endsWith('.jp');
    
    if (!isBroken) {
      return product.imgLink;
    }
    
    // Generate placeholder path for now
    const filename = `product_${productId}_placeholder.png`;
    const imagePath = `/attached_assets/generated_images/${filename}`;
    
    // Update database with placeholder path
    await db
      .update(products)
      .set({ imgLink: imagePath })
      .where(eq(products.id, productId));
    
    return imagePath;
  } catch (error) {
    console.error('Error checking/generating image:', error);
    return null;
  }
}