import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCart } from '../redux/cartSlice';
import { ShoppingCart, Search, Bell, Diamond, Menu, X } from 'lucide-react';

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      dispatch(getCart());
    }
  }, [dispatch, user]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Marketplace', path: '/search' },
    { name: 'Collections', path: '/collections' },
    { name: 'Orders', path: '/orders' }
  ];

  return (
    <>
      <style>{`
        .header-glass {
          background: ${scrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(249, 250, 251, 0.7)'};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid ${scrolled ? 'var(--border-strong)' : 'transparent'};
          transition: all 0.3s ease;
        }
        .nav-link-custom {
          color: var(--text-primary);
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
          position: relative;
          padding: 8px 0;
          transition: color 0.3s ease;
        }
        .nav-link-custom:hover, .nav-link-custom.active {
          color: var(--primary-light);
        }
        .nav-link-custom::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background: var(--grad-primary);
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .nav-link-custom:hover::after, .nav-link-custom.active::after {
          width: 100%;
        }
        .logo-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 22px;
          background: var(--grad-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .icon-btn {
          color: var(--text-secondary);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .icon-btn:hover {
          color: var(--primary-light);
          transform: translateY(-2px);
        }
      `}</style>

      <header className="fixed-top w-100 header-glass" style={{ zIndex: 1030 }}>
        <div className="container-xl d-flex align-items-center justify-content-between py-3 px-4">
          
          {/* Logo & Desktop Nav */}
          <div className="d-flex align-items-center gap-5">
            <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
              <div className="d-flex align-items-center justify-content-center" 
                style={{ width: '32px', height: '32px', background: 'var(--grad-primary)', borderRadius: '8px', boxShadow: '0 0 15px var(--primary-glow)' }}>
                <Diamond size={18} color="#fff" />
              </div>
              <span className="logo-text">UTEShop</span>
            </Link>

            <nav className="d-none d-md-flex gap-4">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`nav-link-custom ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions & User */}
          <div className="d-flex align-items-center gap-4">
            
            <div className="d-none d-sm-flex align-items-center gap-3 pe-3" style={{ borderRight: '1px solid var(--border)' }}>
              <Link to="/search" className="icon-btn text-decoration-none">
                <Search size={20} />
              </Link>
              <div className="icon-btn position-relative">
                <Bell size={20} />
                <span className="position-absolute top-0 start-100 translate-middle p-1 rounded-circle" style={{ width: '8px', height: '8px', background: 'var(--accent)' }}></span>
              </div>
              <Link to="/cart" className="icon-btn text-decoration-none position-relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" 
                    style={{ background: 'var(--grad-amber)', fontSize: '10px', border: '2px solid var(--surface)' }}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {user ? (
              <Link to="/user/profile" className="d-flex align-items-center gap-2 text-decoration-none">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.full_name}&background=7C3AED&color=fff`} 
                  alt={user.full_name} 
                  className="rounded-circle" 
                  style={{ width: '36px', height: '36px', objectFit: 'cover', border: '2px solid var(--border-strong)' }} 
                />
                <span className="d-none d-lg-block fw-semibold" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                  {user.full_name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <div className="d-none d-sm-flex align-items-center gap-3">
                <Link to="/login" className="text-decoration-none" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>Log In</Link>
                <Link to="/register" className="btn-purple px-4 py-2" style={{ fontSize: '14px' }}>Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button 
              className="d-md-none btn p-0 border-0" style={{ color: 'var(--text-primary)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="d-md-none" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <div className="container-xl px-4 py-3 d-flex flex-column gap-3">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="text-decoration-none fw-medium"
                  style={{ color: location.pathname.startsWith(link.path) ? 'var(--primary-light)' : 'var(--text-primary)' }}
                >
                  {link.name}
                </Link>
              ))}
              {!user && (
                <div className="d-flex flex-column gap-2 mt-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <Link to="/login" className="btn btn-outline-purple w-100 justify-content-center">Log In</Link>
                  <Link to="/register" className="btn-purple w-100 justify-content-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Spacer to prevent content from hiding under fixed header */}
      <div style={{ height: '70px' }}></div>
    </>
  );
};

export default Header;
