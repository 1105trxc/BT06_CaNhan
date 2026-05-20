import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getOrderDetails, cancelOrder } from '../redux/orderSlice';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft, MapPin, Search, CreditCard, ChevronRight } from 'lucide-react';

const STATUS_LABEL_MAP = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Processing',
  shipping: 'Shipping',
  completed: 'Completed',
  cancelled: 'Cancelled',
  cancel_requested: 'Cancellation Requested',
  refunded: 'Refunded'
};

const CANCELLED_STATUSES = ['cancelled', 'cancel_requested', 'refunded'];

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getStepTime = (history, statusKey) => {
  if (!history?.length) return null;
  const entry = [...history].reverse().find(h => h.status === statusKey);
  return entry ? formatDateTime(entry.created_at) : null;
};

const StatusTimeline = ({ status, history }) => {
  const isCancelled = CANCELLED_STATUSES.includes(status);
  
  const NORMAL_STEPS = [
    { key: 'pending', label: 'Order Placed', icon: <Package size={18} /> },
    { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={18} /> },
    { key: 'preparing', label: 'Processing', icon: <Clock size={18} /> },
    { key: 'shipping', label: 'Shipping', icon: <Truck size={18} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle size={18} /> }
  ];

  const currentIdx = NORMAL_STEPS.findIndex(s => s.key === status);

  if (isCancelled) {
    return (
      <div className="p-4 text-center">
        <div className="d-inline-flex align-items-center gap-3 p-3 px-4 rounded-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <XCircle size={28} color="#EF4444" />
          <div className="text-start">
            <div className="fw-bold" style={{ color: '#FCA5A5', fontSize: '16px' }}>{STATUS_LABEL_MAP[status]}</div>
            {history?.length > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {formatDateTime(history[history.length - 1]?.created_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 overflow-auto scrollbar-hide">
      <div className="d-flex justify-content-between position-relative" style={{ minWidth: '500px' }}>
        
        {/* Progress Bar Background */}
        <div className="position-absolute" style={{ top: '24px', left: '10%', right: '10%', height: '2px', background: 'var(--surface-3)', zIndex: 0 }}></div>
        
        {/* Progress Bar Fill */}
        {currentIdx > 0 && (
          <div className="position-absolute" style={{ 
            top: '24px', left: '10%', height: '2px', background: 'var(--grad-primary)', zIndex: 1,
            width: `${(currentIdx / (NORMAL_STEPS.length - 1)) * 80}%`, transition: 'width 0.5s ease'
          }}></div>
        )}

        {NORMAL_STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const current = idx === currentIdx;
          const stepTime = getStepTime(history, step.key);

          return (
            <div key={step.key} className="d-flex flex-column align-items-center position-relative z-2" style={{ flex: 1 }}>
              <div className="d-flex align-items-center justify-content-center rounded-circle mb-2" style={{ 
                width: '50px', height: '50px',
                background: done || current ? 'var(--primary-dark)' : 'var(--surface-2)',
                color: done || current ? '#fff' : 'var(--text-faint)',
                border: current ? '2px solid var(--primary-light)' : `2px solid ${done ? 'var(--primary)' : 'var(--border)'}`,
                boxShadow: current ? '0 0 15px var(--primary-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {done ? <CheckCircle size={20} /> : step.icon}
              </div>
              <div style={{ 
                fontSize: '13px', fontWeight: current ? 700 : 500,
                color: current ? 'var(--primary-light)' : done ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'center', maxWidth: '100px', lineHeight: 1.2
              }}>
                {step.label}
              </div>
              {(done || current) && stepTime && (
                <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px', textAlign: 'center' }}>
                  {stepTime}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TrackingLog = ({ history }) => {
  if (!history?.length) return null;
  const sorted = [...history].reverse();

  return (
    <div className="d-flex flex-column gap-0">
      {sorted.map((entry, idx) => (
        <div key={idx} className="d-flex gap-3 position-relative pb-4">
          {idx < sorted.length - 1 && (
            <div className="position-absolute" style={{ left: '11px', top: '24px', bottom: 0, width: '2px', background: idx === 0 ? 'var(--primary-dark)' : 'var(--border)' }}></div>
          )}
          <div className="position-relative z-1 mt-1">
            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ 
              width: '24px', height: '24px',
              background: idx === 0 ? 'var(--primary)' : 'var(--surface-3)',
              border: `4px solid ${idx === 0 ? 'var(--primary-subtle)' : 'var(--surface)'}`
            }}></div>
          </div>
          <div>
            <div style={{ fontWeight: idx === 0 ? 600 : 500, color: idx === 0 ? 'var(--primary-light)' : 'var(--text-primary)', fontSize: '14px' }}>
              {STATUS_LABEL_MAP[entry.status] || entry.status}
            </div>
            {entry.note && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{entry.note}</div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>
              {formatDateTime(entry.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);
  const { selectedOrder, isLoading } = useSelector(state => state.orders);

  useEffect(() => {
    if (user) dispatch(getOrderDetails(id));
  }, [dispatch, id, user]);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder({ orderId: id, reason: 'Customer requested cancellation' }));
    }
  };

  if (!user) {
    return (
      <Layout>
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <div className="container-xl">
            <div className="card-glass p-5 text-center max-w-md mx-auto">
              <h4 className="fw-bold mb-2">Login Required</h4>
              <p style={{ color: 'var(--text-muted)' }} className="mb-4">Please log in to view your order details.</p>
              <Link to="/login" className="btn-purple px-4 py-2">Log In</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || !selectedOrder) {
    return (
      <Layout>
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div className="spinner-border mb-3" role="status"></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isCancellable = ['pending', 'confirmed', 'preparing'].includes(selectedOrder.status);

  return (
    <Layout>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
        
        {/* Banner */}
        <div className="position-relative py-4 mb-4" style={{ background: 'var(--surface)' }}>
          <div className="container-xl px-4 d-flex justify-content-between align-items-center">
            <button className="btn-outline-purple m-0 border-0 px-2 py-1" style={{ background: 'transparent' }} onClick={() => navigate('/orders')}>
              <ChevronLeft size={18} /> Back to Orders
            </button>
            <div className="d-flex align-items-center gap-3">
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>ORDER #<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedOrder.order_code}</span></span>
              <span className="badge" style={{ 
                background: CANCELLED_STATUSES.includes(selectedOrder.status) ? 'rgba(239,68,68,0.1)' : 'var(--primary-subtle)',
                color: CANCELLED_STATUSES.includes(selectedOrder.status) ? '#FCA5A5' : 'var(--primary-light)',
                border: `1px solid ${CANCELLED_STATUSES.includes(selectedOrder.status) ? 'rgba(239,68,68,0.3)' : 'var(--primary)'}`,
                padding: '6px 12px'
              }}>
                {STATUS_LABEL_MAP[selectedOrder.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="container-xl px-4">
          
          {/* Status Timeline Card */}
          <div className="card-dark p-4 mb-4 animate-fade-up">
            <StatusTimeline status={selectedOrder.status} history={selectedOrder.history} />
            <div className="d-flex justify-content-end gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button className="btn-outline-purple" onClick={() => navigate('/search')}>Continue Shopping</button>
              {isCancellable && (
                <button className="btn-outline-purple" style={{ color: '#FCA5A5', borderColor: 'rgba(239,68,68,0.5)' }} onClick={handleCancel}>
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          <div className="row g-4">
            
            {/* Left Column */}
            <div className="col-lg-7 d-flex flex-column gap-4 animate-fade-up delay-100">
              
              {/* Shipping Address */}
              <div className="card-glass p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <MapPin size={20} color="var(--primary-light)" />
                  <h5 className="fw-bold m-0">Shipping Information</h5>
                </div>
                <div className="p-3 rounded-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <p className="mb-1" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Recipient</p>
                      <p className="fw-medium m-0" style={{ color: 'var(--text-primary)' }}>{selectedOrder.shipping_address?.full_name}</p>
                    </div>
                    <div className="col-sm-6">
                      <p className="mb-1" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Phone</p>
                      <p className="fw-medium m-0" style={{ color: 'var(--text-primary)' }}>{selectedOrder.shipping_address?.phone}</p>
                    </div>
                    <div className="col-12">
                      <p className="mb-1" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Address</p>
                      <p className="fw-medium m-0" style={{ color: 'var(--text-primary)' }}>{selectedOrder.shipping_address?.address}</p>
                    </div>
                    {selectedOrder.shipping_address?.note && (
                      <div className="col-12">
                        <p className="mb-1" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Note</p>
                        <p className="fst-italic m-0" style={{ color: 'var(--text-secondary)' }}>{selectedOrder.shipping_address?.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Tracking */}
              {selectedOrder.history?.length > 0 && (
                <div className="card-glass p-4">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <Search size={20} color="var(--primary-light)" />
                    <h5 className="fw-bold m-0">Tracking History</h5>
                  </div>
                  <div className="p-4 rounded-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <TrackingLog history={selectedOrder.history} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="col-lg-5 d-flex flex-column gap-4 animate-fade-up delay-200">
              
              {/* Products List */}
              <div className="card-dark p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <Package size={20} color="var(--primary-light)" />
                    <h5 className="fw-bold m-0">Items ({selectedOrder.items?.length})</h5>
                  </div>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className="d-flex gap-3 p-2 rounded-3 align-items-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <img
                        src={item.product?.media?.[0]?.media_url || 'https://placehold.co/64x64?text=UTEShop'}
                        alt={item.product?.name}
                        className="rounded-3"
                        style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-medium text-truncate mb-1" style={{ fontSize: '14px' }}>{item.product?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity} &times; ${item.price_at_buy?.toFixed(2)}</div>
                      </div>
                      <div className="text-end pe-2">
                        <div className="fw-bold" style={{ fontSize: '15px', color: 'var(--primary-light)' }}>
                          ${(item.price_at_buy * item.quantity)?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="card-glass p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <CreditCard size={20} color="var(--primary-light)" />
                  <h5 className="fw-bold m-0">Payment Summary</h5>
                </div>
                
                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex justify-content-between">
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span className="fw-medium">${selectedOrder.total_base?.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span style={{ color: 'var(--text-muted)' }}>Shipping Fee</span>
                    <span className="fw-medium">{selectedOrder.shipping_fee > 0 ? `$${selectedOrder.shipping_fee.toFixed(2)}` : 'Free'}</span>
                  </div>
                  {selectedOrder.discount_total > 0 && (
                    <div className="d-flex justify-content-between">
                      <span style={{ color: 'var(--text-muted)' }}>Discount</span>
                      <span style={{ color: 'var(--accent)' }}>-${selectedOrder.discount_total?.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="divider-purple mb-4"></div>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold" style={{ fontSize: '16px' }}>Total Paid</span>
                  <span className="fw-bold" style={{ fontSize: '24px', color: 'var(--primary-light)' }}>${selectedOrder.total_final?.toFixed(2)}</span>
                </div>

                <div className="p-3 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Method</span>
                  <span className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    {selectedOrder.payment_method?.toUpperCase() === 'COD' ? 'Cash on Delivery' : selectedOrder.payment_method}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;
