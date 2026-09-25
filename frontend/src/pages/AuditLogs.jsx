import { useEffect, useState } from "react";
import "./AuditLogs.css";

const API_URL = "http://127.0.0.1:8000";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/audit-logs/`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load audit logs");
      }

      setLogs(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    const searchText = search.toLowerCase();

    return (
      log.action?.toLowerCase().includes(searchText) ||
      log.entity_type?.toLowerCase().includes(searchText) ||
      log.description?.toLowerCase().includes(searchText) ||
      String(log.entity_id || "").includes(searchText)
    );
  });

  function getActionClass(action) {
    if (action === "CREATE") {
      return "action-create";
    }

    if (action === "UPDATE") {
      return "action-update";
    }

    if (action === "DELETE") {
      return "action-delete";
    }

    if (action === "COMPLETE") {
      return "action-complete";
    }

    if (action === "RECEIVE") {
      return "action-receive";
    }

    return "action-default";
  }

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <h1>Audit Logs</h1>
          <p>
            Track important actions performed throughout StockFlow.
          </p>
        </div>

        <button
          className="refresh-audit-button"
          onClick={loadLogs}
        >
          ↻ Refresh
        </button>
      </div>

      {message && (
        <div className="audit-message">
          {message}
        </div>
      )}

      <div className="audit-toolbar">
        <input
          type="text"
          placeholder="Search action, entity or description..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="audit-table-card">
        <table className="audit-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>Description</th>
              <th>User ID</th>
              <th>Date & Time</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="audit-empty">
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="audit-empty">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>#{log.id}</strong>
                  </td>

                  <td>
                    <span
                      className={`action-badge ${getActionClass(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td>
                    <span className="entity-type">
                      {log.entity_type}
                    </span>
                  </td>

                  <td>
                    {log.entity_id
                      ? `#${log.entity_id}`
                      : "-"}
                  </td>

                  <td className="description-cell">
                    {log.description || "-"}
                  </td>

                  <td>
                    {log.user_id
                      ? `#${log.user_id}`
                      : "System"}
                  </td>

                  <td>
                    {log.created_at
                      ? new Date(
                          log.created_at
                        ).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogs;