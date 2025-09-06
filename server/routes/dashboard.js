const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to check token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(token, "secretKey");
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// Protected dashboard route
router.get("/", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}` });
});

module.exports = router;
