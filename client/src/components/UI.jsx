import { Link } from "react-router-dom";
import {
  Check,
  ArrowUpRight,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react";
import { initials } from "../utils";
export function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark">
        <Check size={23} />
      </span>
      shortlist<span className="logo-dot">.</span>
    </Link>
  );
}
export function Badge({ status }) {
  return (
    <span className={`badge ${status.toLowerCase()}`}>
      <span />
      {status}
    </span>
  );
}
export function CompanyMark({ name }) {
  return (
    <span className={`company-mark tone-${name.length % 4}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
export function ErrorBox({ error, retry }) {
  return error ? (
    <div className="error-box" role="alert">
      <AlertCircle size={18} />
      <span>{error}</span>
      {retry && (
        <button className="text-button" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div className="loading" role="status" aria-label="Loading">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
      <span>Getting things ready…</span>
    </div>
  );
}
export function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <BriefcaseBusiness size={31} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function PageHeading({ eyebrow, title, children, action }) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p className="subtitle">{children}</p>}
      </div>
      {action}
    </header>
  );
}
export function AppLink({ app }) {
  return (
    <Link className="app-link" to={`/applications/${app.id}`}>
      <CompanyMark name={app.company} />
      <span>
        <strong>{app.role}</strong>
        <small>
          {app.company} · {app.location || "Location not added"}
        </small>
      </span>
      <ArrowUpRight size={18} />
    </Link>
  );
}
