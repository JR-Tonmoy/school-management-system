import { LoginPage } from "./StudentLogin";

export default function AdminLogin({ onNavigate }) {
  return <LoginPage role="admin" onNavigate={onNavigate} />;
}
