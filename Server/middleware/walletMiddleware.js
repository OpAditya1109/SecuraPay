const { encrypt, decrypt } = require("../controllers/solanaWallet");
require("dotenv").config();
// Encrypt the private key before storing it
const encryptPrivateKey = (privateKey) => {
  if (!privateKey) {
    throw new Error("Private key is required");
  }

  return encrypt(privateKey); // Use the encrypt function
};

// Decrypt the private key when accessing it
const decryptPrivateKey = (encryptedPrivateKey) => {
  if (!encryptedPrivateKey) {
    throw new Error("Encrypted private key is required");
  }

  return decrypt(encryptedPrivateKey); // Use the decrypt function
};

module.exports = { encryptPrivateKey, decryptPrivateKey };
