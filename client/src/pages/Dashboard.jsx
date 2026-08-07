import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getDashboard } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(({ data }) => setStats(data))
      .catch((err) => showToast(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const renderStats = () => {
    if (!stats) return <p className="muted">No dashboard data available.</p>;

    if (user?.role === "Administrator") {
      return (
        <div className="stats-grid">
          <div className="stat-card card-employees">
            <div className="value">{stats.totalEmployees || 0}</div>
            <div className="label">Total Employees</div>
          </div>
          <div className="stat-card card-visitors">
            <div className="value">{stats.totalVisitors || 0}</div>
            <div className="label">Total Visitors</div>
          </div>
          <div className="stat-card card-pending">
            <div className="value">{stats.pendingVisitors || 0}</div>
            <div className="label">Pending Visitors</div>
          </div>
          <div className="stat-card card-checkedin">
            <div className="value">{stats.checkedInVisitors || 0}</div>
            <div className="label">Checked-In Visitors</div>
          </div>
          <div className="stat-card card-today">
            <div className="value">{stats.todaysVisitors || 0}</div>
            <div className="label">Today's Visitors</div>
          </div>
        </div>
      );
    }

    if (user?.role === "Receptionist") {
      return (
        <div className="stats-grid">
          <div className="stat-card card-today">
            <div className="value">{stats.todaysVisitors || 0}</div>
            <div className="label">Today's Visitors</div>
          </div>
          <div className="stat-card card-checkedin">
            <div className="value">{stats.checkedInVisitors || 0}</div>
            <div className="label">Checked-In Visitors</div>
          </div>
          <div className="stat-card card-approved">
            <div className="value">{stats.approvedWaitingCheckIn || 0}</div>
            <div className="label">Approved (Waiting Check-in)</div>
          </div>
          <div className="stat-card card-scheduled">
            <div className="value">{stats.scheduledVisitors || 0}</div>
            <div className="label">Scheduled Visitors</div>
          </div>
        </div>
      );
    }

    if (user?.role === "Employee") {
      return (
        <div className="stats-grid">
          <div className="stat-card card-pending">
            <div className="value">{stats.pendingRequests || 0}</div>
            <div className="label">Pending Requests</div>
          </div>
          <div className="stat-card card-approved">
            <div className="value">{stats.approvedToday || 0}</div>
            <div className="label">Approved Today</div>
          </div>
          <div className="stat-card card-total">
            <div className="value">{stats.totalHandled || 0}</div>
            <div className="label">Total Handled</div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <h1 className="page-title">Welcome, {user?.name}</h1>
      <p className="page-subtitle">Logged in as: {user?.role}</p>

      {loading ? (
        <p className="muted">Loading dashboard...</p>
      ) : (
        renderStats()
      )}
    </Layout>
  );
};

export default Dashboard;

