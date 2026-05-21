import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, getHomeProducts, getTopProducts } from '../redux/productSlice';
import Layout from '../components/Layout';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Star, ShoppingCart, Diamond, ChevronLeft, ChevronRight } from 'lucide-react';
import { addToCart } from '../redux/cartSlice';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const StarRating = ({ rating = 4.5, count }) => (
  <div className="d-flex align-items-center gap-1 stars">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        fill={i < Math.floor(rating) ? "currentColor" : "none"}
        stroke="currentColor"
        className={i < rating ? '' : 'opacity-25'}
      />
    ))}
    {count && <span className="ms-1" style={{ color: 'var(--text-faint)', fontSize: '11px' }}>({count})</span>}
  </div>
);

const getCategoryLogo = (brandName) => {
  if (!brandName) return '';
  const mapping = {
    'canon': '/categoryImg/Canon/brand-icon-canon.webp',
    'fujifilm': '/categoryImg/Fujifilm/brand-icon-fujifilm.webp',
    'kodak': '/categoryImg/Kodak/logo-brand-HPRT_1.webp',
    'nikon': '/categoryImg/Nikon/logo-brand-HPRT_5.webp',
    'ricoh': '/categoryImg/Ricoh/logo-brand-HPRT_2.webp',
    'sony': '/categoryImg/Sony/brand-icon-sony_2.webp'
  };
  return mapping[brandName.toLowerCase()] || '';
};

const ProductCard = ({ name, category, price, oldPrice, badge, badgeColor, img, id, sold, navigate, onAddToCart, addedIds, isCarouselItem = false }) => {
  const isAdded = addedIds && addedIds[id];
  const cardElement = (
    <div
      className="product-card h-100 d-flex flex-column"
      onClick={() => navigate(`/product/${id}`)}
      style={isCarouselItem ? { margin: '2px' } : {}}
    >
      <div className="product-card-img-wrap position-relative" style={{ aspectRatio: '1/1' }}>
        <img
          src={img || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80'}
          alt={name}
          loading="lazy"
        />
        {badge && (
          <div className="position-absolute top-0 start-0 m-3 z-2">
            <span
              className="px-2 py-1 fw-bold text-white shadow-sm"
              style={{
                fontSize: '10px',
                letterSpacing: '1px',
                backgroundColor: badgeColor || 'var(--primary)',
                borderRadius: '6px',
                backdropFilter: 'blur(4px)'
              }}
            >
              {badge}
            </span>
          </div>
        )}
        <div className="position-absolute top-0 start-0 w-100 h-100 z-1"
          style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5) 100%)', opacity: 0, transition: 'opacity var(--transition)' }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        />
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1 bg-transparent">
        <p className="text-uppercase mb-1" style={{ color: 'var(--primary-light)', fontSize: '10px', letterSpacing: '1px', fontWeight: 600 }}>
          {category || 'DANH MỤC'}
        </p>
        <p className="fw-medium mb-2 text-primary-hover flex-grow-1" style={{ fontSize: '14px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {name}
        </p>
        <div className="d-flex justify-content-between align-items-end mt-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fw-bold" style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{price?.toLocaleString('vi-VN')} đ</span>
              {oldPrice && <span className="text-decoration-line-through" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{oldPrice?.toLocaleString('vi-VN')} đ</span>}
            </div>
            <StarRating count={sold || Math.floor(Math.random() * 500 + 50)} />
          </div>
          <button
            className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{
              width: '32px', height: '32px',
              background: isAdded ? 'var(--primary)' : 'var(--surface-2)',
              border: `1px solid ${isAdded ? 'var(--primary)' : 'var(--border)'}`,
              color: isAdded ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
            onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(id); }}
            title="Thêm vào giỏ hàng"
          >
            {isAdded ? <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span> : <ShoppingCart size={14} />}
          </button>
        </div>
      </div>
    </div>
  );

  if (isCarouselItem) {
    return cardElement;
  }

  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      {cardElement}
    </div>
  );
};

const CarouselSectionHeader = ({ title, subtitle, prevElClass, nextElClass, linkTo }) => (
  <div className="d-flex justify-content-between align-items-end mb-4 animate-fade-up">
    <div>
      {subtitle && <p className="mb-1" style={{ color: 'var(--primary-light)', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>{subtitle}</p>}
      <h2 className="fw-bold" style={{ fontSize: '28px', color: 'var(--text-primary)' }}>{title}</h2>
    </div>
    <div className="d-flex align-items-center gap-3">
      <Link to={linkTo} className="text-decoration-none d-flex align-items-center gap-2 fw-medium btn-outline-purple px-3 py-1" style={{ fontSize: '13px' }}>
        Xem tất cả <ArrowRight size={14} />
      </Link>
      <div className="d-none d-md-flex align-items-center gap-2">
        <button className={`${prevElClass} carousel-btn btn rounded-circle d-flex align-items-center justify-content-center p-0`} style={{ width: '36px', height: '36px' }}>
          <ChevronLeft size={18} />
        </button>
        <button className={`${nextElClass} carousel-btn btn rounded-circle d-flex align-items-center justify-content-center p-0`} style={{ width: '36px', height: '36px' }}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  </div>
);


const SectionHeader = ({ title, linkTo, subtitle }) => (
  <div className="d-flex justify-content-between align-items-end mb-4 animate-fade-up">
    <div>
      {subtitle && <p className="mb-1" style={{ color: 'var(--primary-light)', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>{subtitle}</p>}
      <h2 className="fw-bold" style={{ fontSize: '28px', color: 'var(--text-primary)' }}>{title}</h2>
    </div>
    <Link to={linkTo} className="text-decoration-none d-flex align-items-center gap-2 fw-medium btn-outline-purple px-3 py-1" style={{ fontSize: '13px' }}>
      Xem tất cả <ArrowRight size={14} />
    </Link>
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { homeProducts, topProducts, categories, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [addedIds, setAddedIds] = useState({});

  const handleAddToCart = (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
    setAddedIds(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [productId]: false })), 1500);
  };

  useEffect(() => {
    dispatch(getHomeProducts());
    dispatch(getTopProducts({ type: 'best_selling' }));
    dispatch(getTopProducts({ type: 'most_viewed' }));
    dispatch(getCategories());
  }, [dispatch]);

  const promoItems = homeProducts?.promotional?.slice(0, 4) || [];
  const newItems = homeProducts?.newProducts?.slice(0, 8) || [];
  const bestItems = homeProducts?.bestSelling?.slice(0, 4) || [];
  const categoryCards = (categories || []).slice(0, 6);

  const swiperBreakpoints = {
    320: {
      slidesPerView: 2,
      spaceBetween: 12
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 16
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 20
    }
  };


  return (
    <Layout>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

        {/* ── Hero Banner ── */}
        <div className="position-relative overflow-hidden" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
          {/* Background Elements */}
          <div className="position-absolute w-100 h-100 top-0 start-0 z-0">
            <div className="position-absolute w-100 h-100" style={{ background: 'var(--grad-hero)', zIndex: 1 }}></div>
            {/* Abstract Glow Orbs */}
            <div className="position-absolute rounded-circle" style={{ width: '600px', height: '600px', background: 'var(--primary-glow)', filter: 'blur(100px)', top: '-20%', right: '-10%', zIndex: 2, animation: 'glow-pulse 8s infinite alternate' }}></div>
            <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'rgba(245, 158, 11, 0.15)', filter: 'blur(80px)', bottom: '10%', left: '-5%', zIndex: 2, animation: 'glow-pulse 10s infinite alternate-reverse' }}></div>

            {/* Grid Pattern Overlay */}
            <div className="position-absolute w-100 h-100 z-3" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              opacity: 0.5
            }}></div>
          </div>

          <div className="container-xl px-4 position-relative z-10 w-100">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0 animate-fade-up">
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span className="badge rounded-pill bg-danger" style={{ background: 'var(--grad-amber) !important' }}>HÀNG MỚI VỀ</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Bộ sưu tập máy ảnh & ống kính mới nhất 2026</span>
                </div>

                <h1 className="fw-bold mb-4" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: '1.05', letterSpacing: '-1px' }}>
                  Nâng Tầm Nghệ Thuật <br />
                  <span className="gradient-text glow-text">Nhiếp Ảnh</span>
                </h1>

                <p className="mb-5" style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', maxWidth: '480px' }}>
                  Khám phá thế giới qua lăng kính chuyên nghiệp. Nơi cung cấp các dòng máy ảnh, ống kính và phụ kiện kỹ thuật số cao cấp hàng đầu Việt Nam.
                </p>

                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/search" className="btn-purple px-5 py-3" style={{ fontSize: '15px' }}>
                    Mua sắm ngay
                  </Link>
                  <Link to="/search?sort=newest" className="btn-outline-purple px-5 py-3" style={{ fontSize: '15px' }}>
                    Xem xu hướng
                  </Link>
                </div>

                <div className="d-flex align-items-center gap-4 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)', maxWidth: '400px' }}>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>10k+</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Khách tin dùng</span>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>500+</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Thiết bị cao cấp</span>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>4.9/5</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Đánh giá trung bình</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-5 offset-lg-1 d-none d-lg-block animate-fade-left delay-200">
                <div className="position-relative">
                  <div className="card-glass p-3 position-relative z-2" style={{ transform: 'rotate(2deg)', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(2deg)'}>
                    <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" alt="Camera Hero" className="img-fluid rounded-4" style={{ objectFit: 'cover', aspectRatio: '3/4' }} />
                  </div>
                  {/* Floating Elements */}
                  <div className="card-glass position-absolute p-3 d-flex align-items-center gap-3 z-3" style={{ bottom: '10%', left: '-15%', animation: 'float 4s ease-in-out infinite' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'var(--grad-primary)' }}>
                      <Star size={20} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lựa chọn hàng đầu</div>
                      <div className="fw-bold">Chất lượng cao</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Features strip ── */}
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container-xl px-4">
            <div className="row">
              {[
                { icon: <Truck size={24} />, title: 'Giao hàng hỏa tốc', sub: 'Miễn phí cho đơn hàng lớn' },
                { icon: <RotateCcw size={24} />, title: 'Đổi trả dễ dàng', sub: 'Hỗ trợ đổi trả trong 30 ngày' },
                { icon: <ShieldCheck size={24} />, title: 'Cam kết chính hãng', sub: '100% sản phẩm chính hãng' },
              ].map((f, i) => (
                <div key={i} className={`col-md-4 d-flex align-items-center justify-content-center gap-4 py-4 ${i !== 2 ? 'border-end' : ''}`} style={{ borderColor: 'var(--border) !important' }}>
                  <div style={{ color: 'var(--primary-light)' }}>{f.icon}</div>
                  <div>
                    <p className="fw-bold mb-1" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{f.title}</p>
                    <p className="mb-0" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="container-xl px-4 py-5 mt-4">

          {/* Categories Horizontal */}
          <div className="mb-5 pb-5">
            <SectionHeader title="Máy ảnh" linkTo="/search" />
            <div className="d-flex gap-3 overflow-auto justify-content-center pb-3 align-items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categoryCards.map(cat => (
                <Link key={cat._id} to={`/search?category=${cat.slug}`} className="text-decoration-none" title={`Danh mục ${cat.name}`}>
                  <div className="brand-rect-card d-flex align-items-center justify-content-center" style={{
                    width: '140px',
                    height: '48px',
                    background: '#ffffff',
                    padding: '8px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    {getCategoryLogo(cat.name) ? (
                      <img
                        src={getCategoryLogo(cat.name)}
                        alt={cat.name}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                      />
                    ) : (
                      <span className="fw-bold" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{cat.name}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div className="mb-5 pb-5">
            <SectionHeader title="Sản phẩm mới về" linkTo="/search?sort=newest" />
            {isLoading ? (
              <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>
            ) : (
              <div className="row">
                {newItems.map((p, i) => (
                  <ProductCard
                    key={p._id || i}
                    id={p._id}
                    name={p.name}
                    category={p.category?.name}
                    price={p.base_price || p.price}
                    oldPrice={p.base_price ? p.base_price * 1.2 : null}
                    img={p.media?.[0]?.media_url}
                    sold={p.sold_quantity}
                    navigate={navigate}
                    onAddToCart={handleAddToCart}
                    addedIds={addedIds}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Promo Banner Mid */}
          <div className="mb-5 pb-5">
            <div className="card-dark position-relative overflow-hidden" style={{ minHeight: '360px', display: 'flex', alignItems: 'center' }}>
              <div className="position-absolute w-100 h-100 z-0" style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1600&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.4
              }}></div>
              <div className="position-absolute w-100 h-100 z-1" style={{ background: 'linear-gradient(90deg, var(--bg) 0%, transparent 100%)' }}></div>

              <div className="position-relative z-2 p-5" style={{ maxWidth: '600px' }}>
                <span className="badge bg-danger mb-3 px-3 py-2" style={{ background: 'var(--grad-amber) !important', fontSize: '12px', letterSpacing: '1px' }}>KHUYẾN MÃI LỚN</span>
                <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.1' }}>
                  Ưu đãi lớn <span className="gradient-text">Tới 40%</span> <br />Cho máy ảnh tuyển chọn
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Đừng bỏ lỡ đợt giảm giá lớn nhất mùa này. Nâng cấp thiết bị nhiếp ảnh của bạn với các dòng máy ảnh, ống kính chính hãng chất lượng cao.</p>
                <Link to="/search?promo=true" className="btn-amber px-4 py-3">Mua Ngay Hôm Nay</Link>
              </div>
            </div>
          </div>

          {/* Hot Promotions Grid */}
          <div className="mb-5 pb-5">
            <SectionHeader title="Khuyến mãi cực hot" linkTo="/search?promo=true" />
            <div className="row">
              {promoItems.map((p, i) => (
                <ProductCard
                  key={p._id || i}
                  id={p._id}
                  name={p.name}
                  category={p.category?.name}
                  price={p.base_price || p.price}
                  oldPrice={p.base_price ? p.base_price * 1.35 : p.oldPrice}
                  badge={p.badge || ['-35%', '-30%', 'SALE', 'HOT'][i % 4]}
                  badgeColor={['#EF4444', '#F59E0B', '#7C3AED', '#10B981'][i % 4]}
                  img={p.media?.[0]?.media_url}
                  sold={p.sold_quantity}
                  navigate={navigate}
                  onAddToCart={handleAddToCart}
                  addedIds={addedIds}
                />
              ))}
            </div>
          </div>

          {/* Best Sellers Carousel */}
          <div className="mb-5 pb-5">
            <CarouselSectionHeader
              title="Sản phẩm bán chạy"
              prevElClass="best-prev"
              nextElClass="best-next"
              linkTo="/search?sort=best_selling"
            />
            {isLoading ? (
              <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>
            ) : (
              <div className="position-relative px-1">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    prevEl: '.best-prev',
                    nextEl: '.best-next',
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true
                  }}
                  breakpoints={swiperBreakpoints}
                  className="pb-5"
                >
                  {(topProducts?.bestSelling || []).map((p, i) => (
                    <SwiperSlide key={p._id || i} style={{ height: 'auto' }}>
                      <ProductCard
                        id={p._id}
                        name={p.name}
                        category={p.category?.name}
                        price={p.base_price || p.price}
                        img={p.media?.[0]?.media_url}
                        sold={p.sold_quantity}
                        navigate={navigate}
                        onAddToCart={handleAddToCart}
                        addedIds={addedIds}
                        isCarouselItem={true}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>

          {/* Most Viewed Carousel */}
          <div className="mb-5 pb-5">
            <CarouselSectionHeader
              title="Sản phẩm xem nhiều nhất"
              prevElClass="viewed-prev"
              nextElClass="viewed-next"
              linkTo="/search?sort=most_viewed"
            />
            {isLoading ? (
              <div className="text-center py-5"><div className="spinner-border" role="status"></div></div>
            ) : (
              <div className="position-relative px-1">
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    prevEl: '.viewed-prev',
                    nextEl: '.viewed-next',
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true
                  }}
                  breakpoints={swiperBreakpoints}
                  className="pb-5"
                >
                  {(topProducts?.mostViewed || []).map((p, i) => (
                    <SwiperSlide key={p._id || i} style={{ height: 'auto' }}>
                      <ProductCard
                        id={p._id}
                        name={p.name}
                        category={p.category?.name}
                        price={p.base_price || p.price}
                        img={p.media?.[0]?.media_url}
                        sold={p.sold_quantity}
                        navigate={navigate}
                        onAddToCart={handleAddToCart}
                        addedIds={addedIds}
                        isCarouselItem={true}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>


          {/* Newsletter Glass Card */}
          <div className="card-glass position-relative overflow-hidden p-5 text-center my-5">
            <div className="position-absolute rounded-circle" style={{ width: '300px', height: '300px', background: 'var(--primary-glow)', filter: 'blur(80px)', top: '-50%', left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}></div>

            <div className="position-relative z-1 max-w-md mx-auto" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <Diamond size={32} color="var(--primary-light)" className="mb-3 mx-auto d-block" />
              <h2 className="fw-bold mb-3" style={{ fontSize: '32px' }}>Nhận thông tin ưu đãi</h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Đăng ký để nhận sớm nhất các đợt mở bán, ưu đãi đặc quyền và kinh nghiệm nhiếp ảnh trực tiếp vào hộp thư của bạn.</p>

              <div className="d-flex gap-2 p-2 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  className="form-control border-0 bg-transparent shadow-none"
                  style={{ outline: 'none' }}
                />
                <button className="btn-purple px-4 py-2 m-0" style={{ whiteSpace: 'nowrap' }}>Đăng ký</button>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .carousel-btn {
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          color: var(--text-secondary) !important;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .carousel-btn:hover {
          background: var(--primary) !important;
          border-color: var(--primary) !important;
          color: #ffffff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        .carousel-btn:disabled, .swiper-button-disabled {
          opacity: 0.4 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        .swiper-pagination-bullet {
          background: var(--text-muted) !important;
          opacity: 0.3 !important;
          width: 8px !important;
          height: 8px !important;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: var(--primary) !important;
          opacity: 1 !important;
          width: 20px !important;
          border-radius: 4px !important;
        }
        .swiper-pagination {
          bottom: 10px !important;
        }
        .brand-rect-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .brand-rect-card:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: var(--shadow-glow) !important;
          border-color: var(--primary-light) !important;
        }
      `}</style>
    </Layout>
  );
};

export default Home;
