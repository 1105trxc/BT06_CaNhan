const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product');

const updateCounts = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB Connected');

    const products = await Product.find();
    
    for (let product of products) {
      product.sold_count = Math.floor(Math.random() * 500) + 10;
      product.view_count = product.sold_count + Math.floor(Math.random() * 2000) + 100;
      await product.save();
    }
    
    console.log('✅ Successfully updated sold_count and view_count for all products!');
    process.exit();
  } catch (error) {
    console.error('❌ Error updating counts:', error);
    process.exit(1);
  }
};

updateCounts();
