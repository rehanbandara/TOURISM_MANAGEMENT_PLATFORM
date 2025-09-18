import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ClientInputForm.css";
//import '../Resources/Flight_Styles.css';

function ClientInputForm({ flightId }) {
  // --- form & server state ---
  const [inputs, setInputs] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [notification, setNotification] = useState(null); // {type, text}
  const [confirmingRedirect, setConfirmingRedirect] = useState(false);

  // --- tabs ---
  const TABS = [
    { key: "details", label: "Details" },
    { key: "get-offer", label: "Get Offer" },
    { key: "packages", label: "Our Packages" },
  ];
  const [activeTab, setActiveTab] = useState("details");
  const tabsRef = useRef([]);
  const noticeRef = useRef(null);

  // --- theming ---
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("cif-theme");
    if (stored) return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("cif-theme", theme);
  }, [theme]);

  // --- location state (flight data) ---
  const location = useLocation();
  const {
    selectedDate = "",
    cabinClass = "Economy",
    adults = 1,
    currency = "USD",
    locale = "en-us",
    tripType = "one-way",
    flightSummary = null,
  } = location.state || {};

  // --- helpers / notifications ---
  function setNotif(type, text, timeout = 5000) {
    setNotification({ type, text });
    // Focus notification for errors (accessibility)
    if (type === "error") {
      setTimeout(() => noticeRef.current?.focus(), 10);
    }
    if (timeout) setTimeout(() => setNotification(null), timeout);
  }

  // --- localStorage persistence (better UX) ---
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cif_inputs") || "{}");
      if (saved && (saved.name || saved.phone)) {
        setInputs((prev) => ({ ...prev, ...saved }));
      }
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("cif_inputs", JSON.stringify(inputs));
    } catch {
      // ignore
    }
  }, [inputs]);

  // --- validation ---
  const phoneRegex = /^[+\d][\d\s-]{6,20}$/;

  function validName(name = inputs.name) {
    return name && name.trim().length >= 2;
  }
  function validPhoneOptional(phone = inputs.phone) {
    if (!phone || phone.trim() === "") return true;
    return phoneRegex.test(phone.trim());
  }

  function validateField(name, value) {
    if (name === "name") {
      if (!validName(value)) return "Please enter your full name (2+ characters).";
    }
    if (name === "phone") {
      if (!validPhoneOptional(value)) return "Enter a valid phone number or leave it blank.";
    }
    return "";
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    // live-validate as they type
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  }
  function handleBlur(e) {
    const { name, value } = e.target;
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  }

  // --- promo / booking handlers (keep original behavior + fallbacks) ---
  async function handleGetOffer() {
    const nameErr = validateField("name", inputs.name);
    const phoneErr = validateField("phone", inputs.phone);
    setErrors((prev) => ({ ...prev, name: nameErr, phone: phoneErr }));

    if (nameErr) {
      setNotif("error", nameErr);
      setActiveTab("details");
      return;
    }
    if (phoneErr) {
      setNotif("error", phoneErr);
      setActiveTab("details");
      return;
    }

    setOfferLoading(true);
    const payload = {
      flightId,
      ...inputs,
      selectedDate,
      cabinClass,
      numberOfAdults: adults,
      locale,
      currency,
      tripType,
    };

    try {
      // preferred endpoint
      let res = await fetch("http://localhost:5000/api/flights/request-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setNotif("success", data.message || "Promo request received. We'll send the code via WhatsApp shortly.");
        setOfferLoading(false);
        return;
      }

      // fallback behavior to remain compatible
      if (res.status === 404) {
        const fbRes = await fetch("http://localhost:5000/api/flights/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, promoOnly: true }),
        });
        if (fbRes.ok) {
          const fd = await fbRes.json();
          setNotif("success", fd.message || "Promo request saved. Our team will send the code via WhatsApp.");
        } else {
          setNotif("error", "Failed to request promo (fallback). Please contact support.");
        }
      } else {
        // try fallback once
        const fbRes2 = await fetch("http://localhost:5000/api/flights/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, promoOnly: true }),
        });
        if (fbRes2.ok) {
          const fd = await fbRes2.json();
          setNotif("success", fd.message || "Promo request saved. Our team will send the code via WhatsApp.");
        } else {
          setNotif("error", "Failed to request promo. Please try again or contact support.");
        }
      }
    } catch (err) {
      console.error("request-promo error:", err);
      try {
        const fbRes3 = await fetch("http://localhost:5000/api/flights/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, promoOnly: true }),
        });
        if (fbRes3.ok) {
          const fd = await fbRes3.json();
          setNotif("success", fd.message || "Promo request saved. Our team will send the code via WhatsApp.");
        } else {
          setNotif("error", "Failed to request promo. Please try again later.");
        }
      } catch (err2) {
        console.error("fallback error:", err2);
        setNotif("error", "Network error while requesting promo. Check your server.");
      }
    } finally {
      setOfferLoading(false);
    }
  }

  function handleBook() {
    const nameErr = validateField("name", inputs.name);
    const phoneErr = validateField("phone", inputs.phone);
    setErrors((prev) => ({ ...prev, name: nameErr, phone: phoneErr }));

    if (nameErr) {
      setNotif("error", nameErr);
      setActiveTab("details");
      return;
    }
    if (phoneErr) {
      setNotif("error", phoneErr);
      setActiveTab("details");
      return;
    }
    setConfirmingRedirect(true);
  }

  async function confirmAndRedirect() {
    setConfirmingRedirect(false);
    setLoading(true);

    const payload = {
      flightId,
      ...inputs,
      selectedDate,
      cabinClass,
      numberOfAdults: adults,
      locale,
      currency,
      tripType,
    };

    try {
      const res = await fetch("http://localhost:5000/api/flights/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.bookingLink) {
        setNotif("info", "Redirecting to the airline booking page...");
        setTimeout(() => {
          window.location.href = data.bookingLink;
        }, 700);
      } else {
        setNotif("error", data.error || "Booking failed or booking link missing.");
      }
    } catch (err) {
      console.error("book error:", err);
      setNotif("error", "Network error while booking. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  // --- sample packages ---
  const packages = [
    { id: 1, title: "20 Days", subtitle: "Kandy • Sigiriya • Dambulla..more", img: "/assets/package1.jpg", price: "From USD 949" },
    { id: 2, title: "30 Days", subtitle: "Galle • Mirissa • Bentota..more", img: "/assets/package2.jpg", price: "From USD 1399" },
    { id: 3, title: "45 Days", subtitle: "Ella • Horton Plains..more", img: "/assets/package3.jpg", price: "From USD 2379" },
  ];

  // --- keyboard navigation for tabs ---
  function onKeyTab(e) {
    const order = TABS.map((t) => t.key);
    const currentIndex = order.indexOf(activeTab);

    if (e.key === "ArrowRight") {
      const next = order[(currentIndex + 1) % order.length];
      setActiveTab(next);
      tabsRef.current[order.indexOf(next)]?.focus();
    } else if (e.key === "ArrowLeft") {
      const prev = order[(currentIndex - 1 + order.length) % order.length];
      setActiveTab(prev);
      tabsRef.current[order.indexOf(prev)]?.focus();
    } else if (e.key === "Home") {
      setActiveTab(order[0]);
      tabsRef.current[0]?.focus();
    } else if (e.key === "End") {
      setActiveTab(order[order.length - 1]);
      tabsRef.current[order.length - 1]?.focus();
    }
  }

  useEffect(() => {
    // subtle scroll into view for accessibility when changing tab
    const panel = document.querySelector(".cif-left");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeTab]);

  // --- panels ---
  function DetailsPanel() {
    return (
      <div
        id="panel-details"
        className="tab-panel panel-animate"
        role="tabpanel"
        aria-labelledby="tab-details"
        aria-describedby="details-desc"
      >
        

        <form
          className="cif-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleBook();
          }}
          noValidate
        >
          <div className={`cif-field ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="name">
              Your full name <span className="cif-required">*</span>
            </label>
            <input
              id="name"
              name="name"
              placeholder="e.g. Samantha Perera"
              value={inputs.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name ? <div id="name-error" className="form-error">{errors.name}</div> : <small className="cif-hint">At least 2 characters.</small>}
          </div>

          <div className={`cif-field ${errors.phone ? "has-error" : ""}`}>
            <label htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              name="phone"
              placeholder="e.g. +94 77 123 4567"
              value={inputs.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            />
            {errors.phone ? (
              <div id="phone-error" className="form-error">{errors.phone}</div>
            ) : (
              <small id="phone-hint" className="cif-hint">WhatsApp delivery only. No spam.</small>
            )}
          </div>

          <div className="cif-actions">
            <button
              type="button"
              className="cif-btn"
              onClick={() => setActiveTab("get-offer")}
              aria-controls="panel-get-offer"
            >
              Next — Get Offer
            </button>
            <button
              type="submit"
              className="cif-btn-outline"
              disabled={loading}
              aria-controls="confirm-modal"
            >
              {loading ? (
                <span className="btn-with-spinner">
                  <span className="spinner" aria-hidden="true" /> Processing...
                </span>
              ) : (
                "Book Ticket"
              )}
            </button>
          </div>

          <div className="cif-smallprint">
            <strong>Note:</strong> Promo codes are issued via WhatsApp by our promotions team.
          </div>
        </form>
      </div>
    );
  }

  function GetOfferPanel() {
    return (
      <div
        id="panel-get-offer"
        className="tab-panel panel-animate"
        role="tabpanel"
        aria-labelledby="tab-get-offer"
      >
        <h3 className="subheading">Request Your WhatsApp Promo Code</h3>
        <p className="cif-lead">
          We will send a 20% partner discount code via WhatsApp. Make sure your name is filled, and phone (optional) is correct for delivery.
        </p>

        <div className="panel" style={{ marginTop: 8 }}>
          <div className="panel-row">
            <div>
              <strong>Name</strong>
              <div className="panel-value">{inputs.name || <span className="muted">Not provided</span>}</div>
            </div>
            <div>
              <strong>Phone</strong>
              <div className="panel-value">{inputs.phone || <span className="muted">Not provided</span>}</div>
            </div>
          </div>

          <div className="cif-actions">
            <button
              type="button"
              className="cif-btn"
              onClick={handleGetOffer}
              disabled={offerLoading}
            >
              {offerLoading ? (
                <span className="btn-with-spinner">
                  <span className="spinner" aria-hidden="true" /> Requesting...
                </span>
              ) : (
                "Get Offer (WhatsApp)"
              )}
            </button>
            <button
              type="button"
              className="cif-btn-outline"
              onClick={() => setActiveTab("packages")}
              aria-controls="panel-packages"
            >
              Explore Packages
            </button>
          </div>

          <div className="cif-smallprint" style={{ marginTop: 12 }}>
            <strong>Tip:</strong> Get the promo first, then use it when booking packages or services.
          </div>
        </div>
      </div>
    );
  }

  function PackagesPanel() {
    return (
      <div
        id="panel-packages"
        className="tab-panel panel-animate"
        role="tabpanel"
        aria-labelledby="tab-packages"
      >
        <h3 className="subheading">Our Top Packages</h3>
        <p className="cif-lead">
          Explore Sri Lanka with custom-made tours for first-time and returning travellers. Click 'Enquire' to get more details.
        </p>

        <div className="packages-grid" style={{ marginTop: 10 }}>
          {packages.map((p) => (
            <article key={p.id} className="package-card" tabIndex={0} aria-label={`${p.title} - ${p.subtitle}, ${p.price}`}>
              <div className="package-media">
                <img
                  src={p.img}
                  alt={p.title}
                  className="package-img"
                  onError={(e) => {
                    e.currentTarget.src = "https://tse2.mm.bing.net/th/id/OIP.9EiYre40tESiEbDBxmTjjwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
                  }}
                />
              </div>
              <div className="package-body">
                <h4 className="package-title">{p.title}</h4>
                <p className="package-sub">{p.subtitle}</p>
                <div className="package-footer">
                  <span className="package-price">{p.price}</span>
                  
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="cif-actions" style={{ marginTop: 16 }}>
          <button type="button" className="cif-btn-outline" onClick={() => setActiveTab("get-offer")}>Back-Get Offer</button>
          <button type="button" className="cif-btn" onClick={() => setActiveTab("details")}>Go to Details</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cif-wrap">
      <main className="cif-container" aria-labelledby="cif-main-title">
        <header className="cif-header">
          <div className="cif-header-row">
            <div>
              <h2 id="cif-main-title" className="cif-title">🎁 Claim 20% OFF on partner services</h2>
              <p className="cif-lead">Complete your details, request a WhatsApp promo code, or explore our packages - all here.</p>
            </div>
            
          </div>
        </header>

        <section className="cif-body">
          <div className="cif-left">
            <nav
              className="tabs"
              role="tablist"
              aria-label="Flight steps"
              onKeyDown={onKeyTab}
            >
              {TABS.map((t, idx) => {
                const isActive = activeTab === t.key;
                return (
                  <button
                    type="button"   //
                    key={t.key}
                    id={`tab-${t.key}`}
                    ref={(el) => (tabsRef.current[idx] = el)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${t.key}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`tab ${isActive ? "active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {idx + 1} {t.label}
                    {isActive && <span className="tab-active-indicator" aria-hidden="true" />}
                  </button>
                );
              })}
            </nav>

            <div className="tab-content">
              {activeTab === "details" && <DetailsPanel />}
              {activeTab === "get-offer" && <GetOfferPanel />}
              {activeTab === "packages" && <PackagesPanel />}
            </div>

            {notification && (
              <div
                ref={noticeRef}
                className={`cif-notice cif-notice-${notification.type}`}
                role={notification.type === "error" ? "alert" : "status"}
                aria-live={notification.type === "error" ? "assertive" : "polite"}
                tabIndex={-1}
              >
                <div className="notice-row">
                  <span>{notification.text}</span>
                  <button
                    type="button"
                    className="notice-close"
                    aria-label="Dismiss notification"
                    onClick={() => setNotification(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="cif-right" aria-label="Booking summary and support">
            <div className="cif-card">
              <img src="/assets/flight_CIF.png" alt="Sri Lanka travel" className="cif-right-banner" />
              <div className="cif-card-body">
                <h3 className="cif-card-title">Booking Summary</h3>
                {flightSummary ? (
                  <div className="cif-flight-summary">{flightSummary}</div>
                ) : (
                  <ul className="cif-summary-list">
                    {selectedDate && (
                      <li>
                        <strong>Date:</strong> {selectedDate}
                      </li>
                    )}
                    <li>
                      <strong>Class:</strong> {cabinClass}
                    </li>
                    <li>
                      <strong>Passengers:</strong> {adults}
                    </li>
                    <li>
                      <strong>Currency:</strong> {currency}
                    </li>
                    <li>
                      <strong>Trip:</strong> {tripType}
                    </li>
                  </ul>
                )}

                <div className="cif-badge">
                  <span>✅ 20% partner discount available</span>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="cif-btn"
                    disabled={loading}
                    onClick={handleBook}
                    aria-controls="confirm-modal"
                  >
                    {loading ? (
                      <span className="btn-with-spinner">
                        <span className="spinner" aria-hidden="true" /> Processing...
                      </span>
                    ) : (
                      "Book Ticket"
                    )}
                  </button>
                </div>

                <div className="cif-support">
                  <div>
                    <strong>Need help?</strong>
                    <p>
                      WhatsApp:{" "}
                      <a href="https://wa.me/94771234567" target="_blank" rel="noreferrer">
                        +94 77 123 4567
                      </a>
                    </p>
                  </div>
                </div>

                <div className="cif-trust">
                  <small>Secure info • No payment on our site </small>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {confirmingRedirect && (
        <div id="confirm-modal" className="cif-modal" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
          <div className="cif-modal-panel">
            <h4 id="confirmTitle">Proceed to Airline Booking?</h4>
            <p>You will be redirected to the airline's official website to complete payment. Continue?</p>
            <div className="cif-modal-actions">
              <button type="button" className="cif-btn-outline" onClick={() => setConfirmingRedirect(false)}>
                Cancel
              </button>
              <button type="button" className="cif-btn" onClick={confirmAndRedirect}>
                Yes - Go to Airline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ClientInputForm);
