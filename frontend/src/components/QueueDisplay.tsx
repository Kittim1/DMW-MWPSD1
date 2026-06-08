import "./QueueDisplay.css";

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  counter_id?: number;
  status: string;
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
  // Group serving items by counter
  const getServingByCounter = () => {
    const counterMap: { [key: number]: QueueItem } = {};
    items.forEach((item) => {
      if (item.counter_id && !counterMap[item.counter_id]) {
        counterMap[item.counter_id] = item;
      }
    });
    return counterMap;
  };

  return (
    <div className="queue-section">
      <div className="queue-header">
        <h2>{title}</h2>
      </div>
      <div className="queue-content">
        {type === "serving" ? (
          <div className="serving-grid">
            {items.length === 0 ? (
              <div className="empty-state">No items</div>
            ) : (
              <>
                {(() => {
                  const counterMap = getServingByCounter();
                  const counters = Object.keys(counterMap)
                    .map(Number)
                    .sort((a, b) => a - b);

                  return (
                    <div className="grid-counters">
                      {counters.map((counterId) => (
                        <div key={counterId} className="counter-box">
                          <div className="box-label">PRIORITY</div>
                          <div className="box-number">
                            {counterMap[counterId].priority_number}
                          </div>
                          <div className="box-label">COUNTER {counterId}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        ) : (
          <div className="waiting-container">
            <div className="waiting-grid">
              {items.length === 0 ? (
                <div className="empty-state">No items</div>
              ) : (
                items.slice(0, 4).map((item, index) => (
                  <div key={item.ticket_id || index} className="waiting-box">
                    <div className="box-label">PRIORITY</div>
                    <div className="box-label">NUMBER</div>
                    <div className="box-number">{item.priority_number}</div>
                  </div>
                ))
              )}
            </div>
            {skippedItems.length > 0 && (
              <div className="skipped-container">
                <div className="skipped-header">
                  <h3>SKIPPED NUMBERS</h3>
                </div>
                <div className="skipped-grid">
                  {skippedItems.slice(0, 5).map((item, index) => (
                    <div key={item.ticket_id || index} className="skipped-box">
                      <div className="skipped-box-label">PRIORITY</div>
                      <div className="skipped-box-number">{item.priority_number}</div>
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
