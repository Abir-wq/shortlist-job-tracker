import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  MessagesSquare,
  LogOut,
  Menu,
  X,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "./UI";
import { initials } from "../utils";

export default function Layout({ user, logout }) {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Overview", Icon: LayoutDashboard },
    { to: "/applications", label: "Applications", Icon: BriefcaseBusiness },
    { to: "/interviews", label: "Interview room", Icon: MessagesSquare },
  ];
  return (
    <div className="app-shell">
      <header className="mobile-header">
        <Logo />
        <button
          className="icon-button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="desktop-logo">
          <Logo />
          <p>Your next chapter, organised.</p>
        </div>
        <span className="nav-label">YOUR WORKSPACE</span>
        <nav aria-label="Main navigation">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/applications/new"
          className="sidebar-add"
          onClick={() => setOpen(false)}
        >
          <Plus size={17} />
          Add application
        </NavLink>
        <div className="sidebar-note">
          <span className="small-star">✳</span>
          <h3>
            A little progress
            <br />
            is still progress.
          </h3>
          <p>One thoughtful application beats ten rushed ones.</p>
          <NavLink to="/interviews" onClick={() => setOpen(false)}>
            Make time to prepare <ArrowUpRight size={14} />
          </NavLink>
        </div>
        <div className="profile">
          <span className="avatar">{initials(user.name)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>Your personal workspace</small>
          </div>
          <button
            className="icon-button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main id="main" className="main-content">
        <Outlet />
        <footer className="app-footer">
          <span>Shortlist · Room for your next chapter.</span>
          <span>Made for steady progress.</span>
        </footer>
      </main>
    </div>
  );
}
