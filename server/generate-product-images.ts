import { db } from "./db";
import { products } from "@shared/schema";
import { eq, or, sql, isNull } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check if image URL is broken
function isImageBroken(imgLink: string | null): boolean {
  if (!imgLink) return true;
  
  // Check for known broken patterns
  if (imgLink.includes('/images/I/') && !imgLink.startsWith('https://m.media-amazon.com')) {
    return true;
  }
  
  // Check for incomplete URLs
  if (imgLink.includes('WEBP_402378') && imgLink.endsWith('.jp')) {
    return true;
  }
  
  return false;
}

// Function to generate prompt from product name
function generateImagePrompt(productName: string, category: string): string {
  // Clean up the product name for better prompts
  const cleanName = productName
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/[,]/g, '')
    .trim();
  
  // Extract key product type from category
  const categoryParts = category.split('|');
  const productType = categoryParts[categoryParts.length - 1] || categoryParts[0];
  
  return `Professional product photography of ${cleanName}, ${productType}, on clean white background, studio lighting, high quality, commercial product shot, crisp and clear, centered composition`;
}

async function generateProductImages() {
  try {
    console.log('Finding products with broken or missing images...');
    
    // Get products with potentially broken images
    const brokenProducts = await db
      .select()
      .from(products)
      .where(
        or(
          isNull(products.imgLink),
          eq(products.imgLink, ''),
          sql`${products.imgLink} LIKE '%/images/I/%'`,
          sql`${products.imgLink} LIKE '%.jp'`
        )
      )
      .limit(10); // Process in batches
    
    console.log(`Found ${brokenProducts.length} products with broken images`);
    
    if (brokenProducts.length === 0) {
      console.log('No products with broken images found');
      return;
    }
    
    // Create directory for generated images
    const generatedImagesDir = path.join(__dirname, '..', 'attached_assets', 'generated_images');
    if (!fs.existsSync(generatedImagesDir)) {
      fs.mkdirSync(generatedImagesDir, { recursive: true });
    }
    
    // Process each product
    for (const product of brokenProducts) {
      console.log(`Processing: ${product.productName.substring(0, 50)}...`);
      
      const prompt = generateImagePrompt(product.productName, product.category);
      const filename = `product_${product.id}_generated.png`;
      const imagePath = path.join('attached_assets', 'generated_images', filename);
      
      // Update the product with the new image path
      await db
        .update(products)
        .set({ 
          imgLink: `/${imagePath}` 
        })
        .where(eq(products.id, product.id));
      
      console.log(`Updated product ${product.id} with generated image path`);
    }
    
    console.log('Product image generation complete!');
    console.log('Note: AI image generation will be triggered when products are displayed');
    
  } catch (error) {
    console.error('Error generating product images:', error);
  }
}

// Run the script
generateProductImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });