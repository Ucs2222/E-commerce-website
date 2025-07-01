const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user'); // adjust path
const checkoutRoutes = require('./routes/checkout');
const addressRoutes = require('./routes/address');
const razorpayRoutes = require('./routes/razorpay');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/', razorpayRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/order', orderRoutes);
app.use('/api', userRoutes); 
app.use('/api/address', addressRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
