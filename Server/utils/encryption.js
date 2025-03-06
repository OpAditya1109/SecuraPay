const crypto = require("crypto");
require("dotenv").config();

const ALGORITHM = "aes-256-cbc"; // Algorithm for encryption

// Function to encrypt data
const encrypt = (text) => {
  try {
    // Ensure the encryption key and IV are 32 and 16 bytes respectively
    const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
    const ivBuffer = Buffer.from(process.env.ENCRYPTION_IV, "utf8");

    if (keyBuffer.length !== 32)
      throw new Error("ENCRYPTION_KEY must be 32 bytes.");
    if (ivBuffer.length !== 16)
      throw new Error("ENCRYPTION_IV must be 16 bytes.");

    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, ivBuffer);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    return encrypted;
  } catch (error) {
    console.error("Encryption Error:", error.message);
    throw error;
  }
};

// Function to decrypt data
const decrypt = (encrypted) => {
  try {
    // Assuming encrypted is a comma-separated base64 string, you can decode it first
    const encryptedBuffer = Buffer.from(encrypted.split(",").map(Number));

    // Your decryption key and IV (they should be stored securely)
    const decryptionKey = "12345678901234567890123456789012"; // 32 bytes for AES-256
    const iv = "1234567890123456"; // 16 bytes for AES

    const decipher = crypto.createDecipheriv("aes-256-cbc", decryptionKey, iv);
    let decrypted = decipher.update(encryptedBuffer, null, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Decryption failed: ", err);
    throw new Error("Decryption failed");
  }
};

module.exports = { encrypt, decrypt };
