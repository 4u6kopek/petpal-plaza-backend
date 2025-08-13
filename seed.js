const mongoose = require("mongoose");
const Pet = require("./models/Pet");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const pets = [
  {
    name: "Fluffy",
    species: "Cat",
    age: 2,
    description: "A fluffy and playful cat.",
    ownerId: "user1",
    likes: ["user2", "user3"],
    comments: [
      {
        content: "So cute!",
        authorId: "user2",
        createdAt: new Date(),
      },
    ],
    imageUrl: "https://example.com/fluffy.jpg",
  },
  {
    name: "Buddy",
    species: "Dog",
    age: 3,
    description: "A loyal and friendly dog.",
    ownerId: "user1",
    likes: ["user1", "user4"],
    comments: [
      {
        content: "Great companion!",
        authorId: "user4",
        createdAt: new Date(),
      },
    ],
    imageUrl: "https://example.com/buddy.jpg",
  },
  {
    name: "Whiskers",
    species: "Cat",
    age: 1,
    description: "A curious kitten.",
    ownerId: "user2",
    likes: ["user1"],
    comments: [
      {
        content: "Adorable!",
        authorId: "user1",
        createdAt: new Date(),
      },
    ],
    imageUrl: "https://example.com/whiskers.jpg",
  },
  {
    name: "Rocky",
    species: "Dog",
    age: 4,
    description: "A strong and energetic dog.",
    ownerId: "user3",
    likes: ["user2", "user3", "user4"],
    comments: [
      {
        content: "Very active!",
        authorId: "user3",
        createdAt: new Date(),
      },
    ],
    imageUrl: "https://example.com/rocky.jpg",
  },
  {
    name: "Mittens",
    species: "Cat",
    age: 2,
    description: "A gentle and soft cat.",
    ownerId: "user4",
    likes: [],
    comments: [
      {
        content: "So calm!",
        authorId: "user1",
        createdAt: new Date(),
      },
    ],
    imageUrl: "https://example.com/mittens.jpg",
  },
];

async function seed() {
  await Pet.deleteMany();
  await Pet.insertMany(pets);
  console.log("Database seeded with 5 pets");
  mongoose.connection.close();
}

seed().catch(console.error);
