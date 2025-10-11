import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminFlights.css";

function AddFlightForm({ onFlightAdded }) {
  const [formData, setFormData] = useState({
    airlineCoverImage: "",
    departure: "",
    destination: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const canSubmit = useMemo(() => {
    return formData.departure.trim() && formData.destination.trim();
  }, [formData]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const res = await fetch("http://localhost:5000/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Create failed");
      setOk("Flight added successfully.");
      setFormData({
        airlineCoverImage: "",
        departure: "",
        destination: "",
        description: "",
      });
      onFlightAdded && onFlightAdded();
    } catch (e) {
      console.error(e);
      setErr("Could not add flight. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setOk("");
        setErr("");
      }, 3000);
    }
  }

  return (
    <form className="fli_card fli_form" onSubmit={handleSubmit} noValidate>
      <div className="fli_form-header">
        <h3 className="fli_card-title">Add New</h3>
      </div>
      <div className="fli_form-grid">
        <label className="fli_field">
          <span>Cover Image URL</span>
          <input
            name="airlineCoverImage"
            placeholder="https://…"
            value={formData.airlineCoverImage}
            onChange={handleChange}
            className="fli_input"
          />
        </label>

        <label className="fli_field">
          <span>From (e.g. CMB)</span>
          <input
            name="departure"
            placeholder="CMB"
            value={formData.departure}
            onChange={handleChange}
            required
            className="fli_input"
          />
        </label>

        <label className="fli_field">
          <span>To (e.g. SIN)</span>
          <input
            name="destination"
            placeholder="SIN"
            value={formData.destination}
            onChange={handleChange}
            required
            className="fli_input"
          />
        </label>

        <label className="fli_field fli_field-full">
          <span>Description</span>
          <input
            name="description"
            placeholder="Short description"
            value={formData.description}
            onChange={handleChange}
            className="fli_input"
          />
        </label>

        {formData.airlineCoverImage && (
          <div className="fli_preview fli_field-full">
            <img
              src={formData.airlineCoverImage}
              alt="Cover preview"
              onError={(e) => {
                e.currentTarget.src = "/default-plane.jpg";
              }}
            />
          </div>
        )}
      </div>

      {err && <div className="fli_notice fli_error">{err}</div>}
      {ok && <div className="fli_notice fli_success">{ok}</div>}

      <div className="fli_form-actions">
        <button className="fli_btn" type="submit" disabled={!canSubmit || loading}>
          {loading ? "Adding…" : "Add Flight"}
        </button>
      </div>
    </form>
  );
}

export default function ManageFlightsDashboard() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("dep-asc");
  const [confirm, setConfirm] = useState(null);

  const navigate = useNavigate();

  async function fetchFlights() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("http://localhost:5000/api/flights");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFlights(data.flights || []);
    } catch (e) {
      console.error(e);
      setErr("Could not load flights. Please refresh.");
      setFlights([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFlights();
  }, []);

  async function handleDelete(id) {
    try {
      await fetch(`http://localhost:5000/api/flights/${id}`, { method: "DELETE" });
      setConfirm(null);
      fetchFlights();
    } catch (e) {
      console.error(e);
      setErr("Delete failed. Try again.");
    }
  }

  function handleEdit(flight) {
    window.open(`/flights/update/${flight._id}`, "_blank", "noopener,noreferrer");
  }

  function handleGoToVisits() {
    navigate("/flights/visits");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flights
      .filter((f) => {
        if (!q) return true;
        const hay = [f.departure, f.destination, f.description].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "dep-asc") return (a.departure || "").localeCompare(b.departure || "");
        if (sortBy === "dep-desc") return (b.departure || "").localeCompare(a.departure || "");
        if (sortBy === "dest-asc") return (a.destination || "").localeCompare(b.destination || "");
        if (sortBy === "dest-desc") return (b.destination || "").localeCompare(a.destination || "");
        return 0;
      });
  }, [flights, query, sortBy]);

  return (
    <div className="fli_admin-wrap">
      <div className="fli_admin-header">
        <div className="fli_admin-title-wrap">
          <h2 className="fli_admin-title">Manage Flights Dashboard</h2>
          <p className="fli_admin-sub">Create, edit, and remove flights. Access promo recipients.</p>
        </div>
        <div className="fli_admin-actions">
          <button className="fli_btn" onClick={handleGoToVisits}>👥 Promo Recipients</button>
          <button className="fli_btn fli_btn-outline" onClick={fetchFlights}>↻ Refresh</button>
        </div>
      </div>

      <AddFlightForm onFlightAdded={fetchFlights} />

      <div className="fli_toolbar">
        <div className="fli_toolbar-left">
          <input
            className="fli_input"
            placeholder="Search by route or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="fli_toolbar-right">
          <label className="fli_inline">
            Sort
            <select className="fli_select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dep-asc">From A → Z</option>
              <option value="dep-desc">From Z → A</option>
              <option value="dest-asc">To A → Z</option>
              <option value="dest-desc">To Z → A</option>
            </select>
          </label>
        </div>
      </div>

      {err && <div className="fli_notice fli_error">{err}</div>}

      <div className="fli_table-wrap">
        <table className="fli_table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Departure</th>
              <th>Destination</th>
              <th>Description</th>
              <th className="fli_col-actions">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-${i}`} className="fli_skeleton-row">
                  <td colSpan={5}>
                    <div className="fli_skeleton-line fli_w-100" />
                  </td>
                </tr>
              ))}

            {!loading &&
              filtered.map((f) => (
                <tr key={f._id}>
                  <td>
                    {f.airlineCoverImage ? (
                      <img
                        src={f.airlineCoverImage}
                        alt="cover"
                        width={64}
                        height={40}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                        onError={(e) => {
                          e.currentTarget.src = "/default-plane.jpg";
                        }}
                      />
                    ) : (
                      <div className="fli_cover-placeholder">No Image</div>
                    )}
                  </td>
                  <td>{f.departure}</td>
                  <td>{f.destination}</td>
                  <td className="fli_truncate">{f.description}</td>
                  <td className="fli_col-actions">
                    <button className="fli_btn fli_btn-small" onClick={() => handleEdit(f)}>Edit</button>
                    <button
                      className="fli_btn fli_btn-danger fli_btn-small"
                      onClick={() => handleDelete(f._id)}>Delete</button>
                  </td>
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="fli_empty">
                  No flights found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="fli_modal" role="dialog" aria-modal="true" aria-labelledby="delTitle">
          <div className="fli_modal-panel">
            <h3 id="delTitle">Delete flight?</h3>
            <p>
              Are you sure you want to delete <strong>{confirm.route}</strong>? This action cannot be undone.
            </p>
            <div className="fli_modal-actions">
              <button className="fli_btn fli_btn-secondary" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button className="fli_btn fli_btn-danger" onClick={() => handleDelete(confirm.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}