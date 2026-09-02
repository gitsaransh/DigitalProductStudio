// Vercel Edge Middleware — runs before static/rewrite resolution on every request.
//
// Does two things, both aimed at making the site legible to agents/crawlers
// instead of just browsers:
//
// 1. Real 404s. website/vercel.json rewrites every path to /index.html so the
//    SPA can handle client-side routing — which means, unfixed, literally any
//    URL (typos, bots probing /wp-admin, an agent guessing a path) returns
//    HTTP 200 with the app shell. That's actively misleading to a crawler: it
//    reads as "this page exists." Anything not in the known-routes list below
//    gets a real 404 with a short markdown body pointing at the sitemap.
//
// 2. `Accept: text/markdown` negotiation on known pages. An agent that asks
//    for markdown gets a small, real markdown summary instead of the JS app
//    shell it can't execute. Only the markdown branch sets `Vary: Accept` —
//    intentionally: the HTML branch is a bare pass-through of the same
//    static index.html Vercel always serves regardless of Accept, so its
//    content never actually varies by that header and giving it a Vary
//    header would be inaccurate. Only add Vary to a response whose content
//    genuinely depends on the varied header.
//
// Static assets (anything with a file extension — .js, .css, .png, .xml, …)
// are never touched here; Vercel's own static file serving already returns a
// correct native 404 for genuinely missing assets.

// No `config.matcher` export: that's a Next.js convention and this is a
// plain Vite/static deployment. Vercel's documented default for Edge
// Middleware with no matcher is "run on every request," which is what we
// want — the isStaticAsset() check below is what keeps this cheap for
// asset requests.

const SITE = 'https://www.digitalproductstudio.in';

// Exact-match static routes, each with a short, honest description (not
// scraped marketing copy) used for the markdown-negotiated response.
const PAGES = {
  '/': { title: 'Digital Product Studio', desc: 'Premium AI-assisted digital planners, templates, and prompt vaults — instant download, no approval queue.' },
  '/products': { title: 'All Products', desc: 'The full product catalog.' },
  '/categories': { title: 'Categories', desc: 'Browse the catalog by category.' },
  '/bundles': { title: 'Bundles', desc: 'Multi-product bundles.' },
  '/membership': { title: 'Membership', desc: 'Membership plan details.' },
  '/free': { title: 'Free Resources', desc: 'Free samples and resources.' },
  '/about': { title: 'About', desc: 'Who Digital Product Studio is and what it makes.' },
  '/blog': { title: 'Blog', desc: 'Guides on selling digital products and using AI tools.' },
  '/faq': { title: 'FAQ', desc: 'Frequently asked questions.' },
  '/support': { title: 'Support', desc: 'Get help with an order or a product.' },
  '/contact': { title: 'Contact', desc: 'Contact Digital Product Studio.' },
  '/privacy': { title: 'Privacy Policy', desc: 'Privacy policy.' },
  '/terms': { title: 'Terms of Service', desc: 'Terms of service.' },
  '/refund': { title: 'Refund Policy', desc: 'Refund policy.' },
  '/licensing': { title: 'Licensing', desc: 'Product licensing terms.' },
  '/affiliate': { title: 'Affiliate Program', desc: 'Affiliate program details.' },
  '/login': { title: 'Log In', desc: 'Sign in to your account.' },
  '/account': { title: 'My Account', desc: 'Account settings.' },
  '/orders': { title: 'My Orders', desc: 'Your order history and downloads.' },
};

// Known catalog, hand-maintained here so the markdown response never depends
// on a runtime fetch. Update alongside supabase/seed.sql when the catalog
// changes — see the note above on the tradeoff this makes.
const PRODUCTS = [
  { slug: 'ultimate-finance-os', title: 'Ultimate Finance OS', price: '$19.00', category: 'Excel Templates' },
  { slug: 'chatgpt-claude-prompt-vault', title: '10,000+ ChatGPT & Claude Prompt Vault', price: '$29.99', category: 'AI Prompts & Automation Kits' },
];

const DYNAMIC_PREFIXES = ['/products/', '/categories/'];
const PASSTHROUGH_PREFIXES = ['/admin', '/coo'];

function isStaticAsset(pathname) {
  const last = pathname.split('/').pop();
  return last.includes('.');
}

function isKnownPath(pathname) {
  if (pathname in PAGES) return true;
  if (PASSTHROUGH_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) return true;
  if (DYNAMIC_PREFIXES.some(p => pathname.startsWith(p) && pathname.length > p.length)) return true;
  return false;
}

// Does the Accept header prefer text/markdown over text/html?
function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const entries = acceptHeader.split(',').map(part => {
    const [type, ...params] = part.trim().split(';');
    const qParam = params.find(p => p.trim().startsWith('q='));
    const q = qParam ? parseFloat(qParam.split('=')[1]) : 1;
    return { type: type.trim().toLowerCase(), q: isNaN(q) ? 1 : q };
  });
  const md = entries.find(e => e.type === 'text/markdown');
  if (!md) return false;
  const html = entries.find(e => e.type === 'text/html' || e.type === '*/*');
  if (!html) return true;
  return md.q >= html.q;
}

function markdownResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept, Accept-Encoding',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function notFound(pathname) {
  const body = `# 404 — Not Found

\`${pathname}\` does not exist on this site.

- Full sitemap: ${SITE}/sitemap.xml
- Agent-readable site guide: ${SITE}/llms.txt
- Product catalog: ${SITE}/products
`;
  return new Response(body, {
    status: 404,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept, Accept-Encoding',
      'Cache-Control': 'no-store',
    },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Builds a real HTML response for a product detail page by fetching the
// actual built /index.html (correct hashed script tag, fonts, JSON-LD, etc —
// whatever the current deploy actually serves) and swapping the empty/home
// content inside <div id="root"> for this product's real details. React
// still mounts from the same script tag and replaces it on load, so browsers
// see zero change; a crawler that never runs JS now sees the real product,
// price and category instead of the generic homepage fallback.
//
// Fetches /index.html specifically (not `request` itself) — that path is a
// static asset (isStaticAsset() is true for it), so it can never re-enter
// this same dynamic-path branch and loop. Any failure here — network error,
// unexpected shape, no match — falls back to normal passthrough; this is a
// pure enhancement, never load-bearing.
async function productDetailHtml(request, product, pathname) {
  try {
    const res = await fetch(new URL('/index.html', request.url));
    if (!res.ok) return null;
    const html = await res.text();

    const block = `<main>
        <h1>${escapeHtml(product.title)}</h1>
        <p>${escapeHtml(product.category)} &mdash; ${escapeHtml(product.price)}</p>
        <p>Instant digital download from Digital Product Studio.</p>
        <p><a href="/products">Browse all products</a></p>
      </main>`;

    // Match up to end of body, not "followed by <script>" — Vite's production
    // build hoists the module script into <head>, so it never follows the
    // root div in the built output (only in the raw dev-time index.html).
    const rootRe = /<div id="root">[\s\S]*?<\/div>\s*(?=<\/body>)/;
    if (!rootRe.test(html)) return null;
    // Use replacer functions, not string replacements: a plain-string
    // replacement value containing "$" (e.g. a price like "$19.00") gets
    // reinterpreted by String.replace as a $1-style backreference token.
    let out = html.replace(rootRe, () => `<div id="root">${block}</div>\n    `);

    const title = `${product.title} — Digital Product Studio`;
    const desc = `${product.title} (${product.category}) — ${product.price}. Instant digital download.`;
    out = out.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`);
    out = out.replace(/(<meta name="description" content=")[^"]*(")/, (_, a, b) => `${a}${escapeHtml(desc)}${b}`);
    out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${SITE}${pathname}${b}`);

    return out;
  } catch {
    return null;
  }
}

function pageMarkdown(pathname) {
  if (pathname === '/products') {
    const lines = PRODUCTS.map(p => `- **${p.title}** (${p.category}) — ${p.price} — ${SITE}/products/${p.slug}`);
    return `# All Products\n\n${lines.join('\n')}\n`;
  }

  for (const prefix of DYNAMIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      const slug = pathname.slice(prefix.length).replace(/\/$/, '');
      if (prefix === '/products/') {
        const p = PRODUCTS.find(x => x.slug === slug);
        if (p) {
          return `# ${p.title}\n\nCategory: ${p.category}\nPrice: ${p.price}\n\nBuy / view: ${SITE}${pathname}\n`;
        }
      }
      return `# ${decodeURIComponent(slug)}\n\nView this page: ${SITE}${pathname}\n`;
    }
  }

  const page = PAGES[pathname];
  if (page) {
    return `# ${page.title}\n\n${page.desc}\n\nFull page: ${SITE}${pathname}\n`;
  }

  return `# ${pathname}\n\nFull page: ${SITE}${pathname}\n`;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname === '' ? '/' : url.pathname;

  if (isStaticAsset(pathname)) return; // let Vercel's static serving / native 404 handle it

  if (!isKnownPath(pathname)) {
    return notFound(pathname);
  }

  // Admin/COO panels are authenticated operator UI, not public agent-facing
  // content — always pass through to the SPA regardless of Accept.
  if (PASSTHROUGH_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return;
  }

  if (prefersMarkdown(request.headers.get('Accept'))) {
    return markdownResponse(pageMarkdown(pathname));
  }

  // Product detail pages: even a plain HTML request (no explicit Accept:
  // text/markdown) should carry real product content in raw HTML, not just
  // the generic homepage fallback — see productDetailHtml() above.
  if (pathname.startsWith('/products/')) {
    const slug = pathname.slice('/products/'.length).replace(/\/$/, '');
    const product = PRODUCTS.find(p => p.slug === slug);
    if (product) {
      const html = await productDetailHtml(request, product, pathname);
      if (html) {
        return new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    }
  }

  return; // fall through to the normal SPA response, unchanged
}
