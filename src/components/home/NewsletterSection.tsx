import { useState } from 'react';
import { Send, Check } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="py-16 bg-dark-500">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="glass-card p-8 sm:p-12">
          <h2 className="section-title text-white mb-4">Stay Updated</h2>
          <p className="text-gray-500 mb-8">
            Subscribe to our newsletter for exclusive deals, new arrivals, and gaming tips.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={isSubmitted}
              className={`btn-primary ${isSubmitted ? 'bg-success-600' : ''}`}
            >
              {isSubmitted ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Subscribe
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-4">
            By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
