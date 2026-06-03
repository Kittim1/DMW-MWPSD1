import { useEffect, useState } from "react";
import "./Analytics.css";

// Simple Bar Chart Component
function BarChart({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const barHeight = 200;

  return (
    <div className="chart-container bar-chart">
      <h4>{title}</h4>
      <div className="chart-content">
        <div className="bars">
          {data.map((item, idx) => (
            <div key={idx} className="bar-item">
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    height: `${(item.value / maxValue) * barHeight}px`,
                  }}
                />
              </div>
              <span className="bar-label">{item.name}</span>
              <span className="bar-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Pie Chart Component
function PieChart({
  data,
  title,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const slices = data.map((item, idx) => {
    const percentage = (item.value / total) * 100;
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    currentAngle = endAngle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      strokeDashoffset,
    };
  });

  return (
    <div className="chart-container pie-chart">
      <h4>{title}</h4>
      <div className="chart-content">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, idx) => {
            const radius = 60;
            const circumference = 2 * Math.PI * radius;
            const rotation = slice.startAngle - 90;

            return (
              <circle
                key={idx}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="30"
                strokeDasharray={`${(slice.percentage / 100) * circumference} ${
                  circumference - (slice.percentage / 100) * circumference
                }`}
                transform={`rotate(${rotation} 100 100)`}
              />
            );
          })}
        </svg>
        <div className="pie-legend">
          {slices.map((slice, idx) => (
            <div key={idx} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: slice.color }}
              />
              <span>{slice.name}: {slice.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Line Chart Component
function LineChart({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const chartWidth = 400;
  const chartHeight = 150;
  const padding = 20;
  const pointSpacing = (chartWidth - 2 * padding) / (data.length - 1);

  const points = data.map((item, idx) => ({
    ...item,
    x: padding + idx * pointSpacing,
    y: chartHeight - padding - (item.value / maxValue) * (chartHeight - 2 * padding),
  }));

  const pathD = points
    .map((point, idx) => `${idx === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="chart-container line-chart">
      <h4>{title}</h4>
      <div className="chart-content">
        <svg width="100%" height="200" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
            <line
              key={idx}
              x1={padding}
              y1={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={chartHeight - padding - ratio * (chartHeight - 2 * padding)}
              stroke="#eee"
              strokeWidth="1"
            />
          ))}
          {/* Line */}
          <path d={pathD} stroke="#0066cc" strokeWidth="2" fill="none" />
          {/* Points */}
          {points.map((point, idx) => (
            <circle key={idx} cx={point.x} cy={point.y} r="4" fill="#0066cc" />
          ))}
        </svg>
      </div>
    </div>
  );
}

interface AnalyticsProps {
  servingQueue: any[];
  waitingQueue: any[];
}

function Analytics({ servingQueue, waitingQueue }: AnalyticsProps) {
  const [queueStats, setQueueStats] = useState({
    perCounter: [
      { name: "Counter 1", value: 0 },
      { name: "Counter 2", value: 0 },
      { name: "Counter 3", value: 0 },
      { name: "Counter 4", value: 0 },
      { name: "Counter 5", value: 0 },
    ],
    statusBreakdown: [
      { name: "Serving", value: 0, color: "#28a745" },
      { name: "Waiting", value: 0, color: "#ffc107" },
      { name: "Completed", value: 0, color: "#0066cc" },
    ],
    hourlyTrend: [
      { name: "08:00", value: 5 },
      { name: "10:00", value: 12 },
      { name: "12:00", value: 18 },
      { name: "14:00", value: 15 },
      { name: "16:00", value: 8 },
    ],
  });

  useEffect(() => {
    // Update queue stats based on API data
    const perCounterData = [1, 2, 3, 4, 5].map((counterId) => ({
      name: `Counter ${counterId}`,
      value: servingQueue.filter((item) => item.counter_id === counterId).length,
    }));

    setQueueStats((prev) => ({
      ...prev,
      perCounter: perCounterData,
      statusBreakdown: [
        { ...prev.statusBreakdown[0], value: servingQueue.length },
        { ...prev.statusBreakdown[1], value: waitingQueue.length },
        { ...prev.statusBreakdown[2], value: 25 }, // Mock data
      ],
    }));
  }, [servingQueue, waitingQueue]);

  return (
    <div className="analytics-section">
      <h3>Analytics Dashboard</h3>
      <div className="charts-grid">
        <BarChart data={queueStats.perCounter} title="Tickets per Counter" />
        <PieChart
          data={queueStats.statusBreakdown}
          title="Queue Status Distribution"
        />
        <LineChart data={queueStats.hourlyTrend} title="Hourly Queue Trend" />
      </div>
    </div>
  );
}

export default Analytics;
