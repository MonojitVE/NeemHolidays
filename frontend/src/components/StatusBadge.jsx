export default function StatusBadge({ status }) {
  const safeStatus = status || "unknown";

  return (
    <span className={`badge ${safeStatus.toLowerCase()}`}>
      {safeStatus}
    </span>
  );
}