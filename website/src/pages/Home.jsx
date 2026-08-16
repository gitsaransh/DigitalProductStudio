import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Download, ShieldCheck, Star, CheckCircle2, Zap,
  RefreshCw, Users, Cpu, Send, ChevronRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import BlogCard from '../components/BlogCard.jsx';
import TestimonialCard from '../components/TestimonialCard.jsx';
import { PRODUCTS, CATEGORIES, BLOG_POSTS, TESTIMONIALS } from '../data/index.js';


/* ─── WHY CHOOSE US data ─── */
const WHY = [
  {
    icon: <Star size={22} fill="var(--amber)" color="var(--amber)" />,
    title: 'Premium Quality',
    desc: 'Every product is hand-reviewed by professionals and AI-enhanced before release.',
    color: 'var(--amber)',
  },
  {
    icon: <Download size={22} color="var(--emerald)" />,
    title: 'Instant Download',
    desc: 'Get your files seconds after purchase — no waiting, no approval queues.',
    color: 'var(--emerald)',
  },
  {
    icon: <ShieldCheck size={22} color="var(--primary-light)" />,
    title: 'Commercial License',
    desc: 'Use in client work and commercial projects where applicable — clearly marked per product.',
    color: 'var(--primary-light)',
  },
  {
    icon: <RefreshCw size={22} color="var(--cyan)" />,
    title: 'Lifetime Updates',
    desc: 'Selected products receive free updates forever — you pay once, benefit always.',
    color: 'var(--cyan)',
  },
  {
    icon: <Users size={22} color="var(--purple)" />,
    title: 'Human Reviewed',
    desc: 'Every template is tested by real professionals before it reaches you.',
    color: 'var(--purple)',
  },
  {
    icon: <Cpu size={22} color="var(--rose)" />,
    title: 'AI Enhanced',
    desc: 'Built with AI-assisted workflows for maximum accuracy, consistency and speed.',
    color: 'var(--rose)',
  },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [testimonialPage, setTestimonialPage] = useState(1);

  const featured = PRODUCTS.filter(p => p.featured).slice(0, 4);
  const blogPosts = BLOG_POSTS.slice(0, 3);

  const testimonialsPerPage = 3;
  const totalTestimonialPages = Math.ceil(TESTIMONIALS.length / testimonialsPerPage);
  const startIndex = (testimonialPage - 1) * testimonialsPerPage;
  const paginatedTestimonials = TESTIMONIALS.slice(startIndex, startIndex + testimonialsPerPage);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section className="hero">
        {/* Animated background blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="hero-content">
          {/* Eyebrow pill */}
          <div className="hero-eyebrow animate-fade-in">
            <Zap size={12} /> Trusted by 14,000+ professionals worldwide
          </div>

          {/* Headline */}
          <h1 className="hero-title animate-fade-in-up delay-1">
            Premium Digital Products<br />
            <span className="gradient-text-primary">Built for Professionals</span>.
          </h1>

          {/* Category strip */}
          <div className="animate-fade-in-up delay-2" style={{ marginBottom: '32px' }}>
            <p style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: 'var(--text-sub)',
              fontWeight: '600',
              letterSpacing: '0.02em',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              alignItems: 'center',
            }}>
              {['Excel', 'Notion', 'Canva', 'AI', 'Business Templates'].map((cat, i) => (
                <React.Fragment key={cat}>
                  <span style={{ color: 'var(--text-muted)' }}>{cat}</span>
                  {i < 4 && <span style={{ color: 'var(--border-accent)', fontSize: '18px', lineHeight: 1 }}>•</span>}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* CTA */}
          <div className="hero-actions animate-fade-in-up delay-3">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products <ArrowRight size={17} />
            </Link>
            <Link to="/free" className="btn btn-secondary btn-lg">
              <Download size={16} /> Free Samples
            </Link>
          </div>

          {/* Trust strip */}
          <div className="hero-trust animate-fade-in-up delay-4">
            {[
              { icon: <CheckCircle2 size={14} color="var(--emerald)" />, text: 'Instant delivery' },
              { icon: <CheckCircle2 size={14} color="var(--emerald)" />, text: 'Commercial license available' },
              { icon: <CheckCircle2 size={14} color="var(--emerald)" />, text: '7-day money-back guarantee' },
              { icon: <CheckCircle2 size={14} color="var(--emerald)" />, text: 'Human reviewed' },
            ].map(({ icon, text }) => (
              <div key={text} className="hero-trust-item">{icon} {text}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURED CATEGORIES
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Browse by Category</div>
            <h2>Featured Categories</h2>
            <p style={{ marginTop: '10px', maxWidth: '480px', margin: '10px auto 0', fontSize: '15px' }}>
              Everything you need in one place — pick your format and dive in.
            </p>
          </div>

          <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.slug} to="/categories" style={{ textDecoration: 'none' }}>
                <div
                  className="glass category-card-premium animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {/* Gradient background wash */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: cat.gradient,
                    pointerEvents: 'none',
                    borderRadius: 'inherit',
                  }} />

                  <div className="category-card-icon" style={{
                    background: cat.color.startsWith('#') ? `${cat.color}15` : 'rgba(99,102,241,0.12)',
                    border: `1px solid ${cat.color.startsWith('#') ? `${cat.color}30` : 'rgba(99,102,241,0.25)'}`,
                    color: cat.color.startsWith('#') ? cat.color : 'var(--primary-light)',
                  }}>
                    {cat.icon}
                  </div>
                  <div className="category-card-title">{cat.name}</div>
                  <div className="category-card-count">{cat.count} products</div>
                  <div className="category-card-link" style={{ color: cat.color.startsWith('#') ? cat.color : 'var(--primary-light)' }}>
                    Browse <ChevronRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{
        background: 'rgba(255,255,255,0.015)',
        borderTop: '1px solid var(--border-glass)',
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Why Choose Us</div>
            <h2>Built Different, By Design.</h2>
            <p style={{ marginTop: '10px', maxWidth: '500px', margin: '10px auto 0', fontSize: '15px' }}>
              We combine AI efficiency with human craft to deliver digital products that actually perform.
            </p>
          </div>

          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {WHY.map((item, i) => (
              <div
                key={item.title}
                className="glass why-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="why-card-icon" style={{
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                }}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="why-card-title">{item.title}</h4>
                  <p className="why-card-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section className="section" style={{ borderBottom: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Testimonials</div>
            <h2>Loved by Creators & Builders</h2>
            <p style={{ marginTop: '10px', maxWidth: '480px', margin: '10px auto 0', fontSize: '15px' }}>
              See how digital product publishers and creators are scaling their workflows with our templates.
            </p>
          </div>

          <div className="grid-3">
            {paginatedTestimonials.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>

          {/* Testimonial Pagination Controls */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px', 
            marginTop: '36px' 
          }}>
            <button 
              onClick={() => setTestimonialPage(p => Math.max(p - 1, 1))}
              disabled={testimonialPage === 1}
              className="btn btn-outline btn-sm"
              style={{ 
                padding: '6px 12px',
                minWidth: '36px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: testimonialPage === 1 ? 0.35 : 1,
                cursor: testimonialPage === 1 ? 'not-allowed' : 'pointer',
                borderColor: 'var(--border-glass)',
                color: 'white',
              }}
            >
              &lt;
            </button>
            
            {[...Array(totalTestimonialPages)].map((_, i) => {
              const pageNum = i + 1;
              const isActive = testimonialPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setTestimonialPage(pageNum)}
                  className={isActive ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  style={{
                    padding: '6px 12px',
                    minWidth: '36px',
                    height: '34px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: isActive ? 'linear-gradient(135deg, var(--primary), var(--purple))' : 'rgba(255,255,255,0.03)',
                    borderColor: isActive ? 'transparent' : 'var(--border-glass)',
                    color: 'white',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button 
              onClick={() => setTestimonialPage(p => Math.min(p + 1, totalTestimonialPages))}
              disabled={testimonialPage === totalTestimonialPages}
              className="btn btn-outline btn-sm"
              style={{ 
                padding: '6px 12px',
                minWidth: '36px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: testimonialPage === totalTestimonialPages ? 0.35 : 1,
                cursor: testimonialPage === totalTestimonialPages ? 'not-allowed' : 'pointer',
                borderColor: 'var(--border-glass)',
                color: 'white',
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════════════ */}
      <section className="section-sm">
        <div className="container">
          <div
            className="glass"
            style={{
              padding: '48px 40px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.07))',
              borderColor: 'var(--border-accent)',
            }}
          >
            {/* Glow orb */}
            <div style={{
              position: 'absolute',
              width: '300px', height: '300px',
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative' }}>
              <span className="badge badge-primary" style={{ marginBottom: '16px', display: 'inline-flex' }}>
                📩 Newsletter
              </span>
              <h2 style={{ marginBottom: '10px', fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
                Get new templates every week.
              </h2>
              <p style={{ marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px', fontSize: '15px' }}>
                Fresh digital products, early access deals and creator tips — delivered free to your inbox.
              </p>

              {!subscribed ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    maxWidth: '440px',
                    margin: '0 auto',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <input
                    className="form-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ flex: 1, minWidth: '220px' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ gap: '7px', whiteSpace: 'nowrap' }}>
                    <Send size={14} /> Subscribe Free
                  </button>
                </form>
              ) : (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  background: 'rgba(16,185,129,0.12)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--emerald)',
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  <CheckCircle2 size={16} /> You're in! First email arrives this week.
                </div>
              )}

              <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginTop: '14px' }}>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BLOG — SEO
      ═══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <div className="section-label">From the Blog</div>
              <h2>Guides for Digital Creators</h2>
              <p style={{ marginTop: '6px', fontSize: '14px', maxWidth: '400px' }}>
                SEO-rich guides on selling digital products, using AI tools and scaling your income.
              </p>
            </div>
            <Link to="/blog" className="btn btn-outline btn-sm">
              All Articles <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid-3">
            {blogPosts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
