import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, PackageOpen, FileSearch } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import CTABanner from '../components/CTABanner.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { PRODUCTS, CATEGORIES, EXCEL_SUBCATEGORIES } from '../data/index.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Only show visible categories in the filter bar
const VISIBLE_CATEGORIES = CATEGORIES.filter(c => c.visible);

/**
 * Maps a free-text product category (e.g. "AI Prompts & Automation Kits")
 * to one of the fixed CATEGORIES slugs (e.g. "ai-prompts") used for filtering.
 * Falls back to keyword matching, then a naive slugify, so unknown categories
 * still render instead of silently disappearing from the catalog.
 */
function deriveCategorySlug(categoryName) {
  if (!categoryName) return '';
  const norm = categoryName.toLowerCase();

  const exact = CATEGORIES.find(c => c.name.toLowerCase() === norm);
  if (exact) return exact.slug;

  const byKeyword = CATEGORIES.find(c => norm.includes(c.slug.replace(/-/g, ' ')));
  if (byKeyword) return byKeyword.slug;

  if (norm.includes('excel') || norm.includes('spreadsheet')) return 'excel';
  if (norm.includes('ai') || norm.includes('prompt')) return 'ai-prompts';
  if (norm.includes('notion')) return 'notion';
  if (norm.includes('canva')) return 'canva';

  return norm.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Normalises an API product record to the shape expected by ProductCard.
 * Falls back to sensible defaults so missing fields don't break the UI.
 */
function normaliseApiProduct(p) {
  return {
    id: p.id || p.sku,
    sku: p.sku,
    slug: p.slug,
    title: p.title,
    subtitle: p.short_description || p.subtitle || '',
    category: p.category,
    categorySlug: deriveCategorySlug(p.category),
    price: p.price ?? (p.pricing?.base_price ?? 0),
    originalPrice: p.compare_at_price ?? (p.pricing?.compare_at_price ?? null),
    rating: p.rating ?? 5.0,
    reviews: p.reviews ?? 0,
    downloads: p.downloads ?? 0,
    tags: p.tags ?? [],
    localizations: p.localizations ?? ['en'],
    lifecycle_state: p.lifecycle_state ?? p.status ?? 'draft',
    featured: p.featured ?? false,
    isBestseller: p.isBestseller ?? false,
    isFree: p.isFree ?? false,
    description: p.description ?? p.long_description ?? '',
    includes: p.includes ?? [],
  };
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  // API-fetched products. Starts as null (loading), then resolves to array.
  const [apiProducts, setApiProducts] = useState(null);

  // Fetch live catalog from API on mount; fall back to static data on error.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/products?limit=200`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && Array.isArray(data.products)) {
          setApiProducts(data.products.map(normaliseApiProduct));
        }
      })
      .catch(() => {
        // API offline — silently fall back to static data
        if (!cancelled) setApiProducts([]);
      });
    return () => { cancelled = true; };
  }, []);

  // Use API products when loaded, otherwise fall back to static list
  const SOURCE_PRODUCTS = (apiProducts && apiProducts.length > 0) ? apiProducts : PRODUCTS;

  // Read category & sub from URL query params
  const activeCategory = searchParams.get('category') || 'all';
  const activeSub = searchParams.get('sub') || 'all';

  const setCategory = (slug) => {
    if (slug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  const setSub = (slug) => {
    if (slug === 'all') {
      setSearchParams({ category: activeCategory });
    } else {
      setSearchParams({ category: activeCategory, sub: slug });
    }
  };

  // Excel subcategory filter bar — only shown when browsing Excel
  const showSubFilter = activeCategory === 'excel';

  const filtered = SOURCE_PRODUCTS
    .filter(p => {
      // Only show products in visible categories
      const catIsVisible = VISIBLE_CATEGORIES.some(c => c.slug === p.categorySlug) || p.categorySlug === 'excel';
      if (!catIsVisible) return false;

      const matchSearch = !search
        || p.title.toLowerCase().includes(search.toLowerCase())
        || p.category.toLowerCase().includes(search.toLowerCase());

      const matchCat = activeCategory === 'all' || p.categorySlug === activeCategory;

      // Sub-category filter for excel (uses p.subcategorySlug if set, otherwise pass all)
      const matchSub = !showSubFilter || activeSub === 'all' || p.subcategorySlug === activeSub;

      return matchSearch && matchCat && matchSub;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.featured - a.featured;
    });

  // Active category meta for breadcrumb / heading
  const activeCat = VISIBLE_CATEGORIES.find(c => c.slug === activeCategory);
  const activeName = activeCat ? activeCat.name : 'All Products';

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          {/* Breadcrumb — built dynamically from URL params */}
          {(() => {
            const crumbs = [{ label: 'Home', to: '/' }, { label: 'Categories', to: '/categories' }];
            if (activeCat) crumbs.push({ label: activeCat.name, to: `/categories/${activeCat.slug}` });
            crumbs.push({ label: 'Products' });
            return <Breadcrumb crumbs={crumbs} />;
          })()}

          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Catalog</span>
          <h1>{activeCat ? `${activeCat.icon} ${activeCat.name}` : 'All Digital Products'}</h1>
          <p>
            {activeCat
              ? activeCat.description
              : 'Instant downloads engineered by AI — planners, templates, prompt vaults, and more.'}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">

          {/* ── Filter Bar ─────────────────────────────────────────────── */}
          <div className="glass" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Search templates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category tabs — only visible categories */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCategory('all')}
              >
                All
              </button>
              {VISIBLE_CATEGORIES.map(c => (
                <button
                  key={c.slug}
                  className={`btn btn-sm ${activeCategory === c.slug ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCategory(c.slug)}
                >
                  {c.icon} {c.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* ── Excel Subcategory Filter ────────────────────────────────── */}
          {showSubFilter && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button
                className={`btn btn-sm ${activeSub === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSub('all')}
              >
                All Subcategories
              </button>
              {EXCEL_SUBCATEGORIES.map(sub => (
                <button
                  key={sub.slug}
                  className={`btn btn-sm ${activeSub === sub.slug ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSub(sub.slug)}
                >
                  {sub.icon} {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* ── Results Count ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> products
            </p>
          </div>

          {/* ── Grid or Empty State ─────────────────────────────────────── */}
          {filtered.length > 0 ? (
            <div className="grid-auto">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          ) : (
            /* Premium Empty State matching Mockup */
            <div style={{
              textAlign: 'center',
              padding: '80px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glass)',
              borderRadius: '20px',
              maxWidth: '800px',
              margin: '0 auto 32px',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-sub)',
                marginBottom: '8px',
              }}>
                <FileSearch size={32} />
              </div>
              <h3 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0 }}>
                No products available yet
              </h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '15px', maxWidth: '440px', margin: 0, lineHeight: '1.6' }}>
                We're preparing the first premium collections for launch. Explore categories or check out our free samples.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/categories" className="btn btn-secondary" style={{
                  background: 'transparent',
                  border: '1px solid var(--border-glass)',
                  color: 'white',
                }}>
                  Back to Categories
                </Link>
                <Link to="/free" className="btn btn-primary">
                  Free Resources
                </Link>
              </div>
            </div>
          )}

          <div style={{ marginTop: '64px' }}>
            <CTABanner
              title="Can't Find What You Need?"
              subtitle="Request a specific template or join the waitlist for upcoming releases."
              btnText="Contact Us"
              btnTo="/contact"
            />
          </div>
        </div>
      </section>
    </>
  );
}
