import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { Logo, ErrorBox } from "../components/UI";
import { api } from "../api";
export default function Auth({ onSuccess }) {
  const [register, setRegister] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body,
      });
      onSuccess(result.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Logo />
        <div>
          <p className="eyebrow">A LITTLE CLARITY. A NEW CHAPTER.</p>
          <h1>
            Your next move.
            <br />
            <em>All in one place.</em>
          </h1>
          <p>
            Keep track of the opportunities you care about.
            <br />
            Show up prepared for the ones that matter.
          </p>
          <div className="paper-card">
            <span className="paper-pin" />
            <p className="eyebrow">ONE STEP AT A TIME</p>
            <div>
              <Check />
              Save a role that feels right
            </div>
            <div>
              <Check />
              Make the application your own
            </div>
            <div>
              <span className="empty-check" />
              Walk into the interview prepared
            </div>
            <span className="paper-caption">You’ve got a place to start.</span>
          </div>
        </div>
        <small>A calmer corner of your job search.</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-mobile-logo">
          <Logo />
        </div>
        <div className="auth-form">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h2>
            {register ? "Start your next chapter." : "Good to see you again."}
          </h2>
          <p className="muted">
            {register
              ? "A few details, then a little more clarity."
              : "Pick up where you left off."}
          </p>
          <ErrorBox error={error} />
          <form onSubmit={submit}>
            {register && (
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  placeholder="Abir Ahmed"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  type={show ? "text" : "password"}
                  name="password"
                  autoComplete={register ? "new-password" : "current-password"}
                  required
                  minLength={register ? 10 : 1}
                  maxLength={72}
                  placeholder={
                    register ? "At least 10 characters" : "Your password"
                  }
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {register && (
              <p className="field-help">
                Use a unique password. Email verification and password recovery
                are not included in this portfolio version.
              </p>
            )}
            <button className="button primary wide" disabled={busy}>
              {busy
                ? "One moment…"
                : register
                  ? "Create my workspace"
                  : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to Shortlist?"}{" "}
            <button
              className="text-button"
              disabled={busy}
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register ? "Sign in" : "Create an account"}
            </button>
          </p>
          <div className="auth-tip">
            <span>FIRST TIME EXPLORING?</span>
            <p>
              Create an account, then load the fictional sample applications to
              see how everything works.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
