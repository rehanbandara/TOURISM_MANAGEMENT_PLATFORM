import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import './BookingChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const URL = "http://localhost:5000/Vbook"; // Backend API

function BookingChart() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(URL);

        const bookingArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.bookings)
          ? res.data.bookings
          : [];

        setBookings(bookingArray);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
      }
    };

    fetchBookings();
  }, []);

  // Count bookings per start date (YYYY-MM-DD only)
  const bookingCounts = {};
  bookings.forEach((b) => {
    if (b.Sdate) {
      const dateOnly = b.Sdate.split("T")[0]; // Extract YYYY-MM-DD
      bookingCounts[dateOnly] = (bookingCounts[dateOnly] || 0) + 1;
    }
  });

  const chartData = {
    labels: Object.keys(bookingCounts), // Dates only
    datasets: [
      {
        label: "Bookings",
        data: Object.values(bookingCounts),
        backgroundColor: "rgba(49, 205, 119, 0.7)",
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: true, text: "Booking Date" },
      },
      y: {
        title: { display: true, text: "Number of Bookings" },
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="A_chart-container">
      <h2>Vehicle Bookings by Date</h2>
      {bookings.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p>No bookings data available.</p>
      )}
    </div>
  );
}

export default BookingChart;
