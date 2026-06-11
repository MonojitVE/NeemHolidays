import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { logout, name } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin">
      <aside>
        <h2>Travel Agent</h2>

        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/content">Content Review</Link>
        <Link to="/admin/brand">Brand Settings</Link>

        <button type="button" onClick={handleLogout}>
          Sign Out
        </button>
      </aside>

      <main>
        <header className="top">
          <b>Welcome, {name || "Admin"}</b>
          <Link to="/">Public Site</Link>
        </header>

        <Outlet />
      </main>
    </div>
  );
}