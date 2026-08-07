import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import ActivityModal from "../components/ActivityModal";
import { useToast } from "../context/ToastContext";
import {
  getMyRequests,
  approveVisitor,
  rejectVisitor,
  getVisitorActivity,
} from "../services/api";

const MyRequests = () => {
  const { showToast } = useToast();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksFor, setRemarksFor] = useState(null);
  const [remarksText, setRemarksText] = useState("");
  const [remarksAction, setRemarksAction] = useState("");
  const [activityLogs, setActivityLogs] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await getMyRequests();
      setVisitors(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRemarks = (id, action) => {
    setRemarksFor(id);
    setRemarksAction(action);
    setRemarksText("");
  };

  const submitRemarks = async () => {
    try {
      if (remarksAction === "approve") {
        await approveVisitor(remarksFor, remarksText);
        showToast("Request approved", "success");
      } else {
        await rejectVisitor(remarksFor, remarksText);
        showToast("Request rejected", "success");
      }
      setRemarksFor(null);
      loadRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Action failed");
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

  return (
    <Layout>
      <h1 className="page-title">My Visitor Requests</h1>

      <div className="card table-card">
        {loading ? (
          <p className="muted">Loading requests...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Visit Date</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No requests assigned to you
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v._id}>
                    <td>{v.visitorName}</td>
                    <td>{v.phoneNumber}</td>
                    <td>{v.purpose}</td>
                    <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={v.status} />
                    </td>
                    <td>{v.remarks || "-"}</td>
                    <td className="actions-cell">
                      {v.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="btn btn-green"
                            onClick={() => openRemarks(v._id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-red"
                            onClick={() => openRemarks(v._id, "reject")}
                          >
                            Reject
                          </button>
                        </>
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

      {remarksFor && (
        <div className="modal-overlay" onClick={() => setRemarksFor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {remarksAction === "approve" ? "Approve Request" : "Reject Request"}
            </h3>
            <textarea
              rows={3}
              placeholder="Add remarks (optional)"
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              className="textarea"
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-navy" onClick={submitRemarks}>
                Confirm
              </button>
              <button
                type="button"
                className="btn btn-gray"
                onClick={() => setRemarksFor(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activityLogs && (
        <ActivityModal logs={activityLogs} onClose={() => setActivityLogs(null)} />
      )}
    </Layout>
  );
};

export default MyRequests;
