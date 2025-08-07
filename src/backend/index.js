const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user');
const checkoutRoutes = require('./routes/checkout');
const addressRoutes = require('./routes/address');
const razorpayRoutes = require('./routes/razorpay');

const app = express();

// ✅ Enable full CORS for any frontend
app.use(cors({
  origin: '*', // Allow any domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ Serve static files (like images) from /public
app.use('/assets', express.static(path.join(__dirname, 'assets')));


// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/', razorpayRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/order', orderRoutes);
app.use('/api', userRoutes); 
app.use('/api/address', addressRoutes);

const PORT=5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
})
