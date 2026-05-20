import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCart } from '../redux/cartSlice';
import { checkoutCOD, resetOrderState } from '../redux/orderSlice';
import { CreditCard, MapPin, Truck, ChevronLeft, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { isLoading, isSuccess, isError, message, selectedOrder } = useSelector((state) => state.orders);
  
  const checkoutSubmittedRef = useRef(false);

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    address: '',
    note: ''
  });

  useEffect(() => {
    dispatch(resetOrderState());
    if (user) dispatch(getCart());
  }, [dispatch, user]);

  useEffect(() => {
    if (checkoutSubmittedRef.current && isSuccess && selectedOrder?._id) {
      checkoutSubmittedRef.current = false;
      navigate(`/orders/${selectedOrder._id}`);
    }
  }, [isSuccess, selectedOrder, navigate]);

  if (!user) {
    return (
      <Layout>
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <div className="container-xl">
            <div className="card-glass p-5 text-center max-w-md mx-auto">
              <h4 className="fw-bold mb-2">Login Required</h4>
              <p style={{ color: 'var(--text-muted)' }} className="mb-4">Please log in to proceed with checkout.</p>
              <Link to="/login" className="btn-purple px-4 py-2">Log In</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const items = cart?.items || [];
  const totals = cart?.totals || { subtotal: 0, shipping_fee: 0, discount_total: 0, total: 0 };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    checkoutSubmittedRef.current = true;
    dispatch(checkoutCOD({ ...formData, paymentMethod: 'cod' }));
  };

  return (
    <Layout>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
        
        {/* Banner */}
        <div className="position-relative py-4 mb-5" style={{ background: 'var(--surface)' }}>
          <div className="container-xl px-4 d-flex justify-content-between align-items-center">
            <button className="btn-outline-purple m-0 border-0" style={{ background: 'transparent' }} onClick={() => navigate('/cart')}>
              <ChevronLeft size={18} /> Back to Cart
            </button>
            <h1 className="fw-bold m-0" style={{ fontSize: '20px' }}>Checkout securely</h1>
            <div className="d-flex align-items-center gap-2" style={{ color: '#10B981', fontSize: '12px', fontWeight: 600 }}>
              <ShieldCheck size={16} /> SSL ENCRYPTED
            </div>
          </div>
        </div>

        <div className="container-xl px-4">
          <form onSubmit={handleSubmit} className="row g-4">
            
            {/* Form Section */}
            <div className="col-lg-7 animate-fade-up">
              
              {/* Shipping Details */}
              <div className="card-dark p-4 mb-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--surface-3)', color: 'var(--primary-light)' }}>
                    <MapPin size={16} />
                  </div>
                  <h4 className="fw-bold m-0" style={{ fontSize: '18px' }}>Shipping Details</h4>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input type="text" className="input-dark w-100 p-2" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Phone Number</label>
                    <input type="text" className="input-dark w-100 p-2" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Delivery Address</label>
                    <input type="text" className="input-dark w-100 p-2" name="address" value={formData.address} onChange={handleChange} required placeholder="Building, Street, District, City" />
                  </div>
                  <div className="col-12">
                    <label className="form-label" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Order Notes (Optional)</label>
                    <textarea className="input-dark w-100 p-2" rows="3" name="note" value={formData.note} onChange={handleChange} placeholder="Special instructions for delivery"></textarea>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card-dark p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--surface-3)', color: 'var(--primary-light)' }}>
                    <CreditCard size={16} />
                  </div>
                  <h4 className="fw-bold m-0" style={{ fontSize: '18px' }}>Payment Method</h4>
                </div>

                <div 
                  className="p-3 rounded-3 d-flex align-items-center justify-content-between" 
                  style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check m-0">
                      <input className="form-check-input cursor-pointer" type="radio" checked readOnly style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: '15px' }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '13px', color: 'var(--primary-light)' }}>Pay when you receive the package</div>
                    </div>
                  </div>
                  <Truck size={24} color="var(--primary-light)" />
                </div>
                
                <p className="mt-3 mb-0" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                  * E-wallets and credit card payments will be supported in future versions.
                </p>
              </div>

            </div>

            {/* Order Summary */}
            <div className="col-lg-5 animate-fade-up delay-100">
              <div className="card-glass p-4" style={{ position: 'sticky', top: '100px' }}>
                <h5 className="fw-bold mb-4">Order Summary</h5>
                
                <div className="d-flex flex-column gap-3 mb-4 max-h-300 overflow-auto pe-2" style={{ maxHeight: '300px' }}>
                  {items.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Your cart is empty.</p>
                  ) : (
                    items.map((item) => (
                      <div key={item._id} className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                          <img
                            src={item.product?.media?.[0]?.media_url || 'https://placehold.co/64x64?text=UTEShop'}
                            alt={item.product?.name}
                            className="rounded-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid var(--border)' }}
                          />
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" 
                            style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '10px' }}>
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="fw-bold text-truncate" style={{ fontSize: '13px' }}>{item.product?.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.unit_price?.toLocaleString('vi-VN')} đ / sản phẩm</div>
                        </div>
                        <div className="fw-bold" style={{ fontSize: '14px', color: 'var(--primary-light)' }}>
                          {item.line_total?.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="divider-purple mb-4"></div>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex justify-content-between">
                    <span style={{ color: 'var(--text-muted)' }}>Tạm tính</span>
                    <span className="fw-medium">{totals.subtotal?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: 'var(--text-muted)' }}>Vận chuyển</span>
                    <span className="fw-medium">{totals.shipping_fee > 0 ? `${totals.shipping_fee.toLocaleString('vi-VN')} đ` : 'Miễn phí'}</span>
                  </div>
                  {totals.discount_total > 0 && (
                    <div className="d-flex justify-content-between">
                      <span style={{ color: 'var(--text-muted)' }}>Giảm giá</span>
                      <span className="fw-accent" style={{ color: 'var(--accent)' }}>-{totals.discount_total?.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3" style={{ background: 'var(--surface-2)' }}>
                  <span className="fw-bold" style={{ fontSize: '16px' }}>Tổng thanh toán</span>
                  <span className="fw-bold" style={{ fontSize: '24px', color: 'var(--primary-light)' }}>{totals.total?.toLocaleString('vi-VN')} đ</span>
                </div>

                {isError && (
                  <div className="p-3 mb-3 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '14px' }}>
                    {message || 'Failed to place order. Please try again.'}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-purple w-100 justify-content-center py-3" 
                  style={{ fontSize: '16px' }}
                  disabled={isLoading || items.length === 0}
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
