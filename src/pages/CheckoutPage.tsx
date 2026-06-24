import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Lock, CreditCard, Wallet, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export default function CheckoutPage() {
  const { cart, auth, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    email: auth.profile?.email || '',
    firstName: auth.profile?.full_name?.split(' ')[0] || '',
    lastName: auth.profile?.full_name?.split(' ').slice(1).join(' ') || '',
    phone: auth.profile?.phone || '',
    paymentMethod: 'card',
  });

  if (!auth.user || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-2">No Items to Checkout</h2>
          <p className="text-gray-500 mb-6">Add items to your cart to proceed.</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const discount = 0;
  const total = subtotal - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    const orderNum = `AS-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from('orders').insert({
      order_number: orderNum,
      user_id: auth.user!.id,
      status: 'awaiting_payment',
      subtotal,
      discount,
      tax: 0,
      total,
      payment_method: formData.paymentMethod,
    });

    if (!error) {
      await clearCart();
      setOrderNumber(orderNum);
      setOrderComplete(true);
    }

    setIsLoading(false);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Your order has been placed successfully.</p>
          <p className="text-primary-400 font-mono mb-6">Order: {orderNumber}</p>
          <p className="text-sm text-gray-500 mb-6">
            You will receive an email confirmation shortly. Check your dashboard for order status.
          </p>
          <div className="flex gap-4">
            <Link to="/dashboard/orders" className="btn-primary">
              View Orders
            </Link>
            <Link to="/products" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="bg-dark-400 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-display font-bold text-white">Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>

          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-primary-500 text-white' : 'bg-white/10 text-gray-500'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`text-sm ${step >= s ? 'text-white' : 'text-gray-500'} hidden sm:block`}>
                  {s === 1 ? 'Information' : s === 2 ? 'Payment' : 'Confirm'}
                </span>
                {s < 3 && <div className={`w-8 sm:w-16 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Customer Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Link to="/cart" className="btn-secondary">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Link>
                  <button onClick={() => setStep(2)} className="btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Payment Method</h2>

                <div className="space-y-4">
                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'card'
                        ? 'border-primary-500/50 bg-primary-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="text-primary-500"
                    />
                    <CreditCard className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'crypto'
                        ? 'border-primary-500/50 bg-primary-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="crypto"
                      checked={formData.paymentMethod === 'crypto'}
                      onChange={handleInputChange}
                      className="text-primary-500"
                    />
                    <Wallet className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Cryptocurrency</p>
                      <p className="text-sm text-gray-500">Bitcoin, Ethereum, USDT</p>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Review Your Order</h2>

                <div className="space-y-6 mb-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400 mb-2">Customer</p>
                    <p className="text-white">
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-gray-500">{formData.email}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5">
                    <p className="text-sm text-gray-400 mb-2">Payment Method</p>
                    <p className="text-white capitalize">
                      {formData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cryptocurrency'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-3">Items ({cart.itemCount})</p>
                    <div className="space-y-2">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {item.product?.name} x {item.quantity}
                          </span>
                          <span className="text-white">
                            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 rounded-xl bg-success-500/10 border border-success-500/20 mb-6">
                  <Shield className="w-5 h-5 text-success-400" />
                  <p className="text-sm text-success-400">Your payment is secured with SSL encryption</p>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="btn-secondary">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm text-white">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{cart.items.length - 3} more items
                  </p>
                )}
              </div>

              <hr className="border-white/10 mb-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-success-400">-${discount.toFixed(2)}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-lg">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
