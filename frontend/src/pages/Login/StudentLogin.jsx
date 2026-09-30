import { useState } from "react";
import { useNavigate } from "react-router-dom";
import schoolLogo from "../../assets/images/school-logo.png";
import "./Login.css";

const roleOptions = [
  { key: "student", label: "Student", icon: "🎓", path: "/login/student" },
  { key: "teacher", label: "Teacher", icon: "👨‍🏫", path: "/login/teacher" },
  { key: "admin", label: "Admin", icon: "⚙️", path: "/login/admin" },
];

const roleContent = {
  student: {
    title: "Student Login",
    label: "Student ID / Roll No. / Email",
    placeholder: "Student ID, Roll No. or Email",
    registrationText: "নতুন Student? প্রথমে Register করুন",
    registrationLabel: "Student Registration",
  },
  teacher: {
    title: "Teacher Login",
    label: "Teacher ID / Email",
    placeholder: "Teacher ID or Email",
    registrationText: "নতুন Teacher? প্রথমে Register করুন",
    registrationLabel: "Teacher Registration",
  },
  admin: {
    title: "Admin Login",
    label: "Admin Email",
    placeholder: "Admin Email",
  },
};

export function LoginPage({ role = "student", onNavigate }) {
  const content = roleContent[role];
  const [message, setMessage] = useState("");
  const routerNavigate = useNavigate();

  const navigate = (path) => {
    if (typeof onNavigate === "function") {
      onNavigate(path);
      return;
    }
    routerNavigate(path);
    <button
      type="button"
      className="registration-button"
      onClick={() => navigate(`/registration/${role}`)}
    >
      ♙ <span>{content.registrationLabel}</span>
    </button>;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Frontend validation passed. Login will be connected later.");
  };

  return (
    <main className="login-page">
      <header className="login-topbar">
        <button
          className="back-link"
          type="button"
          onClick={() => navigate("/home")}
        >
          ‹ Back to Website
        </button>
        <span>Bhuiaganti High School · School Portal</span>
      </header>

      <section className="login-content" aria-labelledby="portal-title">
        <div className="portal-brand">
          <div className="logo-mark">
            <img src={schoolLogo} alt="Bhuiaganti High School logo" />
          </div>
          <h1 id="portal-title">School Portal</h1>
          <p>Bhuiaganti High School</p>
          <p className="bengali-text">ভূঞাগাঁতী উচ্চ বিদ্যালয়</p>
        </div>

        <div className="role-selector" aria-label="Select login role">
          {roleOptions.map((option) => (
            <button
              className={`role-card ${role === option.key ? `role-card-${option.key}` : ""}`}
              key={option.key}
              type="button"
              onClick={() => navigate(option.path)}
              aria-pressed={role === option.key}
            >
              <span className="role-icon" aria-hidden="true">
                {option.icon}
              </span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <h2>{content.title}</h2>
          <label htmlFor={`${role}-identity`}>{content.label}</label>
          <div className="input-wrap">
            <span aria-hidden="true">♙</span>
            <input
              id={`${role}-identity`}
              name="identity"
              placeholder={content.placeholder}
              required
            />
          </div>
          <label htmlFor={`${role}-password`}>Password</label>
          <div className="input-wrap">
            <span aria-hidden="true">▣</span>
            <input
              id={`${role}-password`}
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="login-options">
            <label className="remember-label">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <button
              className="forgot-link"
              type="button"
              onClick={() =>
                setMessage("Password recovery will be available later.")
              }
            >
              Forgot Password?
            </button>
          </div>
          <button className="login-button" type="submit">
            ⇥ <span>Login</span>
          </button>
          {message ? (
            <p className="form-message" role="status">
              {message}
            </p>
          ) : null}
        </form>

        {role === "admin" ? (
          <div className="demo-box">Demo: admin@bhs.edu.bd / BHS@Admin2026</div>
        ) : (
          <div className="registration-box">
            <p>{content.registrationText}</p>
            <button
              type="button"
              className="registration-button"
              onClick={() => navigate(`/registration/${role}`)}
            >
              ♙ <span>{content.registrationLabel}</span>
            </button>
          </div>
        )}

        <button
          className="return-link"
          type="button"
          onClick={() => navigate("/home")}
        >
          ← Return to School Website
        </button>
      </section>
      <footer className="login-footer">
        © 2026 Bhuiaganti High School · All Rights Reserved
      </footer>
    </main>
  );
}

export default function StudentLogin({ onNavigate }) {
  return <LoginPage role="student" onNavigate={onNavigate} />;
}
