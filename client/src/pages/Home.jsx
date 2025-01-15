import React, { useState, useEffect } from "react";
import "../CSS/style.css";
import { assets } from "../assets/assets";
import { BrowserQRCodeReader } from "@zxing/library"; // Ensure ZXing library is installed
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isScanning, setIsScanning] = useState(false); // To manage scanner state
  const [qrCodeResult, setQrCodeResult] = useState(""); // Store QR code result

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

  // Fetch UserName

  // Example to fetch username from backend
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // Add a state for the username
  const navigate = useNavigate(); // Use the history hook to redirect

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("http://13.232.251.240:8080/auth/get-user", {
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
          <div className="slider__contact">
            <div className="contact-item">
              <div className="contact-item__photo">₹</div>
              <p className="contact-item__name">New</p>
            </div>
            <div className="contact-item">
              <div
                className="contact-item__photo contact-item__photo--alert"
                style={{ backgroundColor: "purple" }}
              >
                <i className="ri-at-line"></i>
              </div>
              <p className="contact-item__name">Pay UPI ID</p>
            </div>
            <div className="contact-item">
              <div
                className="contact-item__photo contact-item__photo--alert"
                style={{ backgroundColor: "rgb(241, 102, 52)" }}
              >
                <i className="ri-bill-line"></i>
              </div>
              <p className="contact-item__name">Pay Bills </p>
            </div>
            <div className="contact-item">
              <div
                className="contact-item__photo"
                style={{ backgroundColor: "rgb(56, 56, 173)" }}
              >
                <i className="ri-bank-line"></i>
              </div>
              <p className="contact-item__name">Bank Transfer</p>
            </div>
          </div>

          <div className="slider__business">
            <p className="business-head">Businesses</p>
            <p className="business-subhead">Frequent and smart suggestions</p>
            <div className="business-list">
              <div className="business-item">
                <div
                  className="business-item__photo"
                  style={{ backgroundColor: "orangered" }}
                >
                  I
                </div>
                <p className="business-item__name">India</p>
              </div>
              <div className="business-item">
                <div
                  className="business-item__photo"
                  style={{ backgroundColor: "rgb(231, 231, 231)" }}
                />
              </div>
              <div className="business-item">
                <div
                  className="business-item__photo"
                  style={{ backgroundColor: "rgb(231, 231, 231)" }}
                />
              </div>
            </div>
          </div>
          <div className="slider__promo">
            <p className="promo-head">Promotions</p>
            <div className="promo-list">
              <div className="promo-item">
                <img
                  className="promo-item__photo"
                  src={assets.oyo}
                  alt="oyo rewards"
                />
                <p className="promo-item__name">OYO</p>
              </div>
              <div className="promo-item">
                <img
                  className="promo-item__photo"
                  src={assets.grofers}
                  alt="grofers rewards"
                />
                <p className="promo-item__name">Grofers</p>
              </div>
            </div>
          </div>
          <div className="slider__options">
            <div className="option">
              <ion-icon className="option__icon" name="refresh" />
              <p className="option__text">All transactions</p>
            </div>
            <div className="option">
              <ion-icon
                className="option__icon check-bal"
                name="card-outline"
              />
              <p className="option__text">Check balance</p>
            </div>
            <div className="option" >
              <ion-icon
                className="option__icon"
                name="card-outline"
              />
              <p className="option__text">Create Wallet</p>
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
