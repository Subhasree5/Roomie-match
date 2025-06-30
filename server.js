const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// Firebase Admin SDK setup
const serviceAccount = require("./firebase/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Root route (optional - serves index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});


// 🔐 Signup Route
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, city, phone } = req.body;

  if (!name || !email || !password || !city || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await db.collection("users").doc(email).set({
      name,
      email,
      password,
      city,
      phone,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 🔓 Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Email and password required" });

  try {
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .where("password", "==", password)
      .get();

    if (snapshot.empty)
      return res.status(401).json({ msg: "Invalid credentials" });

    const user = snapshot.docs[0].data();

    return res.status(200).json({
      msg: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        city: user.city,
        phone: user.phone || "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 📄 Get User Profile by Email
app.get("/api/user", async (req, res) => {
  const email = req.query.email;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const doc = await db.collection("users").doc(email).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(doc.data());
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


// ✏ Update User Profile
app.post("/api/update", async (req, res) => {
  const { email, name, city, phone } = req.body;

  if (!email || !name || !city || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.update({ name, city, phone });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


// 🧩 Match Users by City
app.get("/api/match", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const snapshot = await db.collection("users").where("city", "==", city).get();

    const users = snapshot.docs.map(doc => doc.data());

    res.json(users);
  } catch (err) {
    console.error("Error fetching matches:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
