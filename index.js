
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/orders'); 
const categoryRoutes = require('./routes/category');
const sellerOrdersRoutes = require('./routes/sellerOrders');
const commentRoutes = require('./routes/comments');


console.log('🔧 orderRoutes:', orderRoutes);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/seller-orders', sellerOrdersRoutes);
app.use('/api/comments', commentRoutes)


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portunda çalışıyor`);
});








