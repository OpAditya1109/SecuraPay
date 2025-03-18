const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config(); // To load email credentials from .env file
// Your User Model
const TransactionModel = require("../models/Transaction");

const UserModel = require("../models/User"); // Import your User model
const {
  signupvalidation,
  loginvalidation,
} = require("../middleware/AuthValidation");
const { signup, login } = require("../controllers/AuthController");
const ensureAuthenticated = require("../middleware/Auth"); // middleware to check token
const { route } = require("./WalletRouter");

const router = express.Router();

// Route for user signup
router.post("/signup", signupvalidation, signup);


// Route for user login
router.post("/login", loginvalidation, login);

// Route to fetch username
router.get("/get-user", ensureAuthenticated, (req, res) => {
  UserModel.findById(req.user._id)
    .then((user) => {
      // Return username, name, and walletAddress
      res.json({
        username: user.username,
        name: user.name,
        walletAddress: user.publicKey, // Include wallet address
      });
    })
    .catch(() => {
      res.status(400).json({ error: "User not found" });
    });
});

router.get("/get-wallet-address", ensureAuthenticated, (req, res) => {
  UserModel.findById(req.user._id)
    .then((user) => {
      // Return only wallet address (publicKey)
      res.json({
        walletAddress: user.publicKey, // Only wallet address
      });
    })
    .catch(() => {
      res.status(400).json({ error: "User not found" });
    });
});




router.get("/get-encrypted-key", ensureAuthenticated, (req, res) => {
  console.log("Authenticated user:", req.user); // Verify if user is authenticated

  // Check if req.user is present
  if (!req.user) {
    return res.status(401).json({ error: "User is not authenticated." });
  }

  // Find the user in the database
  UserModel.findById(req.user._id)
    .then((user) => {
      console.log("User found:", user); // Log the user object

      if (user) {
        if (user.privateKeyEncrypted) {
          // Send the encrypted private key
          res.json({
            privateKeyEncrypted: user.privateKeyEncrypted,
          });
        } else {
          res.status(400).json({ error: "Encrypted private key not found." });
        }
      } else {
        res.status(404).json({ error: "User not found." });
      }
    })
    .catch((error) => {
      console.log("Error retrieving encrypted private key:", error); // Log the error
      res
        .status(400)
        .json({ error: "Error retrieving encrypted private key." });
    });
});



// Route to fetch the latest transaction for a user



router.get("/user-info-history", ensureAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id); // Find user by _id

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      username: user.username,
      name: user.name,
      walletAddress: user.publicKey, // Return wallet address (publicKey)
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ error: "Server error" });
  }
});








// Route for creating a wallet
router.post("/create-wallet", (req, res) => {
  const { username, publicKey, privateKey } = req.body;

  // Store wallet details in DB (implement securely)
  res.status(200).json({
    success: true,
    message: "Wallet created successfully!",
  });
});

// Generate a timestamp for 5 minutes in the future
const generateExpiryTimestamp = () => new Date(Date.now() + 5 * 60 * 1000);

// Route: Forgot Password (Request Password Reset)
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  // Find the user by email
  UserModel.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      // Set an expiration time for the password reset link
      const resetExpiry = generateExpiryTimestamp();
      user.resetPasswordExpiration = resetExpiry;
      user.save();

      // Generate a password reset link with the user ID
      const resetLink = `http://13.232.251.240:8080/reset-password/${user._id}`;

      // Create the email transport
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Define email options
      let mailOptions = {
        from: "securapay@gmail.com", // Sender email
        to: email, // Recipient email
        subject: "Password Reset Request",
        text: `Hi there,

We received a request to reset your password. If you did not request this, please ignore this email.

To reset your password, please click the link below (valid for 5 minutes):

${resetLink}

If you have any questions, feel free to reach out to our support team.

Best regards,  
The Secura Pay Team`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send reset email" });
        }
        console.log("Email sent:", info);
        res.status(200).json({ message: "Password reset email sent" });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: "Server error" });
    });
});

// Route: Reset Password
router.post("/reset-password/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the URL
  const { newPassword } = req.body; // Extract new password from the request body

  if (!userId || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Find user by userId
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the reset link is still valid
    if (
      !user.resetPasswordExpiration ||
      new Date() > user.resetPasswordExpiration
    ) {
      return res.status(400).json({
        message: "Reset link expired",
        redirect: "/",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear reset-related fields
    user.password = hashedPassword;
    user.resetPasswordExpiration = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate OTP expiration timestamp
const generateExpiryTimestampOtp = () => {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 5); // Set expiration to 5 minutes
  return expirationTime;
};

// Define your OTP generation function
const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  return otp.toString();
};

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Received email:", email);

    // Generate OTP and expiration time
    const otp = generateOTP();
    const otpExpiration = generateExpiryTimestampOtp();

    // Ensure user exists and update OTP and expiration
    let user = await UserModel.findOneAndUpdate(
      { email },
      { otp, otpExpiration }, // Store OTP and its expiration
      { new: true, upsert: true } // Update existing user or create a new one
    );

    console.log("Updated/Created user with OTP:", user);

    if (!user) {
      return res.status(500).json({ error: "Failed to create/update user." });
    }

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Ensure this is correct
        pass: process.env.EMAIL_PASS, // Ensure this is correct
      },
    });

    const mailOptions = {
      from: "securapay@gmail.com", // Replace with your email
      to: email, // The email passed in the request
      subject: "Your OTP for Signup",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        return res.status(500).json({ error: "Error sending OTP email" });
      }
      console.log("OTP email sent:", info.response);
      res.status(200).json({ message: "OTP sent to your email" });
    });

    // Check if the user is already verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ error: "Email is already registered and verified" });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate OTP
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpiration) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP verified successfully
    user.isVerified = true;
    user.otp = null; // Clear OTP after successful verification
    user.otpExpiration = null; // Clear expiration time
    user.failedAttempts = 0; // Reset failed attempts
    await user.save();

    // Respond with a success message and a flag to redirect to the login page
    res.status(200).json({
      message: "OTP verified successfully",
      redirectToLogin: true,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route: Resend OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Allow sending OTP even if email is verified (this should be handled by OTP sending logic)
    // You can also add a check to ensure the user has not requested OTP too frequently (e.g., cooldown).
    if (!user.isVerified) {
      // Trigger the OTP sending process
      const otp = generateOTP(); // Your OTP generation logic here
      const otpExpiration = generateExpiryTimestampOtp();

      // Save new OTP and expiration time
      user.otp = otp;
      user.otpExpiration = otpExpiration;
      await user.save();

      // Send OTP via email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: "securapay@gmail.com",
        to: email,
        subject: "Your OTP for Signup",
        text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending OTP email:", error);
          return res.status(500).json({ error: "Error sending OTP email" });
        }
        console.log("OTP email sent:", info.response);
        res.status(200).json({ message: "OTP sent to your email" });
      });
    } else {
      return res.status(200).json({
        message: "Email is already verified.",
        success: false,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
});

function decryptPrivateKey(encryptedKey, secretKey) {
  try {
    console.log("Decrypting with:", encryptedKey, secretKey); // Log inputs

    // Example decryption logic (use your actual logic here)
    const decrypted = someDecryptionMethod(encryptedKey, secretKey);

    console.log("Decrypted private key:", decrypted); // Log output
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt private key");
  }
}



// API to get private key (used by frontend)
router.post("/get-private-key", ensureAuthenticated, async (req, res) => {
  console.log("API endpoint hit"); // Check if the API is being hit

  const { receiverPublicKey } = req.body;
  try {
    const user = await UserModel.findOne({ publicKey: receiverPublicKey });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const decryptedPrivateKey = decryptPrivateKey(
      user.privateKeyEncrypted,
      "your_secret_key_here"
    );

    console.log("Decrypted private key:", decryptedPrivateKey);

    return res.json({ decryptedPrivateKey });
  } catch (error) {
    console.error("Error fetching private key:", error);
    return res.status(500).json({ error: error.message });
  }
});


















module.exports = router;
