const crypto = require("crypto");
require("dotenv").config();

// Solana Web3 (or Solana SDK) and related libraries
const {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
} = require("@solana/web3.js");

// Environment variables for encryption
const ALGORITHM = "aes-256-cbc"; // Algorithm for encryption

// Create a new Solana wallet and encrypt the private key
const createWallet = () => {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toString();
  const privateKey = keypair.secretKey.toString("base64"); // Base64 encoding for storage

  // Encrypt the private key before sending to the client (do not send private key directly)
  const encryptedPrivateKey = encrypt(privateKey);

  return { publicKey, encryptedPrivateKey };
};

// Function to get wallet balance (in SOL)
const getBalance = async (publicKey) => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
};

// Function to send SOL from one user to another
const sendTransaction = async (privateKey, recipientAddress, amount) => {
  try {
    // Create a connection to the Solana cluster (e.g., Devnet, Testnet, or Mainnet)
    const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

    // Create the Keypair using the provided private key
    const payer = Keypair.fromSecretKey(Buffer.from(privateKey, "base64"));

    // Convert amount to lamports (1 SOL = 1e9 lamports)
    const lamports = amount * LAMPORTS_PER_SOL;

    // Create a new transaction with the transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: lamports, // Ensure amount is in lamports
      })
    );

    // Send the transaction and wait for confirmation
    const signature = await connection.sendTransaction(transaction, [payer]);
    await connection.confirmTransaction(signature);

    // Return success with the transaction signature
    return { success: true, signature };
  } catch (error) {
    console.error("Transaction error:", error);
    throw new Error("Transaction failed");
  }
};

// Request SOL from the testnet faucet (for test wallets)
const requestAirdrop = async (publicKey) => {
  const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");
  const airdropSignature = await connection.requestAirdrop(
    new PublicKey(publicKey),
    2 * LAMPORTS_PER_SOL
  ); // 2 SOL as airdrop
  await connection.confirmTransaction(airdropSignature);

  return airdropSignature;
};

// Encrypt the data
const encrypt = (text) => {
  try {
    const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
    const ivBuffer = Buffer.from(process.env.ENCRYPTION_IV, "utf8");

    if (keyBuffer.length !== 32 || ivBuffer.length !== 16) {
      throw new Error("Invalid key or IV length");
    }

    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, ivBuffer);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    return encrypted;
  } catch (error) {
    console.error("Encryption Error:", error.message);
    throw error;
  }
};

// Decrypt the private key
const decrypt = (encryptedPrivateKey) => {
  try {
    const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
    const ivBuffer = Buffer.from(process.env.ENCRYPTION_IV, "utf8");

    const encryptedBuffer = Buffer.from(encryptedPrivateKey, "base64");

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
    let decrypted = decipher.update(encryptedBuffer, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption Error:", error);
    throw new Error("Decryption failed");
  }
};

module.exports = {
  createWallet,
  getBalance,
  sendTransaction,
  requestAirdrop,
  encrypt,
  decrypt,
};
