import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  MessageCircle,
  Ticket,
  ChevronDown,
  Send,
  Clock,
  Mail,
  Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import type { FAQ, SupportTicket } from '../lib/types';

const departments = [
  { value: 'general', label: 'General Support' },
  { value: 'payments', label: 'Payments & Billing' },
  { value: 'orders', label: 'Orders & Delivery' },
  { value: 'technical', label: 'Technical Issues' },
];

export default function SupportPage() {
  const { auth } = useStore();
  const [activeTab, setActiveTab] = useState('faq');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [newTicket, setNewTicket] = useState({
    department: 'general',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [faqRes, ticketRes] = await Promise.all([
      supabase.from('faqs').select('*').eq('is_active', true).order('sort_order'),
      auth.user
        ? supabase.from('support_tickets').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false })
        : Promise.resolve({ data: null }),
    ]);

    if (faqRes.data) setFaqs(faqRes.data);
    if (ticketRes.data) setTickets(ticketRes.data);
    setIsLoading(false);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    setIsSubmitting(true);
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from('support_tickets').insert({
      ticket_number: ticketNumber,
      user_id: auth.user.id,
      department: newTicket.department,
      subject: newTicket.subject,
      status: 'open',
    });

    if (!error) {
      setSubmitSuccess(true);
      setNewTicket({ department: 'general', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 3000);
      fetchData();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-dark-500">
      <div className="bg-dark-400 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Support Center</h1>
          <p className="text-gray-500 max-w-2xl">
            We&apos;re here to help. Find answers to common questions or get in touch with our support team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 text-center hover:border-primary-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">FAQ</h3>
            <p className="text-sm text-gray-500">Find quick answers to common questions</p>
          </div>

          <div className="glass-card p-6 text-center hover:border-primary-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-6 h-6 text-accent-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Tickets</h3>
            <p className="text-sm text-gray-500">Submit a new support ticket</p>
          </div>

          <div className="glass-card p-6 text-center hover:border-primary-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-success-500/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-success-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Live Chat</h3>
            <p className="text-sm text-gray-500">Chat with our support team</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10">
          {['faq', 'tickets', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-white border-primary-500'
                  : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'faq' && (
          <div className="max-w-3xl">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No frequently asked questions available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={faq.id} className="glass-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-white pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                          openFaqIndex === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      <div className="px-6 pb-4 text-gray-500">{faq.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Submit New Ticket</h2>

              {submitSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-success-500/10 border border-success-500/20 flex items-center gap-3">
                  <Check className="w-5 h-5 text-success-400" />
                  <p className="text-sm text-success-400">Ticket submitted successfully!</p>
                </div>
              )}

              {!auth.user ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Please sign in to submit a ticket.</p>
                  <Link to="/auth/login" className="btn-primary">
                    Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Department</label>
                    <select
                      value={newTicket.department}
                      onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })}
                      className="input-field"
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Subject</label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className="input-field"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Message</label>
                    <textarea
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                      className="input-field min-h-[150px]"
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
              )}
            </div>

            {auth.user && tickets.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Your Tickets</h2>
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm text-primary-400">{ticket.ticket_number}</p>
                          <p className="text-white mt-1">{ticket.subject}</p>
                        </div>
                        <span
                          className={`badge ${
                            ticket.status === 'open' || ticket.status === 'in_progress'
                              ? 'badge-warning'
                              : ticket.status === 'resolved'
                              ? 'badge-success'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="grid lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-card p-6 text-center">
              <Mail className="w-8 h-8 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Email</h3>
              <p className="text-gray-500 mb-4">support@auraxstore.com</p>
              <a href="mailto:support@auraxstore.com" className="btn-secondary">
                Send Email
              </a>
            </div>

            <div className="glass-card p-6 text-center">
              <MessageCircle className="w-8 h-8 text-accent-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Live Chat</h3>
              <p className="text-gray-500 mb-4">24/7 Available</p>
              <button className="btn-primary">Start Chat</button>
            </div>

            <div className="glass-card p-6 text-center">
              <Clock className="w-8 h-8 text-success-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Hours</h3>
              <p className="text-gray-500 mb-4">24/7 Support</p>
              <p className="text-sm text-gray-600">Always available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
