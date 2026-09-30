import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const TOKEN_STORAGE_KEY = "auth_token";

const stats = [
  { label: "Total Users", value: "1,240" },
  { label: "Orders Today", value: "86" },
  { label: "Revenue", value: "$12,430" },
  { label: "Pending Tickets", value: "14" },
];

const recentOrders = [
  { id: "ORD-1001", customer: "John Doe", amount: "$120.00", status: "Completed" },
  { id: "ORD-1002", customer: "Jane Smith", amount: "$75.50", status: "Pending" },
  { id: "ORD-1003", customer: "Alex Brown", amount: "$210.40", status: "Completed" },
  { id: "ORD-1004", customer: "Chris Wilson", amount: "$49.99", status: "Cancelled" },
];

const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Users" },
  { id: "orders", label: "Orders" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

const defaultSettingsOptions = [
  { id: "emailNotifications", label: "Email Notifications", enabled: true },
  { id: "twoFactorAuth", label: "Two-Factor Authentication", enabled: false },
  { id: "maintenanceMode", label: "Maintenance Mode", enabled: false },
  { id: "autoBackup", label: "Auto Backup", enabled: true },
];

export default function AdminPanelTemplate({ currentUser }) {
  const [health, setHealth] = useState(null);
  const [authUser, setAuthUser] = useState(currentUser || null);
  const [apiError, setApiError] = useState("");
  const [settingsOptions, setSettingsOptions] = useState(defaultSettingsOptions);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    setAuthUser(currentUser || null);
  }, [currentUser]);

  useEffect(() => {
    const fetchBootData = async () => {
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        setHealth(healthData);

        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token && !currentUser) {
          const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (meResponse.ok) {
            const meData = await meResponse.json();
            setAuthUser(meData?.data || meData?.user || meData);
          }
        }

        if (token) {
          const settingsResponse = await fetch(`${API_BASE_URL}/settings`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (settingsResponse.ok) {
            const settingsResult = await settingsResponse.json();
            const settingsData = settingsResult?.data || {};
            setSettingsOptions((prev) =>
              prev.map((setting) => ({
                ...setting,
                enabled:
                  typeof settingsData[setting.id] === "boolean"
                    ? settingsData[setting.id]
                    : setting.enabled,
              }))
            );
          }
        }
      } catch (error) {
        setApiError(error.message || "Failed to reach backend.");
      }
    };

    fetchBootData();
  }, []);

  const toggleSetting = async (settingId) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const nextOptions = settingsOptions.map((setting) =>
      setting.id === settingId ? { ...setting, enabled: !setting.enabled } : setting
    );

    setSettingsOptions(nextOptions);
    if (!token) {
      return;
    }

    setSettingsSaving(true);
    setApiError("");
    try {
      const payload = nextOptions.reduce((acc, setting) => {
        acc[setting.id] = setting.enabled;
        return acc;
      }, {});

      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: payload }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || "Unable to save settings.");
      }
    } catch (error) {
      setApiError(error.message || "Unable to save settings.");
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Admin Panel</h2>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              style={activeSection === item.id ? styles.navItemActive : styles.navItem}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <button type="button" style={styles.primaryButton}>
            + New Action
          </button>
        </header>

        {activeSection === "settings" ? (
          <section id="settings" style={styles.settingsSection}>
            <h3 style={styles.tableTitle}>Settings</h3>
            <p style={styles.settingsStatus}>
              {settingsSaving ? "Saving settings..." : "Changes are saved to backend API."}
            </p>
            <div style={styles.settingsList}>
              {settingsOptions.map((setting) => (
                <label key={setting.id} style={styles.settingRow}>
                  <span>{setting.label}</span>
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    onChange={() => toggleSetting(setting.id)}
                  />
                </label>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section style={styles.apiInfo}>
              <p style={styles.apiInfoText}>
                <strong>API Health:</strong> {health ? JSON.stringify(health) : "Checking backend..."}
              </p>
              <p style={styles.apiInfoText}>
                <strong>Logged User:</strong>{" "}
                {authUser ? authUser.email || authUser.name : "No token / not logged in"}
              </p>
              {apiError ? (
                <p style={{ ...styles.apiInfoText, color: "#b91c1c" }}>
                  <strong>Error:</strong> {apiError}
                </p>
              ) : null}
            </section>

            <section style={styles.statsGrid}>
              {stats.map((item) => (
                <article key={item.label} style={styles.card}>
                  <p style={styles.cardLabel}>{item.label}</p>
                  <p style={styles.cardValue}>{item.value}</p>
                </article>
              ))}
            </section>

            <section style={styles.tableSection}>
              <h3 style={styles.tableTitle}>Recent Orders</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order ID</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={styles.td}>{order.id}</td>
                        <td style={styles.td}>{order.customer}</td>
                        <td style={styles.td}>{order.amount}</td>
                        <td style={styles.td}>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f8",
  },
  sidebar: {
    backgroundColor: "#111827",
    color: "#fff",
    padding: "24px 16px",
  },
  logo: {
    marginTop: 0,
    marginBottom: 24,
    fontSize: 22,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  navItem: {
    border: 0,
    width: "100%",
    textAlign: "left",
    color: "#d1d5db",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 8,
    backgroundColor: "#1f2937",
    cursor: "pointer",
  },
  navItemActive: {
    border: 0,
    width: "100%",
    textAlign: "left",
    color: "#ffffff",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 8,
    backgroundColor: "#2563eb",
    cursor: "pointer",
  },
  main: {
    padding: 24,
  },
  apiInfo: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  apiInfoText: {
    margin: "6px 0",
    color: "#111827",
    fontSize: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    margin: 0,
    color: "#111827",
  },
  primaryButton: {
    border: 0,
    borderRadius: 8,
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  cardLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: 14,
  },
  cardValue: {
    margin: "8px 0 0",
    color: "#111827",
    fontSize: 24,
    fontWeight: 700,
  },
  tableSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  settingsSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    marginTop: 24,
  },
  settingsList: {
    display: "grid",
    gap: 10,
  },
  settingsStatus: {
    margin: "0 0 12px",
    fontSize: 13,
    color: "#475569",
  },
  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    color: "#111827",
  },
  tableTitle: {
    marginTop: 0,
    marginBottom: 12,
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: 13,
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #f1f5f9",
    color: "#111827",
    fontSize: 14,
  },
};
