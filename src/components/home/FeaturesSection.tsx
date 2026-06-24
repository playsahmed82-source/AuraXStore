import { Shield, Zap, Clock, Users, Award, Lock } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Products',
    description: 'All accounts and services are verified for authenticity and security.',
    color: 'from-primary-600 to-primary-400',
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Digital products delivered instantly via email or dashboard.',
    color: 'from-accent-600 to-accent-400',
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Our dedicated support team is available around the clock.',
    color: 'from-success-600 to-success-400',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Industry-standard encryption for all transactions.',
    color: 'from-warning-600 to-warning-400',
  },
  {
    icon: Award,
    title: 'Money-back Guarantee',
    description: 'Full refund if product cannot be delivered as promised.',
    color: 'from-pink-600 to-pink-400',
  },
  {
    icon: Users,
    title: '500K+ Happy Customers',
    description: 'Join thousands of satisfied gamers worldwide.',
    color: 'from-cyan-600 to-cyan-400',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-dark-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="section-title text-white mb-4">Why Choose AuraxStore?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We are committed to providing the best gaming marketplace experience with premium products and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group glass-card p-6 hover:border-primary-500/30 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
