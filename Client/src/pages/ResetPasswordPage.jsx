import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import { handleError, handleSuccess } from "../utilis"; // Custom notification handlers
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import "../CSS/ResetPassword.css";

const ResetPasswordPage = () => {
  const { userId } = useParams(); // Extract userId from URL
  const navigate = useNavigate(); // Initialize navigate function

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();

    // Check if the passwords match
    if (newPassword !== confirmPassword) {
      handleError("Passwords do not match"); // Show error notification
      return;
    }

    setLoading(true);

    // Use the environment variable for the base URL
    const apiUrl = `http://localhost:8080/auth/reset-password/${userId}`;

    // Send request to reset the password
    axios
      .post(apiUrl, { newPassword })
      .then((response) => {
        handleSuccess("Password reset successfully!"); // Show success notification

        // Delay navigation for the toast to display
        setTimeout(() => {
          navigate("/"); // Navigate to the homepage after a delay
        }, 2000); // Delay of 2 seconds
      })
      .catch((error) => {
        handleError(
          error.response?.data?.message || "Failed to reset password"
        ); // Show error notification
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      <form onSubmit={handlePasswordChange}>
        <div>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <ToastContainer />
      </form>
    </div>
  );
};

export default ResetPasswordPage;
