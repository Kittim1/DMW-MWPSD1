import "./LoadingOverlay.css";

interface LoadingOverlayProps {
  message?: string;
  visible: boolean;
}

function LoadingOverlay({ message, visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-overlay-inner">
        <div className="loading-seal-wrap">
          <img
            src="/dmw.png"
            alt="DMW Seal"
            className="loading-seal"
            aria-hidden="true"
          />
          {message ? (
            <p className="loading-message">
              <span className="loading-message-text">{message}</span>
              <span className="loading-message-cursor">▌</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
