const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// CRUD Routes
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
    res.json(pet);
  } catch (err) {
    console.error("Error in GET /api/pets/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pets", async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.json(pet);
  } catch (err) {
    console.error("Error in POST /api/pets:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/pets/:id", async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(pet);
  } catch (err) {
    console.error("Error in PUT /api/pets/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/pets/:id", async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted" });
  } catch (err) {
    console.error("Error in DELETE /api/pets/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pets/:id/likes", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet.likes.includes(req.body.userId)) {
      pet.likes.push(req.body.userId);
      await pet.save();
    }
    res.json(pet);
  } catch (err) {
    console.error("Error in POST /api/pets/:id/likes:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pets/:id/comments", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    pet.comments.push(req.body);
    await pet.save();
    res.json(pet);
  } catch (err) {
    console.error("Error in POST /api/pets/:id/comments:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
