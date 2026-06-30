import { useMemo } from "react";

export function StatusBadge({ status = "" }) {
  const normalized = useMemo(
    () => String(status || "").toLowerCase(),
    [status],
  );

  const config = useMemo(() => {
    if (normalized === "active") {
      return {
        label: "Active",
        className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (normalized === "inactive") {
      return {
        label: "Inactive",
        className: "border border-slate-200 bg-slate-100 text-slate-700",
      };
    }

    if (normalized === "pending") {
      return {
        label: "Pending",
        className: "border border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    if (normalized === "disabled") {
      return {
        label: "Disabled",
        className: "border border-rose-200 bg-rose-50 text-rose-700",
      };
    }

    if (!normalized) {
      return {
        label: "Unknown",
        className: "border border-slate-200 bg-slate-100 text-slate-600",
      };
    }

    return {
      label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
      className: "border border-slate-200 bg-slate-100 text-slate-700",
    };
  }, [normalized]);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
