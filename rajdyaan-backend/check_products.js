import mongoose from 'mongoose';
import Product from './src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({}, 'name price stock slug');
    console.log('--- PRODUCTS IN DATABASE ---');
    if (products.length === 0) {
      console.log('No products found in the database.');
    } else {
      console.log(JSON.stringify(products, null, 2));
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkProducts();
