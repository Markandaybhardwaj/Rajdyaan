import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import errorHandler from './middleware/errorHandler.js';

// Import all module routes
import authRoutes from './modules/auth/routes.js';
import productRoutes from './modules/product/routes.js';
import orderRoutes from './modules/order/routes.js';
import paymentRoutes from './modules/payment/routes.js';
import shippingRoutes from './modules/shipping/routes.js';
import b2bRoutes from './modules/b2b/routes.js';
import adminRoutes from './modules/admin/routes.js';
import wishlistRoutes from './modules/wishlist/routes.js';
import profileRoutes from './modules/user-profile/routes.js';
import bannerRoutes from './modules/banner/routes.js';



const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: true
}));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({
  limit: '10kb',
  // Preserve raw body for webhook HMAC verification.
  // Without this, the webhook signature check would fail because
  // JSON.stringify(parsed) can differ from the original raw bytes.
  verify: (req, _res, buf) => {
    if (
      req.originalUrl === '/api/v1/payment/webhook' ||
      req.originalUrl === '/api/v1/shipping/webhook'
    ) {
      req.rawBody = buf;
    }
  },
}));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: "RajDyaan API running" });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/b2b', b2bRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/banners', bannerRoutes);

// 404 — unknown route fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

export default app;
