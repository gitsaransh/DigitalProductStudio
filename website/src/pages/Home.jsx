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

const VISIBLE_CATEGORIES = CATEGORIES.filter(c => c.visible);


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
      <section className="hero" style={{ padding: '80px 0 100px' }}>
        {/* Animated background blobs */}
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}>
            <div>
              {/* Eyebrow pill */}
              <div className="hero-eyebrow animate-fade-in" style={{ display: 'inline-flex', marginBottom: '20px' }}>
                <Zap size={12} style={{ marginRight: '6px' }} /> FLAGSHIP RELEASE — VERSION 1.0
              </div>

              {/* Headline */}
              <h1 className="hero-title animate-fade-in-up delay-1" style={{ fontSize: 'clamp(32px, 5vw, 54px)', lineHeight: '1.1', marginBottom: '20px', textAlign: 'left' }}>
                Ultimate Finance OS
              </h1>
              
              <p className="animate-fade-in-up delay-2" style={{
                fontSize: '17px',
                color: 'var(--text-muted)',
                lineHeight: '1.6',
                marginBottom: '32px',
                maxWidth: '580px',
                textAlign: 'left'
              }}>
                The complete Excel operating system to track expenses, manage budgets, analyze cash flow, and grow your net worth. Engineered for high-performance creators and business owners.
              </p>

              {/* CTA */}
              <div className="hero-actions animate-fade-in-up delay-3" style={{ justifyContent: 'flex-start' }}>
                <Link to="/products" className="btn btn-primary btn-lg">
                  Explore Templates <ArrowRight size={17} style={{ marginLeft: '6px' }} />
                </Link>
                <Link to="/free" className="btn btn-secondary btn-lg">
                  <Download size={16} style={{ marginRight: '6px' }} /> Free Samples
                </Link>
              </div>

              {/* Trust strip */}
              <div className="hero-trust animate-fade-in-up delay-4" style={{ justifyContent: 'flex-start', marginTop: '40px', gap: '24px' }}>
                {[
                  { icon: <CheckCircle2 size={16} color="var(--emerald)" />, text: 'Instant Download' },
                  { icon: <CheckCircle2 size={16} color="var(--emerald)" />, text: 'Lifetime Updates' },
                  { icon: <CheckCircle2 size={16} color="var(--emerald)" />, text: 'Excel Compatible' },
                ].map(({ icon, text }) => (
                  <div key={text} className="hero-trust-item" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-sub)' }}>{icon} {text}</div>
                ))}
              </div>
            </div>

            {/* Visual card representation */}
            <div className="animate-fade-in delay-2" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="glass" style={{
                padding: '36px',
                borderRadius: '24px',
                border: '1px solid rgba(16,185,129,0.3)',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(0,0,0,0.6) 100%)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                width: '100%',
                maxWidth: '420px',
                position: 'relative'
              }}>
                <span className="badge badge-emerald" style={{ marginBottom: '16px' }}>Excel Template</span>
                <h3 style={{ color: 'white', fontSize: '26px', fontWeight: '900', margin: '0 0 8px', letterSpacing: '-0.5px' }}>DPS-XLS-001</h3>
                <p style={{ color: 'var(--text-sub)', fontSize: '14px', margin: '0 0 24px', fontWeight: '600' }}>Comprehensive Finance Tracker Dashboard</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                  {['20+ interactive charts', 'Automated P&L builder', 'Light/Dark visual modes'].map(feat => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={14} color="var(--emerald)" /> {feat}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '30px', color: 'white', fontWeight: '900' }}>$19.00</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-sub)', textDecoration: 'line-through', marginLeft: '8px' }}>$39.00</span>
                  </div>
                  <Link to="/products/ultimate-finance-os" className="btn btn-primary btn-sm">Get It Now →</Link>
                </div>
              </div>
            </div>
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
            {VISIBLE_CATEGORIES.map((cat, i) => (
              <Link key={cat.slug} to={`/categories/${cat.slug}`} style={{ textDecoration: 'none' }}>
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
                  {cat.collectionLabel ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: cat.color.startsWith('#') ? cat.color : 'var(--emerald)' }}>
                        {cat.collectionLabel}
                      </div>
                      <div className="category-card-count">{cat.countLabel}</div>
                    </div>
                  ) : (
                    <div className="category-card-count">{cat.count} products</div>
                  )}
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
