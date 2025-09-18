import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./HomeMainSys.css";
import heroVideo from "./flight/Resources/vv.mp4";

export default function HomeMainSys() {
  const destTrackRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const testimonials = [
    {
      name: "Akila",
      text: "Super smooth! Booked our Colombo–Dubai trip and got an instant partner discount.",
      origin: "Sri Lanka",
    },
    {
      name: "Maya",
      text: "Loved the curated plan. Ella and Sigiriya were breathtaking. Great support as well!",
      origin: "UK",
    },
    {
      name: "Jamal",
      text: "Fast, clear, and helpful. Will use again next holiday. Five stars!",
      origin: "UAE",
    },
  ];

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.18 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const counters = document.querySelectorAll("[data-countto]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            const to = Number(el.getAttribute("data-countto") || 0);
            const dur = 1200;
            const start = performance.now();
            function tick(now) {
              const p = Math.min(1, (now - start) / dur);
              el.textContent = Math.floor(p * to).toLocaleString();
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 4200);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const highlights = [
    {
      title: "Book Your Flight",
      text: "Find the best deals and enjoy seamless booking with our trusted partners.",
      icon: "✈️",
      to: "/flights",
    },
    {
      title: "Curated Tours",
      text: "Explore Sri Lanka’s must-see places with tailored tour packages.",
      icon: "🌄",
      to: "#packages",
    },
    {
      title: "Accommodation",
      text: "Choose from top hotels and unique stays island-wide.",
      icon: "🏨",
      to: "",
      external: false,
    },
    {
      title: "24/7 Support",
      text: "Need help? Our team is always here for you.",
      icon: "💬",
      to: "https://wa.me/94771234567",
      external: true,
    },
  ];

  const destinations = [
    {
      name: "Sigiriya",
      image: "",
      caption: "Climb the Lion Rock & discover ancient frescoes.",
    },
    {
      name: "Ella",
      image: "",
      caption: "Lush tea country, waterfalls & the iconic Nine Arches Bridge.",
    },
    {
      name: "Galle",
      image: "",
      caption: "Wander the Dutch Fort & relax by the beaches.",
    },
    {
      name: "Mirissa",
      image: "",
      caption: "Tropical paradise for surfing & whale watching.",
    },
    {
      name: "Kandy",
      image: "",
      caption: "The cultural capital; Temple of the Tooth.",
    },
  ];

  function scrollToSel(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nextDest() {
    const el = destTrackRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
  }
  function prevDest() {
    const el = destTrackRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.8, behavior: "smooth" });
  }

  function subscribe(e) {
    e.preventDefault();
    setToast({ type: "success", text: "Subscribed! Check your inbox for a welcome guide." });
    setTimeout(() => setToast(null), 2800);
    e.currentTarget.reset();
  }

  return (
    <div className="home-wrap">
      <header className="hero">
        <video className="hero-video" autoPlay loop playsInline muted>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-content reveal">
          <h1 className="hero-title">Welcome to Sri Lanka</h1>
          <p className="hero-sub">
            Discover, book, and enjoy your perfect Sri Lankan getaway. Modern trip planning with airline checkout, curated packages, and exclusive partner deals.
          </p>
          <div className="hero-actions">
            <Link to="/flights" className="btn btn-primary">
              Book Your Flight
            </Link>
          </div>
        </div>
      </header>

      <section id="highlights" className="section section-pad reveal">
        <div className="section-head">
          <h2 className="section-title">Why choose our platform?</h2>
          <p className="section-sub">flights, tours, stays & more.</p>
        </div>
        <div className="grid grid-4">
          {highlights.map((h) =>
            h.external ? (
              <a key={h.title} href={h.to} target="_blank" rel="noreferrer" className="card feature">
                <div className="feature-icon">{h.icon}</div>
                <h3 className="feature-title">{h.title}</h3>
                <p className="feature-text">{h.text}</p>
              </a>
            ) : h.to?.startsWith("#") ? (
              <button key={h.title} className="card feature feature-button" onClick={() => scrollToSel(h.to)}>
                <div className="feature-icon">{h.icon}</div>
                <h3 className="feature-title">{h.title}</h3>
                <p className="feature-text">{h.text}</p>
              </button>
            ) : (
              <Link key={h.title} to={h.to} className="card feature">
                <div className="feature-icon">{h.icon}</div>
                <h3 className="feature-title">{h.title}</h3>
                <p className="feature-text">{h.text}</p>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="section section-pad reveal">
        <div className="section-head">
          <h2 className="section-title">Top Destinations in Sri Lanka</h2>
          <p className="section-sub">A few places you shouldn't miss.</p>
        </div>
        <div className="carousel">
          <button className="carousel-btn prev" onClick={prevDest} aria-label="Previous destinations">‹</button>
          <div className="carousel-track" ref={destTrackRef}>
            {destinations.map((d) => (
              <article key={d.name} className="card destination" tabIndex={0} aria-label={`${d.name}, ${d.caption}`}>
                <div className="destination-media">
                  <img src={d.image} alt={`${d.name} — ${d.caption}`} />
                </div>
                <div className="destination-body">
                  <h3>{d.name}</h3>
                  <p>{d.caption}</p>
                  <div className="destination-actions">
                    <button className="btn btn-outline" onClick={() => scrollToSel("#packages")}>
                      View Packages
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button className="carousel-btn next" onClick={nextDest} aria-label="Next destinations">›</button>
        </div>
      </section>

      <section id="flight-list-section" className="section section-pad reveal">
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link to="/flights" className="btn btn-primary">
            Book Your Flight
          </Link>
        </div>
      </section>

      <section className="section stats reveal">
        <div className="stat">
          <div className="stat-value" data-countto="1200">0</div>
          <div className="stat-label">Happy Travelers</div>
        </div>
        <div className="stat">
          <div className="stat-value" data-countto="120">0</div>
          <div className="stat-label">Partner Hotels</div>
        </div>
        <div className="stat">
          <div className="stat-value" data-countto="85">0</div>
          <div className="stat-label">Tours & Activities</div>
        </div>
        <div className="stat">
          <div className="stat-value" data-countto="24">0</div>
          <div className="stat-label">Support Hours</div>
        </div>
      </section>

      <section id="packages" className="section section-pad reveal">
        <div className="section-head">
          <h2 className="section-title">Our Package Holidays</h2>
          <p className="section-sub">
            Choose from handpicked hotels, tours, and all-inclusive deals. Secure your ideal holiday with a low deposit and flexible payment options—perfect for families, couples, and solo travelers alike.
          </p>
        </div>
        <div className="grid grid-3">
          {[
            {
              title: "Coastal Escape",
              sub: "7 nights in Mirissa with surfing lessons and whale watching.",
              img: "",
            },
            {
              title: "Cultural Wonders",
              sub: "Kandy & Sigiriya tour, train ride, and heritage hotel.",
              img: "",
            },
            {
              title: "Adventure Trails",
              sub: "Ella trek, zipline, and tea estate stay.",
              img: "",
            },
          ].map((p) => (
            <article key={p.title} className="card pack">
              <img className="pack-img" src={p.img} alt={p.title} />
              <div className="pack-body">
                <h3 className="pack-title">{p.title}</h3>
                <p className="pack-sub">{p.sub}</p>
                <div className="pack-actions">
                  <Link to="/packages" className="btn btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-pad reveal">
        <div className="section-head">
          <h2 className="section-title">Traveler Stories</h2>
          <p className="section-sub">Real experiences from real journeys.</p>
        </div>
        <div className="testimonials">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              className={`testimonial ${testimonialIdx === i ? "active" : ""}`}
              aria-hidden={testimonialIdx !== i}
            >
              <p>“{t.text}”</p>
              <footer>
                <strong>{t.name}</strong> • <span>{t.origin}</span>
              </footer>
            </blockquote>
          ))}
          <div className="dots" role="tablist" aria-label="Testimonials">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${testimonialIdx === i ? "active" : ""}`}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setTestimonialIdx(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-pad reveal">
        <div className="card staff">
          <div className="staff-left">
            <h3>Contact Our Team</h3>
            <p>Need a custom trip or help with your booking? We’re here for you.</p>
          </div>
          <div className="staff-actions">
            <a className="btn btn-primary" href="https://wa.me/94771234567" target="_blank" rel="noreferrer">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <section className="cta reveal" aria-label="Subscribe for updates">
        <div className="cta-inner">
          <h3>Get travel tips & limited deals</h3>
          <p>Join our newsletter for the latest offers and holiday inspiration.</p>
          <form className="cta-form" onSubmit={subscribe}>
            <input className="input" type="email" placeholder="email@example.com" required />
            <button className="btn btn-primary" type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h4>Sri Lanka Tourism Platform</h4>
            <p className="muted">Plan your dream trip, simply and securely.</p>
          </div>
          <div>
            <h5>Explore</h5>
            <ul className="linklist">
              <li>
                <Link to="/flights/manage">Flights</Link>
              </li>
              <li>
                <button className="linklike" onClick={() => scrollToSel("#packages")}>
                  Packages
                </button>
              </li>
              <li>
                <a href="https://wa.me/94771234567" target="_blank" rel="noreferrer">
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <ul className="linklist">
              <li>
                <Link to="/about">About Us</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="copy muted">© {new Date().getFullYear()} Sri Lanka Tourism Platform. All rights reserved.</div>
      </footer>

      {toast && (
        <div className={`toast ${toast.type}`} role="status" onAnimationEnd={() => setToast(null)}>
          {toast.text}
        </div>
      )}
    </div>
  );
}