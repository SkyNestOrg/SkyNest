import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Check from "./pages/Check";
import Payment from "./pages/Payment";
import SearchGuestDetails from "./pages/SearchGuestDetails";

export default function AppRoutes() {

  return (
    <Router>
      <Routes>
        <Route path="/frontofficelogin" element={<Login />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
        <Route path="/frontofficedashboard" element={<Dashboard/>}/>
        <Route path="/check" element={<Check/>}/>
        <Route path="/payment" element={<Payment/>}/>
        <Route path="/searchguestdetails" element={<SearchGuestDetails/>}/>
        
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );

 
}