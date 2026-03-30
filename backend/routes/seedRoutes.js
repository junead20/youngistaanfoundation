import express from "express";
import Entry from "../models/Entry.js";
import Volunteer from "../models/Volunteer.js";
import Workshop from "../models/Workshop.js";
import Activity from "../models/Activity.js";
import Community from "../models/Community.js";
import { generateEntries, generateVolunteerObs, generateWorkshops } from "../utils/seedData.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Clear existing data
    await Entry.deleteMany({});
    await Volunteer.deleteMany({});
    await Workshop.deleteMany({});
    await Activity.deleteMany({});
    await Community.deleteMany({});

    // Generate and insert seed data
    const entries = generateEntries(200);
    const volunteers = generateVolunteerObs(80);
    const workshops = generateWorkshops(20);

    await Entry.insertMany(entries);
    await Volunteer.insertMany(volunteers);
    await Workshop.insertMany(workshops);

    const activities = [
      { title: "Box Breathing", description: "Breathe in 4s, hold 4s, out 4s, hold 4s.", category: "Mindful", type: "Self-Time", duration: "5 mins" },
      { title: "Scribble IT Out", description: "Grab a pencil and just scribble hard on paper to release energy.", category: "Creative", type: "Self-Time", duration: "10 mins" },
      { title: "Trust Walk", description: "One person is blindfolded, the other guides them safely.", category: "Social", type: "Interactive", duration: "15 mins" },
      { title: "Pass the Clap", description: "Stand in a circle and pass a clap rhythm as fast as possible.", category: "Physical", type: "Interactive", duration: "10 mins" },
      { title: "Write a Letter to Your Future Self", description: "Write down what you hope for yourself in 5 years.", category: "Mindful", type: "Self-Time", duration: "15 mins" }
    ];
    await Activity.insertMany(activities);

    const communities = [
      { name: "Art & Crafts Club 🎨", description: "For anyone who loves making things with their hands. Share your creations!", member_count: 142, tags: ["art", "painting", "DIY"] },
      { name: "Music & Singing Vibe 🎵", description: "Drop your favorite playlists, sing covers, or just listen together.", member_count: 310, tags: ["music", "singing", "bands"] },
      { name: "Code Jam Space 💻", description: "Building apps, games, or just learning HTML? Join us.", member_count: 85, tags: ["tech", "coding", "games"] },
      { name: "Story Writers ✨", description: "Share your poems, short stories, or just random midnight thoughts.", member_count: 198, tags: ["writing", "poetry", "books"] }
    ];
    await Community.insertMany(communities);

    res.json({
      message: "Database seeded successfully!",
      entries: entries.length,
      volunteerObservations: volunteers.length,
      workshops: workshops.length,
      activities: activities.length,
      communities: communities.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
