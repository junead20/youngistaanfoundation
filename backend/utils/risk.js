export function calculateRisk(entry) {
  let score = 0;

  // Mood-based scoring (lower mood = higher risk)
  score += (5 - entry.mood_score) * 2;

  // Help flag adds significant risk
  if (entry.help_flag) score += 5;

  // Text analysis for risk keywords
  if (entry.text) {
    const highRisk = ["suicide", "self-harm", "kill", "die", "hopeless"];
    const medRisk = ["depressed", "anxiety", "panic", "scared", "alone", "worthless"];
    const lowRisk = ["stress", "sad", "worried", "nervous", "tired", "overwhelmed"];

    highRisk.forEach(w => {
      if (entry.text.toLowerCase().includes(w)) score += 8;
    });
    medRisk.forEach(w => {
      if (entry.text.toLowerCase().includes(w)) score += 4;
    });
    lowRisk.forEach(w => {
      if (entry.text.toLowerCase().includes(w)) score += 2;
    });
  }

  // Low confidence adds risk
  if (entry.confidence_level === "very_low") score += 4;
  else if (entry.confidence_level === "low") score += 2;

  // Low engagement adds risk
  if (entry.engagement_score && entry.engagement_score <= 3) score += 3;

  return Math.min(score, 25); // Cap at 25
}

export function getRiskLevel(score) {
  if (score >= 15) return "CRITICAL";
  if (score >= 10) return "HIGH";
  if (score >= 6) return "MEDIUM";
  return "LOW";
}

export function getMoodLabel(score) {
  if (score >= 5) return "Excellent";
  if (score >= 4) return "Good";
  if (score >= 3) return "Neutral";
  if (score >= 2) return "Low";
  return "Very Low";
}

export function getInsights(entries) {
  if (!entries.length) return [];
  
  const insights = [];
  const avgMood = entries.reduce((s, e) => s + e.mood_score, 0) / entries.length;
  const helpCount = entries.filter(e => e.help_flag).length;
  const peerSupportCount = entries.filter(e => e.peer_support_used).length;
  
  // Program-specific insights
  const programs = {};
  entries.forEach(e => {
    if (!programs[e.program]) programs[e.program] = [];
    programs[e.program].push(e);
  });

  Object.entries(programs).forEach(([prog, pEntries]) => {
    const pAvg = pEntries.reduce((s, e) => s + e.mood_score, 0) / pEntries.length;
    const lowConf = pEntries.filter(e => ["very_low", "low"].includes(e.confidence_level)).length;
    const lowConfPct = Math.round((lowConf / pEntries.length) * 100);
    
    if (pAvg < 3) {
      insights.push({
        type: "warning",
        title: `Low mood in ${prog}`,
        message: `Average mood score is ${pAvg.toFixed(1)}/5 in ${prog} program. Consider intervention.`,
        program: prog
      });
    }
    if (lowConfPct > 30) {
      insights.push({
        type: "alert",
        title: `Low confidence in ${prog}`,
        message: `${lowConfPct}% of participants show low confidence in ${prog} program.`,
        program: prog
      });
    }
  });

  // Age-group insights
  const ageGroups = {};
  entries.forEach(e => {
    if (!ageGroups[e.age_group]) ageGroups[e.age_group] = [];
    ageGroups[e.age_group].push(e);
  });

  Object.entries(ageGroups).forEach(([ag, agEntries]) => {
    const agAvg = agEntries.reduce((s, e) => s + e.mood_score, 0) / agEntries.length;
    if (ag === "13-19" && agAvg < 3) {
      insights.push({
        type: "critical",
        title: "Teen anxiety rising",
        message: `Teen mood average is ${agAvg.toFixed(1)}/5. Adolescent wellbeing needs attention.`
      });
    }
  });

  // Mood-engagement correlation
  const lowMoodEntries = entries.filter(e => e.mood_score <= 2);
  if (lowMoodEntries.length > 0) {
    const lowMoodAvgEngagement = lowMoodEntries.reduce((s, e) => s + (e.engagement_score || 5), 0) / lowMoodEntries.length;
    const allAvgEngagement = entries.reduce((s, e) => s + (e.engagement_score || 5), 0) / entries.length;
    const diff = Math.round(((allAvgEngagement - lowMoodAvgEngagement) / allAvgEngagement) * 100);
    if (diff > 15) {
      insights.push({
        type: "insight",
        title: "Mood affects learning",
        message: `Students with low mood have ${diff}% lower engagement than average.`
      });
    }
  }

  // Help usage
  if (helpCount > 0) {
    insights.push({
      type: "info",
      title: "Help button usage",
      message: `${helpCount} participants used the help button. ${peerSupportCount} used peer support.`
    });
  }

  return insights;
}