import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Analytics from "../components/Analytics";
import Reports from "../components/Reports";
import Services from "../components/Services";
import Settings from "../components/Settings";
import Sidebar from "../components/Sidebar";
import SystemLogs from "../components/SystemLogs";
import {
    useLoadingOverlay,
    usePageLoading,
} from "../contexts/LoadingOverlayContext";
import { authService, counterService, queueService } from "../services/api";
import "./Dashboard.css";

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
  scheduled_time?: string;
  scheduled_day?: string;
  helpdesk_type?: string;
  assigned_counter_ids?: string;
  is_priority?: boolean;
  priority_type?: string;
  called_at?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  counter_id?: number;
}

// Client-side safety sort: Priority tickets (is_priority=true) ALWAYS first,
// then by priority number ascending. Backend also sorts this way, this is a
// double-guard so priority never appears below non-priority in any list.
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

// Sort serving tickets: priority first, then by called_at ascending.
function sortServingPriorityFirst<
  T extends { is_priority?: boolean; called_at?: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ap = a.is_priority ? 1 : 0;
    const bp = b.is_priority ? 1 : 0;
    if (ap !== bp) return bp - ap;
    const ta = a.called_at ? new Date(a.called_at).getTime() : 0;
    const tb = b.called_at ? new Date(b.called_at).getTime() : 0;
    return ta - tb;
  });
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [servingQueue, setServingQueue] = useState<QueueItem[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [skippedQueue, setSkippedQueue] = useState<QueueItem[]>([]);
  const [counters, setCounters] = useState<any[]>([]);
  const [currentTicket, setCurrentTicket] = useState<QueueItem | null>(null);
  const [currentlyServingTickets, setCurrentlyServingTickets] = useState<
    QueueItem[]
  >([]);
  const [maxConcurrent, setMaxConcurrent] = useState<number>(1);
  const [_stats, setStats] = useState<{
    counterCounts: { [key: number]: number };
    sessionTotals: { morning: number; afternoon: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [reportPeriod, setReportPeriod] = useState("daily");
  const [reports, setReports] = useState<any>(null);

  // Forward modal state
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedTargetCounter, setSelectedTargetCounter] = useState<
    number | null
  >(null);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const showLoadingRef = useRef(showLoading);
  const hideLoadingRef = useRef(hideLoading);
  useEffect(() => {
    showLoadingRef.current = showLoading;
    hideLoadingRef.current = hideLoading;
  });

  usePageLoading(loading, "", 300);

  const handleSwitchView = (view: string) => {
    if (view === activeView) return;
    showLoadingRef.current("", 150);
    setTimeout(() => {
      setActiveView(view);
      setTimeout(() => hideLoadingRef.current(), 30);
    }, 100);
  };

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

        let parsedUser: User | null = null;
        if (userData) {
          parsedUser = JSON.parse(userData) as User;
          // Only update user state if it's not set yet
          setUser((prev) => prev || parsedUser);
        }
        console.log(`User load time: ${userLoadTime.toFixed(2)}ms`);

        const apiStart = performance.now();
        const response = await queueService.getStatus();
        const { serving, waiting, skipped, stats: apiStats } = response.data;
        const apiTime = performance.now() - apiStart;
        console.log(`API fetch time: ${apiTime.toFixed(2)}ms`);

        if (!isMounted) return;

        const stateStart = performance.now();
        setServingQueue(sortServingPriorityFirst(serving as QueueItem[]));
        setWaitingQueue(sortPriorityFirst(waiting as QueueItem[]));
        setSkippedQueue(
          sortPriorityFirst(skipped ? (skipped as QueueItem[]) : []),
        );
        setStats(apiStats || null);

        console.log("=== Debug ===");
        console.log("User:", parsedUser);
        console.log("User counter_id:", parsedUser?.counter_id);
        console.log("All waiting tickets:", waiting);

        // Fetch counters for all roles except guard (guard doesn't use this section)
        let counterList: any[] = [];
        if (parsedUser?.role !== "guard") {
          const counterRes = await counterService.getCounters();
          counterList = counterRes.data || [];
          setCounters(counterList);
        }

        // Find ALL tickets currently being served by this counter (Counter 5 can have 2+)
        if (parsedUser?.counter_id) {
          const ticketsForCounter = sortServingPriorityFirst(
            serving.filter(
              (item: QueueItem) => item.counter_id === parsedUser.counter_id,
            ) as QueueItem[],
          );
          setCurrentlyServingTickets(ticketsForCounter);
          setCurrentTicket(ticketsForCounter[0] || null);

          // Look up maximum concurrent ticket capacity for this counter
          const thisCounter = counterList.find(
            (c: any) => c.id === parsedUser?.counter_id,
          );
          const capacity =
            thisCounter?.max_concurrent ??
            (parsedUser.counter_id === 5 ? 2 : 1);
          setMaxConcurrent(Math.max(1, capacity as number));
        }

        // Fetch reports for counter or superadmin
        if (
          parsedUser?.role === "counter" ||
          parsedUser?.role === "superadmin"
        ) {
          const reportRes = await queueService.getReports(
            reportPeriod,
            parsedUser.counter_id,
          );
          setReports(reportRes.data);
        }
        const stateTime = performance.now() - stateStart;
        console.log(`State update time: ${stateTime.toFixed(2)}ms`);

        const totalTime = performance.now() - startTime;
        console.log(`✅ Total fetchData time: ${totalTime.toFixed(2)}ms`);
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
  }, [navigate, reportPeriod]);

  useEffect(() => {
    if ((user?.role === "counter" || user?.role === "superadmin") && !loading) {
      queueService.getReports(reportPeriod, user?.counter_id).then((res) => {
        setReports(res.data);
      });
    }
  }, [reportPeriod, user]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      showLoadingRef.current("", 250);
      try {
        await authService.logout();
        toast.info("Logged out successfully.");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed. Please try again.");
      } finally {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setTimeout(() => {
          navigate("/login");
        }, 100);
      }
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleMarkComplete = async () => {
    console.log("handleMarkComplete function called", currentTicket);
    if (currentTicket && !isProcessing) {
      setIsProcessing(true);
      try {
        const completedTicketNumber = currentTicket.priority_number;
        await queueService.completeService(currentTicket.ticket_id);
        const response = await queueService.getStatus();
        const { serving, skipped } = response.data;

        const allForCounter = sortServingPriorityFirst(
          serving.filter(
            (item: QueueItem) => item.counter_id === user?.counter_id,
          ) as QueueItem[],
        );
        setCurrentlyServingTickets(allForCounter);
        setCurrentTicket(allForCounter[0] || null);
        setServingQueue(sortServingPriorityFirst(serving as QueueItem[]));
        setSkippedQueue(
          sortPriorityFirst(skipped ? (skipped as QueueItem[]) : []),
        );

        const successMsg = `✅ Ticket ${completedTicketNumber} marked as completed successfully!`;
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
        const skippedTicketNumber = currentTicket.priority_number;
        await queueService.skipTicket(currentTicket.ticket_id);
        const response = await queueService.getStatus();
        const { serving, skipped } = response.data;

        const allForCounter = sortServingPriorityFirst(
          serving.filter(
            (item: QueueItem) => item.counter_id === user?.counter_id,
          ) as QueueItem[],
        );
        setCurrentlyServingTickets(allForCounter);
        setCurrentTicket(allForCounter[0] || null);
        setServingQueue(sortServingPriorityFirst(serving as QueueItem[]));
        setSkippedQueue(
          sortPriorityFirst(skipped ? (skipped as QueueItem[]) : []),
        );

        const successMsg = `Ticket ${skippedTicketNumber} has been skipped.`;
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
    const atCapacity = currentlyServingTickets.length >= maxConcurrent;
    if (atCapacity) {
      const errorMsg = `You are already serving ${currentlyServingTickets.length}/${maxConcurrent} ticket(s). Please complete one first.`;
      toast.warning(errorMsg);
      return;
    }

    if (user?.counter_id && ticket && !isProcessing) {
      setIsProcessing(true);
      try {
        await queueService.caterTicket(ticket.ticket_id, user.counter_id);
        const response = await queueService.getStatus();
        const { serving, skipped } = response.data;

        const allForCounter = sortServingPriorityFirst(
          serving.filter(
            (item: QueueItem) => item.counter_id === user.counter_id,
          ) as QueueItem[],
        );
        setCurrentlyServingTickets(allForCounter);
        setCurrentTicket(allForCounter[0] || null);
        setServingQueue(sortServingPriorityFirst(serving as QueueItem[]));
        setSkippedQueue(
          sortPriorityFirst(skipped ? (skipped as QueueItem[]) : []),
        );

        toast.success(
          `✅ Now serving skipped ticket ${allForCounter[allForCounter.length - 1]?.priority_number || ticket.priority_number}`,
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

    // Check if counter is at its max concurrent capacity (Counter 5 can serve 2)
    const atCapacity = currentlyServingTickets.length >= maxConcurrent;
    if (atCapacity) {
      const errorMsg = `You are already serving ${currentlyServingTickets.length}/${maxConcurrent} ticket(s). Please complete one first before serving another.`;
      console.warn(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    if (user?.counter_id && ticket && !isProcessing) {
      setIsProcessing(true);
      try {
        const isClaireOrLizaOrEda = [
          "claire@dmw.com",
          "liza@dmw.com",
          "eda@dmw.com",
        ].includes(user.email);

        if (isClaireOrLizaOrEda) {
          // Allow selecting any ticket for DH/G2G users
          console.log(
            "Calling caterTicket with ticket_id:",
            ticket.ticket_id,
            "counter_id:",
            user.counter_id,
          );
          await queueService.caterTicket(ticket.ticket_id, user.counter_id);
        } else {
          // For other counters, use callNext (FCFS)
          console.log("Calling callNext with counter_id:", user.counter_id);
          await queueService.callNext(user.counter_id);
        }

        console.log("API succeeded");
        const response = await queueService.getStatus();
        const { serving, waiting, skipped } = response.data;
        console.log("Updated serving queue:", serving);
        console.log("Updated waiting queue:", waiting);

        const allForCounter = sortServingPriorityFirst(
          serving.filter(
            (item: QueueItem) => item.counter_id === user?.counter_id,
          ) as QueueItem[],
        );
        setCurrentlyServingTickets(allForCounter);
        const firstTicket = allForCounter[0] || null;
        setCurrentTicket(firstTicket);
        setServingQueue(sortServingPriorityFirst(serving as QueueItem[]));
        setWaitingQueue(sortPriorityFirst(waiting as QueueItem[]));
        setSkippedQueue(
          sortPriorityFirst(skipped ? (skipped as QueueItem[]) : []),
        );
        console.log("State updated with new tickets:", allForCounter);

        const successMsg = `✅ Successfully serving ticket ${firstTicket?.priority_number || ticket.priority_number}`;
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

        const allForCounter = sortServingPriorityFirst(
          serving.filter(
            (item: QueueItem) => item.counter_id === user?.counter_id,
          ) as QueueItem[],
        );
        setCurrentlyServingTickets(allForCounter);
        setServingQueue(sortServingPriorityFirst(serving as QueueItem[]));
        setWaitingQueue(sortPriorityFirst(waiting as QueueItem[]));
        setSkippedQueue(
          sortPriorityFirst(skipped ? (skipped as QueueItem[]) : []),
        );
        setCurrentTicket(allForCounter[0] || null);
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

  const handleForward = async () => {
    if (!currentTicket || !selectedTargetCounter) return;

    setIsProcessing(true);
    try {
      await queueService.forwardTicket(
        currentTicket.ticket_id,
        selectedTargetCounter,
      );
      // Refresh queue data
      const response = await queueService.getStatus();
      const { serving, waiting, skipped } = response.data;

      const allForCounter = sortServingPriorityFirst(
        serving.filter((item: QueueItem) => item.counter_id === user?.counter_id) as QueueItem[],
      );
      setCurrentlyServingTickets(allForCounter);
      setServingQueue(sortServingPriorityFirst(serving as QueueItem[]));
      setWaitingQueue(sortPriorityFirst(waiting as QueueItem[]));
      setSkippedQueue(sortPriorityFirst(skipped ? (skipped as QueueItem[]) : []));
      setCurrentTicket(allForCounter[0] || null);
      setShowForwardModal(false);
      setSelectedTargetCounter(null);
      toast.success("Ticket forwarded successfully!");
    } catch (error) {
      console.error("Failed to forward ticket:", error);
      toast.error("Failed to forward ticket.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Mockup Layout: reusable ticket filters (for counter dashboard) ----
  const getFilteredWaiting = (): QueueItem[] => {
    if (!user) return [];
    return waitingQueue.filter((item: QueueItem) => {
      const isClaireOrLizaOrEda = [
        "claire@dmw.com",
        "liza@dmw.com",
        "eda@dmw.com",
      ].includes(user.email);
      let assignedIds: number[] = [];
      if (Array.isArray((item as any).assigned_counter_ids)) {
        assignedIds = (item as any).assigned_counter_ids;
      } else if (typeof (item as any).assigned_counter_ids === "string") {
        try {
          const parsed = JSON.parse((item as any).assigned_counter_ids);
          assignedIds = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          assignedIds = [];
        }
      }
      if (isClaireOrLizaOrEda) {
        return (
          ["Direct Hire", "G to G"].includes(item.service_type!) ||
          (!!user.counter_id && assignedIds.includes(user.counter_id))
        );
      }
      if (!user.counter_id) return false;
      return assignedIds.includes(user.counter_id) || assignedIds.length === 0;
    });
  };

  const getFilteredSkipped = (): QueueItem[] => {
    if (!user) return [];
    return skippedQueue.filter((item: QueueItem) => {
      const isClaireOrLizaOrEda = [
        "claire@dmw.com",
        "liza@dmw.com",
        "eda@dmw.com",
      ].includes(user.email);
      let assignedIds: number[] = [];
      if (Array.isArray((item as any).assigned_counter_ids)) {
        assignedIds = (item as any).assigned_counter_ids;
      } else if (typeof (item as any).assigned_counter_ids === "string") {
        try {
          const parsed = JSON.parse((item as any).assigned_counter_ids);
          assignedIds = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          assignedIds = [];
        }
      }
      if (isClaireOrLizaOrEda) {
        return (
          ["Direct Hire", "G to G"].includes(item.service_type!) ||
          (!!user.counter_id && assignedIds.includes(user.counter_id))
        );
      }
      if (!user.counter_id) return false;
      return assignedIds.includes(user.counter_id) || assignedIds.length === 0;
    });
  };

  if (user?.role === "guard") {
    useEffect(() => {
      navigate("/guard", { replace: true });
    }, [navigate]);
    return null;
  }

  const isCounterDashboard =
    user?.role === "counter" && activeView === "dashboard";

  return (
    <div className="dashboard-layout">
      {!isCounterDashboard && (
        <Sidebar
          role={user?.role || ""}
          onLogout={handleLogout}
          activeView={activeView}
          setActiveView={handleSwitchView}
        />
      )}

      <div
        className={`dashboard-container ${isCounterDashboard ? "counter-fullwidth" : ""}`}
      >
        {!isCounterDashboard && (
          <header className="dashboard-header">
            <div className="header-content">
              <h1>
                {activeView === "dashboard"
                  ? "Queue Management Dashboard"
                  : activeView === "services"
                    ? "Services Management"
                    : activeView === "reports"
                      ? "Reports & Analytics"
                      : activeView === "logs"
                        ? "System Activity Logs"
                        : "Settings"}
              </h1>
              <div className="user-info">
                <span className="user-name">
                  Welcome, {user?.name} ({user?.role})
                </span>
              </div>
            </div>
          </header>
        )}

        <main className="dashboard-main">
          {activeView === "services" ? (
            <Services />
          ) : activeView === "reports" ? (
            <Reports />
          ) : activeView === "logs" ? (
            <SystemLogs />
          ) : activeView === "settings" ? (
            <Settings user={user} onUserUpdate={handleUserUpdate} />
          ) : user?.role === "counter" ? (
            <div className="counter-mockup-dashboard">
              {/* ========== TOP HEADER (DMW branding + user) ========== */}
              <header className="mockup-header">
                <div className="mockup-header-left">
                  <div className="dmw-seal" aria-label="DMW Seal">
                    <img src="/dmw.png" alt="DMW Seal" className="seal-img" />
                  </div>
                  <div className="dmw-text">
                    <p className="dmw-republic">Republic of the Philippines</p>
                    <p className="dmw-dept">DEPARTMENT OF MIGRANT WORKERS</p>
                    <p className="dmw-office">Regional Office X</p>
                  </div>
                </div>
                <div className="mockup-header-right">
                  <div className="hello-user">
                    hello, Counter{user?.counter_id ?? ""}
                  </div>
                  <div className="user-avatar" aria-hidden="true">
                    <svg viewBox="0 0 40 40" width="40" height="40">
                      <rect
                        x="0"
                        y="0"
                        width="40"
                        height="40"
                        fill="#fff"
                        rx="4"
                      />
                      <circle cx="20" cy="15" r="7" fill="#222" />
                      <path
                        d="M 6 38 Q 6 26 20 26 Q 34 26 34 38 Z"
                        fill="#222"
                      />
                    </svg>
                  </div>
                </div>
              </header>

              {/* ========== MAIN BODY: custom left sidebar + right content ========== */}
              <div className="mockup-body">
                {/* LEFT SIDEBAR */}
                <aside className="mockup-sidebar">
                  <div className="sidebar-brand">
                    <p className="brand-line1">DMW ROX</p>
                    <p className="brand-line2">MWPSD</p>
                  </div>

                  <button
                    className={`sidebar-btn ${activeView === "dashboard" ? "active" : ""}`}
                    onClick={() => handleSwitchView("dashboard")}
                  >
                    DASHBOARD
                  </button>
                  <button
                    className={`sidebar-btn ${activeView === "settings" ? "active" : ""}`}
                    onClick={() => handleSwitchView("settings")}
                  >
                    SETTINGS
                  </button>

                  <div className="sidebar-spacer"></div>

                  <button className="sidebar-logout" onClick={handleLogout}>
                    LOGOUT
                  </button>
                </aside>

                {/* RIGHT CONTENT AREA */}
                <main className="mockup-main">
                  {/* ===== TOP ROW: YELLOW — Current Catered Numbers left + You Are Serving right ===== */}
                  <div className="mockup-top-row">
                    {/* LEFT: Current Catered Numbers */}
                    <section className="mockup-section mockup-yellow mockup-catered-wrap">
                      <h2 className="mockup-section-title">
                        CURRENT CATERED NUMBERS
                      </h2>
                      <div className="mockup-catered-counters">
                        {(() => {
                          // Build slot list: for counters with max_concurrent > 1, render 2 cards
                          const slotList: Array<{
                            counterId: number;
                            counterName: string;
                            isActive: boolean;
                            ticket: QueueItem | undefined;
                            serviceLabel: string;
                            displayNumber: string;
                            isPriority: boolean;
                          }> = [];
                          const serviceHeaderByCounter: Record<number, string> =
                            {
                              1: "",
                              2: "PEOS",
                              3: "INFO SHEET",
                              4: "DIRECT HIRE",
                              5: "WITH APPOINTMENT",
                            };
                          counters
                            .filter((c) => c.is_active)
                            .forEach((counter) => {
                              const slots = Math.max(
                                1,
                                counter.max_concurrent ??
                                  (counter.id === 5 ? 2 : 1),
                              );
                              const ticketsForCounter = servingQueue.filter(
                                (t: any) => t.counter_id === counter.id,
                              );
                              for (let s = 0; s < slots; s++) {
                                const ticket = ticketsForCounter[s];
                                const hasAppt = Boolean(
                                  (ticket as any)?.has_appointment,
                                );
                                const rawService =
                                  (ticket as any)?.service_type ||
                                  ((ticket as any)?.services &&
                                    (ticket as any).services[0]) ||
                                  "";
                                // If counter has a static header (per mockup) prefer it for
                                // the top service-label line; fall back to the ticket's service.
                                const headerLabel =
                                  (counter.id === 5
                                    ? hasAppt
                                      ? serviceHeaderByCounter[5]
                                      : ""
                                    : serviceHeaderByCounter[counter.id]) ||
                                  (rawService === "PEOS"
                                    ? "PEOS"
                                    : rawService === "Information Sheet"
                                      ? "INFO SHEET"
                                      : rawService === "Direct Hire"
                                        ? "DIRECT HIRE"
                                        : rawService === "Balik Manggagawa"
                                          ? hasAppt
                                            ? "WITH APPOINTMENT"
                                            : ""
                                          : rawService || "");
                                const identifier =
                                  (ticket as any)?.ticket_identifier ||
                                  (ticket as any)?.priority_number;
                                const displayNumber = identifier
                                  ? String(identifier).includes("-")
                                    ? identifier
                                    : identifier
                                  : "----";
                                slotList.push({
                                  counterId: counter.id,
                                  counterName: `COUNTER ${counter.id}`,
                                  isActive: user?.counter_id === counter.id,
                                  ticket,
                                  serviceLabel: headerLabel,
                                  displayNumber,
                                  isPriority: !!(ticket as any)?.is_priority,
                                });
                              }
                            });
                          return slotList.map((slot, idx) => (
                            <div
                              key={`counter-${slot.counterId}-slot-${idx}`}
                              className={`mockup-catered-card ${slot.isActive ? "active" : ""} ${slot.isPriority ? "priority" : ""}`}
                            >
                              {slot.serviceLabel && (
                                <p className="mockup-catered-service">
                                  {slot.serviceLabel}
                                </p>
                              )}
                              <p
                                className={`mockup-catered-number ${slot.isPriority ? "priority-text" : ""}`}
                              >
                                {slot.displayNumber}
                              </p>
                              <p className="mockup-catered-counter-label">
                                {slot.counterName}
                              </p>
                            </div>
                          ));
                        })()}
                      </div>
                    </section>

                    {/* RIGHT: You Are Serving */}
                    <section className="mockup-section mockup-yellow mockup-serving-wrap">
                      <h2 className="mockup-section-title">YOU ARE SERVING</h2>
                      <div
                        className={`mockup-serving-box ${currentTicket?.is_priority ? "priority" : ""}`}
                      >
                        <p
                          className={`mockup-serving-number ${currentTicket?.is_priority ? "priority-text" : ""}`}
                        >
                          {currentTicket?.priority_number || "00"}
                        </p>
                        {currentTicket?.is_priority &&
                          currentTicket?.priority_type && (
                            <p className="mockup-serving-priority-tag">
                              ⚑ {currentTicket.priority_type}
                            </p>
                          )}
                        <button
                          className="mockup-mark-complete"
                          onClick={handleMarkComplete}
                          disabled={isProcessing || !currentTicket}
                        >
                          {isProcessing ? "PROCESSING..." : "MARK AS COMPLETE"}
                        </button>
                        <button
                          className="mockup-skip-link"
                          onClick={handleSkip}
                          disabled={isProcessing || !currentTicket}
                        >
                          SKIP THIS NUMBER
                        </button>
                        {currentTicket &&
                          (user?.counter_id === 1 || user?.counter_id === 2) &&
                          (currentTicket.service_type === "Help Desk" ||
                            currentTicket.helpdesk_type?.includes(
                              "Inquiry",
                            )) && (
                            <button
                              className="mockup-forward-btn"
                              onClick={() => setShowForwardModal(true)}
                              disabled={isProcessing}
                            >
                              FORWARD TO COUNTER
                            </button>
                          )}
                      </div>
                    </section>
                  </div>

                  {/* ===== BOTTOM ROW: LIGHT BLUE — NOT CATERED / PRIORITY / SKIPPED with ACTIONS ===== */}
                  <section className="mockup-section mockup-bottom-section">
                    <img
                      src="/dmw.png"
                      alt=""
                      className="mockup-bottom-watermark"
                      aria-hidden="true"
                    />
                    <div className="mockup-bottom-grid">
                      {(() => {
                        const allWaiting = getFilteredWaiting();
                        const regularWaiting = allWaiting.filter(
                          (t) => !t.is_priority,
                        );
                        const priorityWaiting = allWaiting.filter(
                          (t) => t.is_priority,
                        );
                        const caterDisabled =
                          currentlyServingTickets.length >= maxConcurrent ||
                          isProcessing;

                        return (
                          <>
                            {/* ----- NOT CATERED NUMBERS column ----- */}
                            <div className="mockup-bottom-col mockup-col-not-catered">
                              <div className="mockup-col-head-row">
                                <div className="mockup-col-head">
                                  <p className="mockup-col-title">
                                    NOT CATERED NUMBERS:
                                  </p>
                                </div>
                                <div className="mockup-col-head">
                                  <p className="mockup-col-title">ACTIONS</p>
                                </div>
                              </div>
                              <div className="mockup-col-body">
                                {regularWaiting.length > 0 ? (
                                  regularWaiting.map((item) => (
                                    <div
                                      key={item.ticket_id}
                                      className="mockup-row"
                                    >
                                      <div className="mockup-cell mockup-cell-number">
                                        <p className="mockup-ticket-num">
                                          {item.priority_number}
                                        </p>
                                      </div>
                                      <div className="mockup-cell mockup-cell-action">
                                        <button
                                          className="mockup-cater-btn"
                                          onClick={() => handleCater(item)}
                                          disabled={caterDisabled}
                                          title={
                                            caterDisabled
                                              ? currentlyServingTickets.length >=
                                                maxConcurrent
                                                ? `Serving ${currentlyServingTickets.length}/${maxConcurrent} slots`
                                                : "Processing..."
                                              : "Call and cater this ticket"
                                          }
                                        >
                                          {isProcessing ? "..." : "CATER"}
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="mockup-row mockup-empty">
                                    <div className="mockup-cell mockup-cell-number">
                                      <p className="mockup-ticket-num mockup-empty-text">
                                        —
                                      </p>
                                    </div>
                                    <div className="mockup-cell mockup-cell-action">
                                      <button
                                        className="mockup-cater-btn"
                                        disabled
                                      >
                                        CATER
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ----- VERTICAL DIVIDER ----- */}
                            <div className="mockup-col-divider-v"></div>

                            {/* ----- PRIORITY column (dedicated, always visible per mockup) ----- */}
                            <div className="mockup-bottom-col mockup-col-priority">
                              <div className="mockup-col-head-row">
                                <div className="mockup-col-head">
                                  <p className="mockup-col-title mockup-col-title-priority">
                                    ⚑ PRIORITY:
                                  </p>
                                </div>
                                <div className="mockup-col-head">
                                  <p className="mockup-col-title">ACTIONS</p>
                                </div>
                              </div>
                              <div className="mockup-col-body">
                                {priorityWaiting.length > 0 ? (
                                  priorityWaiting.map((item) => (
                                    <div
                                      key={item.ticket_id}
                                      className="mockup-row mockup-row-priority"
                                    >
                                      <div className="mockup-cell mockup-cell-number">
                                        <p className="mockup-ticket-num mockup-ticket-num-priority">
                                          {item.priority_number}
                                          <span className="mockup-priority-chip">
                                            {item.priority_type || "PRIORITY"}
                                          </span>
                                        </p>
                                      </div>
                                      <div className="mockup-cell mockup-cell-action">
                                        <button
                                          className="mockup-cater-btn mockup-cater-btn-priority"
                                          onClick={() => handleCater(item)}
                                          disabled={caterDisabled}
                                          title={
                                            caterDisabled
                                              ? currentlyServingTickets.length >=
                                                maxConcurrent
                                                ? `Serving ${currentlyServingTickets.length}/${maxConcurrent} slots`
                                                : "Processing..."
                                              : "Call priority ticket"
                                          }
                                        >
                                          {isProcessing ? "..." : "CATER"}
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="mockup-row mockup-empty">
                                    <div className="mockup-cell mockup-cell-number">
                                      <p className="mockup-ticket-num mockup-empty-text">
                                        —
                                      </p>
                                    </div>
                                    <div className="mockup-cell mockup-cell-action">
                                      <button
                                        className="mockup-cater-btn mockup-cater-btn-priority"
                                        disabled
                                      >
                                        CATER
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* ===== HORIZONTAL DIVIDER + SKIPPED NUMBERS ROW below ===== */}
                    <div className="mockup-divider-h"></div>

                    <div className="mockup-skipped-row">
                      <div className="mockup-bottom-col mockup-col-skipped">
                        <div className="mockup-col-head-row">
                          <div className="mockup-col-head">
                            <p className="mockup-col-title">SKIPPED NUMBERS:</p>
                          </div>
                          <div className="mockup-col-head">
                            <p className="mockup-col-title">ACTIONS</p>
                          </div>
                        </div>
                        <div className="mockup-skipped-body">
                          {(() => {
                            const skippedList = getFilteredSkipped();
                            const caterAgainDisabled =
                              currentlyServingTickets.length >= maxConcurrent ||
                              isProcessing;
                            return (
                              <>
                                <div className="mockup-skipped-numbers">
                                  {skippedList.length > 0 ? (
                                    skippedList.map((item) => (
                                      <div
                                        key={`num-${item.ticket_id}`}
                                        className={`mockup-cell mockup-cell-number ${item.is_priority ? "priority" : ""}`}
                                      >
                                        <p
                                          className={`mockup-ticket-num mockup-ticket-num-skipped ${item.is_priority ? "priority-text" : ""}`}
                                        >
                                          {item.priority_number}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="mockup-cell mockup-cell-number">
                                      <p className="mockup-ticket-num mockup-empty-text">
                                        —
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="mockup-skipped-actions">
                                  {skippedList.length > 0 ? (
                                    skippedList.map((item) => (
                                      <div
                                        key={`act-${item.ticket_id}`}
                                        className="mockup-skipped-action-row"
                                      >
                                        <button
                                          className="mockup-cater-again-btn"
                                          onClick={() => handleCaterAgain(item)}
                                          disabled={caterAgainDisabled}
                                          title={
                                            caterAgainDisabled
                                              ? currentlyServingTickets.length >=
                                                maxConcurrent
                                                ? `Serving ${currentlyServingTickets.length}/${maxConcurrent} slots`
                                                : "Processing..."
                                              : "Re-cater this skipped ticket"
                                          }
                                        >
                                          {isProcessing ? "..." : "CATER AGAIN"}
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="mockup-skipped-action-row">
                                      <button
                                        className="mockup-cater-again-btn"
                                        disabled
                                      >
                                        CATER AGAIN
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </section>
                </main>
              </div>

              {/* Forward Modal (still needed for Ctr 1/2 with Help Desk/Inquiry tickets) */}
              {showForwardModal && (
                <div
                  className="ticket-modal-overlay"
                  onClick={() => {
                    setShowForwardModal(false);
                    setSelectedTargetCounter(null);
                  }}
                >
                  <div
                    className="ticket-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="ticket-header">
                      <h3>Select target counter</h3>
                    </div>
                    <div className="ticket-content">
                      <div className="counter-selection-grid">
                        {counters
                          .filter(
                            (counter) =>
                              counter.is_active &&
                              counter.id !== user?.counter_id,
                          )
                          .map((counter) => (
                            <button
                              key={counter.id}
                              className={`service-btn ${
                                selectedTargetCounter === counter.id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                setSelectedTargetCounter(counter.id)
                              }
                            >
                              {counter.counter_name}
                            </button>
                          ))}
                      </div>
                    </div>
                    <button
                      className="close-modal-btn"
                      onClick={handleForward}
                      disabled={!selectedTargetCounter || isProcessing}
                    >
                      Forward
                    </button>
                  </div>
                </div>
              )}
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

              {/* Reports section below the main admin grid */}
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
                        <span className="stat-value">
                          {reports.totalTickets}
                        </span>
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
                                <span className="service-type-name">
                                  {type}
                                </span>
                                <span className="service-type-count">
                                  {count as number}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                    {reports.counterBreakdown &&
                      Object.keys(reports.counterBreakdown).length > 0 && (
                        <div className="counter-breakdown-section">
                          <h4>Counter Performance</h4>
                          <div className="counter-breakdown-grid">
                            {Object.entries(reports.counterBreakdown).map(
                              ([counterId, data]: [string, any]) => (
                                <div
                                  key={counterId}
                                  className="counter-breakdown-card"
                                >
                                  <span className="counter-label">
                                    Counter {counterId}
                                  </span>
                                  <div className="counter-stats">
                                    <div className="counter-stat-item">
                                      <span className="stat-label">Total</span>
                                      <span className="stat-value">
                                        {data.total}
                                      </span>
                                    </div>
                                    <div className="counter-stat-item">
                                      <span className="stat-label">Served</span>
                                      <span className="stat-value">
                                        {data.served}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
              <Reports />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
