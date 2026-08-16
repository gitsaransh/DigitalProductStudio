import React from 'react';
import BlogCard from '../components/BlogCard.jsx';
import CTABanner from '../components/CTABanner.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { BLOG_POSTS } from '../data/index.js';

export default function Blog() {
  const featured = BLOG_POSTS.find(p => p.featured);
  const rest = BLOG_POSTS.filter(p => !p.featured);

  return (
    <>
      <div className="page-header">
        <div className="container page-header-content">
          <Breadcrumb crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Blog' },
          ]} />
          <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>Blog</span>
          <h1>Creator Insights & Guides</h1>
          <p>Practical strategies for building, scaling, and monetizing your digital product business.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Featured Post */}
          {featured && (
            <div className="glass animate-fade-in-up" style={{ marginBottom: '48px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 0 }}>
              <div style={{ background: featured.coverGradient, minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
                {featured.coverIcon}
              </div>
              <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
                  <span className={`badge ${featured.categoryColor}`}>{featured.category}</span>
                  <span className="badge badge-amber">Featured</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{featured.readTime}</span>
                </div>
                <h2 style={{ color: 'white', marginBottom: '12px', lineHeight: '1.3' }}>{featured.title}</h2>
                <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>{featured.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{featured.date}</span>
                  <a href={`/blog/${featured.slug}`} className="btn btn-primary btn-sm">Read Article →</a>
                </div>
              </div>
            </div>
          )}

          <div className="grid-3">
            {rest.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
          </div>

          <div style={{ marginTop: '64px' }}>
            <CTABanner
              title="Want to Stay Updated?"
              subtitle="Subscribe to get new articles, product drops, and creator tips in your inbox."
              btnText="Contact Us"
              btnTo="/contact"
            />
          </div>
        </div>
      </section>
    </>
  );
}
