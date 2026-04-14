import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import ProtectedRoute from "./ProtectedRoute";
import ExperienceHub from "./experience-hub/ExperienceHub";
import LostFoundHome from "./lost-found/LostFoundHome";
import ItemDetails from "./lost-found/ItemDetails";
import FinderDashboard from "./lost-found/FinderDashboard";
import NotificationsPanel from "./lost-found/NotificationsPanel";
import ReportItem from "./lost-found/ReportItem";
import ChatInterface from "./lost-found/ChatInterface";
import GrievanceHub from "./grievance/GrievanceHub";
import BookingHub from "./booking/BookingHub";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/experience-hub"
          element={
            <ProtectedRoute>
              <ExperienceHub />
            </ProtectedRoute>
          }
        />
        <Route path="/lost-found" element={<ProtectedRoute><LostFoundHome /></ProtectedRoute>} />
        <Route path="/lost-found/:id" element={<ProtectedRoute><ItemDetails /></ProtectedRoute>} />
        <Route path="/finder-dashboard" element={<ProtectedRoute><FinderDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPanel /></ProtectedRoute>} />
        <Route path="/report-item/:type" element={<ProtectedRoute><ReportItem /></ProtectedRoute>} />
        <Route path="/lost-found/chat/:itemId/:receiverId" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
        <Route path="/grievance" element={<ProtectedRoute><GrievanceHub /></ProtectedRoute>} />
        <Route path="/resource-booking" element={<ProtectedRoute><BookingHub /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
