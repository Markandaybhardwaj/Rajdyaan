import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CATEGORIES = [
  { name: 'Pure Honey', slug: 'pure-honey', description: 'Raw and organic honey sourced from the Himalayas.' },
  { name: 'Desi Ghee', slug: 'desi-ghee', description: 'Traditional A2 Bilona cow ghee.' },
  { name: 'Organic Jaggery', slug: 'organic-jaggery', description: 'Natural sweeteners and jaggery products.' },
  { name: 'Cold Pressed Oils', slug: 'cold-pressed-oils', description: 'Pure oils extracted without heat.' },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing (optional, but safer for first time)
    await Category.deleteMany({});
    
    const created = await Category.insertMany(DEFAULT_CATEGORIES);
    console.log(`Successfully seeded ${created.length} categories.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedCategories();
