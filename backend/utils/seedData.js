// Seed data generator for demo purposes
const programs = ["Bright Spark", "Gender Equality", "Youth Mentoring"];
const cities = ["Hyderabad", "Bangalore", "Delhi", "Mumbai", "Chennai"];
const ageGroups = ["6-12", "13-19"];
const confLevels = ["very_low", "low", "moderate", "high", "very_high"];
const obsTypes = ["withdrawn", "not_interacting", "exam_stress", "bullying", "low_confidence", "anxiety", "positive_change", "other"];
const childNames = ["Aarav", "Diya", "Vivaan", "Ananya", "Arjun", "Isha", "Reyansh", "Saanvi", "Kabir", "Meera", "Rohan", "Priya", "Aditya", "Tara", "Krishna", "Zara", "Vihaan", "Myra", "Sai", "Ahana"];
const volunteerNames = ["Rahul S.", "Sneha M.", "Amit K.", "Pooja R.", "Vikram J.", "Deepa L.", "Kiran P.", "Nisha T.", "Raj B.", "Aisha N."];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export function generateEntries(count = 200) {
  const entries = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const ageGroup = rand(ageGroups);
    const mood = randInt(1, 5);
    const engagement = Math.max(1, Math.min(10, mood * 2 + randInt(-2, 2)));
    const confIdx = Math.max(0, Math.min(4, Math.floor(mood) - 1 + randInt(-1, 1)));
    
    entries.push({
      user_id: `user_${randInt(1, 50)}`,
      user_name: rand(childNames),
      age: ageGroup === "6-12" ? randInt(6, 12) : randInt(13, 19),
      age_group: ageGroup,
      program: rand(programs),
      city: rand(cities),
      mood_score: mood,
      confidence_level: confLevels[confIdx] || "moderate",
      engagement_score: engagement,
      text: mood <= 2 ? rand(["Feeling stressed about exams", "Don't want to come to class", "Feeling alone", "Having trouble sleeping", "Feeling anxious", ""]) : "",
      help_flag: mood <= 2 ? Math.random() > 0.6 : false,
      peer_support_used: Math.random() > 0.7,
      input_source: rand(["self", "volunteer", "self"]),
      session_type: rand(["online", "offline", "online", "online"]),
      timestamp: new Date(now - randInt(0, 90) * 24 * 60 * 60 * 1000)
    });
  }
  return entries;
}

export function generateVolunteerObs(count = 80) {
  const observations = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const ageGroup = rand(ageGroups);
    const obsType = rand(obsTypes);
    const severity = obsType === "positive_change" ? "low" : rand(["low", "medium", "high"]);
    const mood = obsType === "positive_change" ? randInt(3, 5) : randInt(1, 4);
    
    observations.push({
      volunteer_id: `vol_${randInt(1, 10)}`,
      volunteer_name: rand(volunteerNames),
      child_id: `child_${randInt(1, 50)}`,
      child_name: rand(childNames),
      age_group: ageGroup,
      program: rand(programs),
      city: rand(cities),
      observation: getObservationText(obsType),
      observation_type: obsType,
      confidence_level: rand(confLevels),
      mood_score: mood,
      session_type: rand(["online", "offline"]),
      offline_scores: Math.random() > 0.5 ? {
        emotional_wellbeing: randInt(1, 10),
        social_interaction: randInt(1, 10),
        academic_engagement: randInt(1, 10),
        self_confidence: randInt(1, 10),
        overall: randInt(1, 10)
      } : undefined,
      severity,
      follow_up_needed: severity === "high" || severity === "critical",
      timestamp: new Date(now - randInt(0, 90) * 24 * 60 * 60 * 1000)
    });
  }
  return observations;
}

export function generateWorkshops(count = 20) {
  const workshops = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const preConf = randInt(25, 55) / 10;
    const preMood = randInt(20, 40) / 10;
    const preEng = randInt(30, 55) / 10;
    
    workshops.push({
      program: rand(programs),
      city: rand(cities),
      date: new Date(now - randInt(0, 180) * 24 * 60 * 60 * 1000),
      volunteer_id: `vol_${randInt(1, 10)}`,
      volunteer_name: rand(volunteerNames),
      participants_count: randInt(15, 60),
      age_group: rand(ageGroups),
      pre_scores: {
        avg_confidence: preConf,
        avg_mood: preMood,
        avg_engagement: preEng
      },
      post_scores: {
        avg_confidence: Math.min(5, preConf + randInt(5, 20) / 10),
        avg_mood: Math.min(5, preMood + randInt(5, 15) / 10),
        avg_engagement: Math.min(10, preEng + randInt(5, 20) / 10)
      },
      notes: rand(["Great participation", "Some kids were shy initially", "Very engaging session", "Need more follow-up", "Excellent progress"])
    });
  }
  return workshops;
}

function getObservationText(type) {
  const texts = {
    withdrawn: "Child seems withdrawn and does not participate in group activities",
    not_interacting: "Student is not interacting with peers or teachers",
    exam_stress: "Teen showing signs of exam stress and anxiety",
    bullying: "Possible bullying situation observed",
    low_confidence: "Student lacks confidence and avoids speaking in class",
    anxiety: "Showing signs of anxiety - fidgeting, avoiding eye contact",
    positive_change: "Noticeable improvement in confidence and participation",
    other: "General observation about student behavior"
  };
  return texts[type] || texts.other;
}
