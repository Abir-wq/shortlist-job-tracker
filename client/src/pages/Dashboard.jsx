import { Link } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Send,
  MessagesSquare,
  PartyPopper,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import {
  PageHeading,
  Badge,
  AppLink,
  Empty,
  CompanyMark,
} from "../components/UI";
import { STAGES, dayKey, dueLabel, formatDate, isActive } from "../utils";
export default function Dashboard({ user, apps, addSamples, busy }) {
  const first = user.name.split(" ")[0];
  const due = apps
    .filter((a) => isActive(a) && a.follow_up_date)
    .sort((a, b) => a.follow_up_date.localeCompare(b.follow_up_date));
  const upcoming = apps
    .filter(
      (a) =>
        a.status === "Interview" &&
        a.interview_at &&
        new Date(a.interview_at) >= new Date(),
    )
    .sort((a, b) => new Date(a.interview_at) - new Date(b.interview_at));
  const stats = [
    ["Saved", "Worth a closer look", Bookmark],
    ["Applied", "Out in the world", Send],
    ["Interview", "A chance to connect", MessagesSquare],
    ["Offer", "Something to celebrate", PartyPopper],
  ];
  return (
    <>
      <PageHeading
        eyebrow={new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        title={`A little momentum, ${first}.`}
        action={
          <Link className="button primary" to="/applications/new">
            <Plus size={18} />
            Add application
          </Link>
        }
      >
        Your job search, with a clear next step.
      </PageHeading>
      <section className="stats-grid" aria-label="Application counts">
        {stats.map(([status, label, Icon]) => (
          <Link
            to={`/applications?status=${status}`}
            key={status}
            className={`stat-card stat-${status.toLowerCase()}`}
          >
            <div>
              <span>{status}</span>
              <Icon size={18} />
            </div>
            <strong>
              {apps
                .filter((a) => a.status === status)
                .length.toString()
                .padStart(2, "0")}
            </strong>
            <small>{label}</small>
          </Link>
        ))}
      </section>
      {!apps.length ? (
        <section className="panel welcome-panel">
          <Empty
            title="Every next chapter starts somewhere."
            action={
              <div className="button-row">
                <Link className="button primary" to="/applications/new">
                  <Plus size={17} />
                  Add your first application
                </Link>
                <button
                  className="button secondary"
                  onClick={addSamples}
                  disabled={busy}
                >
                  {busy ? "Adding…" : "Explore with sample data"}
                </button>
              </div>
            }
          >
            Save a role, set one small next step, and make room for progress.
            Sample data uses fictional companies.
          </Empty>
        </section>
      ) : (
        <>
          <div className="dashboard-columns">
            <section className="panel next-panel">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">SMALL STEPS, REAL PROGRESS</span>
                  <h2>On your radar</h2>
                </div>
                <span className="count-pill">{due.length}</span>
              </div>
              <p className="muted small">
                Follow-ups, sorted by the date you chose.
              </p>
              {due.length ? (
                <div className="action-list">
                  {due.slice(0, 4).map((a) => (
                    <Link
                      key={a.id}
                      to={`/applications/${a.id}`}
                      className="action-item"
                    >
                      <span className="action-circle">
                        <ArrowUpRight size={18} />
                      </span>
                      <div>
                        <strong>
                          {a.next_action || `Check in with ${a.company}`}
                        </strong>
                        <small>
                          {a.company} · {a.role}
                        </small>
                      </div>
                      <span
                        className={`due ${a.follow_up_date.slice(0, 10) < dayKey() ? "overdue" : ""}`}
                      >
                        {dueLabel(a.follow_up_date)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="quiet-state">
                  <CheckCircle2 />
                  <h3>A little breathing room.</h3>
                  <p>
                    Add a follow-up date to an application when you know your
                    next step.
                  </p>
                </div>
              )}
              <Link className="section-link" to="/applications">
                See all applications <ArrowRight size={16} />
              </Link>
            </section>
            <section className="interview-feature">
              <div className="section-heading">
                <span className="eyebrow">THE NEXT CONVERSATION</span>
                <MessagesSquare size={22} />
              </div>
              <h2>
                {upcoming.length
                  ? "Make a little time\nto prepare."
                  : "Good conversations\nstart with preparation."}
              </h2>
              {upcoming[0] ? (
                <>
                  <div className="feature-company">
                    <CompanyMark name={upcoming[0].company} />
                    <div>
                      <strong>{upcoming[0].company}</strong>
                      <span>{upcoming[0].role}</span>
                    </div>
                  </div>
                  <p className="feature-date">
                    <CalendarDays size={17} />
                    {formatDate(upcoming[0].interview_at, true)}
                  </p>
                  <Link
                    className="button cream"
                    to={`/applications/${upcoming[0].id}#prep`}
                  >
                    Open interview notes
                    <ArrowUpRight size={17} />
                  </Link>
                </>
              ) : (
                <>
                  <p>
                    Your stories, your questions, and a checklist to help you
                    feel ready.
                  </p>
                  <Link className="button cream" to="/interviews">
                    Visit the interview room
                    <ArrowUpRight size={17} />
                  </Link>
                </>
              )}
              <span className="feature-decoration" aria-hidden="true">
                ✳
              </span>
            </section>
          </div>
          <section className="panel">
            <div className="section-heading">
              <h2>Your latest opportunities</h2>
              <Link className="text-link" to="/applications">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div className="recent-list">
              {apps.slice(0, 4).map((a) => (
                <div className="recent-row" key={a.id}>
                  <AppLink app={a} />
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          </section>
          <section className="journey-strip">
            <span className="eyebrow">YOUR PIPELINE</span>
            <div>
              {STAGES.map((stage) => (
                <Link to={`/applications?status=${stage}`} key={stage}>
                  <span className={`stage-dot ${stage.toLowerCase()}`} />
                  {stage}
                  <strong>
                    {apps.filter((a) => a.status === stage).length}
                  </strong>
                </Link>
              ))}
            </div>
            <p>Stages describe where things stand, not your worth.</p>
          </section>
        </>
      )}
    </>
  );
}
