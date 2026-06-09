import { useEffect, useState } from "react";
import { queueService } from "../services/api";
import "./SystemLogs.css";

interface LogEntry {
  id: number;
  action: string;
  details: string;
  created_at: string;
  user?: {
    name: string;
  };
}

function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await queueService.getLogs();
        setLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Poll for new logs every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "catered":
        return "🔔";
      case "catered_again":
        return "🔄";
      case "completed":
        return "✅";
      case "skipped":
        return "⏭️";
      case "cancelled":
        return "❌";
      default:
        return "📝";
    }
  };

  return (
    <div className="logs-section">
      <div className="logs-header">
        <h3>System Activity Logs</h3>
        <span className="live-badge">LIVE UPDATES</span>
      </div>

      <div className="logs-container">
        {loading ? (
          <div className="logs-loading">Loading system activities...</div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">No activity recorded yet.</div>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className={`log-entry ${log.action}`}>
                <div className="log-icon">{getActionIcon(log.action)}</div>
                <div className="log-body">
                  <p className="log-details">{log.details}</p>
                  <div className="log-meta">
                    <span className="log-user">
                      By: {log.user?.name || "System"}
                    </span>
                    <span className="log-dot">•</span>
                    <span className="log-time">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SystemLogs;
