import React, { useState } from "react";
import { ToastContainer } from "react-toastify"; // For notifications
import { handleError, handleSuccess } from "../utilis"; // Custom notification handlers
import "react-toastify/dist/ReactToastify.css";
import "../CSS/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // To handle loading state

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validateEmail = (email) => {
    // Basic email format validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      return handleError("Email is required!");
    }

    if (!validateEmail(email)) {
      return handleError("Please enter a valid email address.");
    }

    setLoading(true); // Start loading

    try {
      // The API endpoint for the forgot-password route
      const url = `http://localhost:8080/auth/forgot-password`;

      // Make the API request to trigger password reset functionality
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      const { success, message, error } = result;

      // Check the response and show a toast notification
      if (success) {
        handleSuccess(message); // Show success message
      } else {
        handleError(error || message); // Show error message if any
      }
    } catch (err) {
      handleError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container-body">
      <div className="container">
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email..."
              value={email}
              onChange={handleChange}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ForgotPassword;
