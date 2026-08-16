import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AdminAuthGate from './components/AdminAuthGate.jsx'; // D-010

// Scoped Stylesheets
import './admin/admin.css';
import './coo/coo.css';

// Public Storefront Pages
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Bundles from './pages/Bundles.jsx';
import FreeResources from './pages/FreeResources.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';
import FAQ from './pages/FAQ.jsx';
import Support from './pages/Support.jsx';
import Contact from './pages/Contact.jsx';
import { Privacy, Terms, RefundPolicy, Licensing } from './pages/Legal.jsx';
import { Affiliate, Account } from './pages/Future.jsx';
import Membership from './pages/Membership.jsx';

// Scoped Admin Panel Pages & Components
import Sidebar from './admin/components/Sidebar.jsx';
import AdminDashboard from './admin/pages/Dashboard.jsx';
import AdminProducts from './admin/pages/Products.jsx';
import AdminOrders from './admin/pages/Orders.jsx';
import AdminAnalytics from './admin/pages/Analytics.jsx';
import AdminCustomers from './admin/pages/Customers.jsx';
import AdminMarketing from './admin/pages/Marketing.jsx';
import AdminBlog from './admin/pages/Blog.jsx';
import AdminSEO from './admin/pages/SEO.jsx';
import AdminEmails from './admin/pages/Emails.jsx';
import AdminDownloads from './admin/pages/Downloads.jsx';
import AdminSettings from './admin/pages/Settings.jsx';

// Scoped COO Executive Dashboard Page
import CooDashboard from './coo/Dashboard.jsx';

function ScrollToTop() {
  const { pathname } = window.location;
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Layout for Public Storefront (Navbar & Footer included)
function StorefrontLayout() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Layout for Operator Admin Panel (Left dark sidebar layout)
// D-010: Wrapped in AdminAuthGate — requires password before rendering.
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <AdminAuthGate>
      <div className={`admin-layout${sidebarOpen ? ' sidebar-open' : ''}`}>
        {sidebarOpen && <div onClick={closeSidebar} className="sidebar-backdrop" />}
        <Sidebar onClose={closeSidebar} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </AdminAuthGate>
  );
}

// Layout for Executive COO Dashboard (Full-screen glassmorphism layout)
function CooLayout() {
  return (
    <div className="coo-layout">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Storefront Public Client Routes */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/free" element={<FreeResources />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/licensing" element={<Licensing />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* Admin Operations Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="marketing" element={<AdminMarketing />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="seo" element={<AdminSEO />} />
          <Route path="emails" element={<AdminEmails />} />
          <Route path="downloads" element={<AdminDownloads />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Executive COO Dashboard Routes */}
        <Route path="/coo" element={<CooLayout />}>
          <Route index element={<CooDashboard />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '100px 24px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>404</div>
            <h2 style={{ color: 'white', marginBottom: '12px' }}>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '24px' }}>← Back to Home</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

