import mongoose from 'mongoose';

const uri = "mongodb+srv://markbhar001_db_user:o9S7XJVZqHD4qPno@cluster0.0gtisgx.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err.message);
    process.exit(1);
  });
