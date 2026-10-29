export const statuses = ["Saved", "Applied", "Interview", "Offer", "Closed"];
export const defaultPrep = [
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
];
export const defaultQuestions = [
  { id: "intro", question: "Tell me about yourself.", answer: "" },
  { id: "why", question: "Why this role and this company?", answer: "" },
  {
    id: "challenge",
    question: "Describe a challenge you worked through.",
    answer: "",
  },
];
export function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}
export function text(value, label, max, required = false) {
  if (value == null) value = "";
  if (typeof value !== "string") invalid(`${label} must be text.`);
  value = value.trim();
  if (required && !value) invalid(`${label} is required.`);
  if (value.length > max)
    invalid(`${label} must be ${max} characters or fewer.`);
  return value;
}
function date(value, label) {
  if (!value) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    invalid(`${label} is not a valid date.`);
  const parsed = new Date(`${value}T12:00:00Z`);
  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== value
  )
    invalid(`${label} is not a valid date.`);
  return value;
}
export function applicationInput(body) {
  const company = text(body.company, "Company", 100, true);
  const role = text(body.role, "Role", 140, true);
  const status = body.status || "Saved";
  if (!statuses.includes(status)) invalid("Choose a valid application stage.");
  const job_url = text(body.job_url, "Job link", 2000);
  if (job_url) {
    let url;
    try {
      url = new URL(job_url);
    } catch {
      invalid("Enter a complete http or https job link.");
    }
    if (!["https:", "http:"].includes(url.protocol))
      invalid("Job links must start with http:// or https://.");
  }
  let interview_at = null;
  if (body.interview_at) {
    if (
      typeof body.interview_at !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(body.interview_at)
    )
      invalid("Interview time needs a time zone.");
    const parsed = new Date(body.interview_at);
    if (Number.isNaN(parsed.valueOf())) invalid("Interview time is invalid.");
    interview_at = parsed.toISOString();
  }
  const prep = body.prep ?? defaultPrep;
  const questions = body.questions ?? defaultQuestions;
  if (
    !Array.isArray(prep) ||
    prep.length !== defaultPrep.length ||
    prep.some(
      (p, i) => !p || p.id !== defaultPrep[i].id || typeof p.done !== "boolean",
    )
  )
    invalid("Preparation checklist is invalid.");
  if (!Array.isArray(questions) || questions.length > 12)
    invalid("Use at most 12 interview questions.");
  const cleanQuestions = questions.map((q, i) => {
    if (!q || typeof q !== "object") invalid("Question is invalid.");
    return {
      id: String(i),
      question: text(q.question, "Question", 240, true),
      answer: text(q.answer, "Answer", 5000),
    };
  });
  return {
    company,
    role,
    location: text(body.location, "Location", 120),
    job_url,
    salary: text(body.salary, "Salary", 120),
    status,
    applied_date: date(body.applied_date, "Applied date"),
    follow_up_date: date(body.follow_up_date, "Follow-up date"),
    interview_at,
    contact_name: text(body.contact_name, "Contact", 120),
    next_action: text(body.next_action, "Next action", 240),
    notes: text(body.notes, "Notes", 15000),
    prep: prep.map((p, i) => ({ ...defaultPrep[i], done: p.done })),
    questions: cleanQuestions,
  };
}
