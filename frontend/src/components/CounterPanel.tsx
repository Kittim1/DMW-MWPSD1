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
  service_type?: string;
  services?: string[];
  is_priority?: boolean;
  priority_type?: string;
}

function CounterPanel({ userId }: CounterPanelProps) {
  const [servingTickets, setServingTickets] = useState<QueueItem[]>([]);
  const [waitingTickets, setWaitingTickets] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [counterId, setCounterId] = useState<number | null>(null);
  const [maxConcurrent, setMaxConcurrent] = useState<number>(1);

  // Fetch counter ID on mount
  useEffect(() => {
    const fetchCounterId = async () => {
      try {
        const countersRes = await counterService.getCounters();
        const counters = countersRes.data || [];
        // First try: exact match by user_id. Then for Counter 5 which can
        // have 2 staff, we also fall back to picking a Counter 5 record if
        // the user is not already linked.
        let userCounter = counters.find((c: any) => c.user_id === userId);
        if (!userCounter) {
          const counter5 = counters.find(
            (c: any) => c.id === 5 && (c.max_concurrent ?? 1) >= 2,
          );
          if (counter5) {
            userCounter = counter5;
          }
        }
        if (userCounter) {
          setCounterId(userCounter.id);
          setMaxConcurrent(userCounter.max_concurrent ?? 1);
        } else {
          setCounterId(userId);
          setMaxConcurrent(1);
        }
      } catch (error) {
        console.error("Failed to fetch counter:", error);
        setCounterId(userId); // fallback
        setMaxConcurrent(1);
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

  // All tickets currently being served by THIS counter (supports multiple for Counter 5)
  const currentlyServingTickets = servingTickets.filter(
    (t) => t.counter_id === counterId,
  );

  // Flag: counter is at capacity (used to disable "Call Next" button)
  const atCapacity =
    currentlyServingTickets.length >= Math.max(1, maxConcurrent);

  const handleCallNext = async () => {
    if (!counterId) return;
    setLoading(true);
    try {
      await queueService.callNext(counterId);
      await fetchQueue();
    } catch (error: any) {
      console.error("Failed to call next:", error);
      alert(error?.response?.data?.message || "Failed to call next ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (ticketId: number) => {
    if (!ticketId) return;

    setLoading(true);
    try {
      await queueService.completeService(ticketId);
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
                <div
                  key={ticket.id}
                  className={`ticket-pair ${ticket.is_priority ? "priority" : ""}`}
                >
                  <div
                    className={`ticket-number ${ticket.is_priority ? "priority-text" : ""}`}
                  >
                    {ticket.priority_number}
                  </div>
                  <div className="counter-assignment">
                    {(ticket.services || [ticket.service_type]).join(", ")}
                  </div>
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
      {currentlyServingTickets.map((servingTicket) => (
        <section
          key={`you-are-serving-${servingTicket.id}`}
          className={`panel-card you-are-serving-card ${servingTicket.is_priority ? "priority" : ""}`}
        >
          <h2 className="panel-title">
            YOU ARE SERVING
            {currentlyServingTickets.length > 1 && (
              <span className="serving-slot">
                {" "}
                ({currentlyServingTickets.indexOf(servingTicket) + 1}/
                {currentlyServingTickets.length}
              </span>
            )}
          </h2>
          <div className="serving-ticket-box">
            <div
              className={`serving-ticket-display ${servingTicket.is_priority ? "priority" : ""}`}
            >
              <div
                className={`serving-ticket-number ${servingTicket.is_priority ? "priority-text" : ""}`}
              >
                {servingTicket.priority_number}
              </div>
              <div className="counter-assignment">
                {(servingTicket.services || [servingTicket.service_type]).join(
                  ", ",
                )}
                {servingTicket.is_priority && servingTicket.priority_type && (
                  <span className="priority-tag">
                    {" "}
                    ⚑ {servingTicket.priority_type}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleMarkCompleted(servingTicket.ticket_id)}
                disabled={loading}
                className="mark-completed-button"
              >
                {loading ? "Processing..." : "MARK AS COMPLETED"}
              </button>
            </div>
          </div>
        </section>
      ))}

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
                  <div
                    key={ticket.id}
                    className={`waiting-ticket ${ticket.is_priority ? "priority" : ""}`}
                  >
                    <span>{ticket.priority_number}</span>
                    {ticket.is_priority && (
                      <span className="priority-badge">⚑ PRIORITY</span>
                    )}
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
              {!atCapacity && waitingTickets.length > 0 ? (
                waitingTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={handleCallNext}
                    disabled={loading || atCapacity}
                    className="cater-button"
                    title={
                      atCapacity
                        ? `Already serving ${currentlyServingTickets.length}/${maxConcurrent}`
                        : "Call next ticket"
                    }
                  >
                    CATER
                  </button>
                ))
              ) : atCapacity ? (
                <div className="serving-message">
                  Serving {currentlyServingTickets.length}/{maxConcurrent} slots
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
