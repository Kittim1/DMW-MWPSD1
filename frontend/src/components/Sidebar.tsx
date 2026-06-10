import "./Sidebar.css";

interface SidebarProps {
  role: string;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

function Sidebar({ role, onLogout, activeView, setActiveView }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/dmw.png" alt="DMW Logo" className="sidebar-logo" />
        <h2 className="sidebar-title">DMW MWPSD</h2>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveView("dashboard")}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </button>

        {role === "superadmin" && (
          <>
            <button
              className={`nav-item ${activeView === "reports" ? "active" : ""}`}
              onClick={() => setActiveView("reports")}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Reports</span>
            </button>
            <button
              className={`nav-item ${activeView === "logs" ? "active" : ""}`}
              onClick={() => setActiveView("logs")}
            >
              <span className="nav-icon">📜</span>
              <span className="nav-text">System Logs</span>
            </button>
          </>
        )}

        <button
          className={`nav-item ${activeView === "settings" ? "active" : ""}`}
          onClick={() => setActiveView("settings")}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
