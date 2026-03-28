require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./User");
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
app.listen(5000, () => {
  console.log("🔥 Server running on http://localhost:5000");
});

app.post("/register", async (req, res) => {
  console.log("📥 Incoming Data:", req.body); // 👈 MUST ADD

  const { name, email, password, role } = req.body;

  try {
    const user = new User({ name, email, password, role });
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
    const user = await User.findOne({ email, password });

    if (user) {
      res.json(user);
    } else {
      res.status(401).json("Invalid credentials");
    }
  } catch (err) {
    res.status(500).json("Server error");
  }
});
