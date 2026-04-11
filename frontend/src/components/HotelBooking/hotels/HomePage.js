// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import "./HomePage.css";

// const HomePage = () => {
//   // State hooks
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [checkInDate, setCheckInDate] = useState("");
//   const [checkOutDate, setCheckOutDate] = useState("");
//   const [guests, setGuests] = useState(1);
//   const [city, setCity] = useState("");
//   const [hotelType, setHotelType] = useState("luxury");
//   const [hotels, setHotels] = useState([]);
//   const [filteredHotels, setFilteredHotels] = useState([]);

//   // Hero images
//   const heroImages = [
//     "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
//     "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
//     "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
//   ];

//   // Hotel Types
//   const hotelTypes = [
//     { id: "luxury", name: "Luxury" },
//     { id: "budget", name: "Budget" },
//     { id: "resort", name: "Resort" },
//     { id: "boutique", name: "Boutique" },
//   ];

//   // Hero image slider
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prev) =>
//         prev === heroImages.length - 1 ? 0 : prev + 1
//       );
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [heroImages.length]);

//   // Fetch hotels from backend
//   useEffect(() => {
//     const fetchHotels = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/hotels"); // Your backend API
//         const data = await res.json();
//         setHotels(data.hotels || []); // Save hotels in state
//         setFilteredHotels(data.hotels || []);
//       } catch (err) {
//         console.error(err);
//         alert("Failed to fetch hotels.");
//       }
//     };
//     fetchHotels();
//   }, []);

//   // Handle search/filter
//   const handleSearch = (e) => {
//   e.preventDefault();

//   const results = hotels.filter((hotel) => {
//     const matchesCity = city === "" || hotel.city.trim().toLowerCase().includes(city.toLowerCase().trim());
//     const matchesType = hotelType === "" || hotel.type.toLowerCase() === hotelType.toLowerCase();
//     const matchesGuests = hotel.maxGuests ? hotel.maxGuests >= guests : true;

//     let matchesDates = true;
//     if (hotel.bookedDates && hotel.bookedDates.length > 0 && checkInDate && checkOutDate) {
//       const checkIn = new Date(checkInDate);
//       const checkOut = new Date(checkOutDate);

//       matchesDates = !hotel.bookedDates.some((booking) => {
//         const bookedStart = new Date(booking.checkIn);
//         const bookedEnd = new Date(booking.checkOut);
//         return checkIn < bookedEnd && checkOut > bookedStart; // overlap check
//       });
//     }

//     return matchesCity && matchesType && matchesGuests && matchesDates;
//   });

//   setFilteredHotels(results);
//   if (results.length === 0) alert("No hotels found. Try a different search.");
// };

  
//   return (
//     <div className="homepage">
//       {/* Hero Section */}
//       <section
//         className="hero"
//         style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
//       >
//         <div className="hero-overlay">
//           <div className="container">
//             <h1>The Perfect Stay, Found</h1>
//             <p>Start your journey here</p>

//             {/* Search Form */}
//             <div className="booking-search">
//               <h2>Find Your Perfect Hotel</h2>
//               <form onSubmit={handleSearch}>
//                 <div className="form-row">
//                   <div className="form-group">
//                     <label>Check In</label>
//                     <input
//                       type="date"
//                       value={checkInDate}
//                       onChange={(e) => setCheckInDate(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Check Out</label>
//                     <input
//                       type="date"
//                       value={checkOutDate}
//                       onChange={(e) => setCheckOutDate(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Guests</label>
//                     <select
//                       value={guests}
//                       onChange={(e) => setGuests(parseInt(e.target.value))}
//                     >
//                       {[1, 2, 3, 4, 5].map((num) => (
//                         <option key={num} value={num}>
//                           {num} {num === 1 ? "Guest" : "Guests"}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="form-group">
//                     <label>City</label>
//                     <input
//                       type="text"
//                       placeholder="Enter city"
//                       value={city}
//                       onChange={(e) => setCity(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-group">
//                     <label>Hotel Type</label>
//                     <select
//                       value={hotelType}
//                       onChange={(e) => setHotelType(e.target.value)}
//                     >
//                       {hotelTypes.map((type) => (
//                         <option key={type.id} value={type.id}>
//                           {type.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <button type="submit" className="btn-primary">
//                   Search Hotels
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Hotels Section */}
//       <section className="hotels-section">
//         <div className="container">
//           <h2>Available Hotels</h2>
//           <div className="hotels-grid">
//             {filteredHotels.length > 0 ? (
//               filteredHotels.map((hotel) => (
//                 <div key={hotel._id} className="hotel-card">
//                   <div className="hotel-image">
//                     <img
//                       src={`http://localhost:5000/${hotel.photos[0]}`}
//                       alt={hotel.name}
//                     />
//                   </div>
//                   <div className="hotel-details">
//                     <h3>{hotel.name}</h3>
//                     <p className="hotel-type">{hotel.type}</p>
//                     <p className="hotel-city">{hotel.city}</p>
//                     {hotel.desc && <p className="hotel-desc">{hotel.desc}</p>}
//                     {/* <button className="btn-secondary">View Details</button> */}
//                     <Link to={`/hotel/${hotel._id}`} className="btn-secondary">
//                       View Details
//                     </Link>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p>No hotels available.</p>
//             )}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  // State hooks
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [city, setCity] = useState("");
  const [hotelType, setHotelType] = useState("luxury");
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);

  // Hero images
  const heroImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
  ];

  // Hotel Types
  const hotelTypes = [
    { id: "luxury", name: "Luxury" },
    { id: "budget", name: "Budget" },
    { id: "resort", name: "Resort" },
    { id: "boutique", name: "Boutique" },
  ];

  // Hero image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Fetch hotels from backend
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch("http://localhost:5000/hotels"); // Your backend API
        const data = await res.json();
        setHotels(data.hotels || []); // Save hotels in state
        setFilteredHotels(data.hotels || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch hotels.");
      }
    };
    fetchHotels();
  }, []);

  // Handle search/filter
  const handleSearch = (e) => {
    e.preventDefault();

    const results = hotels.filter((hotel) => {
      const matchesCity =
        city === "" ||
        hotel.city.trim().toLowerCase().includes(city.toLowerCase().trim());

      const matchesType =
        hotelType === "" ||
        hotel.type.toLowerCase() === hotelType.toLowerCase();

      return matchesCity && matchesType;
    });

    setFilteredHotels(results);
    if (results.length === 0) alert("No hotels found. Try a different search.");
  };

  return (
    <div className="MA-homepage">
      {/* Hero Section */}
      <section
        className="MA-hero"
        style={{ backgroundImage: `url(${heroImages[currentImageIndex]})` }}
      >
        <div className="MA-hero-overlay">
          <div className="container">
            <h1>The Perfect Stay, Found</h1>
            <p>Start your journey here</p>

            {/* Search Form */}
            <div className="MA-booking-search">
              <h2>Find Your Perfect Hotel</h2>
              <form onSubmit={handleSearch}>
                <div className="MA-form-row">
                  <div className="MA-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="MA-form-group">
                    <label>Hotel Type</label>
                    <select
                      value={hotelType}
                      onChange={(e) => setHotelType(e.target.value)}
                    >
                      {hotelTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="MA-btn-primary">
                  Search Hotels
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="MA-hotels-section">
        <div className="container">
          <h2>Available Hotels</h2>
          <div className="MA-hotels-grid">
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => (
                <div key={hotel._id} className="MA-hotel-card">
                  <div className="MA-hotel-image">
                    <img
                      src={`http://localhost:5000/${hotel.photos[0]}`}
                      alt={hotel.name}
                    />
                  </div>
                  <div className="MA-hotel-details">
                    <h3>{hotel.name}</h3>
                    <p className="MA-hotel-type">{hotel.type}</p>
                    <p className="MA-hotel-city">{hotel.city}</p>
                    {hotel.desc && <p className="MA-hotel-desc">{hotel.desc}</p>}
                    <Link to={`/hotel/${hotel._id}`} className="MA-btn-secondary">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p>No hotels available.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

