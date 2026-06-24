import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Gamepad2, ShoppingCart, CreditCard, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Gamepad2,
    title: 'Choose Game',
    description: 'Browse our extensive collection of games and select the product you need.',
    color: 'from-primary-500 to-primary-600',
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
  {
    number: '02',
    icon: ShoppingCart,
    title: 'Add To Cart',
    description: 'Add your selected items to cart and review your order details.',
    color: 'from-accent-500 to-accent-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Complete checkout with our 256-bit SSL encrypted payment system.',
    color: 'from-success-500 to-success-600',
    glowColor: 'rgba(34, 197, 94, 0.4)',
  },
  {
    number: '04',
    icon: Zap,
    title: 'Instant Delivery',
    description: 'Receive your products instantly via email or your dashboard.',
    color: 'from-warning-500 to-warning-600',
    glowColor: 'rgba(234, 179, 8, 0.4)',
  },
];

const stats = [
  { value: 500000, suffix: '+', label: 'Orders Completed' },
  { value: 150, suffix: '+', label: 'Games Supported' },
  { value: 99.9, suffix: '%', label: 'Delivery Rate' },
  { value: 4.9, suffix: '/5', label: 'Customer Rating' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

function FloatingIcon({ icon: Icon, delay = 0 }: { icon: React.ElementType; delay?: number }) {
  return (
    <motion.div
      className="absolute opacity-20"
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Icon className="w-8 h-8 text-primary-400" />
    </motion.div>
  );
}

export default function HowToOrderSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = (containerRef.current as HTMLElement).getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-24 bg-dark-400 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating Icons */}
        <FloatingIcon icon={Gamepad2} delay={0} />
        <FloatingIcon icon={ShoppingCart} delay={0.5} />
        <FloatingIcon icon={CreditCard} delay={1} />
        <FloatingIcon icon={Zap} delay={1.5} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-warning-400" />
            <span className="text-sm text-warning-400 font-medium">Simple Process</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            How To <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Order</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Get your gaming products in just 4 simple steps. Fast, secure, and hassle-free.
          </p>
        </motion.div>

        {/* Timeline Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.15 }}
              >
                {/* Step Card */}
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Glow Effect */}
                  <div
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{ background: `linear-gradient(135deg, ${step.glowColor}, transparent)` }}
                  />

                  {/* Card */}
                  <div className="relative glass-card p-6 lg:p-8 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all duration-300">
                    {/* Step Number */}
                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-dark-500 border border-white/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-400">{step.number}</span>
                    </div>

                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>

                    {/* Animated Border */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-20`} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow between steps (desktop) */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:flex absolute top-1/2 -right-3 z-10 -translate-y-1/2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <ArrowRight className="w-6 h-6 text-primary-500/50" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Counter */}
        <motion.div
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <div className="glass-card p-6 text-center rounded-2xl border border-white/5 group-hover:border-primary-500/30 transition-all duration-300">
                <div className="text-3xl lg:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-success-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
