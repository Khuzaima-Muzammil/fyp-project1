// Importing necessary libraries
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const path = require('path');

const app = express();

// 1. Allowing CORS so the frontend can access the API
app.use(cors());

// 2. Body parsers for handling data
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// 3. Serving static files (images and build)
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 4. Defining routes for different sections
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const courierRoutes = require('./routes/courierRoutes');
const reviewRoutes = require('./routes/review');
const newsletterRoutes = require('./routes/newsletter');
const settingsRoutes = require('./routes/settings');
const couponRoutes = require('./routes/coupon');

app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courier', courierRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Base route (To check if the API is running)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// 5. Database connection and starting the server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
      } else {
        console.error("Server Error:", err);
      }
    });
  })
  .catch(err => console.error("MongoDB Connection Error:", err));