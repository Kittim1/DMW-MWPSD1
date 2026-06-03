import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { queueService } from "../services/api";
import "./Counter.css";

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  counter_id: number;
  status: string;
}

function Counter() {
  const { counterId = "1" } = useParams();
  const [servingQueue, setServingQueue] = useState<QueueItem[]>([]);
  const [notCateredQueue, setNotCateredQueue] = useState<QueueItem[]>([]);
  const [currentTicket, setCurrentTicket] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchQueues = async () => {
      try {
        const response = await queueService.getStatus();
        const { serving, waiting } = response.data;

        if (!isMounted) return;

        // Find current ticket for this counter
        const ticket = serving.find(
          (item: QueueItem) => item.counter_id === parseInt(counterId),
        );
        setCurrentTicket(ticket || null);
        setServingQueue(serving);
        setNotCateredQueue(waiting);
      } catch (error) {
        console.error("Failed to fetch queue data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          timeoutId = setTimeout(fetchQueues, 2000);
        }
      }
    };

    fetchQueues();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [counterId]);

  const handleMarkComplete = async () => {
    if (currentTicket) {
      try {
        // Mark ticket as complete
        await queueService.completeService(currentTicket.ticket_id);
        // Refresh queues using consolidated status endpoint
        const response = await queueService.getStatus();
        const { serving } = response.data;
        const ticket = serving.find(
          (item: QueueItem) => item.counter_id === parseInt(counterId),
        );
        setCurrentTicket(ticket || null);
        setServingQueue(serving);
      } catch (error) {
        console.error("Failed to mark complete:", error);
      }
    }
  };

  const handleCater = async () => {
    try {
      // Call next ticket for this counter (which will assign the ticket to the counter)
      await queueService.callNext(parseInt(counterId));
      // Refresh queues using consolidated status endpoint
      const response = await queueService.getStatus();
      const { serving, waiting } = response.data;
      const ticket = serving.find(
        (item: QueueItem) => item.counter_id === parseInt(counterId),
      );
      setCurrentTicket(ticket || null);
      setServingQueue(serving);
      setNotCateredQueue(waiting);
    } catch (error) {
      console.error("Failed to cater ticket:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Group serving items by counter
  const getServingByCounter = () => {
    const counterMap: { [key: number]: QueueItem } = {};
    servingQueue.forEach((item) => {
      if (item.counter_id && !counterMap[item.counter_id]) {
        counterMap[item.counter_id] = item;
      }
    });
    return counterMap;
  };

  const counterMap = getServingByCounter();
  const allCounters = [1, 2, 3, 4, 5];

  return (
    <div className="counter-container">
      <div className="counter-header">
        <div className="header-left">
          <div className="logo-placeholder">LOGO</div>
          <div className="header-text">
            <p className="country">Republic of the Philippines</p>
            <p className="department">DEPARTMENT OF MIGRANT WORKERS</p>
            <p className="region">Regional Office X</p>
          </div>
        </div>
        <div className="header-right">
          <p className="greeting">hello, Counter {counterId}</p>
          <div className="user-icon">👤</div>
        </div>
      </div>

      <div className="counter-content">
        <div className="catered-section">
          <h3>CURRENT CATERED NUMBERS</h3>
          <div className="catered-counters">
            {allCounters.map((cId) => (
              <div
                key={cId}
                className={`catered-counter ${
                  parseInt(counterId) === cId ? "active" : ""
                }`}
              >
                <p className="counter-label">PRIORITY</p>
                <p className="counter-label">NUMBER</p>
                <p className="counter-number">
                  {counterMap[cId]?.priority_number || "—"}
                </p>
                <p className="counter-label">COUNTER {cId}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="serving-section">
          <h3>YOU ARE SERVING</h3>
          <div className="serving-display">
            <p className="serving-number">
              {currentTicket?.priority_number || "—"}
            </p>
            <button className="mark-complete-btn" onClick={handleMarkComplete}>
              MARK AS COMPLETE
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Dashboard</h3>
        <div className="not-catered">
          <div className="not-catered-list">
            <p className="list-title">NOT CATERED NUMBERS:</p>
            {notCateredQueue.slice(0, 3).map((item) => (
              <p key={item.ticket_id} className="not-catered-number">
                {item.priority_number}
              </p>
            ))}
          </div>
          <div className="actions">
            <p className="actions-title">ACTIONS</p>
            {notCateredQueue.slice(0, 3).map((item) => (
              <button
                key={item.ticket_id}
                className="cater-btn"
                onClick={handleCater}
              >
                CATER
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Counter;
