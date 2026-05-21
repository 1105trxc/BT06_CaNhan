const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const STATUS_LABELS = {
  pending: 'Đơn hàng mới',
  confirmed: 'Đã xác nhận',
  preparing: 'Shop đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  completed: 'Đã giao thành công',
  cancelled: 'Đã hủy',
  cancel_requested: 'Yêu cầu hủy đơn',
  refunded: 'Hoàn tiền'
};

const generateOrderCode = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${stamp}-${rand}`;
};

const getVariantPrice = (product, variantId) => {
  if (!variantId || !product?.variants?.length) return 0;
  const variant = product.variants.find((v) => v._id.toString() === variantId.toString());
  return variant?.additional_price || 0;
};

const buildOrderItems = async (cartItems) => {
  const items = [];
  for (const item of cartItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm trong giỏ');
      error.statusCode = 404;
      throw error;
    }
    const unitPrice = product.base_price + getVariantPrice(product, item.variant_id);
    items.push({
      product: product._id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price_at_buy: unitPrice
    });
  }
  return items;
};

const buildTotals = (items) => {
  const totalBase = items.reduce((sum, item) => sum + item.price_at_buy * item.quantity, 0);
  return {
    total_base: totalBase,
    shipping_fee: 0,
    discount_total: 0,
    total_final: totalBase
  };
};

const applyAutoConfirm = async (order) => {
  if (order.status !== 'pending') return order;
  const createdAt = new Date(order.createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - createdAt) / (1000 * 60);
  if (diffMinutes >= 30) {
    order.status = 'confirmed';
    order.history.push({ status: 'confirmed', note: 'Tự động xác nhận sau 30 phút' });
    await order.save();
  }
  return order;
};

const checkoutCOD = async (userId, payload) => {
  const { fullName, phone, address, note, paymentMethod } = payload;

  if (!fullName || !phone || !address) {
    const error = new Error('Vui lòng nhập đầy đủ thông tin giao hàng');
    error.statusCode = 422;
    throw error;
  }

  if (paymentMethod && paymentMethod !== 'cod') {
    const error = new Error('Hiện chỉ hỗ trợ thanh toán COD');
    error.statusCode = 422;
    throw error;
  }

  // Lấy giỏ hàng và populate chi tiết sản phẩm cùng nhà cung cấp (Shop)
  const cart = await Cart.findOne({ user: userId }).populate({ path: 'items.product', populate: { path: 'shop' } });
  if (!cart || cart.items.length === 0) {
    const error = new Error('Giỏ hàng đang trống');
    error.statusCode = 400;
    throw error;
  }

  // Gom nhóm các mặt hàng trong giỏ theo nhà cung cấp (Shop)
  const itemsByShop = {};
  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm trong giỏ');
      error.statusCode = 404;
      throw error;
    }
    if (!product.shop) {
      const error = new Error(`Sản phẩm ${product.name} chưa được liên kết với nhà cung cấp nào`);
      error.statusCode = 400;
      throw error;
    }
    const shopId = product.shop._id.toString();
    if (!itemsByShop[shopId]) {
      itemsByShop[shopId] = [];
    }
    itemsByShop[shopId].push(item);
  }

  const createdOrders = [];
  const shopIds = Object.keys(itemsByShop);

  // Tạo đơn hàng riêng biệt cho từng Shop
  for (const shopId of shopIds) {
    const shopItems = itemsByShop[shopId];
    const orderItems = [];

    for (const item of shopItems) {
      const product = item.product;
      const unitPrice = product.base_price + getVariantPrice(product, item.variant_id);
      orderItems.push({
        product: product._id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_at_buy: unitPrice
      });
    }

    const totalBase = orderItems.reduce((sum, oItem) => sum + oItem.price_at_buy * oItem.quantity, 0);
    const shippingFee = 15000; // Phí vận chuyển 15,000đ cho mỗi nhà cung cấp
    const discountTotal = 0;
    const totalFinal = totalBase + shippingFee;

    const order = await Order.create({
      order_code: generateOrderCode(),
      customer: userId,
      shop: shopId,
      status: 'pending',
      total_base: totalBase,
      shipping_fee: shippingFee,
      discount_total: discountTotal,
      total_final: totalFinal,
      payment_status: 'pending',
      payment_method: 'cod',
      shipping_address: {
        full_name: fullName,
        phone,
        address,
        note
      },
      items: orderItems,
      history: [{ status: 'pending', note: 'Đặt hàng thành công (COD)' }]
    });

    createdOrders.push(order);
  }

  // Làm trống giỏ hàng
  cart.items = [];
  await cart.save();

  // Trả về danh sách đơn hàng được tạo
  return createdOrders;
};

const getOrdersByUser = async (userId) => {
  const orders = await Order.find({ customer: userId })
    .sort({ createdAt: -1 })
    .populate('shop')
    .populate({ path: 'items.product', populate: { path: 'shop' } });

  for (const order of orders) {
    await applyAutoConfirm(order);
  }

  return orders;
};

const getOrderById = async (userId, orderId) => {
  let order = await Order.findOne({ _id: orderId, customer: userId })
    .populate('shop')
    .populate({ path: 'items.product', populate: { path: 'shop' } });

  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  order = await applyAutoConfirm(order);
  return order;
};

const cancelOrder = async (userId, orderId, reason) => {
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  if (['completed', 'cancelled', 'shipping', 'cancel_requested'].includes(order.status)) {
    const error = new Error('Không thể hủy đơn hàng ở trạng thái hiện tại');
    error.statusCode = 422;
    throw error;
  }

  const createdAt = new Date(order.createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - createdAt) / (1000 * 60);

  if (order.status === 'preparing') {
    order.status = 'cancel_requested';
    order.cancellation.request_reason = reason || 'Yêu cầu hủy đơn';
    order.cancellation.request_at = new Date();
    order.history.push({ status: 'cancel_requested', note: 'Khách gửi yêu cầu hủy đơn' });
    await order.save();
    return order;
  }

  if (diffMinutes > 30) {
    const error = new Error('Chỉ cho phép hủy đơn trong vòng 30 phút sau khi đặt');
    error.statusCode = 422;
    throw error;
  }

  order.status = 'cancelled';
  order.cancellation.user = userId;
  order.cancellation.reason = reason || 'Hủy đơn hàng';
  order.cancellation.cancelled_at = new Date();
  order.history.push({ status: 'cancelled', note: 'Đơn hàng đã bị hủy' });
  await order.save();

  return order;
};

const mapOrderResponse = (order) => {
  if (!order) return null;
  if (Array.isArray(order)) {
    return order.map(mapOrderResponse);
  }
  const orderObj = typeof order.toObject === 'function' ? order.toObject() : order;
  return {
    ...orderObj,
    status_label: STATUS_LABELS[orderObj.status] || orderObj.status
  };
};

module.exports = {
  checkoutCOD,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
  mapOrderResponse,
  STATUS_LABELS
};
