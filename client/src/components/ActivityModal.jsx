const ActivityModal = ({ logs, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h3>Activity History</h3>
      {logs.length === 0 ? (
        <p className="muted">No activity yet.</p>
      ) : (
        <ul className="timeline">
          {logs.map((log) => (
            <li key={log._id} className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <strong>{log.action}</strong>
                <div className="timeline-meta">
                  {new Date(log.timestamp).toLocaleString()}
                  {log.performedBy?.name && ` · ${log.performedBy.name}`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn-gray" onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

export default ActivityModal;
