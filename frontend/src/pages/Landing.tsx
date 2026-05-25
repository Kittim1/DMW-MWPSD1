import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QueueDisplay from "../components/QueueDisplay";
import { queueService } from "../services/api";
import "./Landing.css";

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  counter_id: number;
  status: string;
}

function Landing() {
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [servingQueue, setServingQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [sessionInfo, setSessionInfo] = useState<string>("");
  const navigate = useNavigate();

  const getCurrentSession = () => {
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    const session = isMorning ? "MORNING" : "AFTERNOON";
    const range = "01 - 50";
    return `${session} SESSION (Tickets: ${range})`;
  };

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const [waitingRes, servingRes] = await Promise.all([
          queueService.getWaiting(),
          queueService.getServing(),
        ]);

        setWaitingQueue(waitingRes.data);
        setServingQueue(servingRes.data);
      } catch (error) {
        console.error("Failed to fetch queue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
    const interval = setInterval(fetchQueues, 2000);

    return () => clearInterval(interval);
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="landing-container">
      <div className="landing-header">
        <div className="header-top">
          <img src="/dmw.png" alt="DMW Logo" className="dmw-logo" />
          <h1>Department of Migrant Workers</h1>
          <button
            className="login-icon-btn"
            onClick={() => navigate("/login")}
            title="Login"
            aria-label="Login"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="48"
              height="48"
            >
              <circle cx="12" cy="8" r="4" />

              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>
        </div>

        <h2>Regional Office X</h2>
        <p>MWPSD</p>
        <p>{currentDateTime}</p>
        <p
          style={{
            fontSize: "1.2em",
            fontWeight: "bold",
            marginTop: "10px",
            color: "#333",
          }}
        >
          {sessionInfo}
        </p>
      </div>

      <div className="queue-display-container">
        <QueueDisplay title="WAITING" items={waitingQueue} type="waiting" />
        <QueueDisplay title="SERVING" items={servingQueue} type="serving" />
      </div>
    </div>
  );
}

export default Landing;
