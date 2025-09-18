import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import Nav from "./components/Nav";
import HomeMainSys from "./components/HomeMainSys";
import HomeFlight from "./components/flight/f_frontend/Home_Flight";
import ManageFlightsDashboard from "./components/flight/f_backend/Manage_Flights_Dashboard";
import ClientVisitsPage from "./components/flight/f_backend/ClientVisits_Page";
import UpdateFlightForm from "./components/flight/f_backend/Update_Flight_Form";
import ClientInputForm from "./components/flight/f_frontend/Client_Input_Form";

// Booking page route wrapper
function BookFlightPage() {
  const { id } = useParams();
  return <ClientInputForm flightId={id} />;
}

function App() {
  return (
    <Router>
      <Nav />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomeMainSys />} />
          <Route path="/flights" element={<HomeFlight />} />
          <Route path="/flights/manage" element={<ManageFlightsDashboard />} />
          <Route path="/flights/visits" element={<ClientVisitsPage />} />
          <Route path="/flights/update/:id" element={<UpdateFlightForm />} />
          <Route path="/flights/book/:id" element={<BookFlightPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;