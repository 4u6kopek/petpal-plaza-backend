const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const admin = require("firebase-admin");

const app = express();
app.use(
  cors({
    origin: ["https://petpal-plaza.web.app", "http://localhost:4200"],
  })
);
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

const Pet = require("../models/Pet");

app.use(async (req, res, next) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log("MongoDB connected for request");
    next();
  } catch (err) {
    console.error("MongoDB connection error for request:", err);
    res
      .status(503)
      .json({ error: "Service unavailable: Database not connected" });
  }
});

app.get("/api/users/:uid", async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.params.uid);
    res.json({ displayName: user.displayName || "Unknown User" });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(404).json({ error: "User not found" });
  }
});

// CRUD Routes for Pets
app.get("/api/pets", async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    console.error("Error in GET /api/pets:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/pets/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    res.json(pet);
  } catch (err) {
    console.error("Error in GET /api/pets/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pets", authenticate, async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    console.error("Error in POST /api/pets:", err);
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/pets/:id", authenticate, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    if (pet.ownerId !== req.userId)
      return res.status(403).json({ error: "Unauthorized" });
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedPet);
  } catch (err) {
    console.error("Error in PUT /api/pets/:id:", err);
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/pets/:id", authenticate, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    if (pet.ownerId !== req.userId)
      return res.status(403).json({ error: "Unauthorized" });
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted" });
  } catch (err) {
    console.error("Error in DELETE /api/pets/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pets/:id/likes", authenticate, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    if (!pet.likes.includes(req.userId)) {
      pet.likes.push(req.userId);
      await pet.save();
    }
    res.json(pet);
  } catch (err) {
    console.error("Error in POST /api/pets/:id/likes:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/pets/:id/likes", authenticate, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    pet.likes = pet.likes.filter((id) => id !== req.userId);
    await pet.save();
    res.json(pet);
  } catch (err) {
    console.error("Error in DELETE /api/pets/:id/likes:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pets/:id/comments", authenticate, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    pet.comments.push({ ...req.body, authorId: req.userId });
    await pet.save();
    res.json(pet);
  } catch (err) {
    console.error("Error in POST /api/pets/:id/comments:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
