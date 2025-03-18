import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/Signup.css";
import { handleError, handleSuccess } from "../utilis";
import axios from "axios"; // <-- Added missing import for axios

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [isEmailVerified, setIsEmailVerified] = useState(true); // Track email verification state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const copyLoginInfo = { ...loginInfo };
    copyLoginInfo[name] = value;
    setLoginInfo(copyLoginInfo);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("Email and password are required");
    }
    try {
      setLoading(true); // Start loading
      const url = `http://localhost:8080/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });
      const result = await response.json();
      const { success, message, jwtToken, name, error } = result;
      setLoading(false); // Stop loading

      if (success) {
        handleSuccess(message);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedInUser", name);
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else if (
        message === "Please verify your email address before logging in."
      ) {
        console.log("Setting isEmailVerified to false");
        setIsEmailVerified(false); // Show Resend OTP button if email is not verified
        handleError(message);
      } else {
        handleError(message);
      }
    } catch (err) {
      setLoading(false); // Stop loading in case of error
      handleError(err);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true); // Set loading state while resending OTP
      const response = await axios.post(
        `http://localhost:8080/auth/resend-otp`,
        { email: loginInfo.email }
      );

      if (response.data.redirectToOtpVerification) {
        // Redirect to OTP verification page with email as state
        navigate("/otp-verification", { state: { email: loginInfo.email } });
      } else {
        toast.success(response.data.message); // Show the message if needed
        navigate("/otp-verification", { state: { email: loginInfo.email } });
      }
      setLoading(false); // Stop loading after action
    } catch (error) {
      setLoading(false); // Stop loading in case of error
      console.error("Error resending OTP:", error);
      toast.error("Error resending OTP.");
    }
  };

  return (
    <div className="container-body">
      <div className="container">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter your email..."
              value={loginInfo.email}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter your password..."
              value={loginInfo.password}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Conditionally render the resend OTP button */}
          {isEmailVerified === false && (
            <div className="resend-otp">
              <p>Email not verified!</p>
              <button onClick={handleResendOtp} disabled={loading}>
                {loading ? "Sending OTP..." : "Resend OTP"}
              </button>
            </div>
          )}

          <div className="forgot-and-signup">
            <span>
              Doesn't have an account? <Link to="/signup">Signup</Link>
            </span>
            <span>
              <Link to="/forgot-password">Forgot Password?</Link>
            </span>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
