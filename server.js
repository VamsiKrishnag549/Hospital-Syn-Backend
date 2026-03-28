require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

app.post("/register", async (req, res) => {
  console.log("📥 Incoming Data:", req.body); // 👈 MUST ADD

  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

const user = new User({
  name,
  email,
  password: hashedPassword,
  role
});
    await user.save();

    console.log("✅ Saved to DB"); // 👈 MUST ADD

    res.json({ message: "User registered", user });
  } catch (err) {
    console.log(err);
    res.status(500).json("Error saving user");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
if (!user) {
  return res.status(401).json({ message: "Invalid credentials" });
}

const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
  return res.status(401).json({ message: "Invalid credentials" });
}

    // ✅ CREATE JWT TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json("Server error");
  }
});

function verifyToken(req, res, next) {
  const bearer = req.headers["authorization"];

  if (!bearer) return res.status(403).send("No token");

  const token = bearer.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send("Invalid token");

    req.user = decoded;
    next();
  });
}
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});
