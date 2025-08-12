const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

connectDB();

const Pet = require("../models/Pet");

// CRUD Routes
app.get("/api/pets", async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/pets/:id", async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pets", async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.json(pet);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/pets/:id", async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: "Pet deleted" });
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
});

(async () => {
  await connectDB();
  module.exports = app;
})();
