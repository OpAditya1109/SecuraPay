const express = require("express");
require("dotenv").config();
const { Keypair } = require("@solana/web3.js");
const { encrypt, decrypt } = require("../utils/encryption");
const {
  createWallet,
  getBalance,
  sendTransaction,
  requestAirdrop,
} = require("../controllers/solanaWallet"); // Import wallet functions
const UserModel = require("../models/User");
const router = express.Router();
const ensureAuthenticated = require("../middleware/Auth");
const TransactionModel = require("../models/Transaction");
// Route to create a new Solana wallet
router.post("/create-wallet", async (req, res) => {
  try {
    const { publicKey, encryptedPrivateKey } = createWallet(); // Generate wallet and encrypt private key
    return res.status(200).json({
      message: "Wallet created successfully",
      publicKey,
      encryptedPrivateKey, // Send the encrypted private key to the client (don't store it in plain text)
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error creating wallet", details: error.message });
  }
});

// Route to get wallet balance (in SOL)
router.get("/get-balance/:publicKey", async (req, res) => {
  const { publicKey } = req.params;
  try {
    const balance = await getBalance(publicKey); // Get balance in SOL
    return res.status(200).json({ balance });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error getting balance", details: error.message });
  }
});



// Route to send transaction

router.post("/send-transaction", async (req, res) => {
  const { publicKey, recipientAddress, amount } = req.body;

  try {
    // Fetch the user from the database using the sender's public key
    const user = await UserModel.findOne({ publicKey });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Sender not found in the database" });
    }

    console.log("Received sender public key:", publicKey);
    console.log("Sender found:", user);

    // Decode the Base64-encoded private key from the database
    const privateKeyBuffer = Buffer.from(user.privateKeyEncrypted, "base64"); // Decode Base64 to Buffer
    console.log("Private Key Buffer Length:", privateKeyBuffer.length); // Should be 64 bytes

    // Extract the private key and use it directly in sendTransaction
    const privateKey = privateKeyBuffer.toString("base64"); // Using base64 encoded private key

    // Send the transaction
    const transaction = await sendTransaction(
      privateKey, // Send private key (base64 string)
      recipientAddress,
      amount
    );

    // Store the transaction in the database
    const newTransaction = new TransactionModel({
      sender: publicKey,
      recipient: recipientAddress,
      amount: amount,
      timestamp: new Date(), // Current timestamp
    });

    await newTransaction.save();

    return res
      .status(200)
      .json({ message: "Transaction successful", transaction });
  } catch (error) {
    console.error("Transaction error:", error);
    return res
      .status(500)
      .json({ error: "Transaction failed", details: error.message });
  }
});

router.get("/transaction-history", ensureAuthenticated, async (req, res) => {
  try {
    const { walletAddress } = req.query; // Get wallet address from query params

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const transactions = await TransactionModel.find({
      $or: [{ sender: walletAddress }, { recipient: walletAddress }],
    });

    if (!transactions.length) {
      return res.status(404).json({ error: "No transactions found" });
    }

    // Create a response with both sender and recipient clearly defined
    const formattedTransactions = transactions.map((transaction) => {
      return {
        sender: transaction.sender,
        recipient: transaction.recipient,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
      };
    });

    return res.status(200).json({ transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Server error" });
  }
});









// Route to request SOL from the faucet for testnet wallets
router.post("/request-airdrop/:publicKey", async (req, res) => {
  const { publicKey } = req.params;
  try {
    const signature = await requestAirdrop(publicKey); // Request airdrop from testnet faucet
    return res.status(200).json({
      message: "Airdrop successful",
      signature,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Airdrop failed",
      details: error.message,
    });
  }
});

module.exports = router;
