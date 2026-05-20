require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const fs = require('fs');
const path = require('path');

const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Shop = require('../src/models/Shop');

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

const seedBulkProducts = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to database...');

    const filePath = path.join(__dirname, '../list_image_product_cloudinary');
    const hasFile = fs.existsSync(filePath);
    const sections = hasFile
      ? fs.readFileSync(filePath, 'utf8').split(/\n(?=[A-ZÀ-ỹ])/)
      : [];

    let shop = await Shop.findOne({ name: 'UTEShop Official Store' });
    if (!shop) {
      shop = await Shop.create({
        name: 'UTEShop Official Store',
        address: '01 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM',
        phone: '02837221223',
        logo_url: 'https://ute.edu.vn/logo.png',
        description: 'Cửa hàng chính thức của trường ĐH Sư phạm Kỹ thuật TP.HCM'
      });
    }

  console.log('🚀 Seeding 8 products for each category (total ~40 products)...');

    if (!hasFile) {
      console.log('⚠️ list_image_product_cloudinary not found. Falling back to placeholder images.');
      const defaultCategories = await Category.find({});

      for (let category of defaultCategories) {
        const placeholderUrl = `https://placehold.co/600x600?text=${encodeURIComponent(category.name)}`;
        for (let i = 1; i <= 8; i++) {
          const productVersion = ['Pro', 'Elite', 'S', 'Max', 'Air', 'Edition', 'Plus', 'Classic'][i - 1];
          const productName = `${category.name} ${productVersion} ${i}`;
          const slug = slugify(productName) + '-' + Math.random().toString(36).substring(7);
          const baseSales = Math.floor(Math.random() * 500) + 10;

          await Product.create({
            shop: shop._id,
            category: category._id,
            name: productName,
            slug: slug,
            description: `Sản phẩm ${productName} thuộc phân khúc ${productVersion}.`,
            base_price: Math.floor(Math.random() * (15000000 - 100000 + 1)) + 100000,
            sku: `BULK-${category.slug.toUpperCase()}-${i}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
            media: [{ media_type: 'image', media_url: placeholderUrl, sort_order: 0 }],
            average_rating: Number((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
            is_active: true,
            sold_quantity: baseSales,
            view_count: baseSales + Math.floor(Math.random() * 2000) + 100
          });
        }

        console.log(`✅ Created 8 placeholder products for category: ${category.name}`);
      }

      console.log('✨ BULK SEEDING COMPLETED!');
      process.exit();
    }

    for (let section of sections) {
      const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      let catName = '';
      let urls = [];

      if (lines[0].includes(':')) {
        const parts = lines[0].split(':');
        catName = parts[0].trim();
        if (parts[1]) urls.push(parts[1].trim());
      } else {
        catName = lines[0].replace(':', '').trim();
      }

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('http')) {
          urls.push(lines[i]);
        }
      }

      if (urls.length > 0) {
        let category = await Category.findOne({ name: catName });
        if (!category) {
          category = await Category.create({
            name: catName,
            slug: slugify(catName),
            description: `Hệ sinh thái ${catName} tại UTEShop`
          });
        }

        // Create 8 products for this category
        for (let i = 1; i <= 8; i++) {
          const productVersion = ['Pro', 'Elite', 'S', 'Max', 'Air', 'Edition', 'Plus', 'Classic'][i-1];
          const productName = `${catName} ${productVersion} ${i}`;
          const slug = slugify(productName) + '-' + Math.random().toString(36).substring(7);
          
          // Pick 1-3 random images from the category pool
          const numImages = Math.floor(Math.random() * 3) + 1;
          const pickedUrls = [...urls].sort(() => 0.5 - Math.random()).slice(0, numImages);

          const baseSales = Math.floor(Math.random() * 500) + 10;
          const product = new Product({
            shop: shop._id,
            category: category._id,
            name: productName,
            slug: slug,
            description: `Sản phẩm ${productName} thuộc phân khúc ${productVersion}. Đây là sự lựa chọn tối ưu cho cộng đồng sinh viên UTE với mức giá hợp lý và độ bền bỉ cao. Được kiểm định chất lượng bởi đội ngũ kỹ thuật của nhà trường.`,
            base_price: Math.floor(Math.random() * (15000000 - 100000 + 1)) + 100000,
            sku: `BULK-${category.slug.toUpperCase()}-${i}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
            media: pickedUrls.map((url, index) => ({
              media_type: 'image',
              media_url: url,
              sort_order: index
            })),
            average_rating: Number((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
            is_active: true,
            sold_quantity: baseSales,
            view_count: baseSales + Math.floor(Math.random() * 2000) + 100
          });

          await product.save();
        }
        console.log(`✅ Created 8 products for category: ${catName}`);
      }
    }

    console.log('✨ BULK SEEDING COMPLETED!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedBulkProducts();
