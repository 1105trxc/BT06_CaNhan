import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, getHomeProducts, getTopProducts } from '../redux/productSlice';
import Layout from '../components/Layout';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Star, ShoppingCart, Diamond } from 'lucide-react';
import { addToCart } from '../redux/cartSlice';

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

const ProductCard = ({ name, category, price, oldPrice, badge, badgeColor, img, id, sold, navigate, onAddToCart, addedIds }) => {
  const isAdded = addedIds && addedIds[id];
  return (
  <div className="col-6 col-md-4 col-lg-3 mb-4">
    <div 
      className="product-card h-100 d-flex flex-column"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="product-card-img-wrap position-relative" style={{ aspectRatio: '3/4' }}>
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
          {category || 'CATEGORY'}
        </p>
        <p className="fw-medium mb-2 text-primary-hover flex-grow-1" style={{ fontSize: '14px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {name}
        </p>
        <div className="d-flex justify-content-between align-items-end mt-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="fw-bold" style={{ fontSize: '16px', color: 'var(--text-primary)' }}>${price?.toFixed(2)}</span>
              {oldPrice && <span className="text-decoration-line-through" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>${oldPrice?.toFixed(2)}</span>}
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
  </div>
  );
};

const SectionHeader = ({ title, linkTo, subtitle }) => (
  <div className="d-flex justify-content-between align-items-end mb-4 animate-fade-up">
    <div>
      {subtitle && <p className="mb-1" style={{ color: 'var(--primary-light)', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>{subtitle}</p>}
      <h2 className="fw-bold" style={{ fontSize: '28px', color: 'var(--text-primary)' }}>{title}</h2>
    </div>
    <Link to={linkTo} className="text-decoration-none d-flex align-items-center gap-2 fw-medium btn-outline-purple px-3 py-1" style={{ fontSize: '13px' }}>
      View All <ArrowRight size={14} />
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
                  <span className="badge rounded-pill bg-danger" style={{ background: 'var(--grad-amber) !important' }}>NEW</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Spring Collection 2025 Dropped</span>
                </div>
                
                <h1 className="fw-bold mb-4" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: '1.05', letterSpacing: '-1px' }}>
                  Define Your <br />
                  <span className="gradient-text glow-text">Digital Style</span>
                </h1>
                
                <p className="mb-5" style={{ fontSize: '16px', lineHeight: '1.7', color: 'var(--text-secondary)', maxWidth: '480px' }}>
                  Discover the next generation of academic fashion. Premium quality materials engineered with minimalist aesthetics for the modern student.
                </p>
                
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/search" className="btn-purple px-5 py-3" style={{ fontSize: '15px' }}>
                    Shop Collection
                  </Link>
                  <Link to="/search?sort=newest" className="btn-outline-purple px-5 py-3" style={{ fontSize: '15px' }}>
                    View Trends
                  </Link>
                </div>
                
                <div className="d-flex align-items-center gap-4 mt-5 pt-4" style={{ borderTop: '1px solid var(--border)', maxWidth: '400px' }}>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>10k+</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Active Users</span>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>500+</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Premium Items</span>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>4.9/5</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Average Rating</span>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-5 offset-lg-1 d-none d-lg-block animate-fade-left delay-200">
                <div className="position-relative">
                  <div className="card-glass p-3 position-relative z-2" style={{ transform: 'rotate(2deg)', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(2deg)'}>
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" alt="Hero" className="img-fluid rounded-4" style={{ objectFit: 'cover', aspectRatio: '3/4' }} />
                  </div>
                  {/* Floating Elements */}
                  <div className="card-glass position-absolute p-3 d-flex align-items-center gap-3 z-3" style={{ bottom: '10%', left: '-15%', animation: 'float 4s ease-in-out infinite' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'var(--grad-primary)' }}>
                      <Star size={20} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Top Rated</div>
                      <div className="fw-bold">Premium Quality</div>
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
                { icon: <Truck size={24} />, title: 'Free Express Shipping', sub: 'On orders over $150' },
                { icon: <RotateCcw size={24} />, title: '30-Day Free Returns', sub: 'No questions asked' },
                { icon: <ShieldCheck size={24} />, title: 'Verified Authenticity', sub: '100% genuine products' },
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
            <SectionHeader title="Explore Categories" subtitle="Shop By Collection" linkTo="/search" />
            <div className="d-flex gap-4 overflow-auto pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categoryCards.map(cat => (
                <Link key={cat._id} to={`/search?category=${cat.slug}`} className="text-decoration-none" style={{ minWidth: '160px' }}>
                  <div className="card-dark p-3 text-center h-100 d-flex flex-column align-items-center justify-content-center group">
                    <div className="rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', background: 'var(--surface-3)', color: 'var(--primary-light)', transition: 'all 0.3s' }}>
                      <Diamond size={28} />
                    </div>
                    <p className="fw-bold mb-0 text-primary-hover" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div className="mb-5 pb-5">
            <SectionHeader title="New Arrivals" subtitle="Just Dropped" linkTo="/search?sort=newest" />
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
                backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.4
              }}></div>
              <div className="position-absolute w-100 h-100 z-1" style={{ background: 'linear-gradient(90deg, var(--bg) 0%, transparent 100%)' }}></div>
              
              <div className="position-relative z-2 p-5" style={{ maxWidth: '600px' }}>
                <span className="badge bg-danger mb-3 px-3 py-2" style={{ background: 'var(--grad-amber) !important', fontSize: '12px', letterSpacing: '1px' }}>FLASH SALE</span>
                <h2 className="fw-bold mb-3" style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.1' }}>
                  Up to <span className="gradient-text">40% OFF</span> <br />On Selected Items
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Don't miss out on our biggest sale of the season. Upgrade your wardrobe with premium pieces at unbeatable prices.</p>
                <Link to="/search?promo=true" className="btn-amber px-4 py-3">Shop The Sale Now</Link>
              </div>
            </div>
          </div>

          {/* Hot Promotions Grid */}
          <div className="mb-5 pb-5">
            <SectionHeader title="Hot Promotions" subtitle="Limited Time Offers" linkTo="/search?promo=true" />
            <div className="row">
              {promoItems.map((p, i) => (
                <ProductCard
                  key={p._id || i}
                  id={p._id}
                  name={p.name}
                  category={p.category?.name}
                  price={p.base_price || p.price}
                  oldPrice={p.base_price ? p.base_price * 1.35 : p.oldPrice}
                  badge={p.badge || ['-35%','-30%','SALE','HOT'][i % 4]}
                  badgeColor={['#EF4444','#F59E0B','#7C3AED','#10B981'][i % 4]}
                  img={p.media?.[0]?.media_url}
                  sold={p.sold_quantity}
                  navigate={navigate}
                  onAddToCart={handleAddToCart}
                  addedIds={addedIds}
                />
              ))}
            </div>
          </div>

          {/* Best Sellers */}
          <div className="mb-5 pb-4">
            <SectionHeader title="Trending Now" subtitle="Most Popular" linkTo="/search?sort=best_selling" />
            <div className="row">
              {bestItems.map((p, i) => (
                <ProductCard
                  key={p._id || i}
                  id={p._id}
                  name={p.name}
                  category={p.category?.name}
                  price={p.base_price || p.price}
                  img={p.media?.[0]?.media_url}
                  sold={p.sold_quantity}
                  navigate={navigate}
                  onAddToCart={handleAddToCart}
                  addedIds={addedIds}
                />
              ))}
            </div>
          </div>

          {/* Newsletter Glass Card */}
          <div className="card-glass position-relative overflow-hidden p-5 text-center my-5">
            <div className="position-absolute rounded-circle" style={{ width: '300px', height: '300px', background: 'var(--primary-glow)', filter: 'blur(80px)', top: '-50%', left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}></div>
            
            <div className="position-relative z-1 max-w-md mx-auto" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <Diamond size={32} color="var(--primary-light)" className="mb-3 mx-auto d-block" />
              <h2 className="fw-bold mb-3" style={{ fontSize: '32px' }}>Join The Inner Circle</h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Get early access to drops, exclusive discounts, and styling tips delivered straight to your inbox.</p>
              
              <div className="d-flex gap-2 p-2 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="form-control border-0 bg-transparent shadow-none" 
                  style={{ outline: 'none' }}
                />
                <button className="btn-purple px-4 py-2 m-0" style={{ whiteSpace: 'nowrap' }}>Subscribe</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Home;
