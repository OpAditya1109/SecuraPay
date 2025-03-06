const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    resetPasswordExpiration: { type: Date, default: null },
    otp: { type: String, default: null },
    otpExpiration: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },

    // Make wallet fields optional so they can be added later
    publicKey: { type: String, default: null },
    privateKeyEncrypted: { type: String, default: null },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
