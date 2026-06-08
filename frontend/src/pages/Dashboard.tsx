import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Analytics from "../components/Analytics";
import { authService, counterService, queueService } from "../services/api";
import "./Dashboard.css";

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  counter_id: number;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  counter_id?: number;
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [servingQueue, setServingQueue] = useState<QueueItem[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [skippedQueue, setSkippedQueue] = useState<QueueItem[]>([]);
  const [counters, setCounters] = useState<any[]>([]);
  const [currentTicket, setCurrentTicket] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchData = async () => {
      console.log("fetchData function called");
      const startTime = performance.now();
      try {
        const userLoadStart = performance.now();
        const userData = localStorage.getItem("user");
        const userLoadTime = performance.now() - userLoadStart;

        let parsedUser = null;
        if (userData) {
          parsedUser = JSON.parse(userData);
          // Only update user state if it's not set yet
          setUser((prev) => prev || parsedUser);
        }
        console.log(`User load time: ${userLoadTime.toFixed(2)}ms`);

        const apiStart = performance.now();
        const response = await queueService.getStatus();
        const { serving, waiting, skipped } = response.data;
        const apiTime = performance.now() - apiStart;
        console.log(`API fetch time: ${apiTime.toFixed(2)}ms`);

        if (!isMounted) return;

        const stateStart = performance.now();
        setServingQueue(serving);
        setWaitingQueue(waiting);
        setSkippedQueue(skipped || []);

        // Fetch counters if superadmin
        if (parsedUser?.role === "superadmin") {
          const counterRes = await counterService.getCounters();
          setCounters(counterRes.data);
        }

        // Find current ticket for this counter if counter user
        if (parsedUser?.counter_id) {
          const ticket = serving.find(
            (item: QueueItem) => item.counter_id === parsedUser.counter_id,
          );
          setCurrentTicket(ticket || null);
        }
        const stateTime = performance.now() - stateStart;
        console.log(`State update time: ${stateTime.toFixed(2)}ms`);

        const totalTime = performance.now() - startTime;
        console.log(`✓ Total fetchData time: ${totalTime.toFixed(2)}ms`);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (isMounted) {
          localStorage.removeItem("auth_token");
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          // Schedule next fetch only after current one completes
          timeoutId = setTimeout(fetchData, 2000);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  const handleLogout = async () => {
    console.log("handleLogout function called");
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

  const handleMarkComplete = async () => {
    console.log("handleMarkComplete function called", currentTicket);
    if (currentTicket && !isProcessing) {
      setIsProcessing(true);
      try {
        await queueService.completeService(currentTicket.ticket_id);
        const response = await queueService.getStatus();
        const { serving, skipped } = response.data;
        const ticket = serving.find(
          (item: QueueItem) => item.counter_id === user?.counter_id,
        );
        setCurrentTicket(ticket || null);
        setServingQueue(serving);
        setSkippedQueue(skipped || []);

        const successMsg = `✓ Ticket ${currentTicket.priority_number} marked as completed successfully!`;
        toast.success(successMsg);
      } catch (error) {
        console.error("Failed to mark complete:", error);
        toast.error("Failed to mark complete. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSkip = async () => {
    console.log("handleSkip function called", currentTicket);
    if (currentTicket && !isProcessing) {
      setIsProcessing(true);
      try {
        await queueService.skipTicket(currentTicket.ticket_id);
        const response = await queueService.getStatus();
        const { serving, skipped } = response.data;

        setCurrentTicket(null); // Explicitly clear current ticket
        setServingQueue(serving);
        setSkippedQueue(skipped || []);

        const successMsg = `Ticket ${currentTicket.priority_number} has been skipped.`;
        toast.info(successMsg);
      } catch (error) {
        console.error("Failed to skip ticket:", error);
        toast.error("Failed to skip ticket. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCaterAgain = async (ticket: QueueItem) => {
    console.log("handleCaterAgain function called", ticket);
    if (currentTicket) {
      const errorMsg = `You are already serving ticket ${currentTicket.priority_number}. Please complete or skip it first.`;
      toast.warning(errorMsg);
      return;
    }

    if (user?.counter_id && ticket && !isProcessing) {
      setIsProcessing(true);
      try {
        await queueService.caterTicket(ticket.ticket_id, user.counter_id);
        const response = await queueService.getStatus();
        const { serving, skipped } = response.data;

        const foundTicket = serving.find(
          (item: QueueItem) => item.counter_id === user.counter_id,
        );
        setCurrentTicket(foundTicket || null);
        setServingQueue(serving);
        setSkippedQueue(skipped || []);

        toast.success(
          `✓ Now serving skipped ticket ${foundTicket?.priority_number}`,
        );
      } catch (error) {
        console.error("Failed to cater ticket again:", error);
        toast.error("Failed to serve ticket. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCater = async (ticket: QueueItem) => {
    console.log("handleCater function called", {
      counter_id: user?.counter_id,
      ticket,
      currentTicket,
    });

    // Check if counter is already serving a ticket
    if (currentTicket) {
      const errorMsg = `You are already serving ticket ${currentTicket.priority_number}. Please complete it first before serving another ticket.`;
      console.warn(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    if (user?.counter_id && ticket && !isProcessing) {
      setIsProcessing(true);
      try {
        console.log(
          "Calling API with ticket_id:",
          ticket.ticket_id,
          "counter_id:",
          user.counter_id,
        );
        await queueService.callNext(user.counter_id);
        console.log("callNext API succeeded");
        const response = await queueService.getStatus();
        const { serving, waiting, skipped } = response.data;
        console.log("Updated serving queue:", serving);
        console.log("Updated waiting queue:", waiting);
        const foundTicket = serving.find(
          (item: QueueItem) => item.counter_id === user.counter_id,
        );
        setCurrentTicket(foundTicket || null);
        setServingQueue(serving);
        setWaitingQueue(waiting);
        setSkippedQueue(skipped || []);
        console.log("State updated with new ticket:", foundTicket);

        const successMsg = `✓ Successfully serving ticket ${foundTicket?.priority_number}`;
        toast.success(successMsg);
      } catch (error) {
        console.error("Failed to cater ticket:", error);
        toast.error("Failed to serve ticket. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    } else if (!user?.counter_id || !ticket) {
      const errorMsg =
        "Cannot serve ticket: Missing user counter ID or ticket information.";
      console.warn(errorMsg, { user, ticket });
      toast.error(errorMsg);
    }
  };

  const handleResetQueue = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset the entire queue? This will delete all current tickets for this session.",
      )
    ) {
      setIsProcessing(true);
      try {
        await queueService.resetQueue();
        const response = await queueService.getStatus();
        const { serving, waiting, skipped } = response.data;
        setServingQueue(serving);
        setWaitingQueue(waiting);
        setSkippedQueue(skipped || []);
        setCurrentTicket(null);
        toast.success("Queue has been reset successfully.");
      } catch (error) {
        console.error("Failed to reset queue:", error);
        toast.error("Failed to reset queue.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleToggleCounter = async (counter: any) => {
    try {
      await counterService.updateCounter(counter.id, {
        is_active: !counter.is_active,
      });
      const res = await counterService.getCounters();
      setCounters(res.data);
      toast.success(
        `Counter ${counter.id} ${!counter.is_active ? "enabled" : "disabled"} successfully.`,
      );
    } catch (error) {
      console.error("Failed to toggle counter:", error);
      toast.error("Failed to update counter status.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getServingByCounter = () => {
    console.log("getServingByCounter function called");
    const counterMap: { [key: number]: QueueItem } = {};
    servingQueue.forEach((item) => {
      if (item.counter_id && !counterMap[item.counter_id]) {
        counterMap[item.counter_id] = item;
      }
    });
    return counterMap;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/dmw.png" alt="DMW Logo" className="dmw-logo" />
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
        {user?.role === "counter" ? (
          <div className="counter-dashboard">
            <h2>Counter Service Panel</h2>
            <div className="counter-content">
              <div className="catered-section">
                <h3>CURRENT CATERED NUMBERS</h3>
                <div className="catered-counters">
                  {(() => {
                    const counterMap = getServingByCounter();
                    return [1, 2, 3, 4, 5].map((cId) => (
                      <div
                        key={cId}
                        className={`catered-counter ${
                          user?.counter_id === cId ? "active" : ""
                        }`}
                      >
                        <p className="counter-label">PRIORITY</p>
                        <p className="counter-number">
                          {counterMap[cId]?.priority_number || "—"}
                        </p>
                        <p className="counter-label">COUNTER {cId}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="serving-section">
                <h3>YOU ARE SERVING</h3>
                <div className="serving-display">
                  <p className="serving-number">
                    {currentTicket?.priority_number || "—"}
                  </p>
                  <button
                    className="mark-complete-btn"
                    onClick={handleMarkComplete}
                    disabled={isProcessing || !currentTicket}
                  >
                    {isProcessing ? "PROCESSING..." : "MARK AS COMPLETED"}
                  </button>
                  {currentTicket && (
                    <button
                      className="skip-link-btn"
                      onClick={handleSkip}
                      disabled={isProcessing}
                    >
                      SKIP THIS NUMBER
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h3>Dashboard</h3>
              <div className="not-catered">
                <div className="queue-list-column">
                  <div className="not-catered-list">
                    <p className="list-title">NOT CATERED NUMBERS:</p>
                    {waitingQueue.slice(0, 3).map((item) => (
                      <p key={item.ticket_id} className="not-catered-number">
                        {item.priority_number}
                      </p>
                    ))}
                  </div>
                  <div className="skipped-list">
                    <p className="list-title">SKIPPED NUMBERS:</p>
                    {skippedQueue.slice(0, 3).map((item) => (
                      <p key={item.ticket_id} className="skipped-number">
                        {item.priority_number}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="actions-column">
                  <div className="not-catered-actions">
                    <p className="actions-title">ACTIONS</p>
                    {waitingQueue.slice(0, 3).map((item) => (
                      <button
                        key={item.ticket_id}
                        className="cater-btn"
                        onClick={() => handleCater(item)}
                        disabled={currentTicket !== null || isProcessing}
                        title={
                          currentTicket
                            ? `Complete ticket ${currentTicket.priority_number} first`
                            : isProcessing
                              ? "Processing..."
                              : ""
                        }
                      >
                        {isProcessing ? "Processing..." : `CATER`}
                      </button>
                    ))}
                  </div>
                  <div className="skipped-actions">
                    <p className="actions-title invisible">ACTIONS</p>
                    {skippedQueue.slice(0, 3).map((item) => (
                      <button
                        key={item.ticket_id}
                        className="cater-again-btn"
                        onClick={() => handleCaterAgain(item)}
                        disabled={currentTicket !== null || isProcessing}
                      >
                        {isProcessing ? "..." : "CATER AGAIN"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Analytics
              servingQueue={servingQueue}
              waitingQueue={waitingQueue}
            />
          </div>
        ) : (
          <div className="admin-dashboard">
            <div className="admin-header-row">
              <h2>Super Admin Control Panel</h2>
              <button
                className="btn btn-danger btn-large"
                onClick={handleResetQueue}
                disabled={isProcessing}
              >
                {isProcessing ? "RESETTING..." : "RESET TODAY'S QUEUE"}
              </button>
            </div>

            <div className="overview-stats">
              <div className="stat-box">
                <span className="stat-label">TOTAL TICKETS</span>
                <span className="stat-value">
                  {waitingQueue.length +
                    servingQueue.length +
                    skippedQueue.length}
                </span>
              </div>
              <div className="stat-box">
                <span className="stat-label">WAITING</span>
                <span className="stat-value">{waitingQueue.length}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">SERVING</span>
                <span className="stat-value">{servingQueue.length}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">SKIPPED</span>
                <span className="stat-value">{skippedQueue.length}</span>
              </div>
            </div>

            <div className="admin-grid">
              <div className="admin-card counters-status">
                <h3>COUNTER STATUS</h3>
                <div className="counters-list">
                  {counters.map((counter) => (
                    <div key={counter.id} className="counter-item-admin">
                      <div className="counter-info">
                        <span className="counter-name">
                          {counter.counter_name}
                        </span>
                        <span
                          className={`status-badge ${counter.is_active ? "active" : "inactive"}`}
                        >
                          {counter.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                        <span className="current-user">
                          User: {counter.user?.name || "Unassigned"}
                        </span>
                      </div>
                      <div className="counter-actions">
                        <button
                          className={`btn ${counter.is_active ? "btn-warning" : "btn-success"}`}
                          onClick={() => handleToggleCounter(counter)}
                        >
                          {counter.is_active ? "DISABLE" : "ENABLE"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Analytics
                servingQueue={servingQueue}
                waitingQueue={waitingQueue}
                skippedQueue={skippedQueue}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
