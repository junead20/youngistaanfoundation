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
      { title: "The 5-4-3-2-1 Grounding", description: "Identify 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.", category: "Mindful", type: "Self-Time", duration: "5 mins" },
      { title: "Doodle Your Stress", description: "Grab a pencil and just scribble or draw whatever is in your head for 2 minutes.", category: "Creative", type: "Self-Time", duration: "10 mins" },
      { title: "Cloud Watching", description: "Spend 5 minutes looking at the sky (real or digital) and finding shapes.", category: "Mindful", type: "Self-Time", duration: "5 mins" },
      { title: "Gratitude Text", description: "Send a 'thank you' or 'thinking of you' text to one person right now.", category: "Social", type: "Interactive", duration: "2 mins" },
      { title: "Desk Yoga", description: "3 simple stretches you can do while sitting to release neck and shoulder tension.", category: "Physical", type: "Self-Time", duration: "5 mins" },
      { title: "The Humming Trick", description: "Hum your favorite tune to calm your nervous system and release tension.", category: "Mindful", type: "Self-Time", duration: "3 mins" },
      { title: "Color Breathing", description: "Imagine breathing in blue (calm) and exhaling red (stress).", category: "Mindful", type: "Self-Time", duration: "5 mins" },
      { title: "Digital Detox", description: "Put your phone away and stay offline for exactly 10 minutes.", category: "Mindful", type: "Self-Time", duration: "10 mins" },
      { title: "One-Song Dance", description: "Put on one upbeat song and just move your body however you feel.", category: "Physical", type: "Self-Time", duration: "4 mins" },
      { title: "Nature Soundscapes", description: "Listen to 2 minutes of rain, ocean waves, or forest sounds.", category: "Mindful", type: "Self-Time", duration: "3 mins" },
      { title: "The 'Why' Game", description: "Ask yourself 'why am I awesome?' and find 3 genuine reasons.", category: "Mindful", type: "Self-Time", duration: "3 mins" },
      { title: "Plant Care", description: "Spend 2 minutes watering or checking on a plant near you.", category: "Physical", type: "Self-Time", duration: "2 mins" },
      { title: "Letter to Future Me", description: "Write 2 short sentences for yourself exactly 1 year from today.", category: "Mindful", type: "Self-Time", duration: "10 mins" },
      { title: "Safe Space Visualization", description: "Close your eyes and imagine a place where you feel 100% safe.", category: "Mindful", type: "Self-Time", duration: "5 mins" },
      { title: "Texture Search", description: "Find something fuzzy, something smooth, and something cold in your room.", category: "Physical", type: "Self-Time", duration: "3 mins" },
      { title: "Mantra Creation", description: "Pick 3 words that make you feel strong (e.g., 'I am capable').", category: "Mindful", type: "Self-Time", duration: "3 mins" },
      { title: "Puzzle Break", description: "Solve one quick riddle, crossword, or word search puzzle.", category: "Creative", type: "Self-Time", duration: "10 mins" },
      { title: "Hydration Check", description: "Drink a full glass of water slowly, focusing on the feeling.", category: "Physical", type: "Self-Time", duration: "2 mins" },
      { title: "Deep Sigh", description: "Take a deep breath and exhale with a loud 'ahhh' or 'sigh'.", category: "Mindful", type: "Self-Time", duration: "1 min" },
      { title: "Self-High Five", description: "Literally give yourself a high five or a pat on the back for being you.", category: "Social", type: "Self-Time", duration: "1 min" }
    ];
    await Activity.insertMany(activities);

    const communities = [
      { name: "Art & Crafts Club 🎨", description: "For anyone who loves making things with their hands. Share your creations!", member_count: 142, tags: ["art", "painting", "DIY"] },
      { name: "Music & Singing Vibe 🎵", description: "Drop your favorite playlists, sing covers, or just listen together.", member_count: 310, tags: ["music", "singing", "bands"] },
      { name: "Code Jam Space 💻", description: "Building apps, games, or just learning HTML? Join us.", member_count: 85, tags: ["tech", "coding", "games"] },
      { name: "Midnight Thoughts ✨", description: "Share your poems, short stories, or just random midnight thoughts.", member_count: 198, tags: ["writing", "poetry", "books"] }
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
