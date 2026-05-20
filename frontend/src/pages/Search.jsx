import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, searchProducts } from '../redux/productSlice';
import { addToCart } from '../redux/cartSlice';
import Layout from '../components/Layout';
import { ShoppingCart, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, X, Search as SearchIcon, Star } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Mặc định', value: '' },
  { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
  { label: 'Giá: Cao đến Thấp', value: 'price_desc' },
  { label: 'Bán chạy nhất', value: 'best_selling' },
  { label: 'Xem nhiều nhất', value: 'most_viewed' },
  { label: 'Mới nhất', value: 'newest' },
];

const Search = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults, searchPagination, categories, isLoading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const queryParams = new URLSearchParams(location.search);
  const initialKeyword = queryParams.get('keyword') || '';
  const initialCategory = queryParams.get('category') || '';

  const [filters, setFilters] = useState({
    keyword: initialKeyword,
    categories: initialCategory ? [initialCategory] : [],
    minPrice: '',
    maxPrice: '',
    sort: ''
  });
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [addedIds, setAddedIds] = useState({});
  const ITEMS_PER_PAGE = 12;

  const categoryOptions = useMemo(
    () => (categories || []).map((cat) => ({ label: cat.name, slug: cat.slug })),
    [categories]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.keyword, filters.categories, filters.minPrice, filters.maxPrice, filters.sort]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const query = new URLSearchParams();
    if (filters.keyword) query.append('keyword', filters.keyword);
    if (filters.categories.length > 0) query.append('category', filters.categories.join(','));
    if (filters.minPrice) query.append('minPrice', filters.minPrice);
    if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);
    if (filters.sort) query.append('sortBy', filters.sort);
    query.append('page', currentPage.toString());
    query.append('limit', ITEMS_PER_PAGE.toString());
    dispatch(searchProducts({ queryParams: query.toString(), append: false }));
  }, [filters.keyword, filters.categories, filters.minPrice, filters.maxPrice, filters.sort, currentPage, dispatch]);

  const toggleCategory = (cat) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
    setCurrentPage(1);
  };

  const clearAll = () => {
    setFilters({ keyword: '', categories: [], minPrice: '', maxPrice: '', sort: '' });
    setSearchInput('');
    navigate('/search');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, keyword: searchInput }));
  };

  const handleAddToCart = (e, productId) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
    setAddedIds(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [productId]: false })), 1500);
  };

  const displayProducts = searchResults || [];
  const totalPages = searchPagination?.pages || 1;
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === filters.sort)?.label || 'Mặc định';
  const categoryLabel = (slug) => categoryOptions.find(c => c.slug === slug)?.label || slug;

  return (
    <Layout>
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        
        {/* Banner */}
        <div className="position-relative py-5" style={{ background: 'var(--surface)' }}>
          <div className="position-absolute w-100 h-100 top-0 start-0 z-0 opacity-25" style={{ background: 'var(--grad-hero)' }}></div>
          <div className="container-xl px-4 position-relative z-1 text-center">
            <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              {filters.keyword ? `Kết quả tìm kiếm cho "${filters.keyword}"` : 'Bộ sưu tập Máy ảnh'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Tìm thấy {searchPagination?.total ?? displayProducts.length} sản phẩm
              {filters.categories.length > 0 && ` thuộc hãng ${filters.categories.map(categoryLabel).join(', ')}`}
            </p>
          </div>
        </div>

        <div className="container-xl py-4 px-3 px-md-4">
          
          {/* Top Bar: Search & Sort */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
            <form onSubmit={handleSearchSubmit} className="d-flex w-100" style={{ maxWidth: '400px' }}>
              <div className="position-relative w-100">
                <SearchIcon size={18} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  className="input-dark w-100 m-0"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{ padding: '10px 16px 10px 40px', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
                />
              </div>
              <button type="submit" className="btn-purple m-0" style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', padding: '10px 24px' }}>
                Tìm kiếm
              </button>
            </form>

            <div className="position-relative w-100 w-md-auto text-end" style={{ maxWidth: '200px' }}>
              <button
                className="btn-outline-purple w-100 justify-content-between m-0"
                style={{ padding: '10px 16px', background: 'var(--surface-2)' }}
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span>{activeSortLabel}</span> <ChevronDown size={16} />
              </button>
              {showSortMenu && (
                <div className="position-absolute end-0 top-100 mt-2 card-dark shadow-lg z-3 w-100 p-2" style={{ minWidth: '180px' }}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className="d-block w-100 text-start px-3 py-2 border-0 mb-1"
                      style={{ 
                        background: filters.sort === opt.value ? 'var(--primary-subtle)' : 'transparent',
                        color: filters.sort === opt.value ? 'var(--primary-light)' : 'var(--text-primary)',
                        borderRadius: '6px', fontSize: '14px', transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { if (filters.sort !== opt.value) e.currentTarget.style.background = 'var(--surface-3)'; }}
                      onMouseLeave={e => { if (filters.sort !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                      onClick={() => { setFilters(prev => ({ ...prev, sort: opt.value })); setShowSortMenu(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(filters.categories.length > 0 || filters.minPrice || filters.maxPrice) && (
            <div className="d-flex gap-2 flex-wrap mb-4">
              {filters.categories.map(cat => (
                <span key={cat} className="badge d-flex align-items-center gap-1 cursor-pointer"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '100px' }}
                  onClick={() => toggleCategory(cat)}>
                  {categoryLabel(cat)} <X size={12} />
                </span>
              ))}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="badge d-flex align-items-center gap-1 cursor-pointer"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '100px' }}
                  onClick={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}>
                  {(Number(filters.minPrice) || 0).toLocaleString('vi-VN')} đ – {filters.maxPrice ? (Number(filters.maxPrice).toLocaleString('vi-VN') + ' đ') : '∞'} <X size={12} />
                </span>
              )}
              <button className="btn btn-link p-0 text-decoration-none" style={{ color: 'var(--accent)', fontSize: '13px' }} onClick={clearAll}>
                Xóa tất cả
              </button>
            </div>
          )}

          <div className="row g-4">
            {/* Sidebar */}
            <div className="col-lg-3 d-none d-lg-block">
              <div className="card-glass p-4" style={{ position: 'sticky', top: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: '16px' }}>
                    <SlidersHorizontal size={18} color="var(--primary-light)" /> Bộ lọc
                  </span>
                  <button className="btn btn-link p-0 text-decoration-none" style={{ color: 'var(--text-muted)', fontSize: '12px' }} onClick={clearAll}>
                    Thiết lập lại
                  </button>
                </div>

                <div className="divider-purple mb-4"></div>

                {/* Categories */}
                <div className="mb-4">
                  <p className="fw-bold mb-3" style={{ fontSize: '13px', letterSpacing: '1px', color: 'var(--text-secondary)' }}>HÃNG SẢN XUẤT</p>
                  <div className="d-flex flex-column gap-2">
                    {categoryOptions.map(cat => (
                      <div key={cat.slug} className="form-check d-flex align-items-center mb-0">
                        <input
                          className="form-check-input m-0 me-2 cursor-pointer"
                          type="checkbox"
                          id={`cat-${cat.slug}`}
                          checked={filters.categories.includes(cat.slug)}
                          onChange={() => toggleCategory(cat.slug)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <label className="form-check-label cursor-pointer" style={{ fontSize: '14px', color: 'var(--text-primary)' }} htmlFor={`cat-${cat.slug}`}>
                          {cat.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divider-purple mb-4"></div>

                {/* Price Range */}
                <div className="mb-2">
                  <p className="fw-bold mb-3" style={{ fontSize: '13px', letterSpacing: '1px', color: 'var(--text-secondary)' }}>KHOẢNG GIÁ</p>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="input-dark w-100"
                      placeholder="Từ (đ)"
                      value={filters.minPrice}
                      onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                      style={{ padding: '8px', fontSize: '13px', textAlign: 'center' }}
                    />
                    <span style={{ color: 'var(--text-faint)' }}>-</span>
                    <input
                      type="number"
                      className="input-dark w-100"
                      placeholder="Đến (đ)"
                      value={filters.maxPrice}
                      onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                      style={{ padding: '8px', fontSize: '13px', textAlign: 'center' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="col-lg-9">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center h-100" style={{ minHeight: '400px' }}>
                  <div className="spinner-border" role="status"></div>
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="card-glass text-center py-5">
                  <div className="mb-3 d-flex justify-content-center">
                    <SearchIcon size={48} color="var(--text-faint)" opacity={0.5} />
                  </div>
                  <h4 className="fw-bold mb-2">Không tìm thấy sản phẩm nào</h4>
                  <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Hãy thử điều chỉnh từ khóa hoặc bộ lọc để tìm sản phẩm mong muốn.</p>
                  <button className="btn-purple px-4 py-2" onClick={clearAll}>Xóa tất cả bộ lọc</button>
                </div>
              ) : (
                <>
                  <div className="row g-3">
                    {displayProducts.map(product => (
                      <div key={product._id} className="col-6 col-md-4 col-xl-3 animate-fade-up">
                        <div 
                          className="product-card h-100 d-flex flex-column"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          <div className="product-card-img-wrap position-relative" style={{ aspectRatio: '1/1' }}>
                            <img
                              src={product.media?.[0]?.media_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80'}
                              alt={product.name}
                              loading="lazy"
                            />
                            {product.category && (
                              <div className="position-absolute top-0 start-0 m-2 z-2">
                                <span className="px-2 py-1 fw-bold shadow-sm" style={{ fontSize: '9px', letterSpacing: '0.5px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                  {product.category.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 d-flex flex-column flex-grow-1 bg-transparent">
                            <p className="fw-medium mb-1 text-primary-hover flex-grow-1" style={{ fontSize: '13px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {product.name}
                            </p>
                            <div className="d-flex text-warning mb-2 align-items-center gap-1 stars">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < Math.floor(product.average_rating || 4.5) ? "currentColor" : "none"} stroke="currentColor" className={i < (product.average_rating || 4.5) ? '' : 'opacity-25'} />
                              ))}
                              <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>({product.sold_quantity || 120})</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-end mt-1">
                              <div>
                                <span className="fw-bold" style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{product.base_price?.toLocaleString('vi-VN')} đ</span>
                                {product.base_price && <span className="ms-2 text-decoration-line-through" style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{Math.round(product.base_price * 1.2)?.toLocaleString('vi-VN')} đ</span>}
                              </div>
                              <button 
                                className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
                                style={{ 
                                  width: '30px', height: '30px', 
                                  background: addedIds[product._id] ? 'var(--primary)' : 'var(--surface-2)', 
                                  border: `1px solid ${addedIds[product._id] ? 'var(--primary)' : 'var(--border)'}`, 
                                  color: addedIds[product._id] ? '#fff' : 'var(--text-secondary)', 
                                  transition: 'all 0.2s' 
                                }}
                                onClick={(e) => handleAddToCart(e, product._id)}
                                title="Thêm vào giỏ hàng"
                              >
                                {addedIds[product._id] ? <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span> : <ShoppingCart size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                      <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          className="btn d-flex align-items-center justify-content-center fw-bold"
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '8px',
                            background: currentPage === i + 1 ? 'var(--primary)' : 'var(--surface-2)', 
                            border: `1px solid ${currentPage === i + 1 ? 'var(--primary)' : 'var(--border)'}`,
                            color: currentPage === i + 1 ? '#fff' : 'var(--text-primary)'
                          }}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className="btn d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px' }}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
