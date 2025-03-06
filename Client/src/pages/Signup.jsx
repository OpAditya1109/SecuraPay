import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Keypair } from "@solana/web3.js";
import CryptoJS from "crypto-js"; // Import crypto-js
import "../CSS/Signup.css";

const Signup = () => {
  const [SignupInfo, setSignupInfo] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null); // Store wallet info
  const [walletCreated, setWalletCreated] = useState(false); // To track if the wallet is created
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet) {
      console.log("Wallet created: ", wallet);
      toast.success("Wallet created successfully!");
    }
  }, [wallet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  // Encryption function to store the private key securely using crypto-js
  const encryptionKey = "12345678901234567890123456789012"; // Replace with a secure encryption key

  const encrypt = (text) => {
    const encrypted = CryptoJS.AES.encrypt(text, encryptionKey).toString(); // Use AES encryption
    return encrypted;
  };

  const generateWallet = () => {
    const newWallet = Keypair.generate();
    const encryptedPrivateKey = encrypt(newWallet.secretKey.toString());
    setWallet({
      publicKey: newWallet.publicKey.toBase58(),
      encryptedPrivateKey,
    });
    setWalletCreated(true); // Mark wallet as created
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, username, email, password, phone } = SignupInfo;
    console.log("Signup info before submitting:", SignupInfo);

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      !phone ||
      !wallet ||
      !wallet.publicKey ||
      !wallet.encryptedPrivateKey
    ) {
      return toast.error("All fields and wallet are required!");
    }

    setLoading(true);

    try {
      const url = `http://localhost:8080/auth/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...SignupInfo,
          publicKey: wallet.publicKey, // Send public key
          privateKeyEncrypted: wallet.encryptedPrivateKey, // Send encrypted private key
        }),
      });

      const result = await response.json();
      const { success, message } = result;

      if (success) {
        const otpResponse = await fetch(`http://localhost:8080/auth/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const otpResult = await otpResponse.json();
        if (otpResult.message === "OTP sent to your email") {
          toast.success("Signup successful! Please verify your OTP.");
          setTimeout(() => {
            navigate("/otp-verification", { state: { email } });
          }, 1000);
        } else {
          toast.error(otpResult.error || "Error sending OTP.");
        }
      } else {
        toast.error(message || "Signup failed!");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-body">
      <div className="container">
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
          <div>
            <label htmlFor="name">Name</label>
            <input
              onChange={handleChange}
              type="text"
              name="name"
              autoFocus
              placeholder="Enter Your Name ..."
              value={SignupInfo.name}
            />
          </div>
          <div>
            <label htmlFor="username">Username</label>
            <input
              onChange={handleChange}
              type="text"
              name="username"
              placeholder="Enter Your Username ..."
              value={SignupInfo.username}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              onChange={handleChange}
              type="email"
              name="email"
              placeholder="Enter Your Email ..."
              value={SignupInfo.email}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              onChange={handleChange}
              type="password"
              name="password"
              placeholder="Enter Your Password ..."
              value={SignupInfo.password}
            />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input
              onChange={handleChange}
              type="number"
              name="phone"
              placeholder="Enter Your Phone No ..."
              value={SignupInfo.phone}
            />
          </div>

          {/* Wallet creation button */}
          <button
            type="button"
            onClick={generateWallet}
            disabled={loading || walletCreated}
          >
            {loading ? (
              <span className="loader"></span>
            ) : walletCreated ? (
              "Wallet Created"
            ) : (
              "Create Wallet"
            )}
          </button>

          <button type="submit" disabled={loading || !walletCreated}>
            {loading ? <span className="loader"></span> : "Signup"}
          </button>

          <div className="already-account">
            <span>
              Already Have an Account? <Link to="/login">Login</Link>
            </span>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
