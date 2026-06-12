import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Plane,
  LayoutDashboard,
  FileText,
  Palette,
  LogOut,
  Globe2,
} from "lucide-react";

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
        <h2>
          <Plane size={16} strokeWidth={2.5} />
          Travel Agent
        </h2>

        <Link to="/admin">
          <LayoutDashboard
            size={16}
            strokeWidth={2}
            style={{ verticalAlign: "-3px", marginRight: 8 }}
          />
          Dashboard
        </Link>
        <Link to="/admin/content">
          <FileText
            size={16}
            strokeWidth={2}
            style={{ verticalAlign: "-3px", marginRight: 8 }}
          />
          Content Review
        </Link>
        <Link to="/admin/brand">
          <Palette
            size={16}
            strokeWidth={2}
            style={{ verticalAlign: "-3px", marginRight: 8 }}
          />
          Brand Settings
        </Link>

        <button type="button" onClick={handleLogout}>
          <LogOut
            size={16}
            strokeWidth={2}
            style={{ verticalAlign: "-3px", marginRight: 8 }}
          />
          Sign Out
        </button>
      </aside>

      <main>
        <header className="top">
          <b>Welcome, {name || "Admin"}</b>
          <Link to="/">
            <Globe2
              size={14}
              strokeWidth={2.5}
              style={{ verticalAlign: "-2px", marginRight: 6 }}
            />
            Public Site
          </Link>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
