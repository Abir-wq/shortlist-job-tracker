import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  LayoutGrid,
  List,
  MapPin,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeading, Badge, CompanyMark, Empty } from "../components/UI";
import { STAGES, formatDate, dueLabel, exportCSV } from "../utils";
export default function Applications({ apps, clearSamples, busy }) {
  const [params, setParams] = useSearchParams();
  const stage = params.get("status") || "All";
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [sort, setSort] = useState("newest");
  const filtered = apps
    .filter(
      (a) =>
        (stage === "All" || a.status === stage) &&
        `${a.company} ${a.role} ${a.location}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "company"
        ? a.company.localeCompare(b.company)
        : sort === "followup"
          ? (a.follow_up_date || "9999").localeCompare(
              b.follow_up_date || "9999",
            )
          : new Date(b.created_at) - new Date(a.created_at),
    );
  return (
    <>
      <PageHeading
        eyebrow="ONE PLACE FOR EVERY OPPORTUNITY"
        title="Your applications."
        action={
          <Link className="button primary" to="/applications/new">
            <Plus size={18} />
            Add application
          </Link>
        }
      >
        From “that looks interesting” to your next chapter.
      </PageHeading>
      {apps.some((a) => a.is_sample) && (
        <div className="sample-banner">
          <span>
            <strong>Sample workspace.</strong> These labelled applications use
            fictional companies. Your own entries are separate.
          </span>
          <button
            className="text-button"
            disabled={busy}
            onClick={clearSamples}
          >
            Remove samples
          </button>
        </div>
      )}
      <div className="filter-tabs" aria-label="Filter by stage">
        {["All", ...STAGES].map((s) => (
          <button
            key={s}
            className={stage === s ? "active" : ""}
            onClick={() => setParams(s === "All" ? {} : { status: s })}
          >
            {s}
            <span>
              {s === "All"
                ? apps.length
                : apps.filter((a) => a.status === s).length}
            </span>
          </button>
        ))}
      </div>
      <div className="toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Search applications"
            placeholder="Search company, role or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="sort-field">
          <SlidersHorizontal size={17} />
          <select
            aria-label="Sort applications"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="followup">Follow-up date</option>
            <option value="company">Company A–Z</option>
          </select>
        </label>
        <div className="view-toggle">
          <button
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List size={18} />
          </button>
          <button
            aria-label="Card view"
            aria-pressed={view === "cards"}
            onClick={() => setView("cards")}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
        <button
          className="button secondary export-button"
          onClick={() => exportCSV(filtered)}
          disabled={!filtered.length}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
      {!filtered.length ? (
        <section className="panel">
          <Empty
            title={
              apps.length
                ? "Nothing matches just yet."
                : "A fresh page for your search."
            }
          >
            {apps.length
              ? "Try another search or application stage."
              : "Add your first application to start keeping track."}
          </Empty>
        </section>
      ) : view === "list" ? (
        <div className="panel table-panel">
          <table className="applications-table">
            <thead>
              <tr>
                <th>OPPORTUNITY</th>
                <th>STAGE</th>
                <th>FOLLOW-UP</th>
                <th>ADDED</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link
                      className="table-opportunity"
                      to={`/applications/${a.id}`}
                    >
                      <CompanyMark name={a.company} />
                      <span>
                        <strong>{a.role}</strong>
                        <small>
                          {a.company} · {a.location || "Location not set"}{" "}
                          {a.is_sample && <em>Sample</em>}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <Badge status={a.status} />
                  </td>
                  <td>
                    {a.follow_up_date ? (
                      dueLabel(a.follow_up_date)
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td className="muted">{formatDate(a.created_at)}</td>
                  <td>
                    <Link
                      className="icon-button"
                      to={`/applications/${a.id}`}
                      aria-label={`Open ${a.company}`}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="application-cards">
          {filtered.map((a) => (
            <Link
              to={`/applications/${a.id}`}
              key={a.id}
              className="panel application-card"
            >
              <div className="section-heading">
                <CompanyMark name={a.company} />
                <Badge status={a.status} />
              </div>
              <p className="eyebrow">
                {a.company}
                {a.is_sample ? " · SAMPLE" : ""}
              </p>
              <h3>{a.role}</h3>
              <p className="muted small">
                <MapPin size={14} />
                {a.location || "Location not set"}
              </p>
              <div className="card-next">
                <span>NEXT STEP</span>
                <p>
                  {a.next_action || "Make a little plan for this opportunity."}
                </p>
              </div>
              <div className="card-bottom">
                <span>
                  {a.follow_up_date
                    ? dueLabel(a.follow_up_date)
                    : "No follow-up set"}
                </span>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
      <p className="results-count">
        {filtered.length}{" "}
        {filtered.length === 1 ? "opportunity" : "opportunities"} shown. CSV
        export includes the current filtered list.
      </p>
    </>
  );
}
