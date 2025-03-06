// /backend/utils/solana.js
const {
  Connection,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

// Connect to Solana
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Send transaction to Solana
const sendTransactionToSolana = async (transaction) => {
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    payerKeyPair,
  ]);
  return signature;
};

module.exports = { sendTransactionToSolana };
