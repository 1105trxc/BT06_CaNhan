const orderService = require('../services/orderService');
const responseHelper = require('../utils/responseHelper');

exports.checkoutCOD = async (req, res, next) => {
  try {
    const order = await orderService.checkoutCOD(req.user._id || req.user.id, req.body);
    return responseHelper.successResponse(res, 'Đặt hàng COD thành công', orderService.mapOrderResponse(order), 201);
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user._id || req.user.id);
    const mapped = orders.map(orderService.mapOrderResponse);
    return responseHelper.successResponse(res, 'Lấy lịch sử đơn hàng thành công', mapped);
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetail = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.user._id || req.user.id, req.params.id);
    return responseHelper.successResponse(res, 'Lấy chi tiết đơn hàng thành công', orderService.mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.user._id || req.user.id, req.params.id, req.body.reason);
    return responseHelper.successResponse(res, 'Cập nhật trạng thái hủy đơn', orderService.mapOrderResponse(order));
  } catch (error) {
    next(error);
  }
};
