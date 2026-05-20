const cartService = require('../services/cartService');
const responseHelper = require('../utils/responseHelper');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCartSummary(req.user._id || req.user.id);
    return responseHelper.successResponse(res, 'Lấy giỏ hàng thành công', cart);
  } catch (error) {
    next(error);
  }
};

exports.addCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.addItem(req.user._id || req.user.id, req.body);
    return responseHelper.successResponse(res, 'Đã thêm sản phẩm vào giỏ', cart, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateItem(req.user._id || req.user.id, req.params.itemId, req.body);
    return responseHelper.successResponse(res, 'Đã cập nhật giỏ hàng', cart);
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user._id || req.user.id, req.params.itemId);
    return responseHelper.successResponse(res, 'Đã xóa sản phẩm khỏi giỏ', cart);
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user._id || req.user.id);
    return responseHelper.successResponse(res, 'Đã làm trống giỏ hàng', cart);
  } catch (error) {
    next(error);
  }
};
