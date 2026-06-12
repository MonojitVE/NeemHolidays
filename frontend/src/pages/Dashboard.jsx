import { useEffect, useState } from "react";
import api from "../api/client";
import {
  LayoutDashboard,
  Rss,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
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

  const has = data && Object.keys(data).length > 0;

  // Pull out known fields if present, otherwise fall back gracefully
  const pending = data?.pending_review ?? data?.pending ?? 0;
  const posted = data?.posted ?? data?.accepted ?? 0;
  const rejected = data?.rejected ?? 0;
  const articles = data?.total_articles ?? data?.articles ?? 0;

  // Any extra fields not covered above, shown in the "other metrics" panel
  const knownKeys = new Set([
    "pending_review",
    "pending",
    "posted",
    "accepted",
    "rejected",
    "total_articles",
    "articles",
  ]);
  const extras = has
    ? Object.entries(data).filter(([k]) => !knownKeys.has(k))
    : [];

  // Simple deterministic bar heights derived from the numbers we have,
  // just to give the "weekly activity" card some visual texture.
  const barSeed = [pending, posted, rejected, articles, pending + posted];
  const maxSeed = Math.max(1, ...barSeed);
  const bars = barSeed.map((v) => Math.max(8, Math.round((v / maxSeed) * 60)));

  return (
    <>
      <div className="dash-head">
        <span className="eyebrow">Overview</span>
        <h1>
          <LayoutDashboard
            size={26}
            strokeWidth={2}
            style={{
              verticalAlign: "-4px",
              marginRight: 10,
              color: "var(--accent)",
            }}
          />
          Dashboard
        </h1>
        <p>A snapshot of the AI content pipeline — fetch, review, publish.</p>
      </div>

      {!has ? (
        <div className="dash-panel empty-dash">
          <h2>No dashboard data yet</h2>
          <p>
            Run a fetch from Content Review to start generating numbers here.
          </p>
        </div>
      ) : (
        <>
          <div className="dash-grid">
            <div className="dash-card accent large">
              <span className="dc-label">Awaiting Review</span>
              <span className="dc-value">{pending}</span>
              <span className="dc-sub">
                Blogs generated and waiting on a decision
              </span>
            </div>

            <div className="dash-card">
              <span className="dc-label">Published</span>
              <span className="dc-value">{posted}</span>
              <span className="dc-sub">Live on the public site</span>
            </div>

            <div className="dash-card">
              <span className="dc-label">Rejected</span>
              <span className="dc-value">{rejected}</span>
              <span className="dc-sub">Not used</span>
            </div>
          </div>

          <div className="dash-secondary">
            <div className="dash-panel">
              <h3>
                Pipeline activity <small>LAST RUNS</small>
              </h3>

              <div className="activity-row">
                <Rss
                  size={18}
                  strokeWidth={2}
                  style={{ color: "var(--moss)", flexShrink: 0 }}
                />
                <div className="at-body">
                  <div className="at-title">
                    Articles fetched from RSS feeds
                  </div>
                  <div className="at-time">Total tracked: {articles}</div>
                </div>
              </div>

              <div className="activity-row">
                <Clock
                  size={18}
                  strokeWidth={2}
                  style={{ color: "#f59e0b", flexShrink: 0 }}
                />
                <div className="at-body">
                  <div className="at-title">
                    {pending} blog{pending === 1 ? "" : "s"} pending review
                  </div>
                  <div className="at-time">Needs accept / reject</div>
                </div>
              </div>

              <div className="activity-row">
                <CheckCircle2
                  size={18}
                  strokeWidth={2}
                  style={{ color: "var(--moss)", flexShrink: 0 }}
                />
                <div className="at-body">
                  <div className="at-title">
                    {posted} blog{posted === 1 ? "" : "s"} published
                  </div>
                  <div className="at-time">Visible on public site</div>
                </div>
              </div>

              {rejected > 0 && (
                <div className="activity-row">
                  <XCircle
                    size={18}
                    strokeWidth={2}
                    style={{ color: "var(--danger)", flexShrink: 0 }}
                  />
                  <div className="at-body">
                    <div className="at-title">
                      {rejected} blog{rejected === 1 ? "" : "s"} rejected
                    </div>
                    <div className="at-time">Filtered out by reviewer</div>
                  </div>
                </div>
              )}

              <div className="dc-bars">
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className={i === 0 ? "hi" : ""}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="dash-panel">
              <h3>
                Queue <small>STATUS</small>
              </h3>

              <div className="queue-row">
                <span className="qr-label">Pending review</span>
                <span className="qr-count">{pending}</span>
              </div>
              <div className="queue-row">
                <span className="qr-label">Published</span>
                <span className="qr-count">{posted}</span>
              </div>
              <div className="queue-row">
                <span className="qr-label">Rejected</span>
                <span className="qr-count">{rejected}</span>
              </div>
              <div className="queue-row">
                <span className="qr-label">Total articles</span>
                <span className="qr-count">{articles}</span>
              </div>

              {extras.map(([key, value]) => (
                <div className="queue-row" key={key}>
                  <span className="qr-label">{key.replaceAll("_", " ")}</span>
                  <span className="qr-count">{value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
