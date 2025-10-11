import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ViewDueServices from "./pages/ViewDueServices";
import ViewPastServices from "./pages/ViewPastServices";
import UpdateServiceTable from "./pages/UpdateServiceTable";


export default function AppRoutes() {

  return (
    <Router>
      <Routes>
        <Route path="/servicelogin" element={<Login />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
        <Route path="/serviceofficedashboard" element={<Dashboard/>}/>   
        <Route path="/viewdueservices" element={<ViewDueServices/>}/>
        <Route path="/viewpastservices" element={<ViewPastServices/>}/>
        <Route path="/updateservicetable" element={<UpdateServiceTable/>}/>
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );

 
}