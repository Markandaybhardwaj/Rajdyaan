import mongoose from 'mongoose';

async function updateDB() {
  try {
    await mongoose.connect('mongodb+srv://markbhar001_db_user:o9S7XJVZqHD4qPno@cluster0.0gtisgx.mongodb.net/?appName=Cluster0');
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
