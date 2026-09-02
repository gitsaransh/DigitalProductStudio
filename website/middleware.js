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

export default function middleware(request) {
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

  return; // fall through to the normal SPA response, unchanged
}
