import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
