import { useEffect, useState } from "react";
import { counterService, queueService } from "../services/api";
import "./CounterPanel.css";

interface CounterPanelProps {
  userId: number;
  counterName?: string;
}

interface QueueItem {
  id: number;
  ticket_id: number;
  priority_number: string;
  status: string;
  counter_id?: number;
}

function CounterPanel({ userId }: CounterPanelProps) {
  const [servingTickets, setServingTickets] = useState<QueueItem[]>([]);
  const [waitingTickets, setWaitingTickets] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [counterId, setCounterId] = useState<number | null>(null);

  // Fetch counter ID on mount
  useEffect(() => {
    const fetchCounterId = async () => {
      try {
        const countersRes = await counterService.getCounters();
        const counters = countersRes.data || [];
        // Find the counter assigned to this user
        const userCounter = counters.find((c: any) => c.user_id === userId);
        if (userCounter) {
          setCounterId(userCounter.id);
        } else {
          // Fallback: use first counter or userId
          setCounterId(userId);
        }
      } catch (error) {
        console.error("Failed to fetch counter:", error);
        setCounterId(userId); // fallback
      }
    };

    fetchCounterId();
  }, [userId]);

  const fetchQueue = async () => {
    try {
      const servingRes = await queueService.getServing();
      const waitingRes = await queueService.getWaiting();
      setServingTickets(servingRes.data || []);
      setWaitingTickets(waitingRes.data || []);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    }
  };

  useEffect(() => {
    if (!counterId) return;
    fetchQueue();
    const interval = setInterval(fetchQueue, 2000);
    return () => clearInterval(interval);
  }, [counterId]);

  // Find the ticket currently being served by THIS counter
  const currentlyServingTicket = servingTickets.find(
    (t) => t.counter_id === counterId,
  );

  // Flag: is this counter currently serving someone?
  const isServing = !!currentlyServingTicket;

  const handleCallNext = async () => {
    if (!counterId) return;
    setLoading(true);
    try {
      await queueService.callNext(counterId);
      await fetchQueue();
    } catch (error) {
      console.error("Failed to call next:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!currentlyServingTicket) return;

    setLoading(true);
    try {
      await queueService.completeService(currentlyServingTicket.ticket_id);
      await fetchQueue();
    } catch (error) {
      console.error("Failed to mark complete:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="counter-dashboard">
      {/* ── Current Catered Numbers (All Counters) ── */}
      <section className="panel-card">
        <h2 className="panel-title">CURRENT CATERED NUMBERS</h2>
        <div className="catered-numbers-box">
          {servingTickets.length > 0 ? (
            <div className="tickets-grid">
              {servingTickets.map((ticket) => (
                <div key={ticket.id} className="ticket-pair">
                  <div className="ticket-number">{ticket.priority_number}</div>
                  <div className="counter-assignment">
                    COUNTER {ticket.counter_id || "-"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No tickets being catered</div>
          )}
        </div>
      </section>

      {/* ── You Are Serving (This Counter) ── */}
      {currentlyServingTicket && (
        <section className="panel-card you-are-serving-card">
          <h2 className="panel-title">YOU ARE SERVING</h2>
          <div className="serving-ticket-box">
            <div className="serving-ticket-display">
              <div className="serving-ticket-number">
                {currentlyServingTicket.priority_number}
              </div>
              <button
                onClick={handleMarkCompleted}
                disabled={loading}
                className="mark-completed-button"
              >
                {loading ? "Processing..." : "MARK AS COMPLETED"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Dashboard ── */}
      <section className="panel-card">
        <h2 className="panel-title">Dashboard</h2>

        <div className="dashboard-body">
          {/* Left: Not Catered Numbers */}
          <div className="not-catered-column">
            <h3 className="column-title">NOT CATERED NUMBERS:</h3>
            <div className="not-catered-list">
              {waitingTickets.length > 0 ? (
                waitingTickets.map((ticket) => (
                  <div key={ticket.id} className="waiting-ticket">
                    {ticket.priority_number}
                  </div>
                ))
              ) : (
                <div className="empty-waiting">No waiting tickets</div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="actions-column">
            <h3 className="column-title">ACTIONS</h3>
            <div className="actions-list">
              {!isServing && waitingTickets.length > 0 ? (
                waitingTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={handleCallNext}
                    disabled={loading || isServing}
                    className="cater-button"
                    title={
                      isServing
                        ? "Complete current ticket first"
                        : "Call next ticket"
                    }
                  >
                    CATER
                  </button>
                ))
              ) : isServing ? (
                <div className="serving-message">
                  Serving ticket {currentlyServingTicket?.priority_number}
                </div>
              ) : (
                <div className="empty-waiting">—</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CounterPanel;
