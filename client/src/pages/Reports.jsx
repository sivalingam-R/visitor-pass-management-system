import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import ActivityModal from "../components/ActivityModal";
import { useToast } from "../context/ToastContext";
import { getVisitorReports, getVisitorActivity } from "../services/api";
import { formatLabel } from "../utils/formatLabel";

const toISO = (d) => d.toISOString().split("T")[0];

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  return { startDate: toISO(start), endDate: toISO(now) };
};

const Reports = () => {
  const { showToast } = useToast();
  const [rangeType, setRangeType] = useState("today");
  const [startDate, setStartDate] = useState(toISO(new Date()));
  const [endDate, setEndDate] = useState(toISO(new Date()));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState(null);

  const applyRangeType = (type) => {
    setRangeType(type);
    if (type === "today") {
      const today = toISO(new Date());
      setStartDate(today);
      setEndDate(today);
      return { startDate: today, endDate: today };
    }
    if (type === "week") {
      const range = getWeekRange();
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      return range;
    }
    return { startDate, endDate };
  };

  const loadReport = async (params) => {
    setLoading(true);
    try {
      const query = params || { startDate, endDate };
      const { data } = await getVisitorReports(query);
      setReport(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport({ startDate, endDate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRangeChange = (type) => {
    const range = applyRangeType(type);
    if (type !== "custom") loadReport(range);
  };

  const viewActivity = async (id) => {
    try {
      const { data } = await getVisitorActivity(id);
      setActivityLogs(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load activity");
    }
  };

  const summaryKeys = report
    ? Object.keys(report).filter((k) => k !== "visitors")
    : [];

  return (
    <Layout>
      <h1 className="page-title">Visitor Reports</h1>

      <div className="filters card">
        <div className="range-tabs">
          <button
            type="button"
            className={`tab ${rangeType === "today" ? "active" : ""}`}
            onClick={() => handleRangeChange("today")}
          >
            Today
          </button>
          <button
            type="button"
            className={`tab ${rangeType === "week" ? "active" : ""}`}
            onClick={() => handleRangeChange("week")}
          >
            This Week
          </button>
          <button
            type="button"
            className={`tab ${rangeType === "custom" ? "active" : ""}`}
            onClick={() => setRangeType("custom")}
          >
            Custom
          </button>
        </div>
        {rangeType === "custom" && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-blue"
              onClick={() => loadReport({ startDate, endDate })}
            >
              Apply
            </button>
          </>
        )}
      </div>

      {loading ? (
        <p className="muted">Loading report...</p>
      ) : report ? (
        <>
          <div className="stats-grid">
            {summaryKeys.map((key) => (
              <div className="stat-card" key={key}>
                <div className="value">{report[key]}</div>
                <div className="label">{formatLabel(key)}</div>
              </div>
            ))}
          </div>

          <div className="card table-card">
            <h3>Visitor Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Phone</th>
                  <th>Employee</th>
                  <th>Visit Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {report.visitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      No data for selected range
                    </td>
                  </tr>
                ) : (
                  report.visitors.map((v) => (
                    <tr key={v._id}>
                      <td>{v.visitorName}</td>
                      <td>{v.phoneNumber}</td>
                      <td>{v.employeeId?.name || "-"}</td>
                      <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={v.status} />
                      </td>
                      <td>
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
          </div>
        </>
      ) : null}

      {activityLogs && (
        <ActivityModal logs={activityLogs} onClose={() => setActivityLogs(null)} />
      )}
    </Layout>
  );
};

export default Reports;
