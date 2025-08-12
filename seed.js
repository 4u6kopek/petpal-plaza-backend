require("dotenv").config();
const mongoose = require("mongoose");
const Pet = require("./models/Pet");

const seedPets = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected for seeding");

    const pets = [
      {
        name: "Fluffy",
        species: "Cat",
        age: 2,
        description: "Cute and fluffy cat",
        ownerId: "test-owner1",
        likes: [],
        comments: [],
      },
      {
        name: "Buddy",
        species: "Dog",
        age: 3,
        description: "Friendly dog",
        ownerId: "test-owner2",
        likes: [],
        comments: [],
      },
    ];

    await Pet.insertMany(pets);
    console.log("Sample data added");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedPets();
