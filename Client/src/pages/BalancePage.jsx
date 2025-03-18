import React from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import "../CSS/BalancePage.css"; // Import the CSS file for styling
import { assets } from "../assets/assets";

const BalancePage = () => {
  const { balance } = useParams(); // Get the balance from the URL params
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Optional: Validate if balance is a valid number
  const validBalance = isNaN(balance) ? "0" : balance;

  // Navigate back to the previous page
  const handleGoBack = () => {
    navigate(-1); // -1 will go back to the previous page
  };

  return (
    <div className="balance-page-container">
      <div className="balance-card">
        <div className="card-header">
          <img src={assets.logo} alt="Logo" />
        </div>
        <div className="card-body">
          <p className="balance-description">Current Balance</p>
          <p className="balance-amount">{validBalance} SOL</p>
        </div>
      </div>
      <div className="card-footer">
        <button className="back-button" onClick={handleGoBack}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default BalancePage;
