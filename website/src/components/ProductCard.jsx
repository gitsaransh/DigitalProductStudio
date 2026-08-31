import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Star, Globe } from 'lucide-react';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export default function ProductCard({ product, index = 0 }) {
  const delay = Math.min(index * 0.08, 0.48);
  const currencySymbol = CURRENCY_SYMBOLS[product.currency] ?? `${product.currency ?? 'USD'} `;
  return (
    <div
      className="glass product-card animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header Row */}
      <div className="product-card-top">
        <span className={`badge ${product.isBestseller ? 'badge-amber' : 'badge-primary'}`}>
          {product.isBestseller ? '🏆 Bestseller' : product.category}
        </span>
        {product.originalPrice && (
          <span className="badge badge-rose" style={{ fontSize: '10px' }}>
            -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Category */}
      <div className="product-category">{product.category}</div>

      {/* Title */}
      <h3 className="product-title">{product.title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '14px', lineHeight: '1.5' }}>
        {product.subtitle}
      </p>

      {/* Languages */}
      {product.localizations && product.localizations.length > 1 && (
        <div className="product-langs">
          <Globe size={12} color="var(--text-sub)" />
          {product.localizations.map(lang => (
            <span key={lang} className="product-lang-chip">{lang}</span>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div className="product-footer">
        <div>
          <div className="product-price-sub">Instant Download</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="product-price">{currencySymbol}{product.price}</span>
            {product.originalPrice && (
              <span style={{ fontSize: '13px', color: 'var(--text-sub)', textDecoration: 'line-through' }}>
                {currencySymbol}{product.originalPrice}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div className="product-rating">
            <Star size={13} fill="var(--amber)" />
            {product.rating} ({product.reviews})
          </div>
          <Link
            to={`/products/${product.slug}`}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Download size={13} /> Get It
          </Link>
        </div>
      </div>
    </div>
  );
}
