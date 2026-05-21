import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCart, updateCartItem, removeCartItem } from '../redux/cartSlice';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, Tag } from 'lucide-react';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { cart, isLoading } = useSelector((state) => state.cart);

  useEffect(() => {
    if (user) dispatch(getCart());
  }, [dispatch, user]);

  const items = cart?.items || [];
  const totals = cart?.totals || { subtotal: 0, shipping_fee: 0, discount_total: 0, total: 0 };

  // Nhóm các items trong giỏ hàng theo Shop
  const groupedItems = React.useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const shop = item.product?.shop || {
        _id: 'default',
        name: 'Cửa hàng UTEShop',
        logo_url: 'https://placehold.co/100x100?text=Shop'
      };
      const shopId = shop._id;
      if (!groups[shopId]) {
        groups[shopId] = {
          shop,
          items: []
        };
      }
      groups[shopId].items.push(item);
    });
    return Object.values(groups);
  }, [items]);

  const handleQuantityChange = (itemId, quantity) => {
    dispatch(updateCartItem({ itemId, updates: { quantity } }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId));
  };

  if (!user) {
    return (
      <Layout>
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <div className="container-xl">
            <div className="card-glass p-5 text-center max-w-md mx-auto animate-fade-up" style={{ maxWidth: '400px' }}>
              <div className="mb-4 d-flex justify-content-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', background: 'var(--surface-3)', color: 'var(--primary-light)' }}>
                  <ShoppingCart size={32} />
                </div>
              </div>
              <h4 className="fw-bold mb-2">Khách</h4>
              <p style={{ color: 'var(--text-muted)' }} className="mb-4">Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
              <Link to="/login" className="btn-purple w-100 justify-content-center py-2">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
        
        {/* Banner */}
        <div className="position-relative py-4 mb-4" style={{ background: 'var(--surface)' }}>
          <div className="position-absolute w-100 h-100 top-0 start-0 z-0 opacity-25" style={{ background: 'var(--grad-hero)' }}></div>
          <div className="container-xl px-4 position-relative z-1 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 className="fw-bold mb-1" style={{ fontSize: '28px' }}>Giỏ hàng của bạn</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Kiểm tra lại các sản phẩm của bạn trước khi thanh toán</p>
            </div>
            <button className="btn-outline-purple m-0" onClick={() => navigate('/search')}>
              <ArrowLeft size={16} /> Tiếp tục mua sắm
            </button>
          </div>
        </div>

        <div className="container-xl px-4">
          {isLoading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="card-glass p-5 text-center animate-fade-up">
              <div className="mb-4 d-flex justify-content-center">
                <ShoppingCart size={48} color="var(--text-faint)" opacity={0.5} />
              </div>
              <h4 className="fw-bold mb-2">Giỏ hàng của bạn đang trống</h4>
              <p style={{ color: 'var(--text-muted)' }} className="mb-4">Có vẻ như bạn chưa thêm sản phẩm nào.</p>
              <Link to="/search" className="btn-purple px-4 py-2">Khám phá sản phẩm</Link>
            </div>
          ) : (
            <div className="row g-4">
              {/* Cart Items Grouped by Shop */}
              <div className="col-lg-8 animate-fade-up d-flex flex-column gap-4">
                {groupedItems.map((group) => (
                  <div key={group.shop._id} className="card-dark overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
                    {/* Header nhà cung cấp */}
                    <div className="p-3 d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border)' }}>
                      <img 
                        src={group.shop.logo_url || 'https://placehold.co/100x100?text=Shop'} 
                        alt={group.shop.name} 
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', objectFit: 'cover', border: '1px solid var(--border)' }}
                      />
                      <div>
                        <h6 className="fw-bold m-0" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{group.shop.name}</h6>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nhà cung cấp đối tác</span>
                      </div>
                    </div>

                    {/* Table Header cho Desktop */}
                    <div className="d-none d-md-grid p-3" style={{ gridTemplateColumns: '3fr 1fr 1fr auto', background: 'rgba(255, 255, 255, 0.01)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>SẢN PHẨM</div>
                      <div className="text-center" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>SỐ LƯỢNG</div>
                      <div className="text-end" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '1px' }}>TỔNG CỘNG</div>
                      <div style={{ width: '40px' }}></div>
                    </div>
                    
                    {/* Items list */}
                    <div>
                      {group.items.map((item) => (
                        <div key={item._id} className="p-3 d-flex flex-column flex-md-row align-items-md-center gap-3" style={{ borderBottom: item === group.items[group.items.length - 1] ? 'none' : '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          
                          {/* Product Info */}
                          <div className="d-flex gap-3 align-items-center flex-grow-1" style={{ minWidth: '0' }}>
                            <img
                              src={item.product?.media?.[0]?.media_url || 'https://placehold.co/600x800?text=UTEShop'}
                              alt={item.product?.name}
                              className="rounded-3"
                              style={{ width: '70px', height: '70px', objectFit: 'cover', border: '1px solid var(--border)' }}
                            />
                            <div style={{ minWidth: '0' }}>
                              <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '14px' }}>{item.product?.name}</h6>
                              <p className="mb-0" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Đơn giá: <span style={{ color: 'var(--text-primary)' }}>{item.unit_price?.toLocaleString('vi-VN')} đ</span>
                              </p>
                            </div>
                          </div>

                          {/* Mobile Actions Container */}
                          <div className="d-flex align-items-center justify-content-between mt-2 mt-md-0 w-100 w-md-auto gap-3">
                            
                            {/* Quantity */}
                            <div className="d-flex align-items-center p-1 rounded-pill" style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: '100px' }}>
                              <button 
                                className="btn d-flex align-items-center justify-content-center p-0 rounded-circle" 
                                style={{ width: '24px', height: '24px', background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none' }}
                                onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="flex-grow-1 text-center fw-bold" style={{ fontSize: '13px' }}>{item.quantity}</span>
                              <button 
                                className="btn d-flex align-items-center justify-content-center p-0 rounded-circle" 
                                style={{ width: '24px', height: '24px', background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none' }}
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Total & Remove */}
                            <div className="d-flex align-items-center gap-3">
                              <div className="text-end" style={{ width: '90px' }}>
                                <span className="fw-bold" style={{ fontSize: '15px', color: 'var(--primary-light)' }}>{item.line_total?.toLocaleString('vi-VN')} đ</span>
                              </div>
                              <button 
                                className="btn p-2 rounded-3" 
                                style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.08)' }}
                                onClick={() => handleRemove(item._id)}
                                title="Xóa sản phẩm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="col-lg-4 animate-fade-up delay-100">
                <div className="card-glass p-4" style={{ position: 'sticky', top: '100px' }}>
                  <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                  
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
                        <span style={{ color: 'var(--accent)' }}>-{totals.discount_total?.toLocaleString('vi-VN')} đ</span>
                      </div>
                    )}
                  </div>

                  <div className="divider-purple mb-4"></div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="fw-bold" style={{ fontSize: '16px' }}>Tổng cộng</span>
                    <span className="fw-bold" style={{ fontSize: '24px', color: 'var(--primary-light)' }}>{totals.total?.toLocaleString('vi-VN')} đ</span>
                  </div>

                  {/* Promo code input */}
                  <div className="d-flex gap-2 mb-4">
                    <div className="position-relative flex-grow-1">
                      <Tag size={16} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-faint)' }} />
                      <input 
                        type="text" 
                        className="input-dark w-100 m-0" 
                        placeholder="Mã giảm giá" 
                        style={{ height: '42px', padding: '10px 16px 10px 36px' }}
                      />
                    </div>
                    <button 
                      className="btn-outline-purple m-0 px-3" 
                      style={{ 
                        height: '42px', 
                        whiteSpace: 'nowrap', 
                        flexShrink: 0, 
                        justifyContent: 'center' 
                      }}
                    >
                      Apply
                    </button>
                  </div>

                  <Link to="/checkout" className="btn-purple w-100 justify-content-center py-3" style={{ fontSize: '16px' }}>
                    Tiến hành thanh toán
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
