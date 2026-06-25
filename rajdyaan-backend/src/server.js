import 'dotenv/config';

import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Attempt DB connection, but swallow the error for local dummy testing
    await connectDB().catch(err => {
      console.warn('MongoDB Init Warning (Expected if dummy URI):', err.message);
    });
    
    // Attempt Redis connection, but swallow the error for local dummy testing
    await connectRedis().catch(err => {
      console.warn('Redis Init Warning (Expected if dummy URL):', err.message);
    });
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
