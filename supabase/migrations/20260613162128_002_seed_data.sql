-- Insert categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Game Accounts', 'game-accounts', 'Premium gaming accounts for all major platforms', 'User', 1),
('Top Up Services', 'top-up', 'Instant top-up for in-game currencies', 'CreditCard', 2),
('Boosting Services', 'boosting', 'Professional rank boosting and leveling services', 'TrendingUp', 3),
('In-Game Items', 'in-game-items', 'Skins, weapons, and rare in-game items', 'Package', 4),
('Digital Services', 'digital-services', 'Coaching, account setup, and custom services', 'Settings', 5),
('Gift Cards', 'gift-cards', 'Gaming gift cards and vouchers', 'Gift', 6);

-- Insert games
INSERT INTO games (name, slug, description, is_popular, sort_order) VALUES
('PUBG Mobile', 'pubg-mobile', 'Battle royale mobile gaming', true, 1),
('Free Fire', 'free-fire', 'Fast-paced battle royale', true, 2),
('Valorant', 'valorant', 'Tactical shooter by Riot Games', true, 3),
('Fortnite', 'fortnite', 'Epic Games battle royale', true, 4),
('GTA Online', 'gta-online', 'Grand Theft Auto online multiplayer', true, 5),
('Steam', 'steam', 'Steam platform games', true, 6),
('PlayStation', 'playstation', 'PlayStation platform', true, 7),
('Xbox', 'xbox', 'Xbox platform', true, 8),
('Roblox', 'roblox', 'User-generated gaming platform', true, 9),
('Mobile Legends', 'mobile-legends', 'MOBA mobile gaming', true, 10),
('Clash of Clans', 'clash-of-clans', 'Strategy mobile game', true, 11),
('Clash Royale', 'clash-royale', 'Card strategy game', true, 12),
('Brawl Stars', 'brawl-stars', 'Fast-paced multiplayer game', true, 13),
('Genshin Impact', 'genshin-impact', 'Open-world action RPG', true, 14),
('EA FC', 'ea-fc', 'Football simulation game', true, 15),
('League of Legends', 'league-of-legends', 'Popular MOBA game', true, 16),
('Counter Strike 2', 'counter-strike-2', 'Tactical FPS game', true, 17);

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, price, compare_at_price, product_type, is_featured, is_best_seller, is_trending, stock_unlimited, is_active, features, delivery_info) VALUES
('PUBG Mobile Conqueror Account', 'pubg-mobile-conqueror-account', 'Premium PUBG Mobile account with Conqueror rank, rare skins, and high stats. Full access with email change.', 'Conqueror rank account', 149.99, 199.99, 'account', true, true, true, false, true, '["Conqueror Rank", "10+ Legendary Skins", "100+ UC Balance", "Original Email Access"]', 'Instant delivery via email'),
('Valorant Immortal Account', 'valorant-immortal-account', 'Level 100+ Valorant account with Immortal rank and exclusive weapon skins.', 'Immortal rank account', 129.99, 159.99, 'account', true, true, false, false, true, '["Immortal Rank", "Level 100+", "5+ Premium Skins", "Full Access"]', 'Instant delivery via email'),
('Free Fire 5000 Diamonds', 'free-fire-5000-diamonds', 'Get 5000 diamonds instantly delivered to your Free Fire account.', '5000 Diamonds Top Up', 49.99, 59.99, 'topup', true, true, true, true, true, '["Instant Delivery", "Safe Method", "ID Required"]', 'Instant delivery (5-30 minutes)'),
('PUBG Mobile 8100 UC', 'pubg-mobile-8100-uc', '8100 UC delivered to your PUBG Mobile account with bonus.', '8100 UC Top Up', 99.99, 119.99, 'topup', true, false, true, true, true, '["Instant Delivery", "Winston Pass Bonus", "Safe Method"]', 'Instant delivery (5-15 minutes)'),
('Valorant Rank Boosting - Diamond to Immortal', 'valorant-rank-boosting-diamond-immortal', 'Professional boosting from Diamond to Immortal rank. Guaranteed results.', 'Diamond to Immortal Boost', 199.99, 249.99, 'boosting', true, true, true, true, true, '["Professional Boosters", "Guaranteed Results", "Anti-Cheat Safe", "Progress Tracking"]', '1-7 days depending on rank'),
('Genshin Impact Genesis Crystals 1980', 'genshin-impact-genesis-crystals-1980', '1980 Genesis Crystals for Genshin Impact with bonus crystals.', '1980 Genesis Crystals', 29.99, 34.99, 'topup', false, true, false, true, true, '["Instant Delivery", "Bonus Crystals", "Safe Method"]', 'Instant delivery (5-30 minutes)'),
('Steam Account - Level 50', 'steam-account-level-50', 'Steam account with Level 50+, 50+ games, and trading cards.', 'Level 50 Steam Account', 89.99, 119.99, 'account', false, true, true, false, true, '["Level 50+", "50+ Games", "Trading Cards", "Full Access"]', 'Instant delivery via email'),
('Mobile Legends 5000 Diamonds', 'mobile-legends-5000-diamonds', '5000 Diamonds for Mobile Legends with instant delivery.', '5000 Diamonds Top Up', 44.99, 54.99, 'topup', false, true, true, true, true, '["Instant Delivery", "Safe Method", "ID Required"]', 'Instant delivery (5-15 minutes)'),
('Fortnite 5000 V-Bucks', 'fortnite-5000-vbucks', '5000 V-Bucks delivered to your Fortnite account.', '5000 V-Bucks', 39.99, 49.99, 'topup', false, true, false, true, true, '["Instant Delivery", "Safe Method"]', 'Instant delivery (5-30 minutes)'),
('League of Legends Plat to Diamond Boost', 'lol-plat-diamond-boost', 'Professional boosting from Platinum to Diamond rank.', 'Plat to Diamond Boost', 149.99, 179.99, 'boosting', false, true, true, true, true, '["Professional Boosters", "Guaranteed Results", "Anti-Cheat Safe"]', '1-5 days depending on rank');

-- Insert FAQs
INSERT INTO faqs (question, answer, category, sort_order) VALUES
('How do I receive my order?', 'After payment confirmation, digital products are delivered instantly via email or displayed in your order dashboard. Physical products may take 1-3 business days.', 'Orders', 1),
('Is buying accounts safe?', 'Yes, all accounts are verified and come with full access credentials. We provide a 7-day warranty on all accounts.', 'Security', 2),
('What payment methods do you accept?', 'We accept all major credit cards, PayPal, and cryptocurrency payments.', 'Payments', 3),
('How long does boosting take?', 'Boosting completion time varies by service. Most rank boosts are completed within 1-7 days depending on the rank difference.', 'Services', 4),
('Do you offer refunds?', 'Yes, we offer full refunds for orders that cannot be delivered. Once an item is delivered, refunds are handled case by case.', 'Orders', 5),
('Is my personal information secure?', 'Absolutely. We use industry-standard encryption and never share your data with third parties.', 'Security', 6);

-- Insert banners
INSERT INTO banners (title, subtitle, link_url, button_text, position, sort_order) VALUES
('Level Up Your Gaming Experience', 'Find premium accounts, instant top-ups, and professional boosting services', '/products', 'Shop Now', 'hero', 1),
('Summer Sale - Up to 30% Off', 'Limited time offer on all gaming accounts', '/products?sale=true', 'Shop Sale', 'hero', 2);

-- Insert site settings
INSERT INTO site_settings (key, value) VALUES
('site_name', 'AuraxStore'),
('site_tagline', 'Level Up Your Gaming Experience'),
('support_email', 'support@auraxstore.com'),
('seller_marketplace_enabled', 'false');