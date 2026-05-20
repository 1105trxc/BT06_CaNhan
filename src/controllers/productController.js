const Product = require('../models/Product');
const Category = require('../models/Category');
require('../models/Shop');

exports.getHomeProducts = async (req, res, next) => {
  try {
    // Lấy sản phẩm mới nhất
    const newProducts = await Product.find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('category', 'name slug');

    // Lấy sản phẩm bán chạy nhất
    const bestSelling = await Product.find({ is_active: true })
      .sort({ sold_quantity: -1 })
      .limit(8)
      .populate('category', 'name slug');

    // Lấy sản phẩm khuyến mãi (giả sử có trường promotion_price hoặc lấy random)
    const promotional = await Product.find({ is_active: true })
      .limit(8)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: {
        newProducts,
        bestSelling,
        promotional
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format before querying to avoid CastError
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { view_count: 1 } },
      { new: true }
    )
      .populate('category', 'name slug')
      .populate('shop', 'name');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Lấy sản phẩm tương tự (cùng danh mục) — guard against null category
    let similarProducts = [];
    if (product.category && product.category._id) {
      similarProducts = await Product.find({
        category: product.category._id,
        _id: { $ne: product._id },
        is_active: true
      })
        .limit(4)
        .populate('category', 'name slug');
    }

    res.status(200).json({
      success: true,
      data: {
        product,
        similarProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.searchAndFilterProducts = async (req, res, next) => {
  try {
    const { keyword, category, minPrice, maxPrice, sortBy, page = 1, limit = 8 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.max(parseInt(limit, 10), 1);
    const skip = (pageNumber - 1) * limitNumber;

    let query = { is_active: true };

    // Tìm kiếm theo từ khóa
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Lọc theo danh mục (hỗ trợ nhiều slug cách nhau bằng dấu phẩy)
    if (category) {
      const slugs = category.split(',').map((c) => c.trim()).filter(Boolean);
      if (slugs.length > 0) {
        const categoryDocs = await Category.find({ slug: { $in: slugs } });
        if (categoryDocs.length > 0) {
          query.category = { $in: categoryDocs.map((c) => c._id) };
        }
      }
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
      query.base_price = {};
      if (minPrice) query.base_price.$gte = Number(minPrice);
      if (maxPrice) query.base_price.$lte = Number(maxPrice);
    }

    // Sắp xếp
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { base_price: 1 };
    if (sortBy === 'price_desc') sortOptions = { base_price: -1 };
    if (sortBy === 'best_selling') sortOptions = { sold_quantity: -1 };
    if (sortBy === 'most_viewed') sortOptions = { view_count: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate('category', 'name slug'),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const { type = 'best_selling', limit = 10 } = req.query;
    const limitNumber = Math.max(parseInt(limit, 10), 1);
    const sortOptions = type === 'most_viewed' ? { view_count: -1 } : { sold_quantity: -1 };

    const products = await Product.find({ is_active: true })
      .sort(sortOptions)
      .limit(limitNumber)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
