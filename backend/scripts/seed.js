require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');

// Import Models
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Shop = require('../src/models/Shop');
const Order = require('../src/models/Order');
const Campaign = require('../src/models/Campaign');
const Coupon = require('../src/models/Coupon');
const Cart = require('../src/models/Cart');
const Notification = require('../src/models/Notification');
const CoinTransaction = require('../src/models/CoinTransaction');
const OTP = require('../src/models/OTP');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🧹 Clearing existing database data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Shop.deleteMany({}),
      Order.deleteMany({}),
      Campaign.deleteMany({}),
      Coupon.deleteMany({}),
      Cart.deleteMany({}),
      Notification.deleteMany({}),
      CoinTransaction.deleteMany({}),
      OTP.deleteMany({})
    ]);

    await Cart.collection.dropIndexes().catch(() => {});

    console.log('🏪 Seeding Shop...');
    const shop = await Shop.create({
      name: 'UTEShop Official Store',
      address: '01 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM',
      phone: '02837221223',
      logo_url: 'https://ute.edu.vn/logo.png',
      description: 'Cửa hàng chính thức của trường ĐH Sư phạm Kỹ thuật TP.HCM'
    });

    console.log('👤 Seeding Users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = await User.insertMany([
      { full_name: 'Admin System', email: 'admin@uteshop.vn', password: hashedPassword, role: 'admin', status: 'active' },
      { full_name: 'Vendor Nguyễn Văn A', email: 'vendor@gmail.com', password: hashedPassword, role: 'vendor', status: 'active' },
      { full_name: 'Customer Trần Thị B', email: 'customer1@gmail.com', password: hashedPassword, role: 'customer', status: 'active', coin_balance: 500, addresses: [{ label: 'KTX Khu A', recipient_name: 'Trần Thị B', recipient_phone: '0901234567', street_address: 'Phòng 402, KTX Khu A' }] },
      { full_name: 'Customer Lê Văn C', email: 'customer2@gmail.com', password: hashedPassword, role: 'customer', status: 'active', coin_balance: 200 },
      { full_name: 'Shipper Hoàng Văn D', email: 'shipper@gmail.com', password: hashedPassword, role: 'shipper', status: 'active', shipper_details: { vehicle_type: 'Xe máy', license_plate: '59-X1 123.45', is_available: true } }
    ]);

    const productDir = path.join(__dirname, 'product');
    const brands = fs.readdirSync(productDir).filter(f => fs.statSync(path.join(productDir, f)).isDirectory());

    console.log(`🔍 Found brand directories: ${brands.join(', ')}`);

    console.log('📁 Creating Brand Categories...');
    const brandCategories = {};
    for (const brand of brands) {
      const brandSlug = slugify(brand);
      brandCategories[brand] = await Category.create({
        name: brand,
        slug: brandSlug,
        description: `Các sản phẩm chính hãng thương hiệu ${brand}`
      });
    }

    let productCount = 0;
    const allSeededProducts = [];

    for (const brand of brands) {
      const brandPath = path.join(productDir, brand);
      const filePath = path.join(brandPath, 'products.json');

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ No products.json found in ${brandPath}, skipping.`);
        continue;
      }

      console.log(`📦 Seeding products from brand: ${brand}`);
      const rawProducts = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      for (const p of rawProducts) {
        const brandCategory = brandCategories[brand];

        const basePrice = p.price && p.price > 0 
          ? p.price 
          : Math.floor(Math.random() * (4500000 - 150000 + 1)) + 150000;

        const mainImage = p.cloudinary_url || p.image_url || 'https://placehold.co/600x800?text=UTEShop';
        const mediaList = [{ media_type: 'image', media_url: mainImage, sort_order: 0 }];

        if (Array.isArray(p.images)) {
          p.images.forEach((img, idx) => {
            const url = img.cloudinary_url || img.image_url;
            if (url) {
              mediaList.push({ media_type: 'image', media_url: url, sort_order: idx + 1 });
            }
          });
        }

        const variants = [];
        if (Array.isArray(p.colors)) {
          p.colors.forEach(col => {
            if (col.name) {
              variants.push({ variant_name: 'Màu sắc', variant_value: col.name, stock_quantity: 50 });
            }
          });
        }

        if (Array.isArray(p.versions)) {
          p.versions.forEach(ver => {
            if (ver.name) {
              variants.push({ variant_name: 'Phiên bản', variant_value: ver.name, stock_quantity: 50 });
            }
          });
        }

        const suffix = Math.random().toString(36).substring(2, 6);
        const slug = `${slugify(p.name)}-${suffix}`;

        const baseSales = Math.floor(Math.random() * 500) + 10;
        const newProduct = new Product({
          shop: shop._id,
          category: brandCategory._id,
          name: p.name,
          slug: slug,
          description: `Sản phẩm ${p.name} chính hãng thương hiệu ${brand}. Cung cấp trải nghiệm tối ưu cho nhu cầu học tập và sáng tạo hình ảnh của sinh viên UTE.`,
          base_price: basePrice,
          sku: p.sku || `SKU-${brand.substring(0, 3).toUpperCase()}-${suffix.toUpperCase()}`,
          variants: variants,
          media: mediaList,
          is_active: true,
          sold_quantity: baseSales,
          view_count: baseSales + Math.floor(Math.random() * 2000) + 100,
          average_rating: Number((Math.random() * (5 - 3.8) + 3.8).toFixed(1))
        });

        await newProduct.save();
        allSeededProducts.push(newProduct);
        productCount++;
      }
    }

    console.log(`✅ Seeded ${productCount} products into database!`);

    console.log('🔥 Seeding Campaigns & Coupons...');
    const campaign = await Campaign.create({ 
      name: 'Chào mừng tân sinh viên', slug: 'chao-tan-sv', start_at: new Date(), end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      type: 'discount', value: 10 
    });
    const coupons = await Coupon.insertMany([
      { code: 'UTE10', type: 'percent', value: 10, campaign: campaign._id, status: 'active' },
      { code: 'WELCOME50', type: 'fixed_amount', value: 50000, min_order_total: 200000, status: 'active' },
      { code: 'FREESHIP', type: 'fixed_amount', value: 15000, status: 'active' },
      { code: 'COINBACK', type: 'percent', value: 5, status: 'active' },
      { code: 'SV-GIOI', type: 'percent', value: 20, status: 'active' }
    ]);

    console.log('📦 Seeding Orders (50 orders)...');
    const statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    const newOrders = [];

    const customerList = users.filter(u => u.role === 'customer');

    for (let i = 0; i < 50; i++) {
      const customer = customerList[Math.floor(Math.random() * customerList.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let totalBase = 0;

      const selectedProducts = [...allSeededProducts].sort(() => 0.5 - Math.random()).slice(0, numItems);

      for (let prod of selectedProducts) {
        const qty = Math.floor(Math.random() * 2) + 1;
        items.push({
          product: prod._id,
          quantity: qty,
          price_at_buy: prod.base_price
        });
        totalBase += prod.base_price * qty;
      }

      const shippingFee = 15000;
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      newOrders.push({
        order_code: `ORD-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        customer: customer._id,
        status: status,
        total_base: totalBase,
        shipping_fee: shippingFee,
        total_final: totalBase + shippingFee,
        payment_status: status === 'completed' ? 'paid' : 'pending',
        items: items,
        history: [{ status: 'pending', note: 'Đặt hàng tự động qua seed' }]
      });
    }

    await Order.insertMany(newOrders);
    console.log('✅ Seeded 50 random orders successfully!');

    console.log('🛒 Seeding Carts...');
    await Cart.insertMany(customerList.map(u => ({
      user: u._id, items: [{ product: allSeededProducts[Math.floor(Math.random() * allSeededProducts.length)]._id, quantity: 1 }]
    })));

    console.log('🔔 Seeding Notifications...');
    const customer1 = customerList[0];
    const customer2 = customerList[1];
    const shipper = users.find(u => u.role === 'shipper');

    await Notification.insertMany([
      { user: customer1._id, title: 'Đăng ký thành công', content: 'Chào mừng bạn đến với UTEShop!', type: 'system' },
      { user: customer2._id, title: 'Ưu đãi đặc biệt', content: 'Nhập mã UTE10 để nhận ưu đãi 10%', type: 'promotion' },
      { user: shipper._id, title: 'Tài khoản hoạt động', content: 'Tài khoản giao hàng của bạn đã kích hoạt.', type: 'system' }
    ]);

    console.log('✨ SEEDING COMPLETED SUCCESSFULLY!');
    process.exit();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
