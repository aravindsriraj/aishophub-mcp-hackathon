import { db } from "./db";
import { products } from "@shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CSVRow {
  product_id: string;
  product_name: string;
  category: string;
  discounted_price: string;
  actual_price: string;
  discount_percentage: string;
  rating: string;
  rating_count: string;
  about_product: string;
  user_id: string;
  user_name: string;
  review_id: string;
  review_title: string;
  review_content: string;
  img_link: string;
  product_link: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Double quote inside quoted field
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n');
  const headers = parseCSVLine(lines[0]);
  
  const rows: CSVRow[] = [];
  const processedProducts = new Set<string>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    
    if (values.length >= 16) {
      const productId = values[0];
      
      // Only process each product once (CSV has duplicate products with different reviews)
      if (!processedProducts.has(productId)) {
        processedProducts.add(productId);
        
        const row: CSVRow = {
          product_id: productId,
          product_name: values[1] || '',
          category: values[2] || '',
          discounted_price: values[3] || '',
          actual_price: values[4] || '',
          discount_percentage: values[5] || '',
          rating: values[6] || '',
          rating_count: values[7] || '',
          about_product: values[8] || '',
          user_id: values[9] || '',
          user_name: values[10] || '',
          review_id: values[11] || '',
          review_title: values[12] || '',
          review_content: values[13] || '',
          img_link: values[14] || '',
          product_link: values[15] || ''
        };
        
        rows.push(row);
      }
    }
  }
  
  return rows;
}

async function importCSV() {
  try {
    console.log('Starting CSV import...');
    
    const csvPath = path.join(__dirname, '..', 'attached_assets', 'amazon_1757236301638.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('Parsing CSV...');
    const rows = parseCSV(csvContent);
    console.log(`Parsed ${rows.length} unique products`);
    
    console.log('Inserting products into database...');
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      const productData = batch.map(row => ({
        id: row.product_id,
        productName: row.product_name,
        category: row.category,
        discountedPrice: row.discounted_price,
        actualPrice: row.actual_price,
        discountPercentage: row.discount_percentage,
        rating: row.rating ? parseFloat(row.rating) : null,
        ratingCount: row.rating_count,
        aboutProduct: row.about_product,
        imgLink: row.img_link,
        productLink: row.product_link,
      }));
      
      await db.insert(products).values(productData).onConflictDoNothing();
      inserted += batch.length;
      
      console.log(`Inserted ${inserted}/${rows.length} products...`);
    }
    
    console.log('CSV import completed successfully!');
  } catch (error) {
    console.error('Error importing CSV:', error);
    process.exit(1);
  }
}

// Run import if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importCSV();
}

export { importCSV };
