import React from 'react';
import { Link } from 'react-router-dom';
import { Diamond } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--surface)', position: 'relative', marginTop: 'auto' }}>
      <div style={{ height: '2px', background: 'var(--grad-primary)', width: '100%' }}></div>
      
      <div className="container-xl py-5 px-4">
        <div className="row g-5 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="col-lg-4 pe-lg-5">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="d-flex align-items-center justify-content-center" 
                style={{ width: '36px', height: '36px', background: 'var(--grad-primary)', borderRadius: '10px', boxShadow: '0 0 15px var(--primary-glow)' }}>
                <Diamond size={20} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '24px', color: 'var(--text-primary)' }}>
                UTEShop
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' }}>
              Elevating the academic multi-vendor experience with dark modern aesthetics. 
              Discover premium products curated exclusively for our university community.
            </p>
            <div className="d-flex gap-3">
              {['fa-twitter', 'fa-instagram', 'fa-github'].map((iconClass, idx) => (
                <a key={idx} href="#" 
                  className="d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '40px', height: '40px', 
                    background: 'var(--surface-2)', 
                    borderRadius: '50%',
                    color: 'var(--text-secondary)',
                    transition: 'all var(--transition)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.boxShadow = '0 0 15px var(--primary-glow)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <i className={`fa-brands ${iconClass}`} style={{ fontSize: '18px' }}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div className="col-6 col-md-3 col-lg-2 offset-lg-1">
            <h6 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '20px' }}>Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {['New Arrivals', 'Featured Items', 'Top Sellers', 'Collections'].map(item => (
                <li key={item}>
                  <Link to="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '20px' }}>Company</h6>
            <ul className="list-unstyled d-flex flex-column gap-3">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <Link to="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-6 col-lg-3">
            <h6 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '20px' }}>Subscribe</h6>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              Get the latest updates on new products and upcoming sales.
            </p>
            <div className="d-flex position-relative">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="input-dark w-100 ps-3" 
                style={{ height: '44px', paddingRight: '48px', fontSize: '14px' }}
              />
              <button 
                className="btn position-absolute top-0 end-0 h-100 d-flex align-items-center justify-content-center border-0"
                style={{ background: 'transparent', color: 'var(--primary-light)', width: '44px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--primary-light)'}
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3" 
          style={{ color: 'var(--text-faint)', fontSize: '12px', letterSpacing: '0.5px' }}>
          <div>© {new Date().getFullYear()} UTESHOP. ALL RIGHTS RESERVED.</div>
          <div className="d-flex gap-4">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              SYSTEM STATUS: ONLINE
            </span>
            <span>V2.0 REDESIGN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
