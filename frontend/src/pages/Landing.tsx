import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QueueDisplay from '../components/QueueDisplay';
import { queueService } from '../services/api';
import './Landing.css';

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
  const navigate = useNavigate();

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
        console.error('Failed to fetch queue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
    const interval = setInterval(fetchQueues, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="landing-container">
      <div className="landing-header">
        <button
          className="login-icon-btn"
          onClick={() => navigate('/login')}
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

        <h1>Department of Migrant Workers</h1>
        <h2>Regional Office X</h2>
        <p>MWPSD</p>
      </div>

      <div className="queue-display-container">
        <QueueDisplay
          title="WAITING"
          items={waitingQueue}
          type="waiting"
        />
        <QueueDisplay
          title="SERVING"
          items={servingQueue}
          type="serving"
        />
      </div>
    </div>
  );
}

export default Landing;