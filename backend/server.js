import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import entryRoutes from "./routes/entryRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import workshopRoutes from "./routes/workshopRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import seedRoutes from "./routes/seedRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import offlineSessionRoutes from "./routes/offlineSessionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/offline-sessions", offlineSessionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    secret_loaded: !!(process.env.JWT_SECRET || 'yuva_pulse_default_secret_2026')
  });
});

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
