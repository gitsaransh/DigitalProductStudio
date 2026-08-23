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
import CategoryDetail from './pages/CategoryDetail.jsx';
import Bundles from './pages/Bundles.jsx';
import FreeResources from './pages/FreeResources.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';
import FAQ from './pages/FAQ.jsx';
import Support from './pages/Support.jsx';
import Contact from './pages/Contact.jsx';
import { Privacy, Terms, RefundPolicy, Licensing } from './pages/Legal.jsx';
import { Affiliate } from './pages/Future.jsx';
import Membership from './pages/Membership.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Login from './pages/Login.jsx';
import Account from './pages/Account.jsx';
import MyOrders from './pages/MyOrders.jsx';
import { AuthProvider } from './components/AuthContext.jsx';

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

// Sidebar width — single source of truth used by AdminLayout inline styles.
// Matches --sidebar-width in admin.css. Inline styles bypass shared #root flex cascade.
const ADMIN_SIDEBAR_W = 240;

// Layout for Operator Admin Panel (Left dark sidebar layout)
// D-010: Wrapped in AdminAuthGate — requires password before rendering.
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' && window.innerWidth <= 850
  );

  React.useEffect(() => {
    const handleToggle = () => setSidebarOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 850);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <AdminAuthGate>
      <div
        className={`admin-layout${sidebarOpen ? ' sidebar-open' : ''}`}
        style={{ display: 'block', width: '100%', minHeight: '100vh' }}
      >
        {sidebarOpen && <div onClick={closeSidebar} className="sidebar-backdrop" />}
        <Sidebar onClose={closeSidebar} />
        {/* Inline marginLeft is the single authoritative offset — immune to CSS cascade */}
        <main
          className="admin-main"
          style={{
            marginLeft: isMobile ? 0 : `${ADMIN_SIDEBAR_W}px`,
            width: isMobile ? '100%' : `calc(100% - ${ADMIN_SIDEBAR_W}px)`,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
          }}
        >
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
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Storefront Public Client Routes */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
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
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<MyOrders />} />
          </Route>

          {/* Admin Operations Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
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
    </AuthProvider>
  );
}

