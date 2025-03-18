const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT

    // Ensure decoded token contains `_id`
    if (!decoded._id) {
      return res.status(403).json({ message: "Invalid token structure" });
    }

    req.user = decoded; // Store user data in `req.user`
    next(); // Proceed to the next middleware
  } catch (err) {
    console.error("JWT Verification Error:", err.message);

    return res.status(403).json({
      message: "Token expired or invalid, please login again",
    });
  }
};

module.exports = ensureAuthenticated;
