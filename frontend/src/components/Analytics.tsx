import { useEffect, useState } from "react";
import "./Analytics.css";

// Professional Bar Chart Component
function BarChart({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barHeight = 150;

  return (
    <div className="admin-analytics-card">
      <div className="card-header">
        <h4>{title}</h4>
      </div>
      <div className="chart-content bar-chart-content">
        <div className="bars-container">
          {data.map((item, idx) => (
            <div key={idx} className="bar-column">
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${(item.value / maxValue) * barHeight}px`,
                  }}
                >
                  <span className="bar-tooltip">{item.value}</span>
                </div>
              </div>
              <span className="bar-axis-label">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Professional Pie Chart Component
function PieChart({
  data,
  title,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const slices = data.map((item) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const sliceAngle = total > 0 ? (item.value / total) * 360 : 0;
    const startAngle = currentAngle;
    currentAngle += sliceAngle;

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return {
      ...item,
      percentage,
      startAngle,
      strokeDashoffset,
      circumference
    };
  });

  return (
    <div className="admin-analytics-card">
      <div className="card-header">
        <h4>{title}</h4>
      </div>
      <div className="chart-content pie-chart-content">
        <div className="pie-svg-wrapper">
          <svg width="160" height="160" viewBox="0 0 200 200">
            {slices.map((slice, idx) => (
              <circle
                key={idx}
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke={slice.color}
                strokeWidth="40"
                strokeDasharray={`${(slice.percentage / 100) * slice.circumference} ${
                  slice.circumference - (slice.percentage / 100) * slice.circumference
                }`}
                transform={`rotate(${slice.startAngle - 90} 100 100)`}
                className="pie-slice"
              />
            ))}
          </svg>
          <div className="pie-center-label">
            <span className="total-val">{total}</span>
            <span className="total-lbl">Total</span>
          </div>
        </div>
        <div className="pie-custom-legend">
          {slices.map((slice, idx) => (
            <div key={idx} className="legend-row">
              <span className="dot" style={{ backgroundColor: slice.color }} />
              <span className="lbl">{slice.name}</span>
              <span className="val">{slice.value}</span>
              <span className="pct">{slice.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AnalyticsProps {
  servingQueue: any[];
  waitingQueue: any[];
  skippedQueue?: any[];
}

function Analytics({ servingQueue, waitingQueue, skippedQueue = [] }: AnalyticsProps) {
  const [queueStats, setQueueStats] = useState({
    perCounter: [
      { name: "C1", value: 0 },
      { name: "C2", value: 0 },
      { name: "C3", value: 0 },
      { name: "C4", value: 0 },
      { name: "C5", value: 0 },
    ],
    statusBreakdown: [
      { name: "Serving", value: 0, color: "#4e73df" },
      { name: "Waiting", value: 0, color: "#1cc88a" },
      { name: "Skipped", value: 0, color: "#e74a3b" },
    ],
  });

  useEffect(() => {
    const perCounterData = [1, 2, 3, 4, 5].map((counterId) => ({
      name: `Counter ${counterId}`,
      value: servingQueue.filter((item) => item.counter_id === counterId).length,
    }));

    setQueueStats({
      perCounter: perCounterData,
      statusBreakdown: [
        { name: "Serving", value: servingQueue.length, color: "#4e73df" },
        { name: "Waiting", value: waitingQueue.length, color: "#1cc88a" },
        { name: "Skipped", value: skippedQueue.length, color: "#e74a3b" },
      ],
    });
  }, [servingQueue, waitingQueue, skippedQueue]);

  return (
    <div className="professional-analytics-grid">
      <PieChart
        data={queueStats.statusBreakdown}
        title="Live Status Summary"
      />
      <BarChart 
        data={queueStats.perCounter} 
        title="Active Load per Counter" 
      />
    </div>
  );
}

export default Analytics;
