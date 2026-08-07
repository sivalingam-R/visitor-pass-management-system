import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = {
  Administrator: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/users", label: "Manage Users" },
    { to: "/register", label: "Register User" },
    { to: "/visitors", label: "All Visitors" },
    { to: "/reports", label: "Reports" },
  ],
  Receptionist: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/register-visitor", label: "Register Visitor" },
    { to: "/visitors", label: "Visitor List" },
  ],
  Employee: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/my-requests", label: "My Requests" },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const links = NAV_LINKS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">VPMS</div>
      <div className="navbar-links">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={location.pathname === to ? "active" : ""}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="navbar-user">
        <span>
          {user.name} ({user.role})
        </span>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
