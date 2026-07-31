import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import LoadingOverlay from "../components/LoadingOverlay";

interface LoadingOverlayContextValue {
  showLoading: (message?: string, minDurationMs?: number) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(
  null,
);

interface LoadingOverlayProviderProps {
  children: ReactNode;
}

export function LoadingOverlayProvider({
  children,
}: LoadingOverlayProviderProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const hideTokenRef = useRef(0);
  const checkIntervalRef = useRef<number | null>(null);
  const minTimerRef = useRef<number | null>(null);

  const clearAllTimers = useCallback(() => {
    if (checkIntervalRef.current !== null) {
      window.clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (minTimerRef.current !== null) {
      window.clearTimeout(minTimerRef.current);
      minTimerRef.current = null;
    }
  }, []);

  const finishHide = useCallback(() => {
    clearAllTimers();
    setVisible(false);
    setMessage(undefined);
  }, [clearAllTimers]);

  const showLoading = useCallback(
    (msg?: string, minDurationMs: number = 300) => {
      clearAllTimers();
      setMessage(msg);
      setVisible(true);
      const token = Date.now() + Math.floor(Math.random() * 1_000_000);
      hideTokenRef.current = token;
      const duration = Math.max(0, minDurationMs);
      minTimerRef.current = window.setTimeout(() => {
        if (hideTokenRef.current === token) {
          hideTokenRef.current = 0;
        }
        minTimerRef.current = null;
      }, duration);
    },
    [clearAllTimers],
  );

  const hideLoading = useCallback(() => {
    if (hideTokenRef.current !== 0) {
      if (checkIntervalRef.current === null) {
        const start = Date.now();
        checkIntervalRef.current = window.setInterval(() => {
          if (hideTokenRef.current === 0 || Date.now() - start > 5000) {
            finishHide();
          }
        }, 30);
      }
    } else {
      finishHide();
    }
  }, [finishHide]);

  useEffect(
    () => () => {
      clearAllTimers();
    },
    [clearAllTimers],
  );

  const value = useMemo<LoadingOverlayContextValue>(
    () => ({ showLoading, hideLoading, isLoading: visible }),
    [showLoading, hideLoading, visible],
  );

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      <LoadingOverlay visible={visible} message={message} />
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay(): LoadingOverlayContextValue {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) {
    throw new Error(
      "useLoadingOverlay must be used within <LoadingOverlayProvider>",
    );
  }
  return ctx;
}

export function usePageLoading(
  loading: boolean,
  message: string = "",
  minDurationMs: number = 300,
) {
  const { showLoading, hideLoading } = useLoadingOverlay();

  const showRef = useRef(showLoading);
  const hideRef = useRef(hideLoading);
  const msgRef = useRef(message);
  const minRef = useRef(minDurationMs);

  useEffect(() => {
    showRef.current = showLoading;
    hideRef.current = hideLoading;
    msgRef.current = message;
    minRef.current = minDurationMs;
  });

  useEffect(() => {
    if (loading) {
      showRef.current(msgRef.current, minRef.current);
      return;
    }
    const timer = window.setTimeout(() => hideRef.current(), 40);
    return () => window.clearTimeout(timer);
  }, [loading]);
}
