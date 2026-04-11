import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HotelDetails.css";
import RoomPayment from "./RoomPayment";
import GuestGallery from "./GuestGallery";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get user from localStorage
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    
    // Pre-populate booking form with user details if logged in
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        name: user.username || prev.name,
        email: user.email || prev.email
      }));
    }
  }, []);
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [clientSecret, setClientSecret] = useState("");

  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    roomType: "",
    checkIn: "",
    checkOut: "",
    numberOfRooms: 1,
    adults: 1,
    children: 0,
    additionalInfo: "",
    paymentMethod: "debit_card"
  });

  const [priceDetails, setPriceDetails] = useState({
    pricePerNight: 0,
    numberOfNights: 0,
    subtotal: 0,
    tax: 0,
    serviceFee: 0,
    total: 0
  });

  useEffect(() => {
    fetchHotelDetails();
    fetchRooms();
  }, [id]);

  useEffect(() => {
    calculatePrice();
  }, [bookingForm.roomType, bookingForm.checkIn, bookingForm.checkOut, bookingForm.numberOfRooms]);

  const fetchHotelDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/hotels/${id}`);
      const data = await res.json();
      setHotel(data.hotel);
    } catch (err) {
      console.error("Error fetching hotel:", err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`http://localhost:5000/rooms/hotel/${id}`);
      const data = await res.json();
      setRooms(data.rooms || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!bookingForm.roomType || !bookingForm.checkIn || !bookingForm.checkOut) {
      setPriceDetails({
        pricePerNight: 0,
        numberOfNights: 0,
        subtotal: 0,
        tax: 0,
        serviceFee: 0,
        total: 0
      });
      return;
    }

    const selectedRoom = rooms.find(r => r.roomType === bookingForm.roomType);
    if (!selectedRoom) return;

    const checkInDate = new Date(bookingForm.checkIn);
    const checkOutDate = new Date(bookingForm.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      setPriceDetails({
        pricePerNight: 0,
        numberOfNights: 0,
        subtotal: 0,
        tax: 0,
        serviceFee: 0,
        total: 0
      });
      return;
    }

    const pricePerNight = selectedRoom.pricePerNight || 0;
    const subtotal = pricePerNight * nights * bookingForm.numberOfRooms;
    const tax = subtotal * 0.12;
    const serviceFee = subtotal * 0.05;
    const total = subtotal + tax + serviceFee;

    setPriceDetails({
      pricePerNight,
      numberOfNights: nights,
      subtotal,
      tax,
      serviceFee,
      total
    });
  };

  const handleImageNavigation = (direction) => {
    if (!hotel?.photos?.length) return;
    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === hotel.photos.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? hotel.photos.length - 1 : prev - 1
      );
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in and is a student
    if (!currentUser) {
      alert('Please log in to make a booking');
      navigate('/login');
      return;
    }

    if (currentUser.type !== 'student') {
      alert('Only students can make hotel bookings. Please log in with a student account.');
      return;
    }

    if (priceDetails.total <= 0) {
      alert('Please select valid dates and room type');
      return;
    }

    console.log('Starting booking submission...');
    console.log('Current User:', currentUser);
    console.log('User ID (_id):', currentUser._id);
    console.log('User ID (id):', currentUser.id);
    console.log('All user keys:', Object.keys(currentUser));
    console.log('Hotel ID:', id);

    // Get user ID from any possible field
    const userId = currentUser._id || currentUser.id || currentUser.userId || currentUser.user_id;
    
    if (!userId) {
      alert('Error: User ID not found. Please logout and login again.');
      console.error('Complete user object:', JSON.stringify(currentUser, null, 2));
      return;
    }

    try {
      const bookingData = {
        userId: userId,
        hotelId: id,
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        roomType: bookingForm.roomType,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        numberOfRooms: parseInt(bookingForm.numberOfRooms),
        adults: parseInt(bookingForm.adults),
        children: parseInt(bookingForm.children),
        additionalInfo: bookingForm.additionalInfo,
        totalPrice: priceDetails.total,
        paymentMethod: 'debit_card',
        status: 'pending',
        priceBreakdown: {
          pricePerNight: priceDetails.pricePerNight,
          numberOfNights: priceDetails.numberOfNights,
          subtotal: priceDetails.subtotal,
          tax: priceDetails.tax,
          serviceFee: priceDetails.serviceFee
        }
      };

      console.log('Booking data:', bookingData);

      const response = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      console.log('Booking response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking creation failed:', errorData);
        alert(`Failed to create booking: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      console.log('Booking created:', result.booking._id);
      setCurrentBookingId(result.booking._id);

      console.log('Creating payment intent...');
      // Convert LKR to USD for Stripe (approximate rate: 1 USD = 300 LKR)
      const amountInUSD = priceDetails.total / 300;
      const amountInCents = Math.round(amountInUSD * 100);
      
      console.log(`Amount: LKR ${priceDetails.total} = USD ${amountInUSD.toFixed(2)} = ${amountInCents} cents`);
      
      const piRes = await fetch("http://localhost:5000/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInCents,
          currency: "usd",
          metadata: {
            bookingId: result.booking._id,
            email: bookingForm.email,
            name: bookingForm.name,
            originalAmountLKR: priceDetails.total,
          },
        }),
      });

      console.log('Payment intent response status:', piRes.status);

      if (!piRes.ok) {
        const piError = await piRes.json();
        console.error('Payment intent failed:', piError);
        alert(`Failed to initialize payment: ${piError.error || piError.message || 'Please check your Stripe configuration'}\n\nError Type: ${piError.type || 'unknown'}`);
        return;
      }

      const { clientSecret: cs } = await piRes.json();
      console.log('Payment intent created, client secret received');
      setClientSecret(cs);

      console.log('Closing booking modal, opening payment modal');
      setShowBookingModal(false);
      setShowPaymentModal(true);
    } catch (err) {
      console.error("Error submitting booking:", err);
      alert(`Failed to submit booking: ${err.message}`);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      const response = await fetch(`http://localhost:5000/bookings/${currentBookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentDetails: paymentData
        }),
      });

      if (response.ok) {
        try {
          const receiptRes = await fetch('http://localhost:5000/payments/receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking: {
                id: currentBookingId,
                ...bookingForm,
                priceBreakdown: {
                  pricePerNight: priceDetails.pricePerNight,
                  numberOfNights: priceDetails.numberOfNights,
                  subtotal: priceDetails.subtotal,
                  tax: priceDetails.tax,
                  serviceFee: priceDetails.serviceFee,
                },
              },
              payment: paymentData,
              toEmail: bookingForm.email,
            }),
          });

          if (receiptRes.ok) {
            const blob = await receiptRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_${paymentData.transactionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } else {
            console.warn('Failed to generate or download receipt');
          }
        } catch (e) {
          console.error('Receipt error', e);
        }

        alert(`Payment Successful! Receipt is downloading now.`);

        setShowPaymentModal(false);
        setCurrentBookingId(null);
        setBookingForm({
          name: "",
          email: "",
          phone: "",
          roomType: "",
          checkIn: "",
          checkOut: "",
          numberOfRooms: 1,
          adults: 1,
          children: 0,
          additionalInfo: "",
          paymentMethod: "debit_card"
        });
        setPriceDetails({
          pricePerNight: 0,
          numberOfNights: 0,
          subtotal: 0,
          tax: 0,
          serviceFee: 0,
          total: 0
        });
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Payment was successful but there was an error updating the booking. Please contact support.");
    }
  };

  const handlePaymentCancel = () => {
    if (window.confirm("Are you sure you want to cancel the payment? Your booking will be cancelled.")) {
      fetch(`http://localhost:5000/bookings/${currentBookingId}`, {
        method: "DELETE",
      }).then(() => {
        setShowPaymentModal(false);
        setCurrentBookingId(null);
        alert("Booking cancelled.");
      });
    }
  };

  const formatFacilityName = (key) => {
    const words = {
      parking: "Parking",
      airportShuttle: "Airport Shuttle",
      restaurant: "Restaurant",
      swimmingPool: "Swimming Pool",
      bar: "Bar",
      banquetFacilities: "Banquet Facilities",
      laundry: "Laundry",
      wifi: "Wi-Fi",
      tv: "Television",
      airConditioning: "Air Conditioning",
      minibar: "Mini Bar",
      bathtub: "Bathtub",
      balcony: "Balcony",
    };
    return words[key] || key;
  };

  const getAllFacilities = () => {
    if (!rooms || rooms.length === 0) return [];
    const allFacilities = rooms.flatMap((room) =>
      Object.entries(room.amenities || {})
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
    );
    return Array.from(new Set(allFacilities));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (loading || !hotel) return <div className="MA-loading">Loading...</div>;

  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");

  return (
    <div className="MA-hotel-detail-page">
      {/* Image Carousel */}
      <div className="MA-header-gallery">
        <button className="MA-nav-arrow left" onClick={() => handleImageNavigation("prev")}>‹</button>
        <img
          src={`http://localhost:5000/${hotel.photos[currentImageIndex]}`}
          alt={hotel.name}
          className="MA-main-image"
        />
        <button className="MA-nav-arrow right" onClick={() => handleImageNavigation("next")}>›</button>
      </div>

      <div className="MA-main-section">
        <div className="MA-left-content">
          {/* Overview */}
          <div className="overview MA-section">
            <h2>{hotel.name}</h2>
            <p className="MA-hotel-location">📍 {hotel.city}, {hotel.province || "Sri Lanka"}</p>
            <p className="MA-hotel-desc">{hotel.desc}</p>
          </div>

          {/* Guest Gallery Button */}
          <div className="MA-gallery-cta-section MA-section">
            <div className="MA-gallery-cta-content">
              <div className="MA-gallery-cta-text">
                <h3>📸 Guest Photo Gallery</h3>
                <p>See real photos shared by guests who stayed here. Authentic experiences, real moments!</p>
              </div>
              <button 
                className="MA-view-gallery-btn"
                onClick={() => setShowGalleryModal(true)}
              >
                View Gallery
              </button>
            </div>
          </div>

          {/* Facilities */}
          <div className="facilities MA-section">
            <h3>Facilities</h3>
            {getAllFacilities().length === 0 ? (
              <p>No facilities available.</p>
            ) : (
              <div className="MA-facilities-grid">
                {getAllFacilities().sort().map((facility, index) => (
                  <div className="MA-facility-item" key={index}>
                    <span>✔️</span> {formatFacilityName(facility)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rooms */}
          <div className="rooms MA-section">
            <h3>Available Rooms</h3>
            <div className="MA-rooms-grid">
              {rooms.map((room) => (
                <div key={room._id} className="MA-room-card">
                  <img
                    src={`http://localhost:5000/${room.photos[0]}`}
                    alt={room.roomType}
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/300x200")
                    }
                  />
                  <div className="MA-room-info">
                    <h4>{room.roomType}</h4>
                    <p>{room.bedType}</p>
                    <p className="MA-room-price">
                      LKR {room.pricePerNight?.toLocaleString()} / Night
                    </p>
                    <p className="room-occupancy">
                      Max: {room.maxOccupancy} guests
                    </p>
                    <button
                      className="MA-book-room-btn"
                      onClick={() => {
                        // Check if user is logged in and is a student
                        if (!currentUser) {
                          alert('Please log in to make a booking');
                          navigate('/login');
                          return;
                        }
                        if (currentUser.type !== 'student') {
                          alert('Only students can make hotel bookings. Please log in with a student account.');
                          return;
                        }
                        setBookingForm(prev => ({ ...prev, roomType: room.roomType }));
                        setShowBookingModal(true);
                      }}
                    >
                      Book This Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Booking Button */}
        <div className="MA-right-sidebar">
          <div className="MA-quick-booking-cta">
            <h3>Ready to Book?</h3>
            <p>Choose your dates and room type</p>
            <button
              className="MA-cta-book-btn"
              onClick={() => {
                // Check if user is logged in and is a student
                if (!currentUser) {
                  alert('Please log in to make a booking');
                  navigate('/login');
                  return;
                }
                if (currentUser.type !== 'student') {
                  alert('Only students can make hotel bookings. Please log in with a student account.');
                  return;
                }
                setShowBookingModal(true);
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="MA-booking-modal-overlay"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="MA-booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="MA-close-modal"
              onClick={() => setShowBookingModal(false)}
            >
              ×
            </button>
            <h2>Complete Your Booking</h2>
            <div className="MA-modal-content">
              <form
                onSubmit={handleBookingSubmit}
                className="MA-booking-form-modal"
              >
                {/* Guest Info */}
                <div className="MA-form-section">
                  <h3>Guest Information</h3>
                  <div className="MA-form-grid">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      value={bookingForm.name}
                      onChange={handleBookingChange}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={bookingForm.email}
                      onChange={handleBookingChange}
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={bookingForm.phone}
                      onChange={handleBookingChange}
                      required
                    />
                  </div>
                </div>

                {/* Booking Details */}
                <div className="MA-form-section">
                  <h3>Booking Details</h3>
                  <div className="MA-form-grid">
                    <select
                      name="roomType"
                      value={bookingForm.roomType}
                      onChange={handleBookingChange}
                      required
                    >
                      <option value="">Select Room Type *</option>
                      {rooms.map((room) => (
                        <option key={room._id} value={room.roomType}>
                          {room.roomType} - LKR{" "}
                          {room.pricePerNight?.toLocaleString()}/night
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="numberOfRooms"
                      min="1"
                      max="10"
                      placeholder="Number of Rooms *"
                      value={bookingForm.numberOfRooms}
                      onChange={handleBookingChange}
                      required
                    />
                    <input
                      type="date"
                      name="checkIn"
                      value={bookingForm.checkIn}
                      onChange={handleBookingChange}
                      min={getTodayDate()}
                      required
                    />
                    <input
                      type="date"
                      name="checkOut"
                      value={bookingForm.checkOut}
                      onChange={handleBookingChange}
                      min={bookingForm.checkIn || getTodayDate()}
                      required
                    />
                    <input
                      type="number"
                      name="adults"
                      min="1"
                      max="10"
                      placeholder="Adults *"
                      value={bookingForm.adults}
                      onChange={handleBookingChange}
                      required
                    />
                    <input
                      type="number"
                      name="children"
                      min="0"
                      max="10"
                      placeholder="Children"
                      value={bookingForm.children}
                      onChange={handleBookingChange}
                    />
                  </div>
                  <textarea
                    name="additionalInfo"
                    placeholder="Additional Information or Special Requests"
                    value={bookingForm.additionalInfo}
                    onChange={handleBookingChange}
                    rows="3"
                  />
                </div>

                <button type="submit" className="MA-submit-booking-btn">
                  Proceed to Secure Payment - LKR {priceDetails.total.toFixed(2)}
                </button>
              </form>

              {/* Price Summary */}
              <div className="MA-price-summary-sidebar">
                <h3>Booking Summary</h3>
                {priceDetails.numberOfNights > 0 ? (
                  <div className="MA-price-breakdown">
                    <div className="MA-price-row">
                      <span>Room Rate:</span>
                      <span>LKR {priceDetails.pricePerNight.toLocaleString()}</span>
                    </div>
                    <div className="MA-price-row">
                      <span>Nights:</span>
                      <span>{priceDetails.numberOfNights}</span>
                    </div>
                    <div className="MA-price-row">
                      <span>Rooms:</span>
                      <span>{bookingForm.numberOfRooms}</span>
                    </div>
                    <div className="MA-divider"></div>
                    <div className="MA-price-row">
                      <span>Subtotal:</span>
                      <span>LKR {priceDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="MA-price-row">
                      <span>Tax (12%):</span>
                      <span>LKR {priceDetails.tax.toFixed(2)}</span>
                    </div>
                    <div className="MA-price-row">
                      <span>Service Fee (5%):</span>
                      <span>LKR {priceDetails.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="MA-divider"></div>
                    <div className="MA-price-row total">
                      <span>Total:</span>
                      <span>LKR {priceDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="MA-select-dates-msg">Select dates to see pricing</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="MA-booking-modal-overlay">
          <div className="MA-booking-modal payment-modal">
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <RoomPayment
                  bookingDetails={bookingForm}
                  totalAmount={priceDetails.total}
                  onPaymentComplete={handlePaymentComplete}
                  onCancel={handlePaymentCancel}
                />
              </Elements>
            )}
          </div>
        </div>
      )}

      {/* Guest Gallery Modal */}
      {showGalleryModal && (
        <div 
          className="MA-gallery-modal-fullscreen"
          onClick={() => setShowGalleryModal(false)}
        >
          <div 
            className="MA-gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="MA-close-gallery-modal"
              onClick={() => setShowGalleryModal(false)}
            >
              ×
            </button>
            <GuestGallery hotelId={id} hotelName={hotel.name} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;