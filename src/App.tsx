import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import GamesPage from './pages/GamesPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/auth/AuthPage';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import OverviewPage from './pages/dashboard/OverviewPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SecurityPage from './pages/dashboard/SecurityPage';
import SupportPage from './pages/SupportPage';
import SellerPage from './pages/SellerPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import SearchPage from './pages/SearchPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminSecurityLogsPage from './pages/admin/AdminSecurityLogsPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';
import { ADMIN_ROUTE } from './lib/auth';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/register" element={<AuthPage />} />
          <Route path="/auth/forgot-password" element={<AuthPage />} />

          <Route path={ADMIN_ROUTE} element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductsPage />} />
            <Route path="products/:id/edit" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="sellers" element={<AdminSellersPage />} />
            <Route path="sellers/:id" element={<AdminSellersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="coupons/new" element={<AdminCouponsPage />} />
            <Route path="blog" element={<AdminBlogPage />} />
            <Route path="blog/new" element={<AdminBlogPage />} />
            <Route path="blog/:id/edit" element={<AdminBlogPage />} />
            <Route path="support" element={<AdminSupportPage />} />
            <Route path="support/:id" element={<AdminSupportPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="security-logs" element={<AdminSecurityLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="/dashboard" element={<CustomerDashboard />}>
            <Route index element={<OverviewPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="wishlist" element={<OverviewPage />} />
            <Route path="notifications" element={<OverviewPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="tickets" element={<OverviewPage />} />
            <Route path="settings" element={<OverviewPage />} />
          </Route>

          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="games/:slug" element={<ProductsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="checkout/success" element={<CheckoutPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="support/tickets" element={<SupportPage />} />
            <Route path="seller" element={<SellerPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="about" element={<HomePage />} />
            <Route path="terms" element={<HomePage />} />
            <Route path="privacy" element={<HomePage />} />
            <Route path="refund" element={<HomePage />} />
            <Route path="sitemap.xml" element={<HomePage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
