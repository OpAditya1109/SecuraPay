import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPasswordPage"; // Your new ResetPassword component
import OtpVerification from "./pages/OtpVerfication"; // Import OTP Verification component
import RefreshHandler from "./pages/RefreshHandler";
import BalancePage from "./pages/BalancePage";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import History from "./pages/History";
// import TradingViewWidget from "./pages/TradingViewWidget";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Protect private routes for authenticated users
  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <>
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp-verification" element={<OtpVerification />} />{" "}
        {/* Add OTP Verification Route */}
        <Route path="/balance/:balance" element={<BalancePage />} />
        <Route path="/send" element={<Send />} />
        {/* <Route path="/tradingviewwidget" element={<TradingViewWidget />} /> */}
        <Route path="/receive" element={<Receive />} />
        <Route path="/history" element={<History />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:userId" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />
        {/* <Route path="/home" element={<PrivateRoute element={<Home />} />} /> */}
      </Routes>
    </>
  );
}

export default App;
