interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  let className = "status-badge";

  if (normalizedStatus === "live") {
    className += " status-live";
  } else if (normalizedStatus === "draft") {
    className += " status-draft";
  } else if (normalizedStatus === "scheduled") {
    className += " status-scheduled";
  }

  return (
    <span className={className}>
      {status}
    </span>
  );
}