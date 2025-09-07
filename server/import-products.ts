import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from './db';
import { products } from '@shared/schema';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importProducts() {
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'attached_assets', 'amazon_uk_products_1757248685591.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      skip_records_with_error: true
    });
    
    console.log(`Found ${records.length} products to import`);
    
    // Process each record
    const processedProducts = [];
    for (const record of records) {
      // Skip if essential fields are missing
      if (!record.asin || !record.title) continue;
      
      // Convert price from GBP to INR (multiply by 120)
      const gbpPrice = parseFloat(record.price) || 0;
      const inrDiscountedPrice = Math.round(gbpPrice * 120);
      
      // Calculate actual price (10-50% more than discounted price)
      // Random discount between 10-50%
      const discountPercentage = Math.floor(Math.random() * 41) + 10; // 10-50%
      const inrActualPrice = Math.round(inrDiscountedPrice * (100 / (100 - discountPercentage)));
      
      // Format prices with rupee symbol
      const discountedPriceStr = `₹${inrDiscountedPrice}`;
      const actualPriceStr = `₹${inrActualPrice}`;
      const discountPercentageStr = `${discountPercentage}%`;
      
      // Handle rating (convert 0.0 to null)
      const rating = parseFloat(record.stars) || null;
      const ratingStr = rating ? rating.toString() : null;
      
      // Handle rating count
      const ratingCount = parseInt(record.reviews) || 0;
      const ratingCountStr = ratingCount > 0 ? ratingCount.toString() : null;
      
      processedProducts.push({
        id: record.asin,
        productName: record.title,
        category: record.categoryName || 'Uncategorized',
        discountedPrice: discountedPriceStr,
        actualPrice: actualPriceStr,
        discountPercentage: discountPercentageStr,
        rating: ratingStr,
        ratingCount: ratingCountStr,
        aboutProduct: record.title, // Using title as about_product as requested
        imgLink: record.imgUrl || null,
        productLink: record.productURL || null
      });
    }
    
    console.log(`Processing ${processedProducts.length} valid products`);
    
    // Insert in batches to avoid overwhelming the database
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < processedProducts.length; i += batchSize) {
      const batch = processedProducts.slice(i, i + batchSize);
      
      try {
        // Insert batch - use onConflictDoNothing to skip duplicates
        await db
          .insert(products)
          .values(batch)
          .onConflictDoNothing();
        
        imported += batch.length;
        console.log(`Imported ${imported}/${processedProducts.length} products`);
      } catch (error) {
        console.error('Error importing batch:', error);
        // Continue with next batch even if one fails
      }
    }
    
    console.log(`✓ Successfully imported ${imported} products`);
    
  } catch (error) {
    console.error('Error importing products:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the import
importProducts();