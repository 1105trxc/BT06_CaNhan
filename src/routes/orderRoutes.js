const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/checkout', orderController.checkoutCOD);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetail);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
