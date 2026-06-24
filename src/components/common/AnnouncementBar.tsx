import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Zap, Gift, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Announcement } from '../../lib/types';

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  const fetchAnnouncements = async () => {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`start_time.is.null,start_time.lte.${now}`)
      .or(`end_time.is.null,end_time.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setAnnouncements(data);
  };

  const dismissAnnouncement = (id: string) => {
    setDismissed(prev => [...prev, id]);
    if (announcements.length <= 1) {
      setIsVisible(false);
    } else {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }
  };

  const activeAnnouncements = announcements.filter(a => !dismissed.includes(a.id));

  if (!isVisible || activeAnnouncements.length === 0) return null;

  const announcement = activeAnnouncements[currentIndex % activeAnnouncements.length];

  const getStyles = (type: string) => {
    switch (type) {
      case 'promo':
        return 'bg-gradient-to-r from-warning-600 via-warning-500 to-warning-600';
      case 'warning':
        return 'bg-gradient-to-r from-error-600 via-error-500 to-error-600';
      case 'success':
        return 'bg-gradient-to-r from-success-600 via-success-500 to-success-600';
      default:
        return 'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'promo':
        return <Zap className="w-4 h-4 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <Gift className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className={`${getStyles(announcement.type)} relative`}>
      {/* Carousel indicators */}
      {activeAnnouncements.length > 1 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-1">
          {activeAnnouncements.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-3">
        <div className="flex items-center justify-center gap-3 text-white">
          {getIcon(announcement.type)}
          <p className="text-sm font-medium">
            {announcement.message}
            {announcement.link_url && (
              <Link
                to={announcement.link_url}
                className="ml-2 underline hover:text-white/80 transition-colors"
              >
                {announcement.link_text || 'Learn More'}
              </Link>
            )}
          </p>
        </div>
      </div>

      {announcement.is_dismissible && (
        <button
          onClick={() => dismissAnnouncement(announcement.id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
