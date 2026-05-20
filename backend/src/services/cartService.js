const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate('items.product');
  }
  return cart;
};

const getVariantPrice = (product, variantId) => {
  if (!variantId || !product?.variants?.length) return 0;
  const variant = product.variants.find((v) => v._id.toString() === variantId.toString());
  return variant?.additional_price || 0;
};

const buildCartTotals = (cart) => {
  const items = cart.items.map((item) => {
    const basePrice = item.product?.base_price || 0;
    const variantExtra = getVariantPrice(item.product, item.variant_id);
    const unitPrice = basePrice + variantExtra;
    const lineTotal = unitPrice * item.quantity;
    return {
      _id: item._id,
      product: item.product,
      variant_id: item.variant_id,
      quantity: item.quantity,
      note: item.note,
      unit_price: unitPrice,
      line_total: lineTotal
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  return {
    items,
    totals: {
      subtotal,
      shipping_fee: 0,
      discount_total: 0,
      total: subtotal
    }
  };
};

const getCartSummary = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return buildCartTotals(cart);
};

const addItem = async (userId, payload) => {
  const { productId, variantId, quantity = 1, note } = payload;
  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Không tìm thấy sản phẩm');
    error.statusCode = 404;
    throw error;
  }

  const cart = await getOrCreateCart(userId);
  // getOrCreateCart đã populate product thành object → phải dùng ._id để so sánh với productId string
  const existingItem = cart.items.find(
    (item) => {
      const pId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      const vId = item.variant_id ? item.variant_id.toString() : '';
      const reqVId = variantId ? variantId.toString() : '';
      return pId === String(productId) && vId === reqVId;
    }
  );

  if (existingItem) {
    existingItem.quantity += normalizedQuantity;
    if (note) existingItem.note = note;
  } else {
    cart.items.push({ product: productId, variant_id: variantId, quantity: normalizedQuantity, note });
  }

  await cart.save();
  await cart.populate('items.product');
  return buildCartTotals(cart);
};

const updateItem = async (userId, itemId, payload) => {
  const { quantity, note } = payload;
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) {
    const error = new Error('Không tìm thấy sản phẩm trong giỏ');
    error.statusCode = 404;
    throw error;
  }

  if (quantity !== undefined) {
    item.quantity = Math.max(1, Number(quantity));
  }

  if (note !== undefined) item.note = note;

  await cart.save();
  await cart.populate('items.product');
  return buildCartTotals(cart);
};

const removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) {
    const error = new Error('Không tìm thấy sản phẩm trong giỏ');
    error.statusCode = 404;
    throw error;
  }
  item.deleteOne();
  await cart.save();
  await cart.populate('items.product');
  return buildCartTotals(cart);
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return buildCartTotals(cart);
};

module.exports = {
  getCartSummary,
  addItem,
  updateItem,
  removeItem,
  clearCart
};
