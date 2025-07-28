import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import BASE_URL from "./endpoints/endpoints";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Superagent from "./pages/SuperAgent";
import Normalagent from "./pages/NormalAgent";
import Analytics from "./components/AnalyticsPage";
import Settings from "./components/SettingsPage";
import { ToastContainer, toast } from "react-toastify";

function App() {
  const [, setSocket] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (userId && isLoggedIn === 'true') {
      console.log(`[Socket Debug] Found user ID: ${userId}. Attempting to connect to WebSocket at ${BASE_URL}`);
      const newSocket = io(BASE_URL);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log(`[Socket Debug] Successfully connected to WebSocket with socket ID: ${newSocket.id}`);
        console.log(`[Socket Debug] Emitting 'register' event for user ID: ${userId}`);
        newSocket.emit("register", parseInt(userId, 10));
      });

      newSocket.on("role-updated", ({ newRole }) => {
        console.log(`[Socket Debug] Received 'role-updated' event. New role: ${newRole}`);
        toast.info("Your user role has been updated. The page will now reload.");
        localStorage.setItem('role', newRole);
        setTimeout(() => {
          window.location.reload();
        }, 3000); // Wait 3 seconds for the user to read the toast
      });

      newSocket.on('force-logout', (data) => {
        console.log(`[Socket Debug] Received 'force-logout' event. Reason: ${data.message}`);
        toast.warn(data.message || 'You have been logged out by an administrator.');
        
        // Clear all session data
        localStorage.clear();
        
        setTimeout(() => {
          window.location.href = '/'; // Redirect to login page
        }, 4000); // Wait 4 seconds for user to read message
      });

      newSocket.on('connect_error', (error) => {
        console.error('[Socket Debug] Connection Error:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      // Cleanup on component unmount
      return () => {
        console.log('[Socket Debug] Disconnecting socket.');
        newSocket.disconnect();
      };
    }
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/superagent" element={<Superagent />} />
        <Route path="/normalagent" element={<Normalagent />} />
        {/* Dashboard routes */}
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
