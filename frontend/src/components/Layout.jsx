import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg)' }}>
      <Header />
      <main className="flex-grow-1 d-flex flex-column w-100">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
