-- Add 2FA support to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[];

-- Add role-based access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin', 'super_admin'));

-- Add security fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_ip TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- Security/Audit Logs table
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller applications table
CREATE TABLE seller_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT,
  business_address TEXT,
  business_type TEXT,
  description TEXT,
  documents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product enhancements for seller marketplace
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES profiles(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- Order enhancements
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Coupon enhancements
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applies_to TEXT[]; -- product IDs or category IDs
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN DEFAULT false;

-- Payment transactions table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL,
  payment_provider TEXT,
  transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog enhancements
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 5;

-- Analytics tables
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url TEXT NOT NULL,
  page_title TEXT,
  visitor_id TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings enhancements
INSERT INTO site_settings (key, value) VALUES
('seo_title', 'AuraxStore - Premium Gaming Marketplace'),
('seo_description', 'Buy premium gaming accounts, top-ups, boosting services, and in-game items. Instant delivery, secure payments, 24/7 support.'),
('seo_keywords', 'gaming marketplace, game accounts, top up, boosting, PUBG Mobile, Free Fire, Valorant'),
('stripe_enabled', 'true'),
('paypal_enabled', 'true'),
('two_factor_required_for_admin', 'true'),
('admin_route', 'aurax-admin-secure-2024')
ON CONFLICT (key) DO NOTHING;

-- RLS for new tables
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "security_logs_admin_only" ON security_logs FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "audit_logs_admin_only" ON audit_logs FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "seller_applications_own" ON seller_applications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "seller_applications_insert" ON seller_applications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "seller_applications_admin" ON seller_applications FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "payment_transactions_own" ON payment_transactions FOR SELECT TO authenticated 
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "payment_transactions_admin" ON payment_transactions FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "analytics_admin_only" ON page_views FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "daily_analytics_admin_only" ON daily_analytics FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Indexes for performance
CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_created ON security_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);