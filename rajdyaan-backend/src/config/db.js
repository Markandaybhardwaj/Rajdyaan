import mongoose from 'mongoose';

const connectDB = async (retries = 3, delay = 2000) => {
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection failed. Retries left: ${retries - 1}`);
      retries -= 1;
      if (retries === 0) {
        throw new Error('Failed to connect to MongoDB after multiple retries.');
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

export default connectDB;
