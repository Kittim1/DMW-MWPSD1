import { useState, useEffect } from 'react';
import { queueService } from '../services/api';
import './CounterPanel.css';

interface CounterPanelProps {
  userId: number;
}

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  status: string;
}

function CounterPanel({ userId }: CounterPanelProps) {
  const [currentTicket, setCurrentTicket] = useState<QueueItem | null>(null);
  const [nextTickets, setNextTickets] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await queueService.getWaiting();
      const tickets = res.data;
      
      if (tickets.length > 0) {
        setCurrentTicket(tickets[0]);
        setNextTickets(tickets.slice(1, 4));
      } else {
        setCurrentTicket(null);
        setNextTickets([]);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    if (!currentTicket) return;
    
    setLoading(true);
    try {
      await queueService.callNext(userId);
      await fetchQueue();
    } catch (error) {
      console.error('Failed to call next:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentTicket) return;
    
    setLoading(true);
    try {
      await queueService.completeService(currentTicket.ticket_id);
      await fetchQueue();
    } catch (error) {
      console.error('Failed to complete:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="counter-panel">
      <div className="current-ticket-section">
        <h3>Now Serving</h3>
        {currentTicket ? (
          <div className="ticket-display">
            <div className="ticket-number">{currentTicket.priority_number}</div>
            <div className="ticket-actions">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn btn-success"
              >
                Complete Service
              </button>
            </div>
          </div>
        ) : (
          <div className="no-ticket">
            <p>No tickets in queue</p>
          </div>
        )}
      </div>

      <div className="next-tickets-section">
        <h3>Next in Queue</h3>
        <div className="next-tickets-list">
          {nextTickets.length > 0 ? (
            nextTickets.map((ticket, index) => (
              <div key={ticket.ticket_id} className="next-ticket-item">
                <span className="ticket-position">#{index + 1}</span>
                <span className="ticket-number">{ticket.priority_number}</span>
              </div>
            ))
          ) : (
            <div className="empty-next-tickets">
              <p>No more tickets waiting</p>
            </div>
          )}
        </div>
      </div>

      <div className="panel-actions">
        <button
          onClick={handleCallNext}
          disabled={loading || !currentTicket}
          className="btn btn-primary btn-large"
        >
          {loading ? 'Processing...' : 'Call Next Ticket'}
        </button>
      </div>
    </div>
  );
}

export default CounterPanel;
