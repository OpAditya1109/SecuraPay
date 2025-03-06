const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Corrected capitalization

const TransactionSchema = new Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, required: true }, // Store the timestamp when the transaction is done
});

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

module.exports = TransactionModel;
