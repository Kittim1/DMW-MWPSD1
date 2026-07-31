import "./QueueDisplay.css";

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  ticket_identifier?: string;
  counter_id?: number;
  status: string;
  service_type?: string;
  services?: string[];
  has_appointment?: boolean;
  client_name?: string;
}

interface QueueDisplayProps {
  title: string;
  items: QueueItem[];
  skippedItems?: QueueItem[];
  type: "waiting" | "serving";
}

function QueueDisplay({
  title,
  items,
  skippedItems = [],
  type,
}: QueueDisplayProps) {
  return (
    <div className="queue-section">
      <div className="queue-header">
        <h2>{title}</h2>
      </div>
      <div className="queue-content">
        {type === "serving" ? (
          <div className="serving-grid">
            <div className="grid-counters">
              {items.slice(0, 4).map((item) => (
                <div key={item.ticket_id} className="ticket-box">
                  {item.service_type === "Balik Manggagawa" &&
                    item.has_appointment && (
                      <div className="ticket-label">WITH APPOINTMENT</div>
                    )}
                  {item.service_type === "Balik Manggagawa" &&
                    !item.has_appointment && (
                      <div className="ticket-label">WITHOUT APPOINTMENT</div>
                    )}
                  <div className="ticket-number">
                    {item.ticket_identifier || item.priority_number}
                  </div>
                  {item.client_name && (
                    <div className="ticket-assigned">{item.client_name}</div>
                  )}
                  {!item.client_name && item.counter_id && (
                    <div className="ticket-assigned">
                      COUNTER {item.counter_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="waiting-container">
            <div className="waiting-grid">
              {items.slice(0, 6).map((item, index) => (
                <div key={item.ticket_id || index} className="ticket-box">
                  {item.service_type === "Balik Manggagawa" &&
                    item.has_appointment && (
                      <div className="ticket-label">WITH APPOINTMENT</div>
                    )}
                  {item.service_type === "Balik Manggagawa" &&
                    !item.has_appointment && (
                      <div className="ticket-label">WITHOUT APPOINTMENT</div>
                    )}
                  <div className="ticket-number">
                    {item.ticket_identifier || item.priority_number}
                  </div>
                  {item.client_name && (
                    <div className="ticket-assigned">{item.client_name}</div>
                  )}
                  {!item.client_name && item.counter_id && (
                    <div className="ticket-assigned">
                      COUNTER {item.counter_id}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {skippedItems.length > 0 && (
              <div className="skipped-container">
                <div className="skipped-header">
                  <h3>SKIPPED NUMBERS</h3>
                </div>
                <div className="skipped-grid">
                  {skippedItems.slice(0, 3).map((item, index) => (
                    <div key={item.ticket_id || index} className="skipped-box">
                      <div className="skipped-box-number">
                        {item.ticket_identifier || item.priority_number}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QueueDisplay;
