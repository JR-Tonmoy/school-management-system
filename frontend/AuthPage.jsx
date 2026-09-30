import React, { useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const TOKEN_STORAGE_KEY = "auth_token";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const body =
      mode === "login"
        ? { email, password }
        : { name, email, password, password_confirmation: password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || `${mode} failed (${response.status})`);
      }

      const authToken = result?.data?.token || result?.token || null;
      if (authToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      }

      const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken || localStorage.getItem(TOKEN_STORAGE_KEY)}`,
        },
      });
      const meResult = await meResponse.json().catch(() => null);
      if (!meResponse.ok) {
        throw new Error(meResult?.message || "Could not fetch logged in user.");
      }
      const currentUser = meResult?.data || meResult?.user || meResult;

      setMessage(mode === "login" ? "Login successful." : "Registration successful.");
      if (typeof onAuthSuccess === "function") {
        onAuthSuccess({ ...result, user: currentUser });
      }
    } catch (error) {
      setMessage(error.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome</h2>
        <p style={styles.subtitle}>Sign in or create an account for the admin panel.</p>

        <div style={styles.tabRow}>
          <button
            type="button"
            style={mode === "login" ? styles.activeTab : styles.tab}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            style={mode === "register" ? styles.activeTab : styles.tab}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" ? (
            <input
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          ) : null}
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button style={styles.submit} type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        {message ? <p style={styles.message}>{message}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    fontFamily: "Arial, sans-serif",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
  },
  title: {
    margin: 0,
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: "#4b5563",
    fontSize: 14,
  },
  tabRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "8px 10px",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
  },
  activeTab: {
    border: "1px solid #2563eb",
    borderRadius: 8,
    padding: "8px 10px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    cursor: "pointer",
  },
  form: {
    display: "grid",
    gap: 10,
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
  },
  submit: {
    border: 0,
    borderRadius: 8,
    padding: "10px 12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  message: {
    marginTop: 12,
    marginBottom: 0,
    color: "#111827",
    fontSize: 14,
  },
};
