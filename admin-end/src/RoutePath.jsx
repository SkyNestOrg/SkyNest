import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddTaxes from "./pages/AddTaxes";
import AddDiscounts from "./pages/AddDiscounts";
import ViewDiscounts from "./pages/ViewDiscounts";
import ViewTaxes from "./pages/ViewTaxes";
import ManageStaff from "./pages/ManageStaff";
import ViewLogs from "./pages/ViewLogs";

export default function AppRoutes() {

  return (
    <Router>
      <Routes>
        <Route path="/adminlogin" element={<Login />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
        <Route path="/admindashboard" element={<Dashboard/>}/> 
        <Route path="/addtaxes" element={<AddTaxes/>}/>  
        <Route path="/adddiscounts" element={<AddDiscounts/>}/>
        <Route path="/viewdiscounts" element={<ViewDiscounts/>}/>
        <Route path="/viewtaxes" element={<ViewTaxes/>}/>
        <Route path="/managestaff" element={<ManageStaff/>}/> 
        <Route path="/viewlogs" element={<ViewLogs/>}/>   
        
        
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );

 
}