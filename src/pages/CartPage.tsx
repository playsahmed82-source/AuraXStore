import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useStore } from '../lib/store';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, auth } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateCartQuantity(itemId, newQuantity);
    }
  };

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCouponCode('');
    setIsApplyingCoupon(false);
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to View Cart</h2>
          <p className="text-gray-500 mb-6">Please sign in to access your shopping cart.</p>
          <Link to="/auth/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="glass-card p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-6">Start adding products to your cart!</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const discount = 0;
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="bg-dark-400 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-gray-500">{cart.itemCount} items in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="glass-card p-4 sm:p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop`}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link
                          to={`/products/${item.product?.slug}`}
                          className="font-medium text-white hover:text-primary-400 transition-colors line-clamp-2"
                        >
                          {item.product?.name}
                        </Link>
                        {item.product?.short_description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {item.product.short_description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-gray-500 hover:text-error-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                        {item.product?.price && (
                          <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success-400">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-success-400">Free</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-lg">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Have a coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="btn-secondary"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full">
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link
                to="/products"
                className="block text-center text-sm text-gray-500 hover:text-white mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
