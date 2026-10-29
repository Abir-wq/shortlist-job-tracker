import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
  useLocation,
} from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import { api } from "./api";
import Layout from "./components/Layout";
import { ErrorBox, Loading, Empty } from "./components/UI";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import ApplicationEditor from "./pages/ApplicationEditor";
import Interviews from "./pages/Interviews";
function Detail({ apps, ...props }) {
  const { id } = useParams();
  const app = apps.find((a) => a.id === id);
  return app ? (
    <ApplicationEditor key={id} application={app} {...props} />
  ) : (
    <Empty
      title="This opportunity isn’t here."
      action={
        <Link className="button primary" to="/applications">
          Back to applications
        </Link>
      }
    >
      It may have been deleted, or this link may be incorrect.
    </Empty>
  );
}
export default function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState("");
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  async function checkSession() {
    setAuthError("");
    setChecking(true);
    try {
      const data = await api("/auth/me");
      setUser(data.user);
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    checkSession();
  }, []);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setApps(await api("/applications"));
    } catch (e) {
      setError(e.message);
      if (e.status === 401) {
        setUser(null);
        await checkSession();
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (user) load();
    else setApps([]);
  }, [user?.id]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      setApps([]);
      await checkSession();
    } catch (e) {
      setError(e.message);
    }
  }
  async function save(body, id) {
    const item = await api(id ? `/applications/${id}` : "/applications", {
      method: id ? "PUT" : "POST",
      body,
    });
    setApps((prev) =>
      id ? prev.map((a) => (a.id === id ? item : a)) : [item, ...prev],
    );
    setToast(id ? "Your changes are saved." : "A new opportunity, saved.");
    return item;
  }
  async function remove(id) {
    await api(`/applications/${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
    setToast("Application deleted.");
  }
  async function addSamples() {
    setBusy(true);
    setError("");
    try {
      await api("/applications/samples", { method: "POST" });
      await load();
      setToast("Your fictional sample workspace is ready.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function clearSamples() {
    if (
      !window.confirm(
        "Remove all fictional sample applications? Your own applications will stay.",
      )
    )
      return;
    setBusy(true);
    try {
      await api("/applications/samples", { method: "DELETE" });
      await load();
      setToast("Sample applications removed.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (checking)
    return (
      <div className="initial-loading">
        <Loading />
      </div>
    );
  if (authError)
    return (
      <div className="initial-loading">
        <ErrorBox error={authError} retry={checkSession} />
      </div>
    );
  if (!user) return <Auth onSuccess={setUser} />;
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Routes>
        <Route element={<Layout user={user} logout={logout} />}>
          <Route
            path="/"
            element={
              <>
                <ErrorBox error={error} retry={load} />
                {loading ? (
                  <Loading />
                ) : (
                  <Dashboard
                    user={user}
                    apps={apps}
                    addSamples={addSamples}
                    busy={busy}
                  />
                )}
              </>
            }
          />
          <Route
            path="/applications"
            element={
              <>
                <ErrorBox error={error} retry={load} />
                {loading ? (
                  <Loading />
                ) : (
                  <Applications
                    apps={apps}
                    clearSamples={clearSamples}
                    busy={busy}
                  />
                )}
              </>
            }
          />
          <Route
            path="/applications/new"
            element={<ApplicationEditor key="new" save={save} />}
          />
          <Route
            path="/applications/:id"
            element={
              loading ? (
                <Loading />
              ) : error ? (
                <ErrorBox error={error} retry={load} />
              ) : (
                <Detail apps={apps} save={save} remove={remove} />
              )
            }
          />
          <Route
            path="/interviews"
            element={
              <>
                <ErrorBox error={error} retry={load} />
                {loading ? <Loading /> : <Interviews apps={apps} />}
              </>
            }
          />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route
            path="*"
            element={
              <Empty
                title="A little off the path."
                action={
                  <Link className="button primary" to="/">
                    Back to overview
                  </Link>
                }
              >
                This page doesn’t exist. Your opportunities are still here.
              </Empty>
            }
          />
        </Route>
      </Routes>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
