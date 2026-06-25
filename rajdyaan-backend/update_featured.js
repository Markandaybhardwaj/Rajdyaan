import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });

const uri = process.env.MONGO_URI;

async function updateDB() {
  if (!uri) {
    console.error('MONGO_URI is missing');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Set isFeatured: true for all products temporarily just to guarantee it shows up
    const result = await mongoose.connection.collection('products').updateMany({}, { $set: { isFeatured: true } });
    console.log(`Updated ${result.modifiedCount} products to be featured.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDB();
