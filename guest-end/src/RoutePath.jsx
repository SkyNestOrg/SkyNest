import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { useEffect, useState } from "react";
//import login from "./PersistentLogin"; // Commented out for now

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GuestProfile from "./pages/profile";
import Branches from "./pages/Branches"; 
import RoomsAndServices from "./pages/RoomsAndServices";
import FullLayout from "./layout/FullLayout";
import Book from "./pages/Book";
import GuestService from "./pages/Service";
import CurrentBookings from "./pages/CurrentBookings";
import GuestViewBill from "./pages/GuestViewBill";


export default function AppRoutes() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Register />} /> {/* Default route */}
        <Route path="/guestdashboard" element={<Dashboard/>}/>
        <Route path="/guest-profile" element={<GuestProfile/>}/>
        <Route path="/branches" element={<Branches/>}/> {/* Added Branches route */}
        <Route path = "/roomsandservices" element = {<RoomsAndServices/>} />
        <Route path = "/book" element = {<Book/>} />
        <Route path = "/guestservice" element = {<GuestService/>} />
        <Route path = "/currentbookings" element = {<CurrentBookings/>} />
        <Route path = "/bill" element = {<GuestViewBill/>} />
        <Route path="*" element={<Register />} />
      </Routes>
    </Router>
  );

 
}