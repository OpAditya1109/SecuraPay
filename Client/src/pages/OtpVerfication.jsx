import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const { email } = location.state || {}; // Ensure email exists in state

    if (!email) {
      return toast.error("Email not found. Please try again.");
    }

    if (!otp) {
      return toast.error("OTP is required!");
    }

    // Validate OTP length (assuming it's 6 digits long)
    if (otp.length !== 6) {
      return toast.error("OTP must be 6 digits long.");
    }

    // Check if OTP contains only numbers (basic validation)
    if (!/^\d+$/.test(otp)) {
      return toast.error("OTP should only contain numbers.");
    }

    try {
      const url = `http://localhost:8080/auth/verify-otp`; // Use environment variable for the URL
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();
      console.log(result);

      const { message, redirectToLogin } = result;

      if (redirectToLogin) {
        toast.success(message || "OTP verified successfully.");
        setTimeout(() => {
          navigate("/login"); // Redirect to login after successful verification
        }, 1000);
      } else {
        toast.error(message || "OTP verification failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container-body">
      <div className="container">
        <h1>OTP Verification</h1>
        <form onSubmit={handleVerifyOtp}>
          <div>
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter the OTP sent to your email..."
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button type="submit">Verify OTP</button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default OtpVerification;
