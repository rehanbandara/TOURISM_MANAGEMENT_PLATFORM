
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import Nav from "./components/Nav";
import './App.css';
// Main sys
import HomeMainSys from "./components/HomeMainSys";

//Flight subsys
import HomeFlight from "./components/flight/f_frontend/Home_Flight";
import ManageFlightsDashboard from "./components/flight/f_backend/Manage_Flights_Dashboard";
import ClientVisitsPage from "./components/flight/f_backend/ClientVisits_Page";
import UpdateFlightForm from "./components/flight/f_backend/Update_Flight_Form";
import ClientInputForm from "./components/flight/f_frontend/Client_Input_Form";

//chamod
import CHMyBookings from "./components/CHMyBookings/CHMyBookings";
import AddAccessory from './components/Accessory/AddAccessory';
import AccessoryList from './components/ShowAccessory/AccessoryList';
import AccessoryTable from './components/AccessoriesTable/AccessoryTable';
import UpdateAccessory from './components/UpdateAccessory/UpdateAccessory';
import AccessoryDetails from './components/AccessoryDetails/AccessoryDetails';
import Register from './components/Register/Register';
import Login from "./components/Login/Login";
import ResetPassword from "./components/Login/ResetPassword";
import VerifyCode from "./components/Login/VerifyCode";
import ChangePassword from "./components/Login/ChangePassword";
import AddStaff from "./components/staff/AddStaff";
import StaffLogin from "./components/staffLogin/StaffLogin";
import StaffResetPassword from "./components/staffLogin/StaffResetPassword";
import StaffVerifyCode from "./components/staffLogin/StaffVerifyCode";
import StaffChangePassword from "./components/staffLogin/StaffChangePassword";
import Dashboard from "./components/Dashboard/Dashboard";
import CHCheckout from "./components/CHCheckout/CHCheckout";
import CHPaymentSuccess from "./components/CHPayment/CHPaymentSuccess";
import CHPaymentCancelled from "./components/CHPayment/CHPaymentCancelled";

//naily
import { Toaster } from 'react-hot-toast';
// Components
import ExplorePage from './components/ExplorePage';
import WeatherWidget from './components/WeatherWidget';

// Pages
import Destinations from './pages/homeSidePages/destinations';
import Adventures from './pages/homeSidePages/adventures';
import DestinationDetail from './pages/DestinationDetail';
import AdventureDetail from './pages/AdventureDetail';
import PaymentPage from './pages/PaymentPage';
import WishlistPage from './pages/WishlistPage';

// Admin Components
//import AdminSideBar from './components/adminSideBar';
import AdminDashBoard from './pages/adminSidePages/AdminDashBoard';
import AdminDestinations from './pages/adminSidePages/AdminDestinations';
import AdminAdventures from './pages/adminSidePages/AdminAdventures';
import AdminBookings from './pages/adminSidePages/AdminBookings';


//Ashani
import UpdateVehicle from "./components/transport/UpdateVehicle";
import Vehicles from './components/transport/Vehicles';
import VBook from './components/transport/VBook';
import TMvBook from './components/transport/TMvBook';
import UpdateVBook from "./components/transport/UpdateVBook";
import TMdriver from './components/transport/TMdriver'; 
import DriverUpdate from './components/transport/driverUpdate';
import BookingChart from "./components/transport/BookingChart";
import TMvehicle from './components/transport/TMvehicle';

//Maneesha
import TermsAndConditions from "./components/TermsAndConditions";
import HomePage from "./components/HotelBooking/hotels/HomePage";
import HotelDetails from "./components/HotelBooking/hotels/HotelDetails";
// import RoomBooking from "./components/HotelBooking/hotels/RoomBooking";
import RoomPayment from "./components/HotelBooking/hotels/RoomPayment";
import GuestGallery from "./components/HotelBooking/hotels/GuestGallery";

//hotel owner dashboard
import NavBar from "./components/HotelBooking/HotelOwnerDash/Navbar";
//import Dashboard from "./components/HotelBooking/HotelOwnerDash/Dashboard";
import Hotels from "./components/HotelBooking/HotelOwnerDash/Hotels";
import Rooms from "./components/HotelBooking/HotelOwnerDash/Rooms";
import Bookings from "./components/HotelBooking/HotelOwnerDash/Bookings";
import Reviews from "./components/HotelBooking/HotelOwnerDash/Reviews";
import GuestGalleryAdmin from "./components/HotelBooking/HotelOwnerDash/GuestGalleryAdmin";

// Booking page route wrapper
function BookFlightPage() {
  const { id } = useParams();
  return <ClientInputForm flightId={id} />;
}




// Home Main Nav Bar
function App() {

   // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log("✅ User saved to localStorage:", user);
    } else {
      localStorage.removeItem('user');
      console.log("🔓 User logged out, localStorage cleared");
    }
  }, [user]);



  return (
    <Router>
      <Nav user={user} setUser={setUser} />
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomeMainSys />} />
          <Route path="/flights" element={<HomeFlight />} />
          <Route path="/flights/manage" element={<ManageFlightsDashboard />} />
          <Route path="/flights/visits" element={<ClientVisitsPage />} />
          <Route path="/flights/update/:id" element={<UpdateFlightForm />} />
          <Route path="/flights/book/:id" element={<BookFlightPage />} />
        
          {/* chamod */}
          <Route path="/mainhome" element={<HomeMainSys />} />
          <Route path="/imagepart" element={<AddAccessory />} />
          <Route path="/itemlist" element={<AccessoryList />} />
          <Route path="/acctable" element={<AccessoryTable />} />
          <Route path="/update/:id" element={<UpdateAccessory />} />
          <Route path="/accessoryDetails/:id" element={<AccessoryDetails user={user} />} />
          <Route path="/checkout" element={<CHCheckout user={user} />} />
          <Route path="/payment-success" element={<CHPaymentSuccess user={user} />} />
          <Route path="/payment-cancelled" element={<CHPaymentCancelled />} />
          <Route path="/my-bookings" element={<CHMyBookings user={user} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/add-staff" element={<AddStaff />} />
          <Route path="/staff-login" element={<StaffLogin setUser={setUser} />} />
          <Route path="/staff-reset" element={<StaffResetPassword />} />
          <Route path="/staff-verify" element={<StaffVerifyCode />} />
          <Route path="/staff-change" element={<StaffChangePassword />} />
          <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
          
          {/* Ashani */}
          <Route path="/tmvehicle" element={<TMvehicle />} />
          <Route path="/update-vehicle/:id" element={<UpdateVehicle />} />
          <Route path="/vehi" element={<Vehicles />} />
          <Route path="/Vbook/:vehicleId" element={<VBook />} />   
          <Route path="/TMvBook" element={<TMvBook />} /> 
          <Route path="/update-booking/:id" element={<UpdateVBook />} />
          <Route path="/tmdriver" element={<TMdriver />} />
          <Route path="/driverUpdate/:id" element={<DriverUpdate />} />
          <Route path="/bookingchart" element={<BookingChart />} /> {/* Chart Route */}

          {/* Maneesha */}
          <Route path="/termsandconditions" element={<TermsAndConditions />} />
          <Route path="/hotels" element={<HomePage />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          {/* <Route path="/room-booking" element={<RoomBooking />} /> */}
          <Route path="/payment" element={<RoomPayment />} />
          <Route path="/gallery" element={<GuestGallery />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/hotelsdash" element={<Hotels />} />
          <Route path="/roomsdash" element={<Rooms />} />
          <Route path="/bookingsdash" element={<Bookings />} />
          <Route path="/reviewsdash" element={<Reviews />} />
          <Route path="/photodash" element={<GuestGalleryAdmin />} />

          {/* Naily */}
            {/* Public Routes with NavBar */}
            
            <Route path="/explore" element={
              <>
                
                <ExplorePage />
              </>
            } />
            <Route path="/destinations" element={
              <>
                
                <Destinations />
              </>
            } />
            <Route path="/destination/:id" element={
              <>
                
                <DestinationDetail />
              </>
            } />
            <Route path="/adventures" element={
              <>
                
                <Adventures />
              </>
            } />
            <Route path="/adventure/:id" element={
              <>
                
                <AdventureDetail />
              </>
            } />
            <Route path="/payment/:type/:id" element={
              <>
                
                <PaymentPage />
              </>
            } />
            <Route path="/wishlist" element={
              <>
                
                <WishlistPage />
              </>
            } />
            
            {/* Admin Routes with AdminSideBar */}
            <Route path="/admin" element={
              <AdminDashBoard user={user} onLogout={() => setUser(null)} />
            } />
            <Route path="/admin/destinations" element={
              <div className="admin-layout">
                {/* <AdminSideBar user={user} onLogout={() => setUser(null)} /> */}
                <div className="admin-content">
                  <AdminDestinations />
                </div>
              </div>
            } />
            <Route path="/admin/adventures" element={
              <div className="admin-layout">
                {/* <AdminSideBar user={user} onLogout={() => setUser(null)} /> */}
                <div className="admin-content">
                  <AdminAdventures />
                </div>
              </div>
            } />
            <Route path="/admin/bookings" element={
              <div className="admin-layout">
                {/* <AdminSideBar user={user} onLogout={() => setUser(null)} /> */}
                <div className="admin-content">
                  <AdminBookings />
                </div>
              </div>
            } />
            <Route path="/admin/staff" element={
              <div className="admin-layout">
                {/* <AdminSideBar user={user} onLogout={() => setUser(null)} /> */}
                <div className="admin-content">
                  <AddStaff />
                </div>
              </div>
            } />

          </Routes>
          <WeatherWidget />
      </div>
    </Router>
  );
}

export default App;