require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

const seedRandomOrders = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to database for seeding orders...');

    // Fetch all products and customer users
    const products = await Product.find({ is_active: true });
    const customers = await User.find({ role: 'customer' });

    if (products.length === 0 || customers.length === 0) {
      console.log('❌ Not enough products or customers to seed orders. Run seed.js and seed_from_cloudinary.js first.');
      process.exit(1);
    }

    const statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    const numOrders = 50;
    const newOrders = [];

    console.log(`🚀 Seeding ${numOrders} random orders...`);

    for (let i = 0; i < numOrders; i++) {
      // Pick a random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      // Determine number of items in this order (1 to 4)
      const numItems = Math.floor(Math.random() * 4) + 1;
      
      const items = [];
      let total_base = 0;

      // Pick random products for items
      const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, numItems);

      for (let prod of selectedProducts) {
        const qty = Math.floor(Math.random() * 5) + 1; // 1 to 5 units
        items.push({
          product: prod._id,
          quantity: qty,
          price_at_buy: prod.base_price
        });
        total_base += prod.base_price * qty;
      }

      const shipping_fee = 15000;
      const total_final = total_base + shipping_fee;
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      newOrders.push({
        order_code: `BULK-ORD-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        customer: customer._id,
        status: status,
        total_base: total_base,
        shipping_fee: shipping_fee,
        total_final: total_final,
        payment_status: status === 'completed' ? 'paid' : 'pending',
        items: items,
        history: [{ status: 'pending', note: 'Order placed automatically via seed' }]
      });
    }

    await Order.insertMany(newOrders);
    
    console.log(`✨ Successfully seeded ${numOrders} random orders!`);
    process.exit();
  } catch (error) {
    console.error('❌ Error during order seeding:', error);
    process.exit(1);
  }
};

seedRandomOrders();
