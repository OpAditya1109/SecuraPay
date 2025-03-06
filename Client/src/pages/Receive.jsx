import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import "../CSS/Receive.css";
import logo from "../assets/favicon.png";
import { useNavigate } from "react-router-dom";

const Receive = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("http://localhost:8080/auth/get-wallet-address", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.status === 403) {
            alert("Session expired, please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("loggedInUser");
            navigate("/login", { replace: true });
          } else {
            return response.json();
          }
        })
        .then((data) => {
          if (data) {
            setWalletAddress(data.walletAddress);
          }
        })
        .catch((error) => {
          console.error("Error fetching wallet address:", error);
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Function to handle the back button click
  const handleBack = () => {
    navigate(-1); // This will take the user to the previous page in the browser history
  };

  return (
    <div id="main-receive">
      <div className="receive-container">
        <h2>Receive Crypto</h2>
        <p>Your Wallet Address:</p>
        <input
          className="input-receive"
          type="text"
          value={walletAddress || "Fetching..."}
          readOnly
        />

        {walletAddress && (
          <div className="qr-code-wrapper">
            <QRCode
              value={walletAddress}
              size={180}
              bgColor="#fff"
              fgColor="#000"
            />
            <img src={logo} alt="Logo" className="qr-logo" />
          </div>
        )}

        <button
          onClick={() => navigator.clipboard.writeText(walletAddress)}
          className="copy-btn"
          disabled={!walletAddress}
        >
          {walletAddress ? "Copy Address" : "Loading..."}
        </button>
        <button onClick={handleBack} className="back-btn">
          Back
        </button>
      </div>
    </div>
  );
};

export default Receive;
