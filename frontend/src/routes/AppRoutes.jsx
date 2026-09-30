import { Navigate, Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/Login/AdminLogin";
import StudentLogin from "../pages/Login/StudentLogin";
import TeacherLogin from "../pages/Login/TeacherLogin";
import StudentRegistration from "../pages/Registration/StudentRegistration";
import TeacherRegistration from "../pages/Registration/TeacherRegistration";

function HomePage() {
  return <div />;
}

export default function AppRoutes({ children }) {
  return (
    <Routes>
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/login/teacher" element={<TeacherLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/registration/student" element={<StudentRegistration />} />
      <Route path="/registration/teacher" element={<TeacherRegistration />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={children} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
