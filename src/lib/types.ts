export interface Profile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_verified: boolean;
  is_admin: boolean;
  is_banned: boolean;
  role: 'customer' | 'seller' | 'admin' | 'super_admin';
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_backup_codes: string[] | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  stripe_customer_id: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SecurityLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_email: string;
  business_phone: string | null;
  business_address: string | null;
  business_type: string | null;
  description: string | null;
  documents: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  category_id: string | null;
  platform: string[];
  genre: string | null;
  currency_name: string | null;
  currency_icon: string | null;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  game_id: string | null;
  category_id: string | null;
  seller_id: string | null;
  product_type: 'account' | 'topup' | 'boosting' | 'item' | 'service' | 'giftcard';
  features: string[];
  images: string[];
  stock_quantity: number;
  stock_unlimited: boolean;
  is_digital: boolean;
  download_url: string | null;
  delivery_info: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_trending: boolean;
  is_active: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  game?: Game;
  category?: Category;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  coupon_code: string | null;
  payment_method: string | null;
  payment_id: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  notes: string | null;
  delivery_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'delivered'
  | 'completed'
  | 'refunded'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface PaymentTransaction {
  id: string;
  order_id: string;
  payment_method: string;
  payment_provider: string | null;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  delivery_data: Record<string, unknown> | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: string;
  user_id: string | null;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  department: 'general' | 'payments' | 'orders' | 'technical';
  subject: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  is_staff: boolean;
  message: string;
  attachments: string[];
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: 'news' | 'updates' | 'guides' | 'tutorials' | 'promotions';
  featured_image_url: string | null;
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  reading_time: number;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number | null;
  min_quantity: number;
  max_uses: number | null;
  current_uses: number;
  applies_to: string[] | null;
  first_order_only: boolean;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyAnalytics {
  id: string;
  date: string;
  page_views: number;
  unique_visitors: number;
  total_orders: number;
  total_revenue: number;
  new_users: number;
  created_at: string;
}

export interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  product_id: string;
  discount_percentage: number;
  original_price: number;
  sale_price: number;
  start_time: string;
  end_time: string;
  max_purchases: number;
  current_purchases: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface RecentlyViewed {
  id: string;
  user_id: string;
  product_id: string;
  view_count: number;
  last_viewed_at: string;
  product?: Product;
}

export interface ProductRecommendation {
  id: string;
  product_id: string;
  recommended_product_id: string;
  recommendation_type: 'related' | 'frequently_bought_together' | 'similar' | 'trending' | 'manual';
  sort_order: number;
  created_at: string;
}

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'promo';
  link_url: string | null;
  link_text: string | null;
  is_dismissible: boolean;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  button_text: string | null;
  position: 'hero' | 'category' | 'sidebar' | 'footer';
  sort_order: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}
