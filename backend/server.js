const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { testDbConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security HTTP Headers with Helmet
app.use(helmet());

// 2. CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting on Auth API Routes (Max 15 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 4. Request Body Parsing & Static File Serving
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'ShopMaster Admin Panel REST API',
    timestamp: new Date().toISOString()
  });
});

// 6. Mount Module Routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingRoutes = require('./routes/settingRoutes');
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingRoutes);

// 7. Global Error Handler Middleware
app.use(errorHandler);

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 ShopMaster Backend is Running Successfully",
    version: "1.0.0"
  });
});

// 8. Start Express Server & Test DB Connection
app.listen(PORT, async () => {
  console.log(`🚀 ShopMaster Server running in [${process.env.NODE_ENV}] mode on port ${PORT}`);
  await testDbConnection();
});
