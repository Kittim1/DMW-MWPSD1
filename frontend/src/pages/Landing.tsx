import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLoadingOverlay,
  usePageLoading,
} from "../contexts/LoadingOverlayContext";
import { counterService, queueService } from "../services/api";
import "./Landing.css";

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  ticket_identifier?: string;
  counter_id: number;
  status: string;
  service_type?: string;
  services?: string[];
  has_appointment?: boolean;
  client_name?: string;
  is_priority?: boolean;
  priority_type?: string;
}

interface Counter {
  id: number;
  counter_name: string;
  user_id?: number;
  is_active: boolean;
  current_ticket_id?: number;
  max_concurrent?: number;
}

function Landing() {
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [servingQueue, setServingQueue] = useState<QueueItem[]>([]);
  const [skippedQueue, setSkippedQueue] = useState<QueueItem[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [sessionInfo, setSessionInfo] = useState<string>("");
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const showLoadingRef = useRef(showLoading);
  const hideLoadingRef = useRef(hideLoading);
  useEffect(() => {
    showLoadingRef.current = showLoading;
    hideLoadingRef.current = hideLoading;
  });

  usePageLoading(loading, "", 300);

  const getCurrentSession = () => {
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    const session = isMorning ? "MORNING" : "AFTERNOON";
    return `${session}<br/>SESSION`;
  };

  // Returns a map of counterId -> array of QueueItem currently being served
  // (Counter 5 with max_concurrent = 2 will have up to 2 entries here).
  const getServingByCounter = () => {
    const counterMap: { [key: number]: QueueItem[] } = {};
    servingQueue.forEach((item) => {
      if (item.counter_id) {
        if (!counterMap[item.counter_id]) {
          counterMap[item.counter_id] = [];
        }
        counterMap[item.counter_id].push(item);
      }
    });
    // Keep stable order (earliest called first)
    Object.keys(counterMap).forEach((k) => {
      const id = Number(k);
      counterMap[id].sort((a: any, b: any) => {
        const ta = a.called_at ? new Date(a.called_at).getTime() : 0;
        const tb = b.called_at ? new Date(b.called_at).getTime() : 0;
        return ta - tb;
      });
    });
    return counterMap;
  };

  const getServiceLabel = (item: QueueItem | undefined, counterId: number) => {
    if (item) {
      const serviceName =
        item.service_type || (item.services && item.services[0]);
      if (serviceName) {
        const s = serviceName.toUpperCase();
        switch (s) {
          case "BALIK MANGGAWA":
          case "BALIK_MANGGAWA":
          case "BM":
            if ((item as any).has_appointment === true)
              return "WITH APPOINTMENT";
            return "WITHOUT APPOINTMENT";
          case "WITHOUT_APPOINTMENT":
          case "WITHOUT APPOINTMENT":
          case "NO_APPOINTMENT":
            return "WITHOUT APPOINTMENT";
          case "PEOS":
            return "PEOS";
          case "INFO_SHEET":
          case "INFO SHEET":
          case "INFORMATION SHEET":
            return "INFO SHEET";
          case "DIRECT_HIRE":
          case "DIRECT HIRE":
            return "DIRECT HIRE";
          case "G TO G":
          case "G-TO-G":
          case "G2G":
            return "G TO G";
          case "OVERSEAS EMPLOYMENT CERTIFICATE":
          case "OEC":
            return "OEC";
          case "ACCOUNT RETRIEVAL":
            return "ACCOUNT RETRIEVAL";
          case "HELP DESK":
          case "INQUIRY":
            return "INQUIRY";
          case "WITH_APPOINTMENT":
          case "WITH APPOINTMENT":
          case "APPOINTMENT":
            return "WITH APPOINTMENT";
          default:
            return s.replace(/_/g, " ");
        }
      }
      if ((item as any).has_appointment === true) {
        return "WITH APPOINTMENT";
      }
      if ((item as any).has_appointment === false) {
        return "WITHOUT APPOINTMENT";
      }
    }
    const fallback: { [key: number]: string } = {
      1: "WITHOUT APPOINTMENT",
      2: "PEOS",
      3: "INFO SHEET",
      4: "DIRECT HIRE",
      5: "WITH APPOINTMENT",
    };
    return fallback[counterId] || "";
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchQueues = async () => {
      try {
        const [queueResponse, counterResponse] = await Promise.all([
          queueService.getStatus(),
          counterService.getCounters(),
        ]);
        const { serving, waiting, skipped } = queueResponse.data;

        if (!isMounted) return;

        setWaitingQueue(waiting);
        setServingQueue(serving);
        setSkippedQueue(skipped || []);
        setCounters(counterResponse.data);
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
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timePart = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
        hour12: true,
      });
      const datePart = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCurrentDateTime(`${datePart}  ${timePart}`);
      setSessionInfo(getCurrentSession());
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const counterMap = getServingByCounter();
  const displayCounters = [1, 2, 3, 4, 5]
    .map((id) => counters.find((c) => c.id === id))
    .filter(Boolean) as Counter[];

  return (
    <div id="landing-page" className="landing-container">
      <div className="landing-header">
        <div className="header-content">
          <img src="/dmw.png" alt="DMW Logo" className="dmw-logo" />
          <div className="header-text">
            <h1>Department of Migrant Workers</h1>
            <h2>Regional Office X</h2>
            <h2>MWPSD</h2>
            <p
              className="time-date"
              dangerouslySetInnerHTML={{ __html: currentDateTime }}
            ></p>
            <p
              className="session-info"
              dangerouslySetInnerHTML={{ __html: sessionInfo }}
            ></p>
          </div>
          <button
            className="login-icon-btn"
            onClick={() => {
              showLoadingRef.current("", 150);
              setTimeout(() => {
                navigate("/login");
                setTimeout(() => hideLoadingRef.current(), 40);
              }, 120);
            }}
            title="Login"
            aria-label="Login"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="black"
              stroke="black"
              strokeWidth="0"
              width="38"
              height="38"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="landing-watermark" aria-hidden="true">
        <div className="watermark-ring">
          <svg
            viewBox="0 0 700 700"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <path
                id="circle-top"
                d="M 350,350 m -300,0 a 300,300 0 1,1 600,0 a 300,300 0 1,1 -600,0"
              />
              <path
                id="circle-bottom"
                d="M 350,350 m 300,0 a 300,300 0 1,0 -600,0 a 300,300 0 1,0 600,0"
              />
            </defs>
            <text
              fill="#1a1a1a"
              opacity="0.22"
              fontFamily="'Arial Black', Arial, sans-serif"
              fontWeight="900"
              letterSpacing="4"
            >
              <textPath
                href="#circle-top"
                startOffset="50%"
                textAnchor="middle"
                fontSize="34"
              >
                DEPARTMENT OF MIGRANT WORKERS
              </textPath>
              <textPath
                href="#circle-bottom"
                startOffset="50%"
                textAnchor="middle"
                fontSize="30"
              >
                ★ PHILIPPINES ★
              </textPath>
            </text>
          </svg>
        </div>
        <img src="/dmw.png" alt="" className="watermark-seal" />
      </div>

      <div className="catered-section">
        <h3 className="section-title">CURRENT CATERED NUMBERS</h3>
        <div className="catered-counters">
          {displayCounters.flatMap((counter) => {
            const servingList = counterMap[counter.id] || [];
            const slots = Math.max(
              1,
              counter.max_concurrent ? counter.max_concurrent : 1,
              servingList.length,
              counter.id === 5 ? 2 : 1,
            );
            return Array.from({ length: slots }).map((_, slotIdx) => {
              const ticket: QueueItem | undefined = servingList[slotIdx];
              const serviceLabel = getServiceLabel(ticket, counter.id);
              const displayNumber = ticket?.ticket_identifier
                ? ticket.ticket_identifier.replace("-", " - ")
                : ticket?.priority_number
                  ? ticket.priority_number
                  : "----";
              const isPriority = !!ticket?.is_priority;
              return (
                <div
                  key={`counter-${counter.id}-slot-${slotIdx}`}
                  className={`catered-counter ${isPriority ? "priority" : ""}`}
                >
                  {ticket && (
                    <p className="service-label-top">{serviceLabel}</p>
                  )}
                  <p
                    className={`counter-number ${isPriority ? "priority" : ""}`}
                  >
                    {displayNumber}
                  </p>
                  <p className="counter-name">COUNTER {counter.id}</p>
                </div>
              );
            });
          })}
        </div>
      </div>

      <div className="waiting-section">
        <h3 className="section-title">WAITING NUMBERS</h3>
        <div className="waiting-cards-wrap">
          {waitingQueue.map((item, index) => (
            <div
              key={`waiting-${item.ticket_id}-${index}`}
              className={`waiting-ticket ${item.is_priority ? "priority" : ""}`}
            >
              {item.ticket_identifier || item.priority_number}
            </div>
          ))}
        </div>
      </div>

      {skippedQueue.length > 0 && (
        <div className="skipped-section">
          <h3 className="section-title">SKIPPED NUMBERS</h3>
          <div className="skipped-cards-wrap">
            {skippedQueue.map((item, index) => (
              <div
                key={`skipped-${item.ticket_id}-${index}`}
                className="skipped-ticket"
              >
                {item.ticket_identifier || item.priority_number}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
