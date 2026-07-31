import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePageLoading } from "../contexts/LoadingOverlayContext";
import { queueService } from "../services/api";
import "./Counter.css";

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  counter_id: number;
  status: string;
  service_type?: string;
  is_priority?: boolean;
  priority_type?: "PWD" | "SENIOR_CITIZEN" | "PREGNANT" | null;
}

const PRIORITY_TYPE_LABEL: Record<
  Exclude<QueueItem["priority_type"], null | undefined>,
  string
> = {
  PWD: "PWD",
  SENIOR_CITIZEN: "SENIOR",
  PREGNANT: "PREGNANT",
};

// Sorting helper: Priority first (is_priority=true), then by priority_number ascending.
// This is applied client-side as a safety net even though backend also sorts.
function sortPriorityFirst<
  T extends { is_priority?: boolean; priority_number: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ap = a.is_priority ? 1 : 0;
    const bp = b.is_priority ? 1 : 0;
    if (ap !== bp) return bp - ap;
    const an = parseInt(a.priority_number.replace(/\D/g, ""), 10) || 0;
    const bn = parseInt(b.priority_number.replace(/\D/g, ""), 10) || 0;
    return an - bn;
  });
}

function Counter() {
  const { counterId = "1" } = useParams();
  const [servingQueue, setServingQueue] = useState<QueueItem[]>([]);
  const [notCateredQueue, setNotCateredQueue] = useState<QueueItem[]>([]);
  const [currentTicket, setCurrentTicket] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState("daily");

  usePageLoading(loading, "", 300);
  const [reports, setReports] = useState<any>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchQueues = async () => {
      try {
        const response = await queueService.getStatus();
        const { serving, waiting } = response.data;

        if (!isMounted) return;

        // Apply client-side priority-first sort as a safety net (double-ensures
        // priority tickets float to the top regardless of backend ordering).
        const sortedServing = sortPriorityFirst(serving as QueueItem[]);
        const sortedWaiting = sortPriorityFirst(waiting as QueueItem[]);

        // Find current ticket for this counter
        const ticket = sortedServing.find(
          (item: QueueItem) => item.counter_id === parseInt(counterId),
        );
        setCurrentTicket(ticket || null);
        setServingQueue(sortedServing);
        setNotCateredQueue(sortedWaiting);
      } catch (error) {
        console.error("Failed to fetch queue data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          timeoutId = setTimeout(fetchQueues, 2000);
        }
      }
    };

    const fetchReports = async () => {
      try {
        const response = await queueService.getReports(
          reportPeriod,
          parseInt(counterId),
        );
        setReports(response.data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchQueues();
    fetchReports();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [counterId, reportPeriod]);

  const handleMarkComplete = async () => {
    if (currentTicket) {
      try {
        // Mark ticket as complete
        await queueService.completeService(currentTicket.ticket_id);
        // Refresh queues using consolidated status endpoint
        const response = await queueService.getStatus();
        const { serving } = response.data;
        const sorted = sortPriorityFirst(serving as QueueItem[]);
        const ticket = sorted.find(
          (item: QueueItem) => item.counter_id === parseInt(counterId),
        );
        setCurrentTicket(ticket || null);
        setServingQueue(sorted);
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
      const sortedServing = sortPriorityFirst(serving as QueueItem[]);
      const sortedWaiting = sortPriorityFirst(waiting as QueueItem[]);
      const ticket = sortedServing.find(
        (item: QueueItem) => item.counter_id === parseInt(counterId),
      );
      setCurrentTicket(ticket || null);
      setServingQueue(sortedServing);
      setNotCateredQueue(sortedWaiting);
    } catch (error) {
      console.error("Failed to cater ticket:", error);
    }
  };

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
          <div className="dmw-seal-container">
            <img src="/dmw.png" alt="DMW Seal" className="dmw-seal-img" />
          </div>
          <div className="header-text">
            <p className="country">Republic of the Philippines</p>
            <p className="department">DEPARTMENT OF MIGRANT WORKERS</p>
            <p className="region">Regional Office X</p>
          </div>
        </div>
        <div className="header-right">
          <p className="greeting">hello, Counter {counterId}</p>
          <div className="user-avatar">
            <svg viewBox="0 0 48 48" width="36" height="36" aria-hidden="true">
              <circle cx="24" cy="20" r="12" fill="#2c3e50" />
              <path d="M4 46 C 6 34, 42 34, 44 46 Z" fill="#2c3e50" />
            </svg>
          </div>
        </div>
      </div>

      <div className="counter-content">
        <div className="catered-section">
          <h3>CURRENT CATERED NUMBERS</h3>
          <div className="catered-counters">
            {allCounters.map((cId) => {
              const ct = counterMap[cId];
              const isPr = !!ct?.is_priority;
              return (
                <div
                  key={cId}
                  className={`catered-counter ${
                    parseInt(counterId) === cId ? "active" : ""
                  } ${isPr ? "is-priority" : ""}`}
                >
                  <p className="counter-label">PRIORITY</p>
                  <p className="counter-label">NUMBER</p>
                  <p className="counter-number">{ct?.priority_number || "—"}</p>
                  {isPr && (
                    <div className="priority-badge">
                      {ct?.priority_type
                        ? PRIORITY_TYPE_LABEL[
                            ct.priority_type as keyof typeof PRIORITY_TYPE_LABEL
                          ]
                        : "PRIORITY"}
                    </div>
                  )}
                  {ct?.service_type && (
                    <p className={`service-type ${isPr ? "priority" : ""}`}>
                      {ct.service_type}
                    </p>
                  )}
                  <p className="counter-label">COUNTER {cId}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="serving-section">
          <h3>YOU ARE SERVING</h3>
          <div
            className={`serving-display ${currentTicket?.is_priority ? "is-priority" : ""}`}
          >
            {currentTicket?.is_priority && (
              <div className="serving-priority-banner">
                ⚠ PRIORITY —{" "}
                {currentTicket.priority_type
                  ? PRIORITY_TYPE_LABEL[
                      currentTicket.priority_type as keyof typeof PRIORITY_TYPE_LABEL
                    ]
                  : "PRIORITY"}
              </div>
            )}
            <p className="serving-number">
              {currentTicket?.priority_number || "—"}
            </p>
            {currentTicket?.service_type && (
              <p
                className={`serving-service-type ${currentTicket.is_priority ? "priority" : ""}`}
              >
                {currentTicket.service_type}
              </p>
            )}
            <button className="mark-complete-btn" onClick={handleMarkComplete}>
              MARK AS COMPLETE
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="not-catered">
          <div className="not-catered-list">
            <p className="list-title">NOT CATERED NUMBERS:</p>
            {notCateredQueue.slice(0, 3).map((item) => (
              <div
                key={item.ticket_id}
                className={`not-catered-item ${item.is_priority ? "is-priority" : ""}`}
              >
                {item.is_priority && (
                  <div className="notcatered-priority-badge">
                    {item.priority_type
                      ? PRIORITY_TYPE_LABEL[
                          item.priority_type as keyof typeof PRIORITY_TYPE_LABEL
                        ]
                      : "PRIORITY"}
                  </div>
                )}
                <p
                  className={`not-catered-number ${item.is_priority ? "priority" : ""}`}
                >
                  {item.priority_number}
                </p>
                {item.service_type && (
                  <p
                    className={`not-catered-service-type ${
                      item.is_priority ? "priority" : ""
                    }`}
                  >
                    {item.service_type}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="actions">
            <p className="actions-title">ACTIONS</p>
            {notCateredQueue.slice(0, 3).map((item) => (
              <button
                key={item.ticket_id}
                className={`cater-btn ${item.is_priority ? "priority" : ""}`}
                onClick={handleCater}
              >
                CATER
                {item.is_priority && <span className="cater-btn-pr"> ⚠</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="reports-section">
        <h3>Reports</h3>
        <div className="report-period-buttons">
          {["daily", "weekly", "monthly", "yearly"].map((period) => (
            <button
              key={period}
              className={`report-period-btn ${reportPeriod === period ? "active" : ""}`}
              onClick={() => setReportPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        {reports && (
          <div className="reports-content">
            <div className="report-stats">
              <div className="report-stat">
                <span className="stat-label">Total</span>
                <span className="stat-value">{reports.totalTickets}</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Served</span>
                <span className="stat-value">{reports.served}</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Skipped</span>
                <span className="stat-value">{reports.skipped}</span>
              </div>
              <div className="report-stat">
                <span className="stat-label">Cancelled</span>
                <span className="stat-value">{reports.cancelled}</span>
              </div>
            </div>
            {reports.serviceTypeCounts && (
              <div className="service-type-reports">
                <h4>Service Type Breakdown</h4>
                <div className="service-type-list">
                  {Object.entries(reports.serviceTypeCounts).map(
                    ([type, count]) => (
                      <div key={type} className="service-type-stat">
                        <span className="service-type-name">{type}</span>
                        <span className="service-type-count">
                          {count as number}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Counter;
