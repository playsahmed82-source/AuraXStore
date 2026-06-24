import { Link } from 'react-router-dom';
import { Gamepad2, Mail, MessageCircle, Send } from 'lucide-react';

const footerLinks = {
  products: [
    { name: 'Game Accounts', path: '/products?type=account' },
    { name: 'Top Up Services', path: '/products?type=topup' },
    { name: 'Boosting', path: '/products?type=boosting' },
    { name: 'In-Game Items', path: '/products?type=item' },
    { name: 'Gift Cards', path: '/products?type=giftcard' },
  ],
  popular: [
    { name: 'PUBG Mobile', path: '/games/pubg-mobile' },
    { name: 'Free Fire', path: '/games/free-fire' },
    { name: 'Valorant', path: '/games/valorant' },
    { name: 'Fortnite', path: '/games/fortnite' },
    { name: 'Genshin Impact', path: '/games/genshin-impact' },
  ],
  support: [
    { name: 'Help Center', path: '/support' },
    { name: 'Contact Us', path: '/support/contact' },
    { name: 'FAQ', path: '/support/faq' },
    { name: 'Live Chat', path: '/support/chat' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Careers', path: '/careers' },
    { name: 'Partner Program', path: '/partners', badge: 'Soon' },
  ],
};

const socialLinks = [
  { name: 'Discord', icon: MessageCircle, url: '#' },
  { name: 'Telegram', icon: Send, url: '#' },
  { name: 'Email', icon: Mail, url: 'mailto:support@auraxstore.com' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-100 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                Aura<span className="text-primary-400">x</span>Store
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-4">
              Level Up Your Gaming Experience with premium accounts, instant top-ups, and professional services.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Popular Games</h4>
            <ul className="space-y-3">
              {footerLinks.popular.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-500 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                  >
                    {link.name}
                    {link.badge && (
                      <span className="badge badge-primary">{link.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} AuraxStore. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund" className="text-gray-500 hover:text-white text-sm transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600">
            All game titles, logos, and trademarks are property of their respective owners. AuraxStore is not affiliated with or endorsed by any game publisher.
          </p>
        </div>
      </div>
    </footer>
  );
}
