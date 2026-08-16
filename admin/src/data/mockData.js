// ─── DPH Admin Mock Data ───────────────────────────────────

export const PRODUCTS = [
  { id: 'a694', title: 'Zenith Ultimate Life Planner 2026', category: 'Productivity', price: 14.99, status: 'published', rating: 5.0, reviews: 312, downloads: 2840, score: 94, langs: ['EN','DE','FR','ES','JA'] },
  { id: '4ff5', title: 'Aesthetic Instagram Canva Carousel Templates', category: 'Canva Templates', price: 19.99, status: 'published', rating: 4.9, reviews: 189, downloads: 1650, score: 88, langs: ['EN'] },
  { id: '4916', title: 'Executive Small Business Finance Tracker', category: 'Excel Templates', price: 24.99, status: 'published', rating: 5.0, reviews: 241, downloads: 1980, score: 96, langs: ['EN','DE'] },
  { id: 'b23a', title: '10,000+ ChatGPT & Claude Prompt Vault', category: 'AI Prompt Packs', price: 29.99, status: 'published', rating: 4.8, reviews: 428, downloads: 3200, score: 91, langs: ['EN','DE','FR'] },
  { id: 'c77d', title: 'Notion Content Creator Hub', category: 'Notion Systems', price: 18.99, status: 'published', rating: 4.9, reviews: 167, downloads: 1420, score: 89, langs: ['EN'] },
  { id: 'd41e', title: 'AI Side Income Blueprint 2026', category: 'Business Templates', price: 12.99, status: 'published', rating: 4.9, reviews: 387, downloads: 3100, score: 92, langs: ['EN','DE'] },
  { id: 'e82f', title: 'Social Media Marketing Playbook', category: 'Marketing', price: 16.99, status: 'draft', rating: null, reviews: 0, downloads: 0, score: 71, langs: ['EN'] },
  { id: 'f19c', title: 'Etsy Shop Finance Dashboard (Excel)', category: 'Finance', price: 22.99, status: 'review', rating: null, reviews: 0, downloads: 0, score: 83, langs: ['EN','DE'] },
  { id: 'g35b', title: 'Pinterest Marketing Template Kit', category: 'Canva Templates', price: 17.99, status: 'draft', rating: null, reviews: 0, downloads: 0, score: 68, langs: ['EN'] },
  { id: 'h60c', title: 'Business Plan Template Pro (Notion)', category: 'Notion Systems', price: 21.99, status: 'published', rating: 4.7, reviews: 88, downloads: 720, score: 87, langs: ['EN'] },
];

export const ORDERS = [
  { id: 'ORD-8821', product: 'Zenith Life Planner 2026', buyer: 'sarah.k@gmail.com', marketplace: 'Etsy', amount: 14.99, date: '2026-08-09', status: 'delivered' },
  { id: 'ORD-8820', product: '10,000+ Prompt Vault', buyer: 'marcus.t@hey.com', marketplace: 'Gumroad', amount: 29.99, date: '2026-08-09', status: 'delivered' },
  { id: 'ORD-8819', product: 'Executive Finance Tracker', buyer: 'priya.r@outlook.com', marketplace: 'Direct', amount: 24.99, date: '2026-08-08', status: 'delivered' },
  { id: 'ORD-8818', product: 'Instagram Canva Templates', buyer: 'anika.w@icloud.com', marketplace: 'Etsy', amount: 19.99, date: '2026-08-08', status: 'delivered' },
  { id: 'ORD-8817', product: 'AI Side Income Blueprint', buyer: 'james.l@gmail.com', marketplace: 'Gumroad', amount: 12.99, date: '2026-08-07', status: 'refunded' },
  { id: 'ORD-8816', product: 'Notion Content Creator Hub', buyer: 'david.c@proton.me', marketplace: 'Direct', amount: 18.99, date: '2026-08-07', status: 'delivered' },
  { id: 'ORD-8815', product: 'Zenith Life Planner 2026', buyer: 'lena.m@gmail.com', marketplace: 'Etsy', amount: 14.99, date: '2026-08-06', status: 'delivered' },
  { id: 'ORD-8814', product: 'Executive Finance Tracker', buyer: 'tom.h@yahoo.com', marketplace: 'Creative Market', amount: 24.99, date: '2026-08-06', status: 'pending' },
  { id: 'ORD-8813', product: '10,000+ Prompt Vault', buyer: 'nina.v@gmail.com', marketplace: 'Gumroad', amount: 29.99, date: '2026-08-05', status: 'delivered' },
  { id: 'ORD-8812', product: 'Business Plan Template Pro', buyer: 'rico.p@gmail.com', marketplace: 'Direct', amount: 21.99, date: '2026-08-05', status: 'delivered' },
];

export const CUSTOMERS = [
  { id: 'CUS-001', email: 'sarah.k@gmail.com', name: 'Sarah K.', orders: 3, ltv: 48.97, lastPurchase: '2026-08-09', marketplace: 'Etsy', tag: 'vip' },
  { id: 'CUS-002', email: 'marcus.t@hey.com', name: 'Marcus T.', orders: 2, ltv: 49.98, lastPurchase: '2026-08-09', marketplace: 'Gumroad', tag: 'repeat' },
  { id: 'CUS-003', email: 'priya.r@outlook.com', name: 'Priya R.', orders: 1, ltv: 24.99, lastPurchase: '2026-08-08', marketplace: 'Direct', tag: 'new' },
  { id: 'CUS-004', email: 'anika.w@icloud.com', name: 'Anika W.', orders: 4, ltv: 82.96, lastPurchase: '2026-08-08', marketplace: 'Etsy', tag: 'vip' },
  { id: 'CUS-005', email: 'james.l@gmail.com', name: 'James L.', orders: 1, ltv: 0, lastPurchase: '2026-08-07', marketplace: 'Gumroad', tag: 'refunded' },
  { id: 'CUS-006', email: 'david.c@proton.me', name: 'David C.', orders: 2, ltv: 37.98, lastPurchase: '2026-08-07', marketplace: 'Direct', tag: 'repeat' },
  { id: 'CUS-007', email: 'lena.m@gmail.com', name: 'Lena M.', orders: 1, ltv: 14.99, lastPurchase: '2026-08-06', marketplace: 'Etsy', tag: 'new' },
  { id: 'CUS-008', email: 'tom.h@yahoo.com', name: 'Tom H.', orders: 1, ltv: 24.99, lastPurchase: '2026-08-06', marketplace: 'Creative Market', tag: 'pending' },
];

export const BLOG_POSTS = [
  { id: 'bp-1', title: 'How to Sell Digital Products in 2026: The Complete Guide', status: 'published', category: 'Business', date: '2026-08-05', views: 2840, seoScore: 91 },
  { id: 'bp-2', title: '10 AI Tools Every Digital Creator Must Use in 2026', status: 'published', category: 'AI & Tools', date: '2026-07-28', views: 1920, seoScore: 88 },
  { id: 'bp-3', title: 'Etsy SEO for Digital Products: The 2026 Strategy', status: 'published', category: 'Marketing', date: '2026-07-18', views: 3150, seoScore: 94 },
  { id: 'bp-4', title: 'Etsy vs Gumroad vs Lemon Squeezy: Where to Sell in 2026', status: 'published', category: 'Platforms', date: '2026-07-10', views: 1640, seoScore: 86 },
  { id: 'bp-5', title: 'Notion Templates That Will Transform Your Business in 2026', status: 'draft', category: 'Productivity', date: null, views: 0, seoScore: 72 },
  { id: 'bp-6', title: 'The Ultimate Guide to Excel Templates for Small Business', status: 'draft', category: 'Excel', date: null, views: 0, seoScore: 68 },
];

export const EMAIL_TEMPLATES = [
  { id: 'em-1', name: 'Purchase Confirmation & Download', trigger: 'On Purchase', status: 'active', opens: '94.2%', clicks: '81.3%', lastSent: '2026-08-09' },
  { id: 'em-2', name: 'Welcome to DPH Newsletter', trigger: 'On Subscribe', status: 'active', opens: '62.4%', clicks: '28.7%', lastSent: '2026-08-07' },
  { id: 'em-3', name: 'Refund Processed', trigger: 'On Refund', status: 'active', opens: '88.9%', clicks: '12.1%', lastSent: '2026-08-07' },
  { id: 'em-4', name: 'Weekly New Products Digest', trigger: 'Weekly — Sunday 9am', status: 'active', opens: '41.2%', clicks: '18.6%', lastSent: '2026-08-03' },
  { id: 'em-5', name: 'Abandoned Cart Recovery', trigger: 'After 2h no checkout', status: 'paused', opens: '29.8%', clicks: '9.2%', lastSent: '2026-07-30' },
  { id: 'em-6', name: 'Re-engagement (60-day inactive)', trigger: 'Day 60 of inactivity', status: 'draft', opens: null, clicks: null, lastSent: null },
];

export const DOWNLOADS = [
  { id: 'dl-1', product: 'Zenith Life Planner 2026', file: 'zenith-planner-2026-en.pdf', size: '8.4 MB', accesses: 2840, expiry: null, status: 'active' },
  { id: 'dl-2', product: 'Zenith Life Planner 2026', file: 'zenith-planner-2026-de.pdf', size: '8.4 MB', accesses: 620, expiry: null, status: 'active' },
  { id: 'dl-3', product: '10,000+ Prompt Vault', file: 'prompt-vault-v3.pdf', size: '12.2 MB', accesses: 3200, expiry: null, status: 'active' },
  { id: 'dl-4', product: 'Executive Finance Tracker', file: 'finance-tracker-v2.xlsx', size: '2.1 MB', accesses: 1980, expiry: null, status: 'active' },
  { id: 'dl-5', product: 'Instagram Canva Templates', file: 'canva-templates-link.txt', size: '1 KB', accesses: 1650, expiry: null, status: 'active' },
  { id: 'dl-6', product: 'Notion Content Creator Hub', file: 'notion-template-link.txt', size: '1 KB', accesses: 1420, expiry: null, status: 'active' },
  { id: 'dl-7', product: 'AI Side Income Blueprint', file: 'ai-side-income-v1.pdf', size: '6.8 MB', accesses: 3100, expiry: null, status: 'active' },
];

export const PROMOTIONS = [
  { id: 'prm-1', name: 'Launch Week Special', code: 'LAUNCH30', discount: '30%', uses: 48, limit: 100, status: 'active', expires: '2026-08-31' },
  { id: 'prm-2', name: 'Newsletter Subscriber Discount', code: 'NEWSLETTER20', discount: '20%', uses: 312, limit: null, status: 'active', expires: null },
  { id: 'prm-3', name: 'Summer Flash Sale', code: 'SUMMER50', discount: '50%', uses: 89, limit: 200, status: 'expired', expires: '2026-07-31' },
  { id: 'prm-4', name: 'VIP Customer Reward', code: 'VIP15', discount: '15%', uses: 22, limit: 50, status: 'active', expires: '2026-09-30' },
];

// Revenue by day (last 14 days)
export const REVENUE_TREND = [
  { day: 'Jul 27', revenue: 142.93 }, { day: 'Jul 28', revenue: 219.95 }, { day: 'Jul 29', revenue: 88.97 },
  { day: 'Jul 30', revenue: 309.92 }, { day: 'Jul 31', revenue: 254.94 }, { day: 'Aug 1', revenue: 189.96 },
  { day: 'Aug 2', revenue: 424.88 }, { day: 'Aug 3', revenue: 199.94 }, { day: 'Aug 4', revenue: 284.92 },
  { day: 'Aug 5', revenue: 349.91 }, { day: 'Aug 6', revenue: 274.93 }, { day: 'Aug 7', revenue: 192.97 },
  { day: 'Aug 8', revenue: 381.90 }, { day: 'Aug 9', revenue: 154.97 },
];

export const MARKETPLACE_SPLIT = [
  { name: 'Etsy', revenue: 1840, pct: 42 },
  { name: 'Gumroad', revenue: 1210, pct: 28 },
  { name: 'Direct', revenue: 870, pct: 20 },
  { name: 'Creative Market', revenue: 430, pct: 10 },
];
