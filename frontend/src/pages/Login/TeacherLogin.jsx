import { LoginPage } from "./StudentLogin";

export default function TeacherLogin({ onNavigate }) {
  return <LoginPage role="teacher" onNavigate={onNavigate} />;
}
