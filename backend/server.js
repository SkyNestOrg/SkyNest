import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // replaces body-parser.urlencoded()


//common routes
import TokenAuth from './routes/TokenAuth.js';
app.use('/tokenauth', TokenAuth);

// guest routes (ESM style import instead of require)
import GuestRegister from "./routes/Guest/GuestRegister.js";
app.use("/register", GuestRegister);
import GuestLogin from "./routes/Guest/GuestLogin.js";
app.use("/login", GuestLogin);
import GuestTokenAuth from "./routes/Guest/GuestTokenAuth.js";
app.use("/guesttokenauth", GuestTokenAuth );
import GuestProfile from "./routes/Guest/GuestProfile.js";
app.use("/guest", GuestProfile);
import OurBranches from "./routes/Guest/OurBranches.js";
app.use("/branches", OurBranches);
import RoomsAndServices from './routes/Guest/RoomsAndServices.js'; 
app.use('/roomsandservices',RoomsAndServices);
import GuestBook from './routes/Guest/GuestBook.js'; 
app.use('/book',GuestBook);
import getbranches from './routes/Guest/GetBranches.js'; 
app.use('/getbranches', getbranches);  
import getroomtypes from './routes/Guest/GetRoomType.js'; 
app.use('/getroomtypes', getroomtypes); 
import GuestService from './routes/Guest/GuestService.js'; 
app.use('/guestservice', GuestService);
import GetServices from './routes/Guest/GetServices.js'; 
app.use('/getservices', GetServices);
import GetRooms from './routes/Guest/GetRooms.js'; 
app.use('/getrooms', GetRooms);
import CurrentBookings from './routes/Guest/CurrentBookings.js'; 
app.use('/currentbookings', CurrentBookings);
import GuestViewBill from './routes/Guest/GuestViewBill.js'; 
app.use('/bill', GuestViewBill);





//service office routes
import ServiceLogin from "./routes/ServiceOffice/ServiceLogin.js";
app.use("/serviceofficelogin", ServiceLogin);
import ServiceOfficeTokenAuth from "./routes/ServiceOffice/ServiceOfficeTokenAuth.js";
app.use("/serviceofficetokenauth", ServiceOfficeTokenAuth );
import ViewDueServices from "./routes/ServiceOffice/ViewDueServices.js";
app.use("/viewdueservices", ViewDueServices);
import ViewPastServices from "./routes/ServiceOffice/ViewPastServices.js";
app.use("/viewpastservices",ViewPastServices);
import UpdateServiceTable from "./routes/ServiceOffice/UpdateServiceTable.js";
app.use("/updateservicetable",UpdateServiceTable);



//front desk office routes
import FrontOfficeLogin from "./routes/FrontDesk/FrontOfficeLogin.js";
app.use("/frontofficelogin", FrontOfficeLogin);
import FrontOfficeTokenAuth from "./routes/FrontDesk/FrontOfficeTokenAuth.js";
app.use("/frontofficetokenauth", FrontOfficeTokenAuth );
import Check from "./routes/FrontDesk/Check.js";
app.use("/check", Check );
import Payment from "./routes/FrontDesk/Payment.js";
app.use("/payment", Payment );
import SearchGuestDetails from "./routes/FrontDesk/SearchGuestDetails.js";
app.use("/searchguestdetails", SearchGuestDetails);



//management routes
import ManagementLogin from "./routes/Management/ManagamentLogin.js";
app.use("/managementlogin", ManagementLogin);
import ManagementTokenAuth from "./routes/Management/ManagementTokenAuth.js";
app.use("/managementtokenauth", ManagementTokenAuth );
import Report1 from "./routes/Management/Report1.js";
app.use("/report1", Report1 );
import Report2 from "./routes/Management/Report2.js";
app.use("/report2", Report2 );
import Report3 from "./routes/Management/Report3.js";
app.use("/report3", Report3 );
import Report4 from "./routes/Management/Report4.js";
app.use("/report4", Report4 );
import Report5 from "./routes/Management/Report5.js";
app.use("/report5", Report5 );



//admin routes
import AdminLogin from "./routes/Admin/AdminLogin.js";
app.use("/adminlogin", AdminLogin);
import AdminTokenAuth from "./routes/Admin/AdminTokenAuth.js";
app.use("/admintokenauth", AdminTokenAuth );

import AddTaxes from "./routes/Admin/AddTaxes.js";
app.use("/addtaxes", AddTaxes );
import AddDiscounts from "./routes/Admin/AddDiscounts.js";
app.use("/adddiscounts", AddDiscounts );
import ViewDiscounts from "./routes/Admin/ViewDiscounts.js";
app.use("/viewdiscounts", ViewDiscounts );
import ViewTaxes from "./routes/Admin/ViewTaxes.js";
app.use("/viewtaxes", ViewTaxes );
import ManageStaff from "./routes/Admin/ManageStaff.js";
app.use("/managestaff", ManageStaff );
import ViewLogs from "./routes/Admin/ViewLogs.js";
app.use("/viewlogs", ViewLogs );




// Example route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});


// Start the server and make it listen for requests
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}/`);
});

