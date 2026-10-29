export const STAGES = ["Saved", "Applied", "Interview", "Offer", "Closed"];
export function dayKey(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function formatDate(value, withTime = false) {
  if (!value) return "Not set";
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}
export function dueLabel(value) {
  if (!value) return "";
  const today = new Date(`${dayKey()}T12:00:00`);
  const days = Math.round(
    (new Date(`${value.slice(0, 10)}T12:00:00`) - today) / 86400000,
  );
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return formatDate(value);
}
export function isActive(app) {
  return app.status !== "Closed";
}
export function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}
export function localInputTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${dayKey(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
export function exportCSV(apps) {
  const fields = [
    "company",
    "role",
    "status",
    "location",
    "salary",
    "job_url",
    "applied_date",
    "follow_up_date",
    "interview_at",
    "contact_name",
    "next_action",
    "notes",
  ];
  const safe = (value) => {
    let str = String(value ?? "");
    // Prevent spreadsheet formulas from executing when opening exported user text.
    if (/^[\s]*[=+@-]/.test(str)) str = "'" + str;
    return '"' + str.replaceAll('"', '""') + '"';
  };
  const content =
    "\uFEFF" +
    [fields, ...apps.map((a) => fields.map((f) => a[f]))]
      .map((row) => row.map(safe).join(","))
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `shortlist-${dayKey()}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
