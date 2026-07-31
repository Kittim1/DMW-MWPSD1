import { useEffect, useState } from "react";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { LoadingOverlayProvider } from "./contexts/LoadingOverlayContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Counter from "./pages/Counter";
import Dashboard from "./pages/Dashboard";
import Guard from "./pages/Guard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("auth_token"),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("auth_token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <LoadingOverlayProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/counter/:counterId" element={<Counter />} />
          <Route
            path="/guard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Guard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </LoadingOverlayProvider>
  );
}

export default App;
