import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./HomeMainSys.css";

/* === Sri Lankan Data === */
const destinations = [
  {
    name: "Kandy",
    image: "https://lp-cms-production.imgix.net/2025-07/LPT0915040.jpg?auto=format,compress&q=72&fit=crop&w=1200",
    caption: "",
  },
  {
    name: "Arugam Bay",
    image: "https://lp-cms-production.imgix.net/2025-02/Shutterstock1530880688.jpg?auto=format,compress&q=72&fit=crop&w=1200",
    caption: "",
  },
  {
    name: "Dambulla",
    image: "https://lp-cms-production.imgix.net/2023-10/Stocksytxp5311549f81p300Medium642364.jpg?auto=format,compress&q=72&fit=crop&w=1200",
    caption: "#",
  },
  {
    name: "Minneriya National Park",
    image: "https://lp-cms-production.imgix.net/2025-03/GettyRF579253338.jpg?auto=format,compress&q=72&fit=crop&w=1200",
    caption: "",
  },
  {
    name: "Jaffna",
    image: "https://lp-cms-production.imgix.net/2025-07/shutterstock2358039545.jpg?auto=format,compress&q=72&fit=crop&w=1200",
    caption: "",
  },
];

const packages = [
  {
    title: "Sigiriya",
    sub: "Sigiriya, Kandy & Dambulla: 5 nights in heritage hotels with private tours.",
    img: "https://lp-cms-production.imgix.net/2024-08/Sri-Lanka-Sigiriya--John-Harper-GettyImages-519840921.jpg?auto=format,compress&q=72&fit=crop&w=1200",
  },
  {
    title: "Adam’s Peak",
    sub: "train rides through emerald tea fields.",
    img: "https://lp-cms-production.imgix.net/2025-07/shutterstock2349314111.jpg?auto=format,compress&q=72&fit=crop&w=1200",
  },
  {
    title: "Trincomalee",
    sub: "Mirissa & Unawatuna: 7 nights, whale watching, surfing and beach stays.",
    img: "https://lp-cms-production.imgix.net/2023-10/GettyImages-520870168.jpeg?auto=format,compress&q=72&fit=crop&w=1200",
  },
];

const highlights = [
  {
    title: "Book Flights Instantly",
    text: "Direct to Colombo, Kandy, and Jaffna from anywhere.",
    icon: <i className="fas fa-plane-departure" />,
    to: "/flights",
  },
  {
    title: "Curated Sri Lankan Experiences",
    text: "Heritage sites, safaris, tea trails, beaches and more.",
    icon: <i className="fas fa-leaf" />,
    to: "#packages",
  },
  {
    title: "Premium Island Stays",
    text: "Boutique hotels, eco lodges, and luxury resorts.",
    icon: <i className="fas fa-hotel" />,
    to: "/hotels",
    external: false,
  },
  {
    title: "24/7 Local Support",
    text: "In-country concierge for any need, any time.",
    icon: <i className="fas fa-headset" />,
    to: "https://wa.me/94771234567",
    external: true,
  },
];

/* === Intersection Observer for Animations === */
function useRevealOnScroll(className = "visible") {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const cards = ref.current.querySelectorAll('.TMP_CARD, .TMP_DEST');
    const io = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add(className);
        });
      },
      { threshold: 0.13 }
    );
    cards.forEach(card => io.observe(card));
    return () => cards.forEach(card => io.unobserve(card));
  }, [className]);
  return ref;
}

export default function HomeMainSys() {
  const destTrackRef = useRef(null);
  const cardsRef = useRevealOnScroll();

  // --- DUAL REF FIX ---
  // For carousel, we need both destTrackRef and cardsRef to point to the carousel track element.
  const setCarouselTrackRef = (el) => {
    destTrackRef.current = el;
    cardsRef.current = el;
  };

  const [toast, setToast] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [carouselAnim, setCarouselAnim] = useState(""); // For slide animation

  const testimonials = [
    {
      name: "Akila",
      text: "We saw Sigiriya and Ella by train—absolutely magical. Booking and support were perfect.",
      origin: "Sri Lanka",
    },
    {
      name: "Maya",
      text: "Every hotel and guide was authentic and local. The best way to see Sri Lanka.",
      origin: "UK",
    },
    {
      name: "Jamal",
      text: "Loved the curated beach packages for Mirissa. Fast, friendly, truly Sri Lankan hospitality.",
      origin: "UAE",
    },
  ];

  /* === Animated Stats === */
  useEffect(() => {
    const animateCount = (el, to) => {
      let start = 0;
      const duration = 1000;
      const startTime = performance.now();
      function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        el.textContent = Math.floor(progress * to).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    };
    document.querySelectorAll("[data-countto]").forEach((el) => {
      animateCount(el, Number(el.getAttribute("data-countto") || 0));
    });
  }, []);

  /* === Testimonial Animation === */
  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  /* === Scroll Indicator === */
  useEffect(() => {
    const updateScrollIndicator = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      const indicator = document.getElementById('TMP_SCROLL_IND');
      if (indicator) {
        indicator.style.setProperty('--scroll-width', `${scrollPercent}%`);
      }
    };
    window.addEventListener('scroll', updateScrollIndicator);
    return () => window.removeEventListener('scroll', updateScrollIndicator);
  }, []);

  function scrollToSel(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function nextDest() {
    const el = destTrackRef.current;
    if (!el) return;
    setCarouselAnim("slide-left");
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
    setTimeout(() => setCarouselAnim(""), 440);
  }
  function prevDest() {
    const el = destTrackRef.current;
    if (!el) return;
    setCarouselAnim("slide-right");
    el.scrollBy({ left: -el.clientWidth * 0.8, behavior: "smooth" });
    setTimeout(() => setCarouselAnim(""), 440);
  }
  function subscribe(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    form.classList.add('form-submitting');
    if (!email || !email.includes('@')) {
      setToast({ type: "error", text: "Please enter a valid email address." });
      setTimeout(() => { setToast(null); form.classList.remove('form-submitting'); }, 2000);
      return;
    }
    setTimeout(() => {
      setToast({ type: "success", text: "Subscribed! Check your inbox for a welcome guide." });
      setTimeout(() => setToast(null), 2000);
      form.reset(); form.classList.remove('form-submitting');
    }, 900);
  }

  return (
    <div className="TMP_WRAP">
      <div className="TMP_SCROLL_IND" id="TMP_SCROLL_IND"></div>
      {/* HERO */}
      <header className="TMP_HERO">
        <video
          className="TMP_HERO_VID"
          autoPlay
          loop
          playsInline
          muted
          poster={destinations[0].image}
        >
          <source src={require("./flight/Resources/vv.mp4")} type="video/mp4" />
        </video>
        <div className="TMP_HERO_OVER" />
        <div className="TMP_HERO_CONTENT fade-in">
          <h1 className="TMP_HERO_TITLE animate-fadein-title">
            Discover Sri Lanka <br />
            <span className="TMP_HERO_SUBTITLE_ANIM">
              Culture. Nature. Adventure.
            </span>
          </h1>
          <p className="TMP_HERO_SUB animate-fadein">
            Experience authentic Sri Lanka: book flights, explore unique tours, stay at island gems, and get local support—all in one spot.
          </p>
          <div className="TMP_HERO_ACT">
            <Link to="/flights" className="TMP_BTN">
              <i className="fas fa-plane" /> Book Flights
            </Link>
            <Link to="/hotels" className="TMP_BTN">
              <i className="fas fa-hotel" /> Hotels
            </Link>
            <Link to="/rentals" className="TMP_BTN">
              <i className="fas fa-car" /> Rent Vehicle
            </Link>
            <Link to="/attractions" className="TMP_BTN">
              <i className="fas fa-map-marked-alt" /> Attractions
            </Link>
            <button className="TMP_BTN TMP_BTN_SEC" onClick={() => scrollToSel("#packages")}>
              <i className="fas fa-suitcase-rolling" /> See Packages
            </button>
            <button className="TMP_BTN TMP_BTN_OUT" onClick={() => setShowVideoModal(true)}>
              <i className="fas fa-play-circle" /> Watch Video
            </button>
          </div>
        </div>
      </header>

      {/* MODAL for custom video */}
      {showVideoModal && (
        <div className="modal-backdrop" onClick={() => setShowVideoModal(false)}>
          <div
            className="modal-content-anim"
            style={{
              width: "min(94vw, 720px)",
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 2px 48px 0 #0fc2c0b5",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute", right: 10, top: 10, background: "#fff", border: "none", fontSize: "1.7rem", color: "#005c4b", zIndex: 8, cursor: "pointer"
              }}
              onClick={() => setShowVideoModal(false)}
              aria-label="Close video"
            >
              <i className="fas fa-times-circle" />
            </button>
            <video width="100%" height="400" controls autoPlay loop muted>
              <source src={require("./flight/Resources/vv.mp4")} type="video/mp4" />
              Sorry, your browser doesn't support embedded videos.
            </video>
          </div>
        </div>
      )}

      {/* Highlights */}
      <section id="highlights" className="TMP_SECTION TMP_SECTION_PAD">
        <div className="TMP_SECTION_HEAD">
          <h2 className="TMP_SECTION_TITLE">Why Book With Us?</h2>
          <p className="TMP_SECTION_SUB">Sri Lankan flights, tours, stays & support—all in one place.</p>
        </div>
        <div className="TMP_GRID TMP_GRID4" ref={cardsRef}>
          {highlights.map((h, idx) =>
            h.external ? (
              <a key={h.title} href={h.to} target="_blank" rel="noreferrer" className="TMP_CARD">
                <div className="TMP_FEATURE_ICON">{h.icon}</div>
                <h3 className="TMP_FEATURE_TITLE">{h.title}</h3>
                <p className="TMP_FEATURE_TEXT">{h.text}</p>
              </a>
            ) : h.to?.startsWith("#") ? (
              <button key={h.title} className="TMP_CARD" onClick={() => scrollToSel(h.to)}>
                <div className="TMP_FEATURE_ICON">{h.icon}</div>
                <h3 className="TMP_FEATURE_TITLE">{h.title}</h3>
                <p className="TMP_FEATURE_TEXT">{h.text}</p>
              </button>
            ) : (
              <Link key={h.title} to={h.to} className="TMP_CARD">
                <div className="TMP_FEATURE_ICON">{h.icon}</div>
                <h3 className="TMP_FEATURE_TITLE">{h.title}</h3>
                <p className="TMP_FEATURE_TEXT">{h.text}</p>
              </Link>
            )
          )}
        </div>
      </section>

      {/* Destinations Carousel */}
      <section className="TMP_SECTION TMP_SECTION_PAD" id="destinations">
        <div className="TMP_SECTION_HEAD">
          <h2 className="TMP_SECTION_TITLE">Sri Lanka’s Must-See Destinations</h2>
          <p className="TMP_SECTION_SUB">From misty mountains to golden coasts.</p>
        </div>
        <div className="TMP_CAROUSEL" role="region" aria-label="Top destinations carousel">
          <button className="TMP_CAROUSEL_BTN prev" onClick={prevDest} aria-label="Previous destinations" type="button">
            <i className="fas fa-chevron-left" />
          </button>
          <div
            className={`TMP_CAROUSEL_TRACK ${carouselAnim}`}
            ref={setCarouselTrackRef}
            role="group"
            aria-label="Destination cards"
            tabIndex={0}
          >
            {destinations.map((d, idx) => (
              <article key={d.name} className="TMP_DEST" tabIndex={0} role="article" aria-label={`${d.name}, ${d.caption}`}>
                <div className="TMP_DEST_MEDIA">
                  <img
                    src={d.image}
                    alt={`${d.name} — ${d.caption}`}
                    loading="lazy"
                    style={{ transition: "transform .3s" }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.07)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/005c4b/ffffff?text=' + encodeURIComponent(d.name);
                    }}
                  />
                </div>
                <div className="TMP_DEST_BODY">
                  <h3>{d.name}</h3>
                  <p>{d.caption}</p>
                  <div className="TMP_DEST_ACT">
                    <button
                      className="TMP_BTN TMP_BTN_SEC"
                      style={{ fontSize: "1rem", padding: "11px 22px" }}
                      onClick={() => scrollToSel("#packages")}
                      type="button"
                      aria-label={`View packages for ${d.name}`}
                    >
                      View Packages
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button className="TMP_CAROUSEL_BTN next" onClick={nextDest} aria-label="Next destinations" type="button">
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </section>

      {/* Packages section */}
      <section className="TMP_SECTION TMP_SECTION_PAD" id="packages">
        <div className="TMP_SECTION_HEAD">
          <h2 className="TMP_SECTION_TITLE animate-fadein-title">Curated Packages</h2>
          <p className="TMP_SECTION_SUB">Handpicked journeys for every explorer.</p>
        </div>
        <div className="TMP_GRID TMP_GRID3" ref={cardsRef}>
          {packages.map((p, i) => (
            <div className="TMP_CARD" key={p.title}>
              <img src={p.img} alt={p.title} style={{ width: "100%", borderRadius: 12, marginBottom: 12, height: 170, objectFit: "cover" }} />
              <h3 className="TMP_FEATURE_TITLE">{p.title}</h3>
              <p className="TMP_FEATURE_TEXT">{p.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="TMP_STATS">
        <div>
          <div className="TMP_STAT_VAL" data-countto="1200">0</div>
          <div className="TMP_STAT_LABEL">Happy Travelers</div>
        </div>
        <div>
          <div className="TMP_STAT_VAL" data-countto="120">0</div>
          <div className="TMP_STAT_LABEL">Island Hotels</div>
        </div>
        <div>
          <div className="TMP_STAT_VAL" data-countto="87">0</div>
          <div className="TMP_STAT_LABEL">Local Tours</div>
        </div>
        <div>
          <div className="TMP_STAT_VAL" data-countto="24">0</div>
          <div className="TMP_STAT_LABEL">Support Hours</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="TMP_SECTION TMP_SECTION_PAD">
        <div className="TMP_SECTION_HEAD">
          <h2 className="TMP_SECTION_TITLE">Traveler Stories</h2>
          <p className="TMP_SECTION_SUB">Real experiences from real journeys.</p>
        </div>
        <div className="TMP_TESTIMONIALS">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              className={`TMP_TESTIMONIAL ${testimonialIdx === i ? "active" : ""}`}
              aria-hidden={testimonialIdx !== i}
            >
              <p>“{t.text}”</p>
              <footer>
                {t.name} • <span>{t.origin}</span>
              </footer>
            </blockquote>
          ))}
          <div className="TMP_DOTS" role="tablist" aria-label="Testimonials">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`TMP_DOT ${testimonialIdx === i ? "active" : ""}`}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setTestimonialIdx(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="TMP_CTA" aria-label="Subscribe for updates">
        <div className="TMP_CTA_INNER">
          <h3>Get travel tips & limited deals</h3>
          <p>Join our newsletter for the latest offers and island inspiration.</p>
          <form className="TMP_CTA_FORM" onSubmit={subscribe}>
            <input
              className="TMP_INPUT"
              type="email"
              name="email"
              placeholder="email@example.com"
              required
              aria-label="Email address for newsletter subscription"
              style={{ fontSize: "1.09rem" }}
            />
            <button className="TMP_BTN" type="submit" aria-label="Subscribe to newsletter">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="TMP_FOOTER">
        <div className="TMP_FOOTER_GRID" style={{ alignItems: "center" }}>
          <div>
            <h4>Sri Lanka Tourism Platform</h4>
            <p>Plan your dream trip, simply and securely.</p>
          </div>
          <div>
            <h5>Explore</h5>
            <ul className="TMP_LINKLIST">
              <li>
                <Link to="/flights/manage">Flights</Link>
              </li>
              <li>
                <button className="TMP_LINKLIKE" onClick={() => scrollToSel("#packages")}>
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
            <ul className="TMP_LINKLIST">
              <li>
                <Link to="/about">About Us</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="TMP_COPY">© {new Date().getFullYear()} Sri Lanka Tourism Platform. All rights reserved.</div>
      </footer>

      {toast && (
        <div className={`TMP_TOAST ${toast.type}`} role="status" onAnimationEnd={() => setToast(null)}>
          {toast.text}
        </div>
      )}
    </div>
  );
}