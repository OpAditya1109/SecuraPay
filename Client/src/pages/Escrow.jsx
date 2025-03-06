import { useState } from "react";

const EscrowForm = () => {
  const [senderPublicKey, setSenderPublicKey] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [amount, setAmount] = useState("");
  const [escrowFunded, setEscrowFunded] = useState(false);
  const [escrowPublicKey, setEscrowPublicKey] = useState("");
  const [escrowError, setEscrowError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [senderAddress, setSenderAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  // Handle funding the escrow
  const handleFundEscrow = async () => {
    if (!senderPublicKey || !recipientPublicKey || !amount) {
      setEscrowError(
        "Please provide valid sender, recipient, and amount details."
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/wallet/fund-escrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderPublicKey,
          recipientPublicKey,
          amount,
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        setEscrowPublicKey(data.result.escrowPublicKey);
        setEscrowFunded(true);
        setEscrowError(null);
      } else {
        setEscrowError(data.error || "Failed to fund escrow");
      }
    } catch (error) {
      console.error("Escrow funding error:", error);
      setEscrowError("Escrow funding failed");
    }
  };

  const handleReleaseEscrow = async (e) => {
    e.preventDefault();

    const amountAsNumber = parseFloat(amount);

    if (
      !senderAddress ||
      !recipientAddress ||
      !amount ||
      isNaN(amountAsNumber)
    ) {
      setMessage("Please fill all fields with valid data.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/wallet/release-escrow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKey: senderAddress,
            recipientAddress,
            amount: amountAsNumber,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Escrow released successfully!");
      } else {
        setMessage(`Escrow release failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Escrow release failed: ", error);
      setMessage(`Escrow release failed: ${error.message}`);
    }
    setLoading(false);
  };
  return (
    <div>
      <h2>Fund Escrow</h2>
      <input
        type="text"
        placeholder="Sender Public Key"
        value={senderPublicKey}
        onChange={(e) => setSenderPublicKey(e.target.value)}
      />
      <input
        type="text"
        placeholder="Recipient Public Key"
        value={recipientPublicKey}
        onChange={(e) => setRecipientPublicKey(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleFundEscrow}>Fund Escrow</button>

      {escrowError && <p style={{ color: "red" }}>{escrowError}</p>}

      {escrowFunded && (
        <div>
          <h3>Release Escrow</h3>
          <input
            type="text"
            placeholder="Sender Public Key"
            value={senderPublicKey}
            onChange={(e) => setSenderPublicKey(e.target.value)}
          />
          <input
            type="text"
            placeholder="Recipient Public Key"
            value={recipientPublicKey}
            onChange={(e) => setRecipientPublicKey(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount to Release"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleReleaseEscrow} disabled={loading}>
            {loading ? "Releasing..." : "Release Escrow"}
          </button>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default EscrowForm;
