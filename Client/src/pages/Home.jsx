import React, { useState, useEffect } from "react";
import "../CSS/style.css";
import { assets } from "../assets/assets";
import { BrowserQRCodeReader } from "@zxing/library"; // Ensure ZXing library is installed
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import CryptoChart from "./SolanaChart"
const Home = () => {
  const [isScanning, setIsScanning] = useState(false); // To manage scanner state
  const [qrCodeResult, setQrCodeResult] = useState(""); // Store QR code result
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // Add a state for the username
  const [walletAddress, setWalletAddress] = useState(""); // Add state for the wallet address
  const navigate = useNavigate(); // Use the history hook to redirect

  useEffect(() => {
    if (isScanning) {
      const video = document.getElementById("video");
      const codeReader = new BrowserQRCodeReader();

      // Start scanning from the camera
      codeReader
        .decodeFromInputVideoDevice(undefined, "video")
        .then((result) => {
          console.log(result);
          setQrCodeResult(result.text); // Update QR code result state
          stopScanning(); // Stop scanning once the QR code is read
          setTimeout(() => {
            const qrResultElement = document.querySelector(".qr-result");
            if (qrResultElement) {
              qrResultElement.classList.add("hide");
            }
          }, 3000); // Hide after 3 seconds
        })

        .catch((err) => {
          console.error(err);
          alert("Error: " + err); // Display error for debugging
        });

      // Ensure the video plays (this might not work due to autoplay restrictions)
      video.play().catch((error) => {
        console.error("Video play failed:", error); // Log error if autoplay fails
      });
    }
  }, [isScanning]);

  // Function to start scanning
  const startScanning = () => {
    setIsScanning(true); // Begin QR code scanning
    const maindiv = document.getElementById("main");
    const video = document.getElementById("video");
    video.style.display = "block"; // Show the video element for scanning
    maindiv.style.display = "none"; // Hide the main content
  };

  // Function to stop scanning
  const stopScanning = () => {
    setIsScanning(false); // Stop scanning
    const video = document.getElementById("video");
    const maindiv = document.getElementById("main");
    video.style.display = "none"; // Hide the video element
    maindiv.style.display = "block"; // Show the main content
  };

  // Fetch UserName and Wallet Address

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("http://localhost:8080/auth/get-user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.status === 403) {
            // Token is expired or invalid, remove it from localStorage
            alert("Session expired, please login again.");
            localStorage.removeItem("token");
            localStorage.removeItem("loggedInUser"); // Remove the expired token
            navigate("/login", { replace: true }); // Redirect to the login page
          } else {
            return response.json();
          }
        })
        .then((data) => {
          if (data) {
            setName(data.name); // Set the name if the response is successful
            setUsername(data.username); // Set the username as well
            setWalletAddress(data.walletAddress); // Set the wallet address
          }
        })
        .catch((error) => {
          console.error("Error fetching name and username:", error);
        });
    } else {
      // If no token is found, redirect to login
      navigate("/login", { replace: true });
    }
  }, [navigate]); // Empty dependency array ensures it runs on component mount only
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Wallet address copied to clipboard!");
      })
      .catch((err) => {
        alert("Failed to copy wallet address: " + err);
      });
  };
  const handleCheckBalance = async () => {
    // Validate wallet address format
    if (
      !walletAddress ||
      !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)
    ) {
      alert("Invalid wallet address. Please check and try again.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/wallet/get-balance/${walletAddress}`
      );
      const data = await response.json();

      if (response.ok) {
        // Instead of an alert, redirect to a new page
        window.location.href = `/balance/${data.balance}`; // Pass balance as part of the URL
      } else {
        // Handle case when the server returns an error
        alert(`Error fetching balance: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      alert("Failed to fetch balance. Please try again later.");
    }
  };

  return (
    <div id="container">
      <div id="main">
        <header className="header pd">
          <div className="header__user">
            <img className="photo" src={assets.profile} alt="user profile" />
            <div className="info">
              <div className="info__username">{name}</div>
              <div className="info__upiid">{username}@Securapay</div>
            </div>
          </div>
          <div className="info__container">
            <div className="info__wallet-box">
              <div className="wallet-content">
                <p className="info__wallet-label">Wallet Address:</p>
                <p className="info__wallet-address">{walletAddress}</p>
              </div>
              <button
                className="copy-icon"
                onClick={() => copyToClipboard(walletAddress)}
              >
                <img src={assets.copy} alt="Copy" />
              </button>
            </div>
          </div>
          <div className="header__option">
            <ion-icon className="option-icon" name="ellipsis-vertical" />
          </div>
        </header>
        <main className="main">
          <div className="tez">
            <div className="tez__circle">
              <button
                id="scanner_click"
                className="scanner_click"
                onClick={startScanning}
              >
                <img src={assets.logo} alt="" />
              </button>
            </div>
            <p className="tez__text">Tap for Secure Mode</p>
          </div>
        </main>

        <section className="slider">
          <div className="logo-wrap">
            <img
              className="logo-wrap__img"
              src={assets.logo2}
              alt="google pay logo"
            />
          </div>

          <div className="actions__container">
            <div className="action-item">
              <Link to="/send" className="action-item__btn">
                <img
                  src={assets.send}
                  alt="Send"
                  className="action-item__icon"
                />
              </Link>
              <span className="action-item__label">Send</span>
            </div>
            <div className="action-item">
              <Link to="/receive" className="action-item__btn">
                <img
                  src={assets.receive}
                  alt="Receive"
                  className="action-item__icon"
                />
              </Link>
              <span className="action-item__label">Receive</span>
            </div>
            <div className="action-item">
              <Link to="/history" className="action-item__btn">
                <img
                  src={assets.history}
                  alt="History"
                  className="action-item__icon"
                />
              </Link>
              <span className="action-item__label">History</span>
            </div>
          </div>
          <div className="chartview">
            {" "}
            <div className="w-full h-[500px]">
              {" "}
              <CryptoChart />{" "}
            </div>{" "}
          </div>
          <div className="slider__options">
            <div className="option">
              <button
                className="option__icon check-bal"
                onClick={handleCheckBalance}
              >
                <img
                  src={assets.bankcard}
                  alt="Credit Card"
                  className="icon-image"
                />
                <span>Check Balance</span>
              </button>
            </div>
          </div>
        </section>
      </div>
      <div id="scanner" style={{ display: isScanning ? "block" : "none" }}>
        <button id="close-button" onClick={stopScanning}>
          <i className="ri-close-large-line" />
        </button>
        <video id="video" style={{ width: "100%", height: "100%" }} />
        <div className="scanner-frame">
          <div className="scanner-border top-left" />
          <div className="scanner-border top-right" />
          <div className="scanner-border bottom-left" />
          <div className="scanner-border bottom-right" />
        </div>
      </div>
      {qrCodeResult && <div className="qr-result">QR Code: {qrCodeResult}</div>}
    </div>
  );
};

export default Home;
