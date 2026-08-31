-- Adds USD pricing for international marketplace listings (Gumroad, and later
-- Etsy). The direct storefront + Razorpay checkout use products.base_price/
-- currency (INR); marketplaces that primarily serve international buyers need
-- their own USD price point rather than a mechanical currency conversion.

alter table products
  add column price_usd numeric(10,2),
  add column compare_at_price_usd numeric(10,2);

-- Restore the original USD price points these products were designed with,
-- before the storefront/checkout was standardized on INR.
update products set price_usd = 19.00, compare_at_price_usd = 39.00
  where sku = 'DPS-XLS-001';
update products set price_usd = 29.99, compare_at_price_usd = 59.99
  where sku = 'DPS-PRM-001';
