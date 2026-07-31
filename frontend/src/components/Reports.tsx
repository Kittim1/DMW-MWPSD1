import { useEffect, useState } from "react";
import { queueService } from "../services/api";
import "./Reports.css";

function Reports() {
  const [reportType, setReportType] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    totalTickets: 0,
    served: 0,
    skipped: 0,
    cancelled: 0,
    avgWaitTime: "0m",
  });

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await queueService.getReports(reportType);
        setReportData(response.data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportType]);

  return (
    <div className="reports-section">
      <div className="reports-header">
        <h3>Queue Reports & Analytics</h3>
        <div className="report-tabs">
          <button
            className={`tab-btn ${reportType === "daily" ? "active" : ""}`}
            onClick={() => setReportType("daily")}
            disabled={loading}
          >
            Daily
          </button>
          <button
            className={`tab-btn ${reportType === "weekly" ? "active" : ""}`}
            onClick={() => setReportType("weekly")}
            disabled={loading}
          >
            Weekly
          </button>
          <button
            className={`tab-btn ${reportType === "monthly" ? "active" : ""}`}
            onClick={() => setReportType("monthly")}
            disabled={loading}
          >
            Monthly
          </button>
          <button
            className={`tab-btn ${reportType === "yearly" ? "active" : ""}`}
            onClick={() => setReportType("yearly")}
            disabled={loading}
          >
            Yearly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="reports-loading">Loading report data...</div>
      ) : (
        <>
          <div className="reports-grid">
            <div className="report-card primary">
              <span className="report-label">TOTAL TICKETS</span>
              <span className="report-value">{reportData.totalTickets}</span>
            </div>
            <div className="report-card success">
              <span className="report-label">SERVED</span>
              <span className="report-value">{reportData.served}</span>
            </div>
            <div className="report-card warning">
              <span className="report-label">SKIPPED</span>
              <span className="report-value">{reportData.skipped}</span>
            </div>
            <div className="report-card danger">
              <span className="report-label">CANCELLED</span>
              <span className="report-value">{reportData.cancelled}</span>
            </div>
            <div className="report-card info">
              <span className="report-label">AVG. WAIT TIME</span>
              <span className="report-value">{reportData.avgWaitTime}</span>
            </div>
          </div>

          <div className="charts-placeholder">
            <div className="chart-box">
              <h4>Service Efficiency</h4>
              <div className="placeholder-viz">
                <div className="efficiency-bar">
                  <div
                    className="efficiency-fill"
                    style={{
                      width:
                        reportData.totalTickets > 0
                          ? `${(reportData.served / reportData.totalTickets) * 100}%`
                          : "0%",
                    }}
                  ></div>
                </div>
                <p>
                  {reportData.totalTickets > 0
                    ? (
                        (reportData.served / reportData.totalTickets) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  % Completion Rate
                </p>
              </div>
            </div>
            <div className="chart-box">
              <h4>Volume Trends</h4>
              <div className="placeholder-viz">
                <div className="trend-lines">
                  <div className="trend-line" style={{ height: "40%" }}></div>
                  <div className="trend-line" style={{ height: "60%" }}></div>
                  <div className="trend-line" style={{ height: "45%" }}></div>
                  <div className="trend-line" style={{ height: "80%" }}></div>
                  <div className="trend-line" style={{ height: "55%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
