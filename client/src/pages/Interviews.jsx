import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { PageHeading, CompanyMark, Empty } from "../components/UI";
import { formatDate } from "../utils";
export default function Interviews({ apps }) {
  const interviews = apps
    .filter((a) => a.status === "Interview")
    .sort(
      (a, b) =>
        new Date(a.interview_at || "9999-01-01") -
        new Date(b.interview_at || "9999-01-01"),
    );
  return (
    <>
      <PageHeading eyebrow="A SPACE TO FEEL READY" title="The interview room.">
        Gather your thoughts. Find your examples. Be yourself.
      </PageHeading>
      <div className="interview-intro">
        <span className="small-star">✳</span>
        <p>
          You don’t need a perfect script.
          <br />
          <strong>A few honest stories are a good place to start.</strong>
        </p>
      </div>
      {interviews.length ? (
        <div className="application-cards">
          {interviews.map((a) => {
            const done = a.prep.filter((p) => p.done).length;
            return (
              <Link
                className="panel interview-card"
                key={a.id}
                to={`/applications/${a.id}#prep`}
              >
                <CompanyMark name={a.company} />
                <p className="eyebrow">{a.company}</p>
                <h2>{a.role}</h2>
                <p className="muted small">
                  <CalendarDays size={15} />
                  {a.interview_at
                    ? formatDate(a.interview_at, true)
                    : "Date to be arranged"}
                </p>
                <div className="progress-label">
                  <span>
                    <CheckCircle2 size={15} />
                    Your preparation
                  </span>
                  <strong>
                    {done}/{a.prep.length}
                  </strong>
                </div>
                <progress
                  max={a.prep.length}
                  value={done}
                  aria-label={`Preparation for ${a.company}`}
                />
                <div className="card-bottom">
                  <span>Open my notes</span>
                  <ArrowUpRight size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <section className="panel">
          <Empty
            title="Your next conversation will have a home here."
            action={
              <Link className="button primary" to="/applications">
                View applications
              </Link>
            }
          >
            Move an application to the Interview stage to see it here. You can
            write preparation notes at any stage.
          </Empty>
        </section>
      )}
      <section className="interview-tips">
        <h2>Three things worth thinking about.</h2>
        <div>
          <article>
            <span>01</span>
            <h3>Why this opportunity?</h3>
            <p>
              Find one specific thing that connects the role to work you
              actually enjoy.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>What have you learned?</h3>
            <p>
              Choose a real challenge. Explain your part, your decisions, and
              what changed.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>What do you want to ask?</h3>
            <p>
              An interview goes both ways. Ask about the team, expectations, and
              daily work.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
