import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Analytics from './pages/Analytics.jsx';
import Customers from './pages/Customers.jsx';
import Marketing from './pages/Marketing.jsx';
import Blog from './pages/Blog.jsx';
import SEO from './pages/SEO.jsx';
import Emails from './pages/Emails.jsx';
import Downloads from './pages/Downloads.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  // Close sidebar on navigation (using click interception or click-to-close overlay)
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <BrowserRouter>
      <div className={`admin-layout${sidebarOpen ? ' sidebar-open' : ''}`}>
        {sidebarOpen && <div onClick={closeSidebar} className="sidebar-backdrop" />}
        <Sidebar onClose={closeSidebar} />
        <main className="admin-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/seo" element={<SEO />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch-all */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--text-sub)' }}>
                <h2>404 — Section Not Found</h2>
                <p style={{ marginTop: '8px' }}>This internal panel section does not exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
