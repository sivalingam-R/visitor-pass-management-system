import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import ActivityModal from "../components/ActivityModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getAllVisitors,
  searchVisitors,
  checkInVisitor,
  checkOutVisitor,
  cancelVisitor,
  getVisitorActivity,
} from "../services/api";

const STATUSES = ["", "Pending", "Approved", "Rejected", "CheckedIn", "CheckedOut"];

const Visitors = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    visitorName: "",
    status: "",
    visitDate: "",
  });
  const [activityLogs, setActivityLogs] = useState(null);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const { data } = await getAllVisitors();
      setVisitors(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );
      const { data } = await searchVisitors(params);
      setVisitors(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ visitorName: "", status: "", visitDate: "" });
    loadVisitors();
  };

  const handleCheckIn = async (id) => {
    try {
      await checkInVisitor(id);
      showToast("Visitor checked in successfully", "success");
      if (filters.visitorName || filters.status || filters.visitDate) {
        handleSearch();
      } else {
        loadVisitors();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await checkOutVisitor(id);
      showToast("Visitor checked out successfully", "success");
      if (filters.visitorName || filters.status || filters.visitDate) {
        handleSearch();
      } else {
        loadVisitors();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Check-out failed");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this visit?")) return;
    try {
      await cancelVisitor(id);
      showToast("Visit cancelled successfully", "success");
      if (filters.visitorName || filters.status || filters.visitDate) {
        handleSearch();
      } else {
        loadVisitors();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Cancellation failed");
    }
  };

  const viewActivity = async (id) => {
    try {
      const { data } = await getVisitorActivity(id);
      setActivityLogs(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load activity");
    }
  };

  const canCancel = (status) =>
    ["Pending", "Approved", "Rejected", "CheckedIn"].includes(status);

  return (
    <Layout>
      <h1 className="page-title">
        {user.role === "Administrator" ? "All Visitors" : "Visitor List"}
      </h1>

      <div className="filters card">
        <input
          placeholder="Search visitor name"
          value={filters.visitorName}
          onChange={(e) => setFilters({ ...filters, visitorName: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          {STATUSES.map((s) => (
            <option key={s || "all"} value={s}>
              {s || "All Status"}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.visitDate}
          onChange={(e) => setFilters({ ...filters, visitDate: e.target.value })}
        />
        <button type="button" className="btn btn-blue" onClick={handleSearch}>
          Search
        </button>
        <button type="button" className="btn btn-gray" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="card table-card">
        {loading ? (
          <p className="muted">Loading visitors...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Employee</th>
                <th>Visit Date</th>
                <th>Arrival</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-cell">
                    No records found
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v._id}>
                    <td>{v.visitorName}</td>
                    <td>{v.phoneNumber}</td>
                    <td>{v.purpose}</td>
                    <td>{v.employeeId?.name || "-"}</td>
                    <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                    <td>{v.expectedArrivalTime || "-"}</td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>{v.remarks || "-"}</td>
                    <td className="actions-cell">
                      {user.role === "Receptionist" && v.status === "Approved" && (
                        <button
                          type="button"
                          className="btn btn-blue"
                          onClick={() => handleCheckIn(v._id)}
                        >
                          Check In
                        </button>
                      )}
                      {user.role === "Receptionist" && v.status === "CheckedIn" && (
                        <button
                          type="button"
                          className="btn btn-gray"
                          onClick={() => handleCheckOut(v._id)}
                        >
                          Check Out
                        </button>
                      )}
                      {(user.role === "Receptionist" || user.role === "Administrator") &&
                        canCancel(v.status) && (
                          <button
                            type="button"
                            className="btn btn-red"
                            onClick={() => handleCancel(v._id)}
                          >
                            Cancel
                          </button>
                        )}
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => viewActivity(v._id)}
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {activityLogs && (
        <ActivityModal logs={activityLogs} onClose={() => setActivityLogs(null)} />
      )}
    </Layout>
  );
};

export default Visitors;
