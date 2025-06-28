const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path=require("path");
const app = express();
const port = 5000;
app.use(express.json());
const publicPath=path.join(__dirname,"..","public");
app.use(express.static(publicPath));
// Initialize Firebase
const serviceAccount = require("./firebase/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath,"index.html"));
});

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
      user: { name: user.name, email: user.email, city: user.city }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/api/update-profile", async (req, res) => {
  const { email, name, city } = req.body;

  if (!email || !name || !city) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = snapshot.docs[0].ref;

    await userDoc.update({ name, city });

    res.json({ message: "Profile updated" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Firebase admin should be initialized above this
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
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});