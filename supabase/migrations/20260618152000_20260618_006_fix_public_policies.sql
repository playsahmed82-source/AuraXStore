
/*
# Fix public RLS policies for anonymous users

1. Fix anonymous read access
- Some policies were restricted to `authenticated` only (e.g., flash_sales, announcements, products)
- This means the site would not load data for non-logged-in users
- Changed to allow `public` (anonymous + authenticated) read access

2. Consistent policy naming
- All public read policies now use `TO public` explicitly
- This ensures data loads regardless of login status

3. Fixed policies
- flash_sales: changed from `TO authenticated` to `TO public`
- announcements: changed from `TO authenticated` to `TO public`
- products: added `TO public` explicitly
- games: added `TO public` explicitly
- categories: added `TO public` explicitly
*/

-- Fix flash_sales to allow anonymous reads
DROP POLICY IF EXISTS "flash_sales_read" ON flash_sales;
CREATE POLICY "flash_sales_read" ON flash_sales FOR SELECT
  TO public USING (is_active = true);

-- Fix announcements to allow anonymous reads
DROP POLICY IF EXISTS "announcements_read" ON announcements;
CREATE POLICY "announcements_read" ON announcements FOR SELECT
  TO public USING (is_active = true);

-- Fix products public read
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT
  TO public USING (is_active = true);

-- Fix games public read
DROP POLICY IF EXISTS "games_public_read" ON games;
CREATE POLICY "games_public_read" ON games FOR SELECT
  TO public USING (is_active = true);

-- Fix categories public read
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT
  TO public USING (is_active = true);

-- Fix blog_posts public read
DROP POLICY IF EXISTS "blog_posts_public_read" ON blog_posts;
CREATE POLICY "blog_posts_public_read" ON blog_posts FOR SELECT
  TO public USING (is_published = true);

-- Fix reviews public read
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT
  TO public USING (is_approved = true);

-- Fix faqs public read
DROP POLICY IF EXISTS "faqs_public_read" ON faqs;
CREATE POLICY "faqs_public_read" ON faqs FOR SELECT
  TO public USING (is_active = true);

-- Fix banners public read
DROP POLICY IF EXISTS "banners_public_read" ON banners;
CREATE POLICY "banners_public_read" ON banners FOR SELECT
  TO public USING (is_active = true);
