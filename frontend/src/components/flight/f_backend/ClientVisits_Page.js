import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminFlights.css";

export default function PromoRecipientsPage() {
  const [visits, setVisits] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("date-desc");
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  async function fetchVisitsData() {
    setLoading(true);
    setErr("");
    try {
      const [vRes, sRes] = await Promise.all([
        fetch("http://localhost:5000/api/flights/visits/all"),
        fetch("http://localhost:5000/api/flights/visits/stats"),
      ]);
      if (!vRes.ok || !sRes.ok) throw new Error("Failed to fetch");
      const v = await vRes.json();
      const s = await sRes.json();
      setVisits(v.visits || []);
      setTotalVisits(s.totalVisits || 0);
    } catch (e) {
      console.error(e);
      setErr("Could not load promo recipients. Please try again.");
      setVisits([]);
      setTotalVisits(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVisitsData();
  }, []);

  function handleDownloadPDF() {
    window.open("http://localhost:5000/api/flights/promo/pdf", "_blank", "noopener,noreferrer");
  }

  function getWhatsAppUrl(phone, name, promoCode) {
    if (!phone || !promoCode) return "#";
    const formattedPhone = String(phone).replace(/[^\d]/g, "");
    const message = encodeURIComponent(
      `Hello${name ? " " + name : ""}, thanks for booking! Your promo code is: ${promoCode}. Enjoy your trip!`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  }

  function copyPromo(promo) {
    if (!promo) return;
    navigator.clipboard
      .writeText(promo)
      .then(() => setToast({ type: "fli_success", text: "Promo code copied!" }))
      .catch(() => setToast({ type: "fli_error", text: "Copy failed. Select and copy manually." }));
  }

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = visits.filter((v) => {
      const hay = [
        v.name,
        v.phone,
        v.promoCode,
        v.flight?.departure,
        v.flight?.destination,
        v.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matches = q ? hay.includes(q) : true;
      const missing = onlyMissing ? !(v.phone && v.promoCode) : true;
      return matches && missing;
    });

    list = list.sort((a, b) => {
      if (sortBy === "name-az") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name-za") return (b.name || "").localeCompare(a.name || "");
      const aDate = a.bookedAt ? new Date(a.bookedAt).getTime() : 0;
      const bDate = b.bookedAt ? new Date(b.bookedAt).getTime() : 0;
      return sortBy === "date-asc" ? aDate - bDate : bDate - aDate;
    });

    return list;
  }, [visits, query, onlyMissing, sortBy]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, onlyMissing, sortBy, pageSize]);

  return (
    <div className="fli_admin-wrap">
      <div className="fli_admin-header">
        <div className="fli_admin-title-wrap">
          <h2 className="fli_admin-title">Promo Recipients</h2>
          <p className="fli_admin-sub">Send WhatsApp promos, export PDF, and review recent visits.</p>
        </div>
        <div className="fli_admin-actions">
          <button className="fli_btn fli_btn-secondary" onClick={() => navigate("/flights/manage")}>
            ← Back to Dashboard
          </button>
          <button className="fli_btn" onClick={handleDownloadPDF} title="Export PDF">
            ⬇️ Export PDF
          </button>
          <button className="fli_btn fli_btn-outline" onClick={fetchVisitsData} title="Refresh">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="fli_admin-stats">
        <div className="fli_stat">
          <div className="fli_stat-value">{totalVisits}</div>
          <div className="fli_stat-label">Total Promo Visits</div>
        </div>
        <div className="fli_stat">
          <div className="fli_stat-value">{visits.length}</div>
          <div className="fli_stat-label">Loaded Records</div>
        </div>
        <div className="fli_stat">
          <div className="fli_stat-value">
            {visits.filter((v) => v.phone && v.promoCode).length}
          </div>
          <div className="fli_stat-label">Ready to Send</div>
        </div>
      </div>

      <div className="fli_toolbar">
        <div className="fli_toolbar-left">
          <input
            className="fli_input"
            placeholder="Search name, phone, route, promo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="fli_checkbox">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
            />
            Show only missing Phone/Promo
          </label>
        </div>
        <div className="fli_toolbar-right">
          <label className="fli_inline">
            Sort
            <select className="fli_select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="name-az">Name A → Z</option>
              <option value="name-za">Name Z → A</option>
            </select>
          </label>
          <label className="fli_inline">
            Rows
            <select className="fli_select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {err && <div className="fli_notice fli_error">{err}</div>}

      <div className="fli_table-wrap">
        <table className="fli_table">
          <thead>
            <tr>
              <th className="fli_col-narrow">#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>PromoCode</th>
              <th className="fli_col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`sk-${i}`} className="fli_skeleton-row">
                  <td colSpan={8}>
                    <div className="fli_skeleton-line fli_w-100" />
                  </td>
                </tr>
              ))}

            {!loading &&
              paged.map((v, i) => {
                const idx = (page - 1) * pageSize + i + 1;
                const dateText = v.bookedAt
                  ? new Date(v.bookedAt).toLocaleDateString()
                  : "-";
                const canSend = Boolean(v.phone && v.promoCode);
                return (
                  <tr key={v._id}>
                    <td className="fli_col-narrow">{idx}</td>
                    <td>{v.name || "-"}</td>
                    <td>{v.phone || "-"}</td>
                    <td>{v.flight?.departure || "-"}</td>
                    <td>{v.flight?.destination || "-"}</td>
                    <td>{dateText}</td>
                    <td>
                      {v.promoCode ? (
                        <div className="fli_promo-cell">
                          <span className="fli_tag">{v.promoCode}</span>
                          <button
                            className="fli_btn fli_btn-mini"
                            onClick={() => copyPromo(v.promoCode)}
                            title="Copy promo code"
                          >Copy</button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>-</span>
                      )}
                    </td>
                    <td className="fli_col-actions">
                      {canSend ? (
                        <a
                          href={getWhatsAppUrl(v.phone, v.name, v.promoCode)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fli_btn fli_btn-wa"
                          title="Send WhatsApp"
                        >WhatsApp</a>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>No Phone/Promo</span>
                      )}
                    </td>
                  </tr>
                );
              })}

            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={8} className="fli_empty">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredSorted.length > pageSize && (
        <div className="fli_pagination">
          <button
            className="fli_btn fli_btn-outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="fli_page-info">
            Page {page} of {Math.ceil(filteredSorted.length / pageSize)}
          </span>
          <button
            className="fli_btn fli_btn-outline"
            onClick={() =>
              setPage((p) => Math.min(Math.ceil(filteredSorted.length / pageSize), p + 1))
            }
            disabled={page >= Math.ceil(filteredSorted.length / pageSize)}
          >
            Next
          </button>
        </div>
      )}

      {toast && (
        <div className={`fli_toast ${toast.type}`} role="status" onAnimationEnd={() => setToast(null)}>
          {toast.text}
        </div>
      )}
    </div>
  );
}