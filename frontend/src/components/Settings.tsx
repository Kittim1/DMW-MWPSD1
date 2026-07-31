import { useState, useEffect } from "react";
import { authService } from "../services/api";
import { toast } from "react-toastify";
import "./Settings.css";

interface SettingsProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  onUserUpdate: (updatedUser: any) => void;
}

function Settings({ user, onUserUpdate }: SettingsProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.updateProfile({
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        password_confirmation: formData.password_confirmation || undefined,
      });

      toast.success("Profile updated successfully!");
      onUserUpdate(response.data.user);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: "",
        password_confirmation: ""
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-container">
        <div className="settings-card">
          <div className="card-header">
            <h3>Profile Settings</h3>
            <p>Manage your account information and password.</p>
          </div>
          
          <div className="dark-mode-toggle">
            <div className="toggle-label">
              <span>Dark Mode</span>
              <span>{isDarkMode ? "On" : "Off"}</span>
            </div>
            <button
              className={`toggle-btn ${isDarkMode ? "active" : ""}`}
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <div className="toggle-slider"></div>
            </button>
          </div>

          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-divider">
              <span>Security</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-save" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>

        {user?.role === "superadmin" && (
          <div className="settings-card system-card">
            <div className="card-header">
              <h3>System Configuration</h3>
              <p>Global settings for the Regional Office.</p>
            </div>
            
            <div className="system-settings-list">
              <div className="system-setting-item">
                <div className="setting-info">
                  <span className="setting-title">Office Name</span>
                  <span className="setting-desc">Department of Migrant Workers - Regional Office X</span>
                </div>
                <button className="btn btn-outline" disabled>Edit</button>
              </div>

              <div className="system-setting-item">
                <div className="setting-info">
                  <span className="setting-title">Ticket Prefix</span>
                  <span className="setting-desc">Current prefix: No Prefix</span>
                </div>
                <button className="btn btn-outline" disabled>Edit</button>
              </div>

              <div className="system-setting-item">
                <div className="setting-info">
                  <span className="setting-title">Session Capacity</span>
                  <span className="setting-desc">Limit: 50 tickets per session</span>
                </div>
                <button className="btn btn-outline" disabled>Edit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
