import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import AddHotel from "./pages/AddHotel";
import MakeYourStay from "./pages/MakeYourStay";
import ExploreStays from "./pages/ExploreStays";
import HotelDetails from "./pages/HotelDetails";
import EditHotel from "./pages/EditHotel";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={<About />}
        />

        {/* ADD HOTEL */}
        <Route
          path="/add-hotel"
          element={<AddHotel />}
        />

        {/* EXPLORE STAYS */}
        <Route
          path="/explore-stays"
          element={<ExploreStays />}
        />

        {/* MAKE YOUR STAY */}
        <Route
          path="/make-your-stay"
          element={<MakeYourStay />}
        />

        {/* HOTEL DETAILS */}
        <Route
          path="/hotel/:id"
          element={<HotelDetails />}
        />

        {/* EDIT HOTEL */}
        <Route
          path="/edit-hotel/:id"
          element={<EditHotel />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;