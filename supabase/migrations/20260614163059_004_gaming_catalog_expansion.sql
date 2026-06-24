-- Flash Sales Table
CREATE TABLE flash_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 1 AND discount_percentage <= 99),
  original_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_purchases INTEGER DEFAULT 100,
  current_purchases INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recently Viewed Products
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 1,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Product Recommendations (can be manual or algorithm-based)
CREATE TABLE product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommendation_type TEXT DEFAULT 'related' CHECK (recommendation_type IN ('related', 'frequently_bought_together', 'similar', 'trending', 'manual')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, recommended_product_id)
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'promo')),
  link_url TEXT,
  link_text TEXT,
  is_dismissible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Categories for better organization
ALTER TABLE games ADD COLUMN IF NOT EXISTS platform TEXT[] DEFAULT '{}';
ALTER TABLE games ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS currency_name TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS currency_icon TEXT;

-- Insert comprehensive game catalog
INSERT INTO games (name, slug, description, category_id, platform, genre, currency_name, currency_icon, is_popular, sort_order, image_url, banner_url) VALUES
-- Battle Royale Games
('PUBG Mobile', 'pubg-mobile', 'PUBG Mobile - Battle Royale sensation with 100-player matches', (SELECT id FROM categories WHERE slug = 'battle-royale'), ARRAY['Android', 'iOS'], 'Battle Royale', 'UC', '💎', true, 1, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'),
('Free Fire', 'free-fire', 'Garena Free Fire - Fast-paced battle royale survival shooter', (SELECT id FROM categories WHERE slug = 'battle-royale'), ARRAY['Android', 'iOS'], 'Battle Royale', 'Diamonds', '💎', true, 2, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Fortnite', 'fortnite', 'Fortnite - Build, battle, and survive in this iconic battle royale', (SELECT id FROM categories WHERE slug = 'battle-royale'), ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Android', 'iOS'], 'Battle Royale', 'V-Bucks', '💰', true, 3, 'https://images.unsplash.com/photo-1538481199705-c710c4e965d?w=400', 'https://images.unsplash.com/photo-1538481199705-c710c4e965d?w=1200'),
('Apex Legends', 'apex-legends', 'Apex Legends - Hero shooter battle royale with unique legends', (SELECT id FROM categories WHERE slug = 'battle-royale'), ARRAY['PC', 'PlayStation', 'Xbox', 'Switch'], 'Battle Royale', 'Apex Coins', '🪙', true, 4, 'https://images.unsplash.com/photo-1552820728-8b83bb1b457c?w=400', 'https://images.unsplash.com/photo-1552820728-8b83bb1b457c?w=1200'),
('Call of Duty Mobile', 'cod-mobile', 'Call of Duty Mobile - Console-quality action on mobile', (SELECT id FROM categories WHERE slug = 'battle-royale'), ARRAY['Android', 'iOS'], 'Battle Royale', 'CP', '💵', true, 5, 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400', 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1200'),
('Warzone Mobile', 'warzone-mobile', 'Call of Duty Warzone Mobile - Battle royale on the go', (SELECT id FROM categories WHERE slug = 'battle-royale'), ARRAY['Android', 'iOS'], 'Battle Royale', 'CP', '💵', true, 6, 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400', 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1200'),

-- PC Competitive Games
('Valorant', 'valorant', 'Valorant - Tactical 5v5 character-based shooter', (SELECT id FROM categories WHERE slug = 'fps'), ARRAY['PC'], 'FPS', 'VP', '⭐', true, 10, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'),
('Counter Strike 2', 'cs2', 'CS2 - The legendary tactical shooter reimagined', (SELECT id FROM categories WHERE slug = 'fps'), ARRAY['PC'], 'FPS', 'Credits', '🎯', true, 11, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'),
('League of Legends', 'league-of-legends', 'League of Legends - The world''s most popular MOBA', (SELECT id FROM categories WHERE slug = 'moba'), ARRAY['PC'], 'MOBA', 'RP', '🔵', true, 12, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'),
('Dota 2', 'dota-2', 'Dota 2 - Complex MOBA with deep strategy', (SELECT id FROM categories WHERE slug = 'moba'), ARRAY['PC'], 'MOBA', 'Dota Coins', '🔴', true, 13, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'),
('Rainbow Six Siege', 'rainbow-six-siege', 'Rainbow Six Siege - Tactical team-based shooter', (SELECT id FROM categories WHERE slug = 'fps'), ARRAY['PC', 'PlayStation', 'Xbox'], 'FPS', 'Credits', '🛡️', true, 14, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'),
('Overwatch 2', 'overwatch-2', 'Overwatch 2 - Team-based hero shooter', (SELECT id FROM categories WHERE slug = 'fps'), ARRAY['PC', 'PlayStation', 'Xbox', 'Switch'], 'FPS', 'Credits', '🦸', true, 15, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'),

-- MMO & RPG Games
('World of Warcraft', 'world-of-warcraft', 'World of Warcraft - The legendary MMORPG', (SELECT id FROM categories WHERE slug = 'mmorpg'), ARRAY['PC'], 'MMORPG', 'Gold', '🪙', true, 20, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Black Desert Online', 'bdo', 'Black Desert Online - Action MMORPG with stunning combat', (SELECT id FROM categories WHERE slug = 'mmorpg'), ARRAY['PC', 'PlayStation', 'Xbox'], 'MMORPG', 'Pearls', '💎', true, 21, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('RuneScape', 'runescape', 'RuneScape - Classic MMORPG adventure', (SELECT id FROM categories WHERE slug = 'mmorpg'), ARRAY['PC', 'Mobile'], 'MMORPG', 'GP', '💰', true, 22, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Lost Ark', 'lost-ark', 'Lost Ark - Free-to-play action MMORPG', (SELECT id FROM categories WHERE slug = 'mmorpg'), ARRAY['PC'], 'MMORPG', 'Gold', '🪙', true, 23, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('New World', 'new-world', 'New World - Amazon''s MMORPG adventure', (SELECT id FROM categories WHERE slug = 'mmorpg'), ARRAY['PC'], 'MMORPG', 'Gold', '🪙', true, 24, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Genshin Impact', 'genshin-impact', 'Genshin Impact - Open world action RPG', (SELECT id FROM categories WHERE slug = 'rpg'), ARRAY['PC', 'PlayStation', 'iOS', 'Android'], 'RPG', 'Genesis Crystals', '✨', true, 25, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),

-- Mobile Games
('Mobile Legends', 'mobile-legends', 'Mobile Legends - 5v5 MOBA on mobile', (SELECT id FROM categories WHERE slug = 'moba'), ARRAY['Android', 'iOS'], 'MOBA', 'Diamonds', '💎', true, 30, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Clash of Clans', 'clash-of-clans', 'Clash of Clans - Build your village and battle', (SELECT id FROM categories WHERE slug = 'strategy'), ARRAY['Android', 'iOS'], 'Strategy', 'Gems', '💎', true, 31, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Clash Royale', 'clash-royale', 'Clash Royale - Real-time card battle game', (SELECT id FROM categories WHERE slug = 'strategy'), ARRAY['Android', 'iOS'], 'Strategy', 'Gems', '💎', true, 32, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Brawl Stars', 'brawl-stars', 'Brawl Stars - Fast-paced multiplayer battles', (SELECT id FROM categories WHERE slug = 'fps'), ARRAY['Android', 'iOS'], 'Action', 'Gems', '💎', true, 33, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Honor of Kings', 'honor-of-kings', 'Honor of Kings - China''s biggest MOBA', (SELECT id FROM categories WHERE slug = 'moba'), ARRAY['Android', 'iOS'], 'MOBA', 'Tokens', '🎫', true, 34, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),
('Arena of Valor', 'arena-of-valor', 'Arena of Valor - 5v5 hero-based MOBA', (SELECT id FROM categories WHERE slug = 'moba'), ARRAY['Android', 'iOS'], 'MOBA', 'Vouchers', '🧾', true, 35, 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=400', 'https://images.unsplash.com/photo-1511512578047-dfb36753921d?w=1200'),

-- Console Platforms (as games for platform accounts)
('PlayStation', 'playstation', 'PlayStation Network - Access the PlayStation ecosystem', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['PlayStation'], 'Platform', 'PSN Credit', '🎮', true, 40, 'https://images.unsplash.com/photo-1606144042614-b243f0d6cc6f?w=400', 'https://images.unsplash.com/photo-1606144042614-b243f0d6cc6f?w=1200'),
('Xbox', 'xbox', 'Xbox Network - Access the Xbox ecosystem', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['Xbox'], 'Platform', 'Xbox Credit', '🎮', true, 41, 'https://images.unsplash.com/photo-1621255282541-1acd5e7bb31b?w=400', 'https://images.unsplash.com/photo-1621255282541-1acd5e7bb31b?w=1200'),
('Nintendo Switch', 'nintendo-switch', 'Nintendo Switch - Hybrid gaming console', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['Switch'], 'Platform', 'Nintendo Credit', '🎮', true, 42, 'https://images.unsplash.com/photo-1578303512597-81e6cc1b7b07?w=400', 'https://images.unsplash.com/photo-1578303512597-81e6cc1b7b07?w=1200'),

-- PC Platforms
('Steam', 'steam', 'Steam - The ultimate gaming platform', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['PC'], 'Platform', 'Steam Credit', '🎮', true, 50, 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400', 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1200'),
('Epic Games', 'epic-games', 'Epic Games Store - PC gaming platform', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['PC'], 'Platform', 'V-Bucks', '🎮', true, 51, 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400', 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1200'),
('Riot Games', 'riot-games', 'Riot Games - League of Legends and more', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['PC'], 'Platform', 'RP', '🎮', true, 52, 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400', 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1200'),
('EA App', 'ea-app', 'EA App - Electronic Arts gaming platform', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['PC', 'PlayStation', 'Xbox'], 'Platform', 'EA Points', '🎮', true, 53, 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400', 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1200'),
('Ubisoft Connect', 'ubisoft-connect', 'Ubisoft Connect - Ubisoft gaming platform', (SELECT id FROM categories WHERE slug = 'platform'), ARRAY['PC', 'PlayStation', 'Xbox'], 'Platform', 'Units', '🎮', true, 54, 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400', 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1200')
ON CONFLICT (slug) DO UPDATE SET
  platform = EXCLUDED.platform,
  genre = EXCLUDED.genre,
  currency_name = EXCLUDED.currency_name,
  currency_icon = EXCLUDED.currency_icon,
  is_popular = EXCLUDED.is_popular;

-- Add missing categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Battle Royale', 'battle-royale', 'Battle Royale Games - Last one standing wins', '⚔️', 1),
('FPS', 'fps', 'First Person Shooter Games', '🎯', 2),
('MOBA', 'moba', 'Multiplayer Online Battle Arena', '🏟️', 3),
('MMORPG', 'mmorpg', 'Massively Multiplayer Online Role-Playing Games', '🌍', 4),
('RPG', 'rpg', 'Role-Playing Games', '🎭', 5),
('Strategy', 'strategy', 'Strategy Games', '🧠', 6),
('Platform', 'platform', 'Gaming Platforms and Services', '🎮', 7)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- Add RLS for new tables
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "flash_sales_read" ON flash_sales FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "flash_sales_admin" ON flash_sales FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "recently_viewed_own" ON recently_viewed FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "recently_viewed_insert" ON recently_viewed FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "recently_viewed_update" ON recently_viewed FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "recommendations_read" ON product_recommendations FOR SELECT TO authenticated USING (true);
CREATE POLICY "recommendations_admin" ON product_recommendations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "announcements_read" ON announcements FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "announcements_admin" ON announcements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Indexes for performance
CREATE INDEX idx_flash_sales_active ON flash_sales(is_active, start_time, end_time);
CREATE INDEX idx_recently_viewed_user ON recently_viewed(user_id, last_viewed_at DESC);
CREATE INDEX idx_recommendations_product ON product_recommendations(product_id);
CREATE INDEX idx_announcements_active ON announcements(is_active);