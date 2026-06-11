import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/analytics/summary");
      setData(res.data || {});
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <>
      <h1>Dashboard</h1>

      {Object.keys(data).length === 0 ? (
        <div className="card">
          <p>No dashboard data available.</p>
        </div>
      ) : (
        <div className="stats">
          {Object.entries(data).map(([key, value]) => (
            <Card key={key}>
              <h3>{key.replaceAll("_", " ")}</h3>
              <b>{value ?? 0}</b>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}