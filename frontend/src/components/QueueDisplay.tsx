import './QueueDisplay.css';

interface QueueItem {
  ticket_id: number;
  priority_number: string;
  counter_id?: number;
  status: string;
}

interface QueueDisplayProps {
  title: string;
  items: QueueItem[];
  type: 'waiting' | 'serving';
}

function QueueDisplay({ title, items, type }: QueueDisplayProps) {
  return (
    <div className="queue-section">
      <div className="queue-header">
        <h2>{title}</h2>
      </div>
      <div className="queue-content">
        <div className={`queue-list ${type}`}>
          {items.length === 0 ? (
            <div className="empty-state">No items</div>
          ) : (
            <>
              {type === 'serving' && (
                <div className="serving-header">
                  <div className="col-priority">Priority #</div>
                  <div className="col-counter">Counter</div>
                </div>
              )}
              {items.map((item, index) => (
                <div
                  key={item.ticket_id || index}
                  className={`queue-item ${type} ${index === 0 ? 'first' : ''}`}
                >
                  {type === 'waiting' ? (
                    <div className="priority-number">{item.priority_number}</div>
                  ) : (
                    <>
                      <div className="priority-number">{item.priority_number}</div>
                      <div className="counter-number">{item.counter_id}</div>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueueDisplay;
