import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const TOKEN_STORAGE_KEY = "auth_token";

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export default function BackendApiIntegration() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("Admin User");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [health, setHealth] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const healthResponse = await apiRequest("/health", {
          headers: { "Content-Type": "application/json" },
        });
        setHealth(healthResponse);
      } catch (error) {
        setStatusMessage(`Health check failed: ${error.message}`);
      }
    };

    loadHealth();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, password_confirmation: password }),
      });

      const token = result?.data?.token || result?.token || null;
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
      setUser(result?.data?.user || result?.user || null);
      setStatusMessage("Registered successfully.");
    } catch (error) {
      setStatusMessage(`Register failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const token = result?.data?.token || result?.token || null;
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
      setUser(result?.data?.user || result?.user || null);
      setStatusMessage("Logged in successfully.");
    } catch (error) {
      setStatusMessage(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMe = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      const result = await apiRequest("/auth/me", { method: "GET" });
      setUser(result?.data || result?.user || result);
      setStatusMessage("Fetched profile successfully.");
    } catch (error) {
      setStatusMessage(`Fetch profile failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setStatusMessage("");
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
      setStatusMessage("Logged out successfully.");
    } catch (error) {
      setStatusMessage(`Logout failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>Laravel API Integration (v1)</h2>

      <p>
        <strong>Health:</strong> {health ? JSON.stringify(health) : "Checking..."}
      </p>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button type="button" onClick={handleRegister} disabled={loading}>
          Register
        </button>
        <button type="button" onClick={handleLogin} disabled={loading}>
          Login
        </button>
        <button type="button" onClick={handleGetMe} disabled={loading}>
          Get Me
        </button>
        <button type="button" onClick={handleLogout} disabled={loading}>
          Logout
        </button>
      </div>

      {statusMessage ? <p>{statusMessage}</p> : null}

      <h3>Authenticated User</h3>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
