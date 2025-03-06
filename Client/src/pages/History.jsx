import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/History.css"; // Import the CSS file

const History = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
          setMessage("Failed to fetch wallet address.");
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!walletAddress) return;

    const token = localStorage.getItem("token");
    fetch(
      `http://localhost:8080/wallet/transaction-history?walletAddress=${walletAddress}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setTransactions(data.transactions);
        }
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
        setMessage("Failed to fetch transactions.");
      });
  }, [walletAddress]);

  return (
    <div className="history-container">
      <h2>Wallet Address</h2>
      {message && <p className="error-message">{message}</p>}
      {walletAddress ? (
        <p className="wallet-address">
          <strong>Your Wallet Address:</strong> {walletAddress}
        </p>
      ) : (
        <p className="loading-message">Loading wallet address...</p>
      )}

      <h2>Transaction History</h2>
      {transactions.length > 0 ? (
        <ul className="transaction-list">
          {transactions.map((transaction, index) => (
            <li
              key={index}
              className={
                walletAddress === transaction.sender
                  ? "transaction-item sender"
                  : "transaction-item recipient"
              }
            >
              <p>
                <strong>Sender:</strong> {transaction.sender}
              </p>
              <p>
                <strong>Recipient:</strong> {transaction.recipient}
              </p>
              <p>
                <strong>Amount:</strong> {transaction.amount}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(transaction.timestamp).toLocaleString()}
              </p>
              {/* Conditionally render Payment Send/Receive label */}
              <p className="payment-label">
                {walletAddress === transaction.sender
                  ? "Payment Sent"
                  : "Payment Received"}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="loading-message">No transactions found.</p>
      )}
    </div>
  );
};

export default History;
