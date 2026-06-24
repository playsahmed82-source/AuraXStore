import { useEffect, useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SupportTicket, SupportMessage } from '../../lib/types';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<Record<string, SupportMessage[]>>({});
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data } = await query.limit(100);

    if (data) {
      setTickets(data);

      const ticketIds = data.map(t => t.id);
      const { data: msgs } = await supabase
        .from('support_messages')
        .select('*')
        .in('ticket_id', ticketIds)
        .order('created_at');

      if (msgs) {
        const grouped: Record<string, SupportMessage[]> = {};
        msgs.forEach(msg => {
          if (!grouped[msg.ticket_id]) grouped[msg.ticket_id] = [];
          grouped[msg.ticket_id].push(msg);
        });
        setMessages(grouped);
      }
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateStatus = async (ticketId: string, status: string) => {
    await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId);
    fetchTickets();
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setIsSending(true);

    await supabase.from('support_messages').insert({
      ticket_id: selectedTicket.id,
      user_id: null,
      is_staff: true,
      message: newMessage.trim(),
    });

    await supabase
      .from('support_tickets')
      .update({ status: 'waiting', updated_at: new Date().toISOString() })
      .eq('id', selectedTicket.id);

    setNewMessage('');
    setIsSending(false);
    fetchTickets();
  };

  const statuses = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Support Tickets</h1>
        <p className="text-gray-500">Manage customer support requests</p>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-2">
          {['', ...statuses].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`glass-card p-4 cursor-pointer transition-colors ${
                selectedTicket?.id === ticket.id ? 'border-primary-500/50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-primary-400">{ticket.ticket_number}</p>
                  <p className="text-white font-medium mt-1">{ticket.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`badge ${
                  ticket.status === 'open' ? 'badge-error' :
                  ticket.status === 'in_progress' ? 'badge-warning' :
                  ticket.status === 'waiting' ? 'badge-primary' :
                  'badge-success'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedTicket && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-xs text-primary-400">{selectedTicket.ticket_number}</p>
                <h2 className="text-lg font-semibold text-white">{selectedTicket.subject}</h2>
              </div>
              <select
                value={selectedTicket.status}
                onChange={(e) => updateStatus(selectedTicket.id, e.target.value)}
                className="input-field w-auto"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
              {messages[selectedTicket.id]?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_staff ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    msg.is_staff ? 'bg-primary-500/20' : 'bg-white/10'
                  }`}>
                    <p className="text-sm text-white">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a response..."
                className="input-field flex-1"
              />
              <button onClick={sendMessage} disabled={isSending || !newMessage.trim()} className="btn-primary">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
