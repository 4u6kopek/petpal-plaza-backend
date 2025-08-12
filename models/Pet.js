const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  authorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  age: { type: Number, required: true },
  description: { type: String, required: true },
  ownerId: { type: String, required: true },
  likes: [{ type: String }],
  comments: [commentSchema],
});

module.exports = mongoose.model("Pet", petSchema);
