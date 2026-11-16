
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import jobRoutes from "./routes/jobRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Job routes
app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("JobTrack Backend is running!");
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
