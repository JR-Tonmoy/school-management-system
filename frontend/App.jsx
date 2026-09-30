import { useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import AdminPanelTemplate from "./AdminPanelTemplate";
import AuthPage from "./AuthPage";
import BackendApiIntegration from "./BackendApiIntegration";
import AdminLogin from "./src/pages/Login/AdminLogin";
import StudentLogin from "./src/pages/Login/StudentLogin";
import TeacherLogin from "./src/pages/Login/TeacherLogin";
import AppRoutes from "./src/routes/AppRoutes";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
const TOKEN_STORAGE_KEY = "auth_token";

function LegacyApp() {
  const routerNavigate = useNavigate();
  const [path, setPath] = useState(window.location.pathname);
  const [view, setView] = useState("auth");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuthSuccess = (payload) => {
    setCurrentUser(payload?.user || null);
    setIsAuthenticated(true);
    setView("admin");
  };

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setIsAuthenticated(false);
        setView("auth");
        setAuthChecking(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Token is not valid");
        }

        const meData = await response.json().catch(() => null);
        setCurrentUser(meData?.data || meData?.user || meData || null);
        setIsAuthenticated(true);
        setView("admin");
      } catch (error) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setView("auth");
      } finally {
        setAuthChecking(false);
      }
    };

    verifyToken();
  }, []);

  const navigateToLogin = (targetPath) => {
    routerNavigate(targetPath);
    setPath(targetPath);
  };

  const loginPages = {
    "/login/student": StudentLogin,
    "/login/teacher": TeacherLogin,
    "/login/admin": AdminLogin,
  };
  const LoginPage = loginPages[path];

  const handleProtectedView = (targetView) => {
    if (!isAuthenticated) {
      setView("auth");
      return;
    }
    setView(targetView);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setView("auth");
  };

  if (authChecking) {
    return <div style={styles.checking}>Checking authentication...</div>;
  }

  if (LoginPage) {
    return <LoginPage onNavigate={navigateToLogin} />;
  }

  return (
    <div>
      <div style={styles.topbar}>
        <button
          type="button"
          style={view === "auth" ? styles.activeButton : styles.button}
          onClick={() => {
            navigateToLogin("/login/student");
            setView("auth");
          }}
        >
          Login / Register
        </button>
        <button
          type="button"
          style={view === "admin" ? styles.activeButton : styles.button}
          onClick={() => handleProtectedView("admin")}
        >
          Admin Panel
        </button>
        <button
          type="button"
          style={view === "api" ? styles.activeButton : styles.button}
          onClick={() => handleProtectedView("api")}
        >
          API Integration
        </button>
        {isAuthenticated ? (
          <button
            type="button"
            style={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : null}
      </div>

      {view === "auth" ? <AuthPage onAuthSuccess={handleAuthSuccess} /> : null}
      {view === "admin" && isAuthenticated ? (
        <AdminPanelTemplate currentUser={currentUser} />
      ) : null}
      {view === "api" && isAuthenticated ? <BackendApiIntegration /> : null}
    </div>
  );
}

const styles = {
  topbar: {
    display: "flex",
    gap: 10,
    padding: 12,
    backgroundColor: "#0f172a",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  checking: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
  },
  button: {
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  activeButton: {
    border: "1px solid #3b82f6",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  logoutButton: {
    marginLeft: "auto",
    border: "1px solid #ef4444",
    backgroundColor: "#7f1d1d",
    color: "#ffffff",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes>
        <LegacyApp />
      </AppRoutes>
    </BrowserRouter>
  );
}
