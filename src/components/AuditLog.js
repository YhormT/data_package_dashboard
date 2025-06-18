import React, { useState } from "react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";

const AuditLog = () => {
  const [userId, setUserId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (userId) params.userId = userId;
      if (start) params.start = start;
      if (end) params.end = end;
      if (type) params.type = type;
      const res = await axios.get(BASE_URL + "/api/admin-balance-sheet/audit-log", { params });
      setLogs(res.data);
    } catch (e) {
      setError(e.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Audit Log</h2>
      <div className="mb-4 flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-sm font-medium">Agent/User ID</label>
          <input
            type="number"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="border p-2 rounded w-32"
            placeholder="User ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={e => setStart(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={end}
            onChange={e => setEnd(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Type</label>
          <input
            type="text"
            value={type}
            onChange={e => setType(e.target.value)}
            className="border p-2 rounded w-32"
            placeholder="(optional)"
          />
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border border-gray-300 text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Date/Time</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Amount</th>
                <th className="border px-2 py-1">Prev Balance</th>
                <th className="border px-2 py-1">New Balance</th>
                <th className="border px-2 py-1">Reference</th>
                <th className="border px-2 py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.id || idx}>
                  <td className="border px-2 py-1 whitespace-nowrap">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                  <td className="border px-2 py-1">{log.type}</td>
                  <td className="border px-2 py-1">{log.amount}</td>
                  <td className="border px-2 py-1">{log.previousBalance}</td>
                  <td className="border px-2 py-1">{log.balance}</td>
                  <td className="border px-2 py-1">{log.reference}</td>
                  <td className="border px-2 py-1">{log.description}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-4">No logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
