import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import "./ClientInputForm.css";

// Simple controlled input - no memo/ref needed for such a small form
function InputField({
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required,
  autoComplete,
  inputMode,
  ariaInvalid,
  ariaDescribedby,
}) {
  return (
    <input
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      autoComplete={autoComplete}
      inputMode={inputMode}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedby}
      className="fli_frontCI_input"
    />
  );
}

function ClientInputForm({ flightId }) {
  const [inputs, setInputs] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmingRedirect, setConfirmingRedirect] = useState(false);
  const notificationTimeout = useRef(null);

  // Tabs
  const TABS = useMemo(
    () => [
      { key: "details", label: "Details & Offer" },
      { key: "packages", label: "Our Packages" },
    ],
    []
  );
  const [activeTab, setActiveTab] = useState("details");
  const tabsRef = useRef([]);
  const noticeRef = useRef(null);

  // Location state (flight data)
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

  // Notification helper
  const setNotif = useCallback((type, text, timeout = 5000) => {
    setNotification({ type, text });
    if (type === "error") setTimeout(() => noticeRef.current?.focus(), 10);
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    if (timeout) {
      notificationTimeout.current = setTimeout(() => setNotification(null), timeout);
    }
  }, []);

  // Validation (phone: min 10 digits)
  const phoneRegex = useMemo(() => /^[+\d][\d\s-]{9,20}$/, []);
  const validName = useCallback((name) => name && name.trim().length >= 2, []);
  const validPhoneOptional = useCallback(
    (phone) => !phone || phone.trim() === "" || phoneRegex.test(phone.trim()),
    [phoneRegex]
  );
  const validateField = useCallback(
    (name, value) => {
      if (name === "name" && !validName(value)) return "Please enter your full name (2+ characters).";
      if (name === "phone" && !validPhoneOptional(value))
        return "Enter a valid phone number (min 10 digits) or leave it blank.";
      return "";
    },
    [validName, validPhoneOptional]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setInputs((prev) => (prev[name] === value ? prev : { ...prev, [name]: value }));
      const msg = validateField(name, value);
      setErrors((prev) => (prev[name] === msg ? prev : { ...prev, [name]: msg }));
    },
    [validateField]
  );
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      const msg = validateField(name, value);
      setErrors((prev) => (prev[name] === msg ? prev : { ...prev, [name]: msg }));
    },
    [validateField]
  );

  // Booking/Promo handlers (no redundant fallbacks)
  const handleGetOffer = useCallback(async () => {
    const nameErr = validateField("name", inputs.name);
    const phoneErr = validateField("phone", inputs.phone);
    setErrors((prev) => ({ ...prev, name: nameErr, phone: phoneErr }));
    if (nameErr || phoneErr) {
      setNotif("error", nameErr || phoneErr);
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
      let res = await fetch("http://localhost:5000/api/flights/request-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setNotif("success", data.message || "Promo request received. We'll send the code via WhatsApp shortly.");
      } else {
        // fallback
        const fbRes = await fetch("http://localhost:5000/api/flights/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, promoOnly: true }),
        });
        if (fbRes.ok) {
          const fd = await fbRes.json();
          setNotif("success", fd.message || "Promo request saved. Our team will send the code via WhatsApp.");
        } else {
          setNotif("error", "Failed to request promo. Please try again or contact support.");
        }
      }
    } catch (err) {
      setNotif("error", "Network error while requesting promo. Check your server.");
    } finally {
      setOfferLoading(false);
    }
  }, [
    inputs,
    selectedDate,
    cabinClass,
    adults,
    locale,
    currency,
    tripType,
    flightId,
    validateField,
    setNotif,
  ]);

  const handleBook = useCallback(() => {
    const nameErr = validateField("name", inputs.name);
    const phoneErr = validateField("phone", inputs.phone);
    setErrors((prev) => ({ ...prev, name: nameErr, phone: phoneErr }));
    if (nameErr || phoneErr) {
      setNotif("error", nameErr || phoneErr);
      setActiveTab("details");
      return;
    }
    setConfirmingRedirect(true);
  }, [inputs, validateField, setNotif]);

  const confirmAndRedirect = useCallback(async () => {
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
      setNotif("error", "Network error while booking. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [
    flightId,
    inputs,
    selectedDate,
    cabinClass,
    adults,
    locale,
    currency,
    tripType,
    setNotif,
  ]);

  // Packages (static)
  const packages = useMemo(
    () => [
      {
        id: 1,
        title: "20 Days",
        subtitle: "Kandy • Sigiriya • Dambulla..more",
        img: "/assets/flight_CIF.png",
        price: "From USD 949",
      },
      {
        id: 2,
        title: "30 Days",
        subtitle: "Galle • Mirissa • Bentota..more",
        img: "/assets/flight_CIF.png",
        price: "From USD 1399",
      },
      {
        id: 3,
        title: "45 Days",
        subtitle: "Ella • Horton Plains..more",
        img: "/assets/flight_CIF.png",
        price: "From USD 2379",
      },
    ],
    []
  );

  // Keyboard navigation for tabs
  const onKeyTab = useCallback(
    (e) => {
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
    },
    [TABS, activeTab]
  );

  // Panels
  function DetailsPanel() {
    return (
      <div
        id="fli_frontCI_panel-details"
        className="fli_frontCI_tab-panel fli_frontCI_panel-animate"
        role="tabpanel"
        aria-labelledby="fli_frontCI_tab-details"
        aria-describedby="fli_frontCI_details-desc"
      >
        
        <form
          className="fli_frontCI_form"
          onSubmit={(e) => {
            e.preventDefault();
            handleBook();
          }}
          noValidate
        >
          <div className={`fli_frontCI_field ${errors.name ? "fli_frontCI_has-error" : ""}`}>
            <label htmlFor="fli_frontCI_name">
              Your full name <span className="fli_frontCI_required">*</span>
            </label>
            <InputField
              id="fli_frontCI_name"
              name="name"
              placeholder="e.g. Samantha Perera"
              value={inputs.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="name"
              ariaInvalid={!!errors.name}
              ariaDescribedby={errors.name ? "fli_frontCI_name-error" : undefined}
            />
            {errors.name ? (
              <div id="fli_frontCI_name-error" className="fli_frontCI_form-error">
                {errors.name}
              </div>
            ) : (
              <small className="fli_frontCI_hint">At least 2 characters.</small>
            )}
          </div>
          <div className={`fli_frontCI_field ${errors.phone ? "fli_frontCI_has-error" : ""}`}>
            <label htmlFor="fli_frontCI_phone">Phone (optional)</label>
            <InputField
              id="fli_frontCI_phone"
              name="phone"
              placeholder="e.g. +94 77 123 4567"
              value={inputs.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              inputMode="tel"
              ariaInvalid={!!errors.phone}
              ariaDescribedby={errors.phone ? "fli_frontCI_phone-error" : "fli_frontCI_phone-hint"}
            />
            {errors.phone ? (
              <div id="fli_frontCI_phone-error" className="fli_frontCI_form-error">
                {errors.phone}
              </div>
            ) : (
              <small id="fli_frontCI_phone-hint" className="fli_frontCI_hint">
                WhatsApp delivery only. No spam.
              </small>
            )}
          </div>
          <div className="fli_frontCI_actions">
            <button
              type="button"
              className="fli_frontCI_btn"
              onClick={handleGetOffer}
              disabled={offerLoading}
            >
              {offerLoading ? (
                <span className="fli_frontCI_btn-with-spinner">
                  <span className="fli_frontCI_spinner" aria-hidden="true" /> Requesting...
                </span>
              ) : (
                "Get Offer (WhatsApp)"
              )}
            </button>
            <button
              type="submit"
              className="fli_frontCI_btn-outline"
              disabled={loading}
              aria-controls="fli_frontCI_confirm-modal"
            >
              {loading ? (
                <span className="fli_frontCI_btn-with-spinner">
                  <span className="fli_frontCI_spinner" aria-hidden="true" /> Processing...
                </span>
              ) : (
                "Book Ticket"
              )}
            </button>
          </div>
          <div className="fli_frontCI_smallprint">
            <strong>Note:</strong> Promo codes are issued via WhatsApp by our promotions team.
          </div>
        </form>
      </div>
    );
  }

  function PackagesPanel() {
    return (
      <div
        id="fli_frontCI_panel-packages"
        className="fli_frontCI_tab-panel fli_frontCI_panel-animate"
        role="tabpanel"
        aria-labelledby="fli_frontCI_tab-packages"
      >
        <h3 className="fli_frontCI_subheading">Our Top Packages</h3>
        <p className="fli_frontCI_lead">
          Explore Sri Lanka with custom-made tours for first-time and returning travellers. Get 20% OFF with our WhatsApp promo code.
        </p>
        
        <div className="fli_frontCI_packages-grid" style={{ marginTop: 10 }}>
          {packages.map((p) => (
            <article key={p.id} className="fli_frontCI_package-card" tabIndex={0} aria-label={`${p.title} - ${p.subtitle}, ${p.price}`}>
              <div className="fli_frontCI_package-media">
                <img
                  src={p.img}
                  alt={p.title}
                  className="fli_frontCI_package-img"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://tse2.mm.bing.net/th/id/OIP.9EiYre40tESiEbDBxmTjjwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";
                  }}
                />
              </div>
              <div className="fli_frontCI_package-body">
                <h4 className="fli_frontCI_package-title">{p.title}</h4>
                <p className="fli_frontCI_package-sub">{p.subtitle}</p>
                <div className="fli_frontCI_package-footer">
                  <span className="fli_frontCI_package-price">{p.price}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="fli_frontCI_actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="fli_frontCI_btn"
            onClick={handleGetOffer}
            disabled={offerLoading}
          >
            {offerLoading ? (
              <span className="fli_frontCI_btn-with-spinner">
                <span className="fli_frontCI_spinner" aria-hidden="true" /> Requesting...
              </span>
            ) : (
              "Get Offer (WhatsApp)"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fli_frontCI_wrap">
      <main className="fli_frontCI_container" aria-labelledby="fli_frontCI_main-title">
        <header className="fli_frontCI_header">
          <div className="fli_frontCI_header-row">
            <div>
              <h2 id="fli_frontCI_main-title" className="fli_frontCI_title">
                🎁 Claim 20% OFF on partner services
              </h2>
              <p className="fli_frontCI_lead">
                Complete your details, request a WhatsApp promo code, or explore our packages - all here.
              </p>
            </div>
          </div>
        </header>
        <section className="fli_frontCI_body">
          <div className="fli_frontCI_left">
            <nav className="fli_frontCI_tabs" role="tablist" aria-label="Flight steps" onKeyDown={onKeyTab}>
              {TABS.map((t, idx) => {
                const isActive = activeTab === t.key;
                return (
                  <button
                    type="button"
                    key={t.key}
                    id={`fli_frontCI_tab-${t.key}`}
                    ref={(el) => (tabsRef.current[idx] = el)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`fli_frontCI_panel-${t.key}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`fli_frontCI_tab ${isActive ? "fli_frontCI_active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    {idx + 1} {t.label}
                    {isActive && <span className="fli_frontCI_tab-active-indicator" aria-hidden="true" />}
                  </button>
                );
              })}
            </nav>
            <div className="fli_frontCI_tab-content">
              {activeTab === "details" && <DetailsPanel />}
              {activeTab === "packages" && <PackagesPanel />}
            </div>
            {notification && (
              <div
                ref={noticeRef}
                className={`fli_frontCI_notice fli_frontCI_notice-${notification.type}`}
                role={notification.type === "error" ? "alert" : "status"}
                aria-live={notification.type === "error" ? "assertive" : "polite"}
                tabIndex={-1}
              >
                <div className="fli_frontCI_notice-row">
                  <span>{notification.text}</span>
                  <button
                    type="button"
                    className="fli_frontCI_notice-close"
                    aria-label="Dismiss notification"
                    onClick={() => setNotification(null)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
          <aside className="fli_frontCI_right" aria-label="Booking summary and support">
            <div className="fli_frontCI_card">
              <img src="/assets/flight_CIF.png" alt="Sri Lanka travel" className="fli_frontCI_right-banner" />
              <div className="fli_frontCI_card-body">
                <h3 className="fli_frontCI_card-title">Booking Summary</h3>
                {flightSummary ? (
                  <div className="fli_frontCI_flight-summary">{flightSummary}</div>
                ) : (
                  <ul className="fli_frontCI_summary-list">
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
                <div className="fli_frontCI_badge">
                  <span>✅ 20% partner discount available</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="fli_frontCI_btn"
                    disabled={loading}
                    onClick={handleBook}
                    aria-controls="fli_frontCI_confirm-modal"
                  >
                    {loading ? (
                      <span className="fli_frontCI_btn-with-spinner">
                        <span className="fli_frontCI_spinner" aria-hidden="true" /> Processing...
                      </span>
                    ) : (
                      "Book Ticket"
                    )}
                  </button>
                </div>
                <div className="fli_frontCI_support">
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
                <div className="fli_frontCI_trust">
                  <small>Secure info • No payment on our site </small>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
      {confirmingRedirect && (
        <div id="fli_frontCI_confirm-modal" className="fli_frontCI_modal" role="dialog" aria-modal="true" aria-labelledby="fli_frontCI_confirmTitle">
          <div className="fli_frontCI_modal-panel">
            <h4 id="fli_frontCI_confirmTitle">Proceed to Airline Booking?</h4>
            <p>You will be redirected to the airline's official website to complete payment. Continue?</p>
            <div className="fli_frontCI_modal-actions">
              <button type="button" className="fli_frontCI_btn-outline" onClick={() => setConfirmingRedirect(false)}>
                Cancel
              </button>
              <button type="button" className="fli_frontCI_btn" onClick={confirmAndRedirect}>
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