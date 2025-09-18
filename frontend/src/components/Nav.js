import React, { useState } from "react";
import { Link } from "react-router-dom";

// Theme variables for easy customization
const themeVars = {
  light: {
    "--navbar-bg": "#f6f8fa",
    "--navbar-text": "#212529",
    "--navbar-hover-bg": "#e4e4e4",
    "--navbar-hover-text": "#212529",
    "--brand-color": "#212529",
    "--toggle-bg": "#212529",
    "--toggle-text": "#fff",
    "--menu-bg": "#f6f8fa",
    "--menu-text": "#212529",
    "--btn-bg": "#212529",
    "--btn-text": "#fff",
    "--active-bg": "#e2e6ea",
    "--active-text": "#212529"
  },
  dark: {
    "--navbar-bg": "#0B1D3A",
    "--navbar-text": "#fff",
    "--navbar-hover-bg": "#2d333b",
    "--navbar-hover-text": "#f9dc5c",
    "--brand-color": "#fff",
    "--toggle-bg": "#fff",
    "--toggle-text": "#212529",
    "--menu-bg": "#0B1D3A",
    "--menu-text": "#f9dc5c",
    "--btn-bg": "#fff",
    "--btn-text": "#355ca9",
    "--active-bg": "#2d333b",
    "--active-text": "#f9dc5c"
  }
};

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("isDark") === "true"
  );

  // Apply theme variables to document body for global usage
  React.useEffect(() => {
    const vars = isDark ? themeVars.dark : themeVars.light;
    Object.entries(vars).forEach(([key, value]) => {
      document.body.style.setProperty(key, value);
    });
    document.body.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("light-mode", !isDark);
    localStorage.setItem("isDark", isDark ? "true" : "false");
  }, [isDark]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      />
      <nav
        className={`main-navbar navbar navbar-expand-lg shadow-sm sticky-top ${
          isDark ? "navbar-dark dark-mode" : "navbar-light light-mode"
        }`}
        style={{
          background: "var(--navbar-bg)",
          color: "var(--navbar-text)"
        }}
      >
        <div className="navbar-container container">
          <Link
            className="site-brand navbar-brand fw-bold d-flex align-items-center gap-2"
            to="/"
            style={{
              color: "var(--brand-color)",
              fontSize: "2rem",
              marginRight: "8px"
            }}
          >
            <span role="img" aria-label="logo">
              🚩
            </span>
            TMP
          </Link>
          <button
            className="menu-toggle navbar-toggler"
            type="button"
            aria-controls="mainMenu"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className={`menu-list collapse navbar-collapse${
              menuOpen ? " show" : ""
            }`}
            id="mainMenu"
            style={{
              background: "var(--menu-bg)",
              color: "var(--menu-text)"
            }}
          >
            <ul className="main-links navbar-nav ms-auto align-items-lg-center gap-lg-3">
              {[
                { to: "/", label: "Home" },
                { to: "/flights", label: "Flights" },
                { to: "/hotels", label: "Hotels" },
                { to: "/profile", label: "Car rental" },
                { to: "/profile", label: "Attractions" },
                { to: "/logout", label: "Logout" }
              ].map((item, idx) => (
                <li className="nav-link-item nav-item" key={idx}>
                  <Link
                    className="nav-link px-3 rounded-pill link-hover"
                    to={item.to}
                    style={{
                      color: "var(--navbar-text)",
                      transition: "background 0.3s, color 0.3s"
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              className={`toggle-dark-mode btn btn-sm ms-3 rounded-pill d-flex align-items-center gap-2`}
              style={{
                background: "var(--btn-bg)",
                color: "var(--btn-text)",
                minWidth: "88px",
                fontWeight: 500
              }}
              onClick={() => setIsDark((dark) => !dark)}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <>
                  <span role="img" aria-label="Day">
                    🌞
                  </span>
                  <span>Light</span>
                </>
              ) : (
                <>
                  <span role="img" aria-label="Night">
                    🌙
                  </span>
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>
      <style>{`
        .main-navbar {
          font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
          font-size: 1rem;
        }
        .site-brand {
          font-size: 1.4rem;
          letter-spacing: 1px;
        }
        .nav-link {
          font-weight: 500;
          transition: background 0.3s, color 0.3s;
        }
        .link-hover:hover, .nav-link.active {
          background: var(--navbar-hover-bg);
          color: var(--navbar-hover-text) !important;
        }
        .toggle-dark-mode {
          font-weight: 500;
        }
        @media (max-width: 991px) {
          .main-links {
            gap: 0 !important;
          }
          .nav-link {
            margin-bottom: 5px;
          }
        }
      `}</style>
    </>
  );
}