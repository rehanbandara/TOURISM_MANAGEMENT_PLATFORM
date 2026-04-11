
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import "./TMvBook.css";

const URL = "http://localhost:5000/Vbook";

function TMvBook() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch all bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(URL);
      console.log("📥 Fetched bookings:", res.data.bookings);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Download PDF for the whole table
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Vehicle Booking Details", 14, 20);

    const tableColumn = ["#", "Customer", "Start Date", "End Date", "Return Time", "Features", "Amount", "Payment Method", "Status", "Transaction ID"];
    const tableRows = bookings.map((booking, index) => {
      return [
        index + 1,
        booking.Name,
        new Date(booking.Sdate).toLocaleDateString(),
        new Date(booking.Edate).toLocaleDateString(),
        booking.Rtime,
        booking.Features || "-",
        `Rs. ${booking.Amount || 0}`,
        booking.PaymentMethod || "Cash",
        booking.PaymentStatus || "Pending",
        booking.TransactionId || "-"
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("All_Bookings.pdf");
  };

  // Delete booking
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`${URL}/${id}`);
        fetchBookings();
      } catch (err) {
        console.error(err);
        alert("Failed to delete booking");
      }
    }
  };

  // Update booking
  const handleUpdate = (id) => {
    navigate(`/update-booking/${id}`);
  };

  if (loading) return <p className="A_loading-text">Loading bookings...</p>;
  if (error) return <p className="A_error-text">{error}</p>;

  return (
    <div>
      <h1 className="A_t">Transport Management - Bookings</h1>

      

      {bookings.length > 0 ? (
        <table className="A_booking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Return Time</th>
              <th>Features</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Transaction ID</th>
              <th>License</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => {
              return (
              <tr key={booking._id}>
                <td>{index + 1}</td>
                <td>{booking.Name}</td>
                <td>{new Date(booking.Sdate).toLocaleDateString()}</td>
                <td>{new Date(booking.Edate).toLocaleDateString()}</td>
                <td>{booking.Rtime}</td>
                <td>{booking.Features || "-"}</td>
                <td>Rs. {booking.Amount || 0}</td>
                <td>
                  <span className={`A_payment-method ${booking.PaymentMethod === 'Online' ? 'A_online' : 'A_cash'}`}>
                    {booking.PaymentMethod || "Cash"}
                  </span>
                </td>
                <td>
                  <span className={`A_payment-status ${booking.PaymentStatus?.toLowerCase()}`}>
                    {booking.PaymentStatus || "Pending"}
                  </span>
                </td>
                <td>{booking.TransactionId || "-"}</td>
                <td>
                  {booking.License && booking.License.length > 0
                    ? booking.License.map((img, i) => (
                        <a key={i} href={`http://localhost:5000/${img}`} target="_blank" rel="noreferrer">
                          View {i + 1}
                        </a>
                      ))
                    : "-"}
                </td>
                <td>
                  <button onClick={() => handleUpdate(booking._id)} className="A_update-btn">
                    Update
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(booking._id)} className="A_delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="A_no-bookings">No bookings found</p>
      )}


       <button onClick={downloadPDF} className="A_pdf-btn ">
        Download PDF (All Bookings)
      </button>

    </div>
  );
}

export default TMvBook;

