import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ConfigurationBanner from './ConfigurationBanner';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <ConfigurationBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;