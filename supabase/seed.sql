-- Seed data for the 2 real, testable products.
-- Deliberately does NOT carry over the 4 fake "demo/seed record" products that were
-- sitting in the old SQLite catalog (Zenith Life Planner, Executive Finance Tracker,
-- Canva Carousel, and the ChatGPT Vault duplicate already deleted in-app on 2026-08-31) —
-- see PRODUCT_CATALOG.md, which flags those as dummy ingestion-test payloads, not real
-- products. Starting the new catalog clean.
--
-- Note: both products.json files on disk say "status": "Draft", but they're the ones
-- actively being tested for purchase end-to-end, so they're seeded here as 'published'
-- so they're actually visible/buyable. Flip to 'draft' in the dashboard if that's wrong.
--
-- Pricing is in INR: Razorpay charges INR by default for this account, and checkout
-- reads base_price/currency directly from this table (no separate hardcoded price map),
-- so catalog and checkout can never drift apart again.

insert into products (
  sku, title, slug, category, status, lifecycle_state, version, file_hash,
  base_price, compare_at_price, currency, description, short_description, tags, file_placeholder
) values
(
  'DPS-XLS-001',
  'Ultimate Finance OS',
  'ultimate-finance-os',
  'Excel Templates',
  'published',
  'published',
  '1.0',
  '7cec14030356e347695696f59e5a3c09d199c918e423bc098e39aa9e570357fb',
  1500.00,
  3000.00,
  'INR',
  'Take control of your personal and business finances with the Ultimate Finance OS. A premium, dual-mode (light/dark) spreadsheet engineered for high-performance financial tracking. Designed for individuals, creators, and business owners looking to consolidate their income streams, expense allocations, OKRs, and net worth progress in a single unified dashboard view.',
  'The complete Excel operating system to track expenses, manage budgets, analyze cash flow, and grow your net worth.',
  array['Finance','Budget','Excel','Spreadsheet','Tracker','Monthly Budget','Expense Tracker','Net Worth','Cash Flow','Personal Finance','Business Finance','SaaS Dashboard','Income Planner'],
  'Ultimate_Finance_OS_v1.0.xlsx'
),
(
  'DPS-PRM-001',
  '10,000+ ChatGPT & Claude Prompt Vault',
  'chatgpt-claude-prompt-vault',
  'AI Prompts & Automation Kits',
  'published',
  'published',
  '1.0',
  '2522cc20fc18d116d5b9c1097a9e8dd633e78ed803d02bb15757c7f21af2f19c',
  499.00,
  999.00,
  'INR',
  'A professional-grade repository of high-performance AI prompts, curated to eliminate guesswork and maximize output accuracy. Fully verified, deduplicated, and formatted with placeholders for easy copy-pasting.',
  'Batch 01: 200 fully distinct, schema-complete prompts across five categories (Business, Project Management, Productivity, Marketing, Writing).',
  array['AI','ChatGPT','Claude','Prompts','Vault','Business Prompts','Marketing Prompts','Project Management','Productivity Prompts','Copywriting'],
  'prompt_vault_master.csv'
);
