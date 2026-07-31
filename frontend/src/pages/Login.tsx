import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoadingOverlay } from "../contexts/LoadingOverlayContext";
import { authService } from "../services/api";
import "./Login.css";

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

function Login({ setIsAuthenticated }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const showRef = useRef(showLoading);
  const hideRef = useRef(hideLoading);

  useEffect(() => {
    showRef.current = showLoading;
    hideRef.current = hideLoading;
  });

  useEffect(() => {
    showRef.current("", 150);
    const t = window.setTimeout(() => hideRef.current(), 180);
    return () => window.clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    showRef.current("", 400);

    try {
      const response = await authService.login(email, password);
      const { token } = response.data;

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      console.log("Login successful:", response.data.user);
      setIsAuthenticated(true);
      toast.success(`Welcome back, ${response.data.user.name}!`);
      const userRole = response.data.user.role;
      if (userRole === "guard") {
        navigate("/guard");
      } else if (userRole === "counter") {
        navigate(`/counter/${response.data.user.counter_id || 1}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      console.error("Login error:", errorMessage, err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      hideRef.current();
    }
  };

  const handleBack = () => {
    showRef.current("", 150);
    setTimeout(() => {
      navigate("/");
      setTimeout(() => hideRef.current(), 40);
    }, 120);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button
          className="back-btn"
          onClick={handleBack}
          aria-label="Go back"
        ></button>
        <h1>DMW Processing</h1>
        <h2>Queue Management System</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-info">
          <p>
            <strong>Demo Credentials:</strong>
          </p>
          <p>SuperAdmin: admin@dmw.com / password</p>
          <p>Counter: counter1@dmw.com / password</p>
          <p>Guard: guard@dmw.com / password</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
