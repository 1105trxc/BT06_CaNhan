import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails, resetProductState } from '../redux/productSlice';
import { addToCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, CheckCircle, Truck, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/pagination';
const PLACEHOLDER_IMAGE = {
  media_url: 'https://placehold.co/600x800?text=UTEShop'
};

const StarRow = ({ rating = 4.8, count }) => (
  <div className="d-flex align-items-center gap-2">
    <div className="d-flex text-warning" style={{ fontSize: '13px' }}>
      {[...Array(5)].map((_, i) => (
        <i key={i} className={`fa-solid ${i < Math.floor(rating) ? 'fa-star' : i < rating ? 'fa-star-half-stroke' : 'fa-star opacity-25'}`}></i>
      ))}
    </div>
    <span className="text-muted" style={{ fontSize: '13px' }}>({rating} · {count || 0} reviews)</span>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: reduxProduct, similarProducts, isLoading, isError } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);

  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    dispatch(getProductDetails(id));
    return () => dispatch(resetProductState());
  }, [id, dispatch]);

  const product = reduxProduct;

  if (isLoading) return (
    <Layout>
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border" role="status"></div>
      </div>
    </Layout>
  );

  if (!product) return (
    <Layout>
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <p className="text-muted mb-3">Không tìm thấy sản phẩm.</p>
        <button className="btn btn-outline-purple" onClick={() => navigate('/search')}>Quay lại tìm kiếm</button>
      </div>
    </Layout>
  );

  const images = product.media?.length > 0 ? product.media : [PLACEHOLDER_IMAGE];
  const discountPct = 23;
  const oldPrice = (product.base_price * (100 / (100 - discountPct))).toFixed(2);
  const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) || 100;
  const displaySimilar = similarProducts?.length > 0
    ? similarProducts.slice(0, 4)
    : [];

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ');
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
    navigate('/checkout');
  };

  return (
    <Layout>
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <div className="container-xl px-4 py-4">

          {/* Breadcrumb */}
          <nav className="mb-4">
            <ol className="breadcrumb mb-0" style={{ fontSize: '12px' }}>
              <li className="breadcrumb-item"><Link to="/home" className="text-decoration-none text-muted">Home</Link></li>
              <li className="breadcrumb-item text-muted"><ChevronRight size={12} className="mx-1" />{product.category?.name}</li>
              <li className="breadcrumb-item text-dark active" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <ChevronRight size={12} className="mx-1" />{product.name}
              </li>
            </ol>
          </nav>

          {/* Main Product Section */}
          <div className="row g-5 mb-5">

            {/* Left: Image Gallery */}
            <div className="col-lg-6">
              {/* Main Swiper */}
              <div className="rounded-3 overflow-hidden mb-3" style={{ backgroundColor: 'var(--surface)' }}>
                <Swiper
                  loop={images.length > 1}
                  navigation={true}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  modules={[FreeMode, Navigation, Thumbs, Pagination]}
                  pagination={{ clickable: true }}
                  style={{ '--swiper-navigation-color': 'var(--primary-light)', '--swiper-pagination-color': 'var(--primary-light)' }}
                >
                  {images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img src={img.media_url} className="w-100" style={{ height: '520px', objectFit: 'cover' }} alt={`${product.name} ${i + 1}`} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  loop={false}
                  spaceBetween={10}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Navigation, Thumbs]}
                >
                  {images.map((img, i) => (
                    <SwiperSlide key={i} style={{ cursor: 'pointer', opacity: 0.6 }}>
                      <div className="rounded-2 overflow-hidden border-2" style={{ aspectRatio: '1/1', backgroundColor: '#f5f5f5' }}>
                        <img src={img.media_url} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={`thumb-${i}`} />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
              <style>{`.swiper-slide-thumb-active { opacity: 1 !important; } .swiper-slide-thumb-active div { border: 2px solid #111 !important; }`}</style>
            </div>

            {/* Right: Product Info */}
            <div className="col-lg-6 d-flex flex-column">

              {/* Badges */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge rounded-pill border fw-normal px-3 py-2" style={{ fontSize: '11px', backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                  New Season Arrival
                </span>
                <span className="badge rounded-pill border fw-normal px-3 py-2" style={{ fontSize: '11px', backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                  UTEShop Exclusive
                </span>
              </div>

              {/* Name */}
              <h1 className="fw-bold text-dark mb-2" style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontFamily: 'Georgia, serif', lineHeight: '1.25' }}>
                {product.name}
              </h1>

              {/* Rating + Sold */}
              <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
                <StarRow rating={product.average_rating || 4.8} count={product.sold_quantity} />
                <span className="text-muted" style={{ fontSize: '13px' }}>{product.sold_quantity || 842} sold</span>
              </div>

              {/* Price */}
              <div className="d-flex align-items-baseline gap-3 mb-1">
                <span className="fw-bold text-dark" style={{ fontSize: '28px' }}>${product.base_price?.toFixed(2)}</span>
                <span className="text-muted text-decoration-line-through" style={{ fontSize: '18px' }}>${oldPrice}</span>
                <span className="badge text-white fw-bold px-2 py-1 rounded-1" style={{ fontSize: '11px', backgroundColor: '#e11d48' }}>
                  {discountPct}% OFF
                </span>
              </div>
              <p className="text-muted mb-3" style={{ fontSize: '12px' }}>
                <ShieldCheck size={13} className="me-1 text-success" />
                Exclusive pricing for VIP members and subscribers.
              </p>

              <hr className="my-3" />


              {/* Quantity */}
              <div className="mb-4">
                <p className="fw-bold text-dark mb-2" style={{ fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Quantity</p>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center border rounded-2 overflow-hidden" style={{ width: '120px' }}>
                    <button className="btn btn-light border-0 px-3 py-2" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                      <Minus size={14} />
                    </button>
                    <span className="flex-grow-1 text-center fw-bold" style={{ fontSize: '15px' }}>{quantity}</span>
                    <button className="btn btn-light border-0 px-3 py-2" onClick={() => setQuantity(q => q + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-success d-flex align-items-center gap-1" style={{ fontSize: '13px' }}>
                    <CheckCircle size={15} /> {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 mb-4">
                <button className="btn btn-purple flex-grow-1 py-3 rounded-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: '14px' }}
                  onClick={handleAddToCart}>
                  <ShoppingCart size={17} /> Add to Cart
                </button>
                <button
                  className={`btn border rounded-2 px-3 ${wishlist ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setWishlist(!wishlist)}
                  title="Wishlist"
                >
                  <Heart size={18} fill={wishlist ? '#fff' : 'none'} />
                </button>
              </div>
              <button className="btn btn-outline-purple w-100 py-3 rounded-2 fw-bold" style={{ fontSize: '14px' }} onClick={handleBuyNow}>
                Buy It Now
              </button>

              {/* Trust Badges */}
              <div className="row g-2 mt-4">
                {[
                  { icon: <Truck size={16} />, title: 'Free Shipping', sub: 'Orders over $100' },
                  { icon: <RotateCcw size={16} />, title: '30-Day Returns', sub: 'Easy returns' },
                  { icon: <ShieldCheck size={16} />, title: 'Authenticity', sub: '100% verified' },
                ].map((f, i) => (
                  <div key={i} className="col-4">
                    <div className="border rounded-2 p-2 text-center" style={{ backgroundColor: '#fafafa' }}>
                      <span className="text-dark opacity-50 d-block mb-1">{f.icon}</span>
                      <p className="fw-bold mb-0 text-dark" style={{ fontSize: '10px' }}>{f.title}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{f.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Tabs */}
          <div className="mb-5">
            <div className="d-flex gap-0 border-bottom mb-4">
              {[
                { key: 'description', label: 'Description' },
                { key: 'reviews', label: `Reviews (${product.sold_quantity || 128})` },
                { key: 'shipping', label: 'Shipping & Returns' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className="btn btn-link text-decoration-none px-4 py-3 border-0 rounded-0 fw-bold"
                  style={{
                    fontSize: '13px',
                    color: activeTab === tab.key ? '#111' : '#9ca3af',
                    borderBottom: activeTab === tab.key ? '2px solid #111' : '2px solid transparent',
                  }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-1">


              {activeTab === 'reviews' && (
                <div>
                  <div className="d-flex align-items-center gap-4 mb-4 p-4 rounded-3" style={{ backgroundColor: '#f9f9f9' }}>
                    <div className="text-center">
                      <p className="fw-bold mb-0" style={{ fontSize: '48px', lineHeight: 1 }}>{product.average_rating || 4.8}</p>
                      <StarRow rating={product.average_rating || 4.8} />
                      <p className="text-muted mb-0 mt-1" style={{ fontSize: '12px' }}>{product.sold_quantity || 842} reviews</p>
                    </div>
                    <div className="flex-grow-1">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="d-flex align-items-center gap-2 mb-1">
                          <span style={{ fontSize: '12px', width: '10px' }}>{star}</span>
                          <i className="fa-solid fa-star text-warning" style={{ fontSize: '11px' }}></i>
                          <div className="flex-grow-1 rounded-pill overflow-hidden" style={{ height: '6px', backgroundColor: '#e5e7eb' }}>
                            <div className="h-100 rounded-pill" style={{ width: `${[70, 20, 6, 2, 2][5 - star]}%`, backgroundColor: '#fbbf24' }}></div>
                          </div>
                          <span className="text-muted" style={{ fontSize: '11px' }}>{[70, 20, 6, 2, 2][5 - star]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted text-center py-4" style={{ fontSize: '14px' }}>No written reviews yet. Be the first!</p>
                </div>
              )}


            </div>
          </div>

          {/* Similar Products */}
          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '18px' }}>You Might Also Like</h2>
              <Link to="/search" className="text-dark text-decoration-none d-flex align-items-center gap-1 fw-medium" style={{ fontSize: '13px' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="row g-3">
              {displaySimilar.map((item, i) => (
                <div key={item._id || i} className="col-6 col-md-3">
                  <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${item._id}`)}>
                    <div className="rounded-3 overflow-hidden mb-2" style={{ aspectRatio: '3/4', backgroundColor: '#f5f5f5' }}>
                      <img
                        src={item.media?.[0]?.media_url}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                        alt={item.name}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                    <p className="text-uppercase text-muted mb-1" style={{ fontSize: '9px', letterSpacing: '0.8px' }}>{item.category?.name}</p>
                    <p className="fw-medium text-dark mb-1" style={{ fontSize: '13px' }}>{item.name}</p>
                    <StarRow rating={item.average_rating || 4.5} />
                    <p className="fw-bold text-dark mt-1 mb-0" style={{ fontSize: '14px' }}>${item.base_price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
