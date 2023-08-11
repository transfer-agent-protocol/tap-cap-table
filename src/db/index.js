import connectDB from "./config/mongoose.js";
import addNotPoetToDB from "./operations/seed.js"; // Import the seed function

connectDB();

addNotPoetToDB() // Call the seed function
    .then(() => console.log("Database seeded successfully"))
    .catch((err) => console.log("Error seeding database:", err));
