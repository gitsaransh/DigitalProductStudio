import React, { useState } from 'react';
import { Search, Filter, Star, Globe } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import CTABanner from '../components/CTABanner.jsx';
import { PRODUCTS, CATEGORIES } from '../data/index.js';

export default function Products() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  const filtered = PRODUCTS
    .filter(p => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'all' || p.categorySlug === activeCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.featured - a.featured;
    });

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>Catalog</span>
          <h1>All Digital Products</h1>
          <p>Instant downloads engineered by AI — planners, templates, prompt vaults, and more.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Filter Bar */}
          <div className="glass" style={{ padding: '20px 24px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.slug}
                  className={`btn btn-sm ${activeCategory === c.slug ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveCategory(c.slug)}
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

          {/* Results Count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> products
            </p>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid-auto">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>
              <Search size={36} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p>No products match your search. Try a different keyword or category.</p>
            </div>
          )}

          <div style={{ marginTop: '64px' }}>
            <CTABanner
              title="Can't Find What You Need?"
              subtitle="Request a specific product or join our waitlist for upcoming releases."
              btnText="Contact Us"
              btnTo="/contact"
            />
          </div>
        </div>
      </section>
    </>
  );
}
