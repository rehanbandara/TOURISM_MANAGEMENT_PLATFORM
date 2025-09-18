import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminFlights.css";
//import '../Resources/Flight_Styles.css';

export default function UpdateFlightForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    airlineCoverImage: "",
    departure: "",
    destination: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    async function fetchFlight() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`http://localhost:5000/api/flights/${id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (data && data.flight) {
          setFormData({
            airlineCoverImage: data.flight.airlineCoverImage || "",
            departure: data.flight.departure || "",
            destination: data.flight.destination || "",
            description: data.flight.description || "",
          });
        }
      } catch (e) {
        console.error(e);
        setErr("Could not load flight. Go back and try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchFlight();
  }, [id]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const res = await fetch(`http://localhost:5000/api/flights/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Update failed");
      setOk("Flight updated.");
      setTimeout(() => navigate("/flights/manage"), 600);
    } catch (e) {
      console.error(e);
      setErr("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate("/flights/manage");
  }

  if (loading) {
    return (
      <div className="admin-wrap">
        <div className="card" style={{ maxWidth: 520, margin: "2rem auto" }}>
          <div className="skeleton-line w-100" style={{ height: 18, marginBottom: 10 }} />
          <div className="skeleton-line w-100" style={{ height: 180 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <form className="card form" onSubmit={handleSubmit} style={{ maxWidth: 560, margin: "2rem auto" }}>
        <div className="form-header">
          <h3 className="card-title">Edit Flight</h3>
        </div>

        <div className="form-grid">
          <label className="field field-full">
            <span>Airline Cover Image URL</span>
            <input
              name="airlineCoverImage"
              placeholder="https://…"
              value={formData.airlineCoverImage}
              onChange={handleChange}
              className="input"
            />
          </label>

          {formData.airlineCoverImage && (
            <div className="preview field-full">
              <img
                src={formData.airlineCoverImage}
                alt="Cover preview"
                onError={(e) => {
                  e.currentTarget.src = "/default-plane.jpg";
                }}
              />
            </div>
          )}

          <label className="field">
            <span>From (e.g. CMB)</span>
            <input
              name="departure"
              placeholder="CMB"
              value={formData.departure}
              onChange={handleChange}
              required
              className="input"
            />
          </label>

          <label className="field">
            <span>To (e.g. SIN)</span>
            <input
              name="destination"
              placeholder="SIN"
              value={formData.destination}
              onChange={handleChange}
              required
              className="input"
            />
          </label>

          <label className="field field-full">
            <span>Description</span>
            <input
              name="description"
              placeholder="Short description"
              value={formData.description}
              onChange={handleChange}
              className="input"
            />
          </label>
        </div>

        {err && <div className="notice error">{err}</div>}
        {ok && <div className="notice success">{ok}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}