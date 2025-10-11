import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/flights", label: "Flights" },
  { to: "/hotels", label: "Hotels" },
  { to: "/profile", label: "Car rental" },
  { to: "/profile", label: "Attractions" },
  { to: "/logout", label: "Logout" }
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      />
      <nav
        className="main-navbar navbar navbar-expand-lg shadow-sm sticky-top"
        style={{
          background: "#f6f8fa",
          color: "#212529"
        }}
      >
        <div className="navbar-container container">
          <Link
            className="site-brand navbar-brand fw-bold d-flex align-items-center gap-2"
            to="/"
            style={{
              color: "#212529",
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
            onClick={toggleMenu}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div
            className={`menu-list collapse navbar-collapse${menuOpen ? " show" : ""}`}
            id="mainMenu"
            style={{
              background: "#f6f8fa",
              color: "#212529"
            }}
          >
            <ul className="main-links navbar-nav ms-auto align-items-lg-center gap-lg-3">
              {navItems.map((item, idx) => (
                <li className="nav-link-item nav-item" key={idx}>
                  <Link
                    className="nav-link px-3 rounded-pill link-hover"
                    to={item.to}
                    style={{
                      color: "#212529",
                      transition: "background 0.3s, color 0.3s"
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
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
          background: #e4e4e4;
          color: #212529 !important;
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