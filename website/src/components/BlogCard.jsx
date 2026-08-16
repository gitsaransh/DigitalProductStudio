import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BlogCard({ post, index = 0 }) {
  return (
    <div
      className="glass blog-card animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s`, overflow: 'hidden' }}
    >
      <div
        className="blog-card-cover"
        style={{ background: post.coverGradient, borderRadius: '12px 12px 0 0' }}
      >
        <span style={{ fontSize: '48px' }}>{post.coverIcon}</span>
      </div>
      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span className={`badge ${post.categoryColor}`}>{post.category}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{post.readTime}</span>
        </div>
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.excerpt}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{post.date}</span>
          <Link
            to={`/blog/${post.slug}`}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', color: 'var(--primary-light)', transition: 'gap 0.2s' }}
          >
            Read More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
