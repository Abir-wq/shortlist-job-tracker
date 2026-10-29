import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  ExternalLink,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import { Badge, CompanyMark, ErrorBox, PageHeading } from "../components/UI";
import { STAGES, localInputTime } from "../utils";
const empty = {
  company: "",
  role: "",
  location: "",
  job_url: "",
  salary: "",
  status: "Saved",
  applied_date: "",
  follow_up_date: "",
  interview_at: "",
  contact_name: "",
  next_action: "",
  notes: "",
  prep: [
    { id: "company", label: "Read about the company", done: false },
    { id: "story", label: "Prepare a short introduction", done: false },
    { id: "examples", label: "Choose two examples of my work", done: false },
    {
      id: "questions",
      label: "Write questions for the interviewer",
      done: false,
    },
    {
      id: "logistics",
      label: "Check the time, location and equipment",
      done: false,
    },
  ],
  questions: [
    { id: "intro", question: "Tell me about yourself.", answer: "" },
    { id: "why", question: "Why this role and this company?", answer: "" },
    {
      id: "challenge",
      question: "Describe a challenge you worked through.",
      answer: "",
    },
  ],
};
export default function ApplicationEditor({ application, save, remove }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(() =>
    application
      ? {
          ...application,
          applied_date: application.applied_date?.slice(0, 10) || "",
          follow_up_date: application.follow_up_date?.slice(0, 10) || "",
          interview_at: localInputTime(application.interview_at),
        }
      : structuredClone(empty),
  );
  const [tab, setTab] = useState(
    location.hash === "#prep" ? "prep" : "details",
  );
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }
  function leave(event) {
    if (dirty && !window.confirm("Leave without saving your changes?"))
      event.preventDefault();
  }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = {
        ...form,
        interview_at: form.interview_at
          ? new Date(form.interview_at).toISOString()
          : null,
      };
      const saved = await save(payload, application?.id);
      setDirty(false);
      if (!application)
        navigate(`/applications/${saved.id}`, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteApplication() {
    if (
      !window.confirm(
        `Delete the application at ${form.company}? Its notes will also be deleted.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await remove(application.id);
      setDirty(false);
      navigate("/applications");
    } catch (error) {
      setError(error.message);
      setBusy(false);
    }
  }
  const field = (
    key,
    label,
    type = "text",
    maxLength = 120,
    required = false,
  ) => (
    <label>
      {label}
      {required && <span className="required"> *</span>}
      <input
        type={type}
        value={form[key] || ""}
        maxLength={maxLength}
        required={required}
        onChange={(e) => update(key, e.target.value)}
      />
    </label>
  );
  return (
    <>
      <Link className="back-link" to="/applications" onClick={leave}>
        <ArrowLeft size={16} />
        All applications
      </Link>
      {application ? (
        <header className="detail-heading">
          <CompanyMark name={form.company} />
          <div>
            <p className="eyebrow">
              {application.is_sample ? "FICTIONAL SAMPLE · " : ""}
              {application.company}
            </p>
            <h1>{application.role}</h1>
            <p className="muted">
              {application.location || "A new possibility."}
            </p>
          </div>
          <Badge status={form.status} />
        </header>
      ) : (
        <PageHeading
          eyebrow="MAKE ROOM FOR A POSSIBILITY"
          title="A new opportunity."
        >
          Start with the company and role. The rest can come later.
        </PageHeading>
      )}
      <div className="detail-tabs">
        <button
          className={tab === "details" ? "active" : ""}
          onClick={() => setTab("details")}
        >
          The opportunity
        </button>
        <button
          className={tab === "prep" ? "active" : ""}
          onClick={() => setTab("prep")}
        >
          Interview preparation{" "}
          <span>
            {form.prep.filter((p) => p.done).length}/{form.prep.length}
          </span>
        </button>
      </div>
      <ErrorBox error={error} />
      <form onSubmit={submit} className="editor-form">
        <div hidden={tab !== "details"}>
          <div className="editor-columns">
            <section className="panel form-panel">
              <h2>The essentials</h2>
              <p className="muted small">
                A few details to keep this opportunity in focus.
              </p>
              <div className="form-grid">
                {field("company", "Company", "text", 100, true)}
                {field("role", "Role / job title", "text", 140, true)}
                {field("location", "Location / work arrangement")}
                {field("salary", "Salary / hourly rate")}
                <label>
                  Application stage
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                  >
                    {STAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                {field("applied_date", "Date applied", "date")}
                {field("job_url", "Job posting link", "url", 2000)}
                {field("contact_name", "Contact person")}
              </div>
              {form.job_url && /^https?:\/\//.test(form.job_url) && (
                <a
                  href={form.job_url}
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open job posting <ExternalLink size={14} />
                </a>
              )}
            </section>
            <section className="panel form-panel next-step-form">
              <span className="eyebrow">KEEP THE BALL ROLLING</span>
              <h2>One small next step.</h2>
              <p className="muted small">
                Something specific you can actually do.
              </p>
              <label>
                My next action
                <input
                  value={form.next_action}
                  maxLength={240}
                  onChange={(e) => update("next_action", e.target.value)}
                  placeholder="e.g. Send a short follow-up email"
                />
              </label>
              {field("follow_up_date", "Follow-up date", "date")}
              {field("interview_at", "Interview date & time", "datetime-local")}
              <p className="field-help">
                Interview time uses your device’s time zone (
                {Intl.DateTimeFormat().resolvedOptions().timeZone}). Dates are
                reminders inside this app; no email is sent.
              </p>
            </section>
          </div>
          <section className="panel form-panel notes-panel">
            <h2>Notes to your future self</h2>
            <p className="muted small">
              What caught your eye? What did you learn? Keep the useful details
              here.
            </p>
            <label className="sr-only" htmlFor="notes">
              Application notes
            </label>
            <textarea
              id="notes"
              rows={6}
              maxLength={15000}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Team details, conversations, things to remember…"
            />
          </section>
        </div>
        <div hidden={tab !== "prep"}>
          <div className="prep-heading">
            <div>
              <h2>A little preparation goes a long way.</h2>
              <p className="muted">
                Your thoughts don’t have to be polished. They just have to be
                yours.
              </p>
            </div>
            <CheckCircle2 size={34} />
          </div>
          <div className="prep-layout">
            <section className="panel form-panel checklist">
              <h3>Before the conversation</h3>
              {form.prep.map((item, index) => (
                <label key={item.id} className={item.done ? "checked" : ""}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) =>
                      update(
                        "prep",
                        form.prep.map((p, i) =>
                          i === index ? { ...p, done: e.target.checked } : p,
                        ),
                      )
                    }
                  />
                  <span>{item.label}</span>
                </label>
              ))}
              <div className="checklist-note">
                A checklist is a helping hand, not another test.
              </div>
            </section>
            <section className="questions">
              <div className="section-heading">
                <h3>Your stories & questions</h3>
                <span className="muted small">{form.questions.length}/12</span>
              </div>
              {form.questions.map((q, index) => (
                <article className="panel question-card" key={q.id}>
                  <div className="question-top">
                    <span className="question-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <label className="sr-only" htmlFor={`question-${index}`}>
                      Question {index + 1}
                    </label>
                    <input
                      id={`question-${index}`}
                      value={q.question}
                      required
                      maxLength={240}
                      onChange={(e) =>
                        update(
                          "questions",
                          form.questions.map((p, i) =>
                            i === index
                              ? { ...p, question: e.target.value }
                              : p,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Remove question ${index + 1}`}
                      onClick={() =>
                        update(
                          "questions",
                          form.questions.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <label className="sr-only" htmlFor={`answer-${index}`}>
                    Answer {index + 1}
                  </label>
                  <textarea
                    id={`answer-${index}`}
                    rows={5}
                    value={q.answer}
                    maxLength={5000}
                    placeholder="A few bullet points, a real example, a question you want to ask…"
                    onChange={(e) =>
                      update(
                        "questions",
                        form.questions.map((p, i) =>
                          i === index ? { ...p, answer: e.target.value } : p,
                        ),
                      )
                    }
                  />
                </article>
              ))}
              <button
                type="button"
                className="button secondary"
                disabled={form.questions.length >= 12}
                onClick={() =>
                  update("questions", [
                    ...form.questions,
                    {
                      id: crypto.randomUUID(),
                      question: "My question",
                      answer: "",
                    },
                  ])
                }
              >
                <Plus size={17} />
                Add a question
              </button>
            </section>
          </div>
        </div>
        <div className="save-bar">
          <span className={dirty ? "unsaved" : "muted"}>
            {dirty
              ? "You have unsaved changes."
              : application
                ? "All changes saved."
                : "Required fields are marked *."}
          </span>
          <div>
            {application && (
              <button
                type="button"
                className="button danger-quiet"
                aria-label="Delete application"
                disabled={busy}
                onClick={deleteApplication}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}
            <button
              className="button primary"
              disabled={busy}
              onClick={() => {
                if (!form.company.trim() || !form.role.trim())
                  setTab("details");
                else if (form.questions.some((q) => !q.question.trim()))
                  setTab("prep");
              }}
            >
              <Save size={17} />
              {busy
                ? "Saving…"
                : application
                  ? "Save changes"
                  : "Save application"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
