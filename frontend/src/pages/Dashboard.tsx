import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CounterPanel from "../components/CounterPanel";
import { authService, counterService } from "../services/api";
import "./Dashboard.css";

interface Counter {
  id: number;
  counter_name: string;
  current_ticket_id?: number | null;
  currentTicket?: {
    id: number;
    priority_number: string;
    status: string;
  } | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }

        const countersRes = await counterService.getCounters();
        setCounters(countersRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        localStorage.removeItem("auth_token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Queue Management Dashboard</h1>
          <div className="user-info">
            <span>
              Welcome, {user?.name} ({user?.role})
            </span>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {user?.role === "superadmin" ? (
          <div className="admin-dashboard">
            <h2>System Administration</h2>
            <div className="admin-stats">
              <div className="stat-card">
                <h3>Total Counters</h3>
                <p className="stat-value">{counters.length}</p>
              </div>
              <div className="stat-card">
                <h3>Active Counters</h3>
                <p className="stat-value">
                  {counters.filter((c) => c.current_ticket_id).length}
                </p>
              </div>
            </div>

            <h3>All Counters</h3>
            <div className="counters-grid">
              {counters.map((counter) => (
                <div key={counter.id} className="counter-info-card">
                  <h4>{counter.counter_name}</h4>
                  <p>
                    Current Ticket:{" "}
                    <strong>
                      {counter.currentTicket?.priority_number || "None"}
                    </strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : user?.role === "counter" ? (
          <div className="counter-dashboard">
            <h2>Counter Service Panel</h2>
            <CounterPanel userId={user.id} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default Dashboard;
