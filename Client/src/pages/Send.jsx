import React, { useState } from "react";
import "../CSS/Send.css";
import ReactQRScanner from "react-qr-scanner"; // Importing the QR scanner
import { assets } from "../assets/assets";

const Send = () => {
  const [senderAddress, setSenderAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Function to handle the form submission
  const handleSendTransaction = async (e) => {
    e.preventDefault();

    if (!senderAddress || !recipientAddress || !amount) {
      setMessage("Please fill all fields.");
      return;
    }

    const amountAsNumber = parseFloat(amount);
    if (isNaN(amountAsNumber)) {
      setMessage("Invalid amount.");
      return;
    }

    setLoading(true);
    try {
      // Send request to your API endpoint
      const response = await fetch(
        "http://localhost:8080/wallet/send-transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKey: senderAddress, // Send the publicKey (address)
            recipientAddress,
            amount: amountAsNumber, // Ensure amount is a number
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Transaction successful!");
      } else {
        setMessage(`Transaction failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Transaction failed: ", error);
      setMessage(`Transaction failed: ${error.message}`);
    }
    setLoading(false);
  };

  const handleScan = (data) => {
    if (data) {
      console.log(data); // Log the data to check its structure
      const scannedAddress = typeof data === "object" ? data.text : data; // Handle object data
      setRecipientAddress(scannedAddress); // Set the recipient address
      setIsScannerOpen(false); // Close the scanner
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div id="main-send">
      <div className="send-transaction-container">
        <h2>Send Transaction</h2>
        <form onSubmit={handleSendTransaction}>
          <div>
            <label>Sender Wallet Address</label>
            <input
              className="input-send"
              type="text"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              placeholder="Enter sender address"
              required
            />
          </div>
          <div>
            <label>Recipient Wallet Address</label>
            <div className="input-wrapper">
              <input
                className="input-send"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter recipient address"
                required
              />
              <img
                src={assets.qrscan} // Replace with your scanner icon image path
                alt="Scan QR"
                className="scanner-icon"
                onClick={() => setIsScannerOpen(true)} // Open QR scanner when clicked
              />
            </div>
          </div>
          <div>
            <label>Amount</label>
            <input
              className="input-send"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to send"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="button-send">
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
        {message && <p className="p-send">{message}</p>}

        {/* Conditionally render the QR scanner */}
        {isScannerOpen && (
          <div className="scanner-modal">
            <ReactQRScanner
              delay={300}
              onScan={handleScan}
              onError={handleError}
              style={{ width: "100%" }}
            />
            <button
              onClick={() => setIsScannerOpen(false)}
              className="close-scanner"
            >
              Close Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Send;
