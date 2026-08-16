import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb
 *
 * Props:
 *   crumbs — array of { label: string, to?: string }
 *             Last item is the current page (no link, no "to").
 *
 * Also injects a JSON-LD BreadcrumbList for SEO.
 *
 * Usage:
 *   <Breadcrumb crumbs={[
 *     { label: 'Home', to: '/' },
 *     { label: 'Categories', to: '/categories' },
 *     { label: 'Excel Templates' },          // current page — no `to`
 *   ]} />
 */
export default function Breadcrumb({ crumbs = [] }) {
  if (!crumbs.length) return null;

  const BASE = 'https://digitalproductstudio.in';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.to ? { item: `${BASE}${c.to}` } : {}),
    })),
  };

  return (
    <>
      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          color: 'var(--text-sub)',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i === 0 && (
                <Home
                  size={12}
                  style={{ marginRight: '2px', opacity: 0.6, flexShrink: 0 }}
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  style={{ color: 'white', fontWeight: '600' }}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  style={{
                    color: 'var(--text-sub)',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-sub)')}
                >
                  {crumb.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight
                  size={12}
                  style={{ opacity: 0.4, flexShrink: 0 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
}
