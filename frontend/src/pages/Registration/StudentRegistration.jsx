import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registration.css";

const definitions = {
  student: {
    title: "Student Registration",
    subtitle: "শিক্ষার্থী নিবন্ধন — ভূঞাগাঁতী উচ্চ বিদ্যালয়",
    sections: [
      {
        title: "👤 PERSONAL INFORMATION",
        fields: [
          [
            "fullName",
            "Full Name (পূর্ণ নাম)",
            "যেমন: Tonmoy Sarker",
            "text",
            true,
          ],
          [
            "guardianName",
            "Guardian Name (অভিভাবক)",
            "অভিভাবকের নাম",
            "text",
            true,
          ],
        ],
      },
      {
        title: "📚 ACADEMIC INFORMATION",
        fields: [
          ["studentId", "Student ID", "যেমন: BHS-2026-001", "text", true],
          ["rollNumber", "Roll Number", "যেমন: 101", "text", true],
          [
            "className",
            "Class",
            "-- Class নির্বাচন করুন --",
            "select",
            true,
            ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
          ],
          [
            "section",
            "Section",
            "-- Section --",
            "select",
            true,
            ["A", "B", "C", "D"],
          ],
        ],
      },
      {
        title: "📞 CONTACT INFORMATION",
        fields: [
          ["phone", "Phone Number", "01XXXXXXXXX", "tel", true],
          ["email", "Email (optional)", "email@example.com", "email", false],
        ],
      },
    ],
  },
  teacher: {
    title: "Teacher Registration",
    subtitle: "শিক্ষক নিবন্ধন — ভূঞাগাঁতী উচ্চ বিদ্যালয়",
    sections: [
      {
        title: "👤 PERSONAL INFORMATION",
        fields: [
          [
            "fullName",
            "Full Name (পূর্ণ নাম)",
            "যেমন: Tonmoy Sarker",
            "text",
            true,
          ],
        ],
      },
      {
        title: "🏫 PROFESSIONAL INFORMATION",
        fields: [
          ["teacherId", "Teacher ID", "যেমন: TCH-001", "text", true],
          ["qualification", "Qualification", "যেমন: M.A., M.Sc.", "text", true],
          [
            "designation",
            "Designation",
            "-- Designation --",
            "select",
            true,
            ["Assistant Teacher", "Senior Teacher", "Head Teacher", "Other"],
          ],
          [
            "subject",
            "Subject",
            "-- Subject নির্বাচন করুন --",
            "select",
            true,
            [
              "Bangla",
              "English",
              "Mathematics",
              "Science",
              "ICT",
              "Social Science",
              "Religion",
              "Other",
            ],
          ],
        ],
      },
      {
        title: "📞 CONTACT INFORMATION",
        fields: [
          ["phone", "Phone Number", "01XXXXXXXXX", "tel", true],
          ["email", "Email", "email@example.com", "email", true],
        ],
      },
    ],
  },
};

function RegistrationPage({ role }) {
  const navigate = useNavigate();
  const definition = definitions[role];
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fields = definition.sections.flatMap((section) => section.fields);

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitting(true);
    const nextErrors = {};
    fields.forEach(([name, label, , , required]) => {
      if (required && !values[name]?.trim())
        nextErrors[name] = `${label} is required.`;
    });
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email))
      nextErrors.email = "Enter a valid email address.";
    if (!values.password?.trim()) nextErrors.password = "Password is required.";
    if (!values.confirmPassword?.trim())
      nextErrors.confirmPassword = "Confirm Password is required.";
    if (
      values.password &&
      values.confirmPassword &&
      values.password !== values.confirmPassword
    )
      nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    setSubmitting(false);
    if (Object.keys(nextErrors).length === 0)
      setSuccess(
        "Registration form submitted successfully. Backend connection will be added later.",
      );
  };

  const renderField = ([name, label, placeholder, type, required, options]) => (
    <label className="registration-field" key={name}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {type === "select" ? (
        <select
          name={name}
          value={values[name] || ""}
          onChange={updateValue}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          value={values[name] || ""}
          onChange={updateValue}
          type={type}
          placeholder={placeholder}
          required={required}
        />
      )}
      {errors[name] ? (
        <small className="field-error">{errors[name]}</small>
      ) : null}
    </label>
  );

  return (
    <main className="registration-page">
      <header className="registration-topbar">
        <button type="button" onClick={() => navigate("/home")}>
          ‹ Back to Website
        </button>
        <span>Bhuiaganti High School · {definition.title}</span>
      </header>
      <section className="registration-content">
        <div className="registration-brand">
          <div className="registration-logo">
            {role === "student" ? "🎓" : "👨‍🏫"}
          </div>
          <h1>{definition.title}</h1>
          <p>{definition.subtitle}</p>
        </div>
        <form className="registration-card" onSubmit={handleSubmit} noValidate>
          {definition.sections.map((section) => (
            <section className="registration-section" key={section.title}>
              <h2>{section.title}</h2>
              <div className="registration-grid">
                {section.fields.map(renderField)}
              </div>
            </section>
          ))}
          <section className="registration-section password-section">
            <h2>🔒 SET PASSWORD</h2>
            <div className="registration-grid">
              {renderField([
                "password",
                "Password",
                "কমপক্ষে ৬ অক্ষর",
                "password",
                true,
              ])}
              {renderField([
                "confirmPassword",
                "Confirm Password",
                "Password আবার দিন",
                "password",
                true,
              ])}
            </div>
          </section>
          <button
            className="registration-submit"
            type="submit"
            disabled={submitting}
          >
            ♙ <span>Register করুন</span>
          </button>
          {success ? (
            <p className="registration-success" role="status">
              {success}
            </p>
          ) : null}
        </form>
        <p className="login-prompt">
          ইতিমধ্যে Account আছে?{" "}
          <button type="button" onClick={() => navigate(`/login/${role}`)}>
            Login করুন
          </button>
        </p>
        <button
          className="school-link"
          type="button"
          onClick={() => navigate("/home")}
        >
          ← School Website
        </button>
      </section>
      <footer className="registration-footer">
        © 2026 Bhuiaganti High School · All Rights Reserved
      </footer>
    </main>
  );
}

export default function StudentRegistration() {
  return <RegistrationPage role="student" />;
}

export { RegistrationPage };
