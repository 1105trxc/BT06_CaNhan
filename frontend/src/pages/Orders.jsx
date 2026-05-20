import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getMyOrders, cancelOrder } from '../redux/orderSlice';
import toast from 'react-hot-toast';

const Orders = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (user) {
      dispatch(getMyOrders());
    }
  }, [dispatch, user]);

  const handleCancel = (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      dispatch(cancelOrder({ orderId, reason: 'Khách yêu cầu hủy đơn' }))
        .unwrap()
        .then((res) => {
          toast.success(res.message || 'Cập nhật trạng thái hủy đơn thành công');
        })
        .catch((err) => {
          toast.error(err || 'Không thể hủy đơn hàng');
        });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container-xl">
          <div className="bg-white border rounded-4 p-4 text-center shadow-sm">
            <h4 className="fw-bold mb-3">Vui lòng đăng nhập để xem đơn hàng</h4>
            <Link to="/login" className="btn btn-purple px-4">Đăng nhập</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-xl px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Đơn hàng của bạn</h2>
            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Theo dõi trạng thái và lịch sử mua hàng</p>
          </div>
          <Link to="/search" className="btn btn-outline-purple">Tiếp tục mua sắm</Link>
        </div>

        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"></div>
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="bg-white border rounded-4 p-5 text-center shadow-sm">
            <h5 className="fw-bold mb-2">Chưa có đơn hàng</h5>
            <p className="text-muted">Hãy chọn sản phẩm để bắt đầu mua sắm.</p>
            <Link to="/search" className="btn btn-purple px-4">Tìm sản phẩm</Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="row g-4">
            {orders.map((order) => (
              <div key={order._id} className="col-12">
                <div className="bg-white border rounded-4 p-4 shadow-sm">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div>
                      <h5 className="fw-bold mb-1">#{order.order_code}</h5>
                      <div className="text-muted" style={{ fontSize: '13px' }}>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                      <div className="text-muted" style={{ fontSize: '13px' }}>Trạng thái: <span className="fw-bold text-dark">{order.status_label}</span></div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold" style={{ fontSize: '16px' }}>{order.total_final?.toLocaleString('vi-VN')} đ</div>
                      <div className="text-muted" style={{ fontSize: '12px' }}>{order.items?.length || 0} sản phẩm</div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <Link to={`/orders/${order._id}`} className="btn btn-purple btn-sm">Xem chi tiết</Link>
                    {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(order._id)}>
                        {order.status === 'preparing' ? 'Gửi yêu cầu hủy' : 'Hủy đơn'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
