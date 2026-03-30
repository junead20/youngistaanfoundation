export function generateMiloResponse(moodScore, conversation, ageGroup) {
  // If this is the first real message from the user (conversation length = 1 means just the user's initial rating)
  if (conversation.length <= 1) {
    if (moodScore >= 8) {
      return {
        text: "That's awesome! I love hearing that. What's making your day so good? 🌟",
        options: ["Had a fun time with friends", "Did well in school/hobby", "Just feeling good!", "Something else"],
        action: null
      };
    } else if (moodScore >= 5) {
      return {
        text: "Not bad! Sound like an okay day. Did anything specific happen, or just coasting? 😊",
        options: ["Just a normal day", "Nothing special", "A mix of good and bad", "I'm a bit bored"],
        action: null
      };
    } else if (moodScore >= 3) {
      return {
        text: "I hear you. Sounds like things are a little heavy right now. Want to talk about what's on your mind? 💙",
        options: ["Stress from school", "Friends/family stuff", "Just overthinking", "I don't know why I feel low"],
        action: null
      };
    } else {
      return {
        text: "I'm so sorry you're feeling this way. I'm right here listening. Would you like to share a bit about what's hurting? 💔",
        options: ["Everything feels too much", "I feel really lonely", "I messed up", "I don't want to talk about it"],
        action: "alerted_volunteer" // Flags for checking
      };
    }
  }

  // Second check - suggesting ONE small thing
  const lastUserMessage = conversation[conversation.length - 1].text;
  
  if (lastUserMessage === "I don't want to talk about it") {
    return {
      text: "That's completely okay. No pressure at all. Want to just take your mind off things? We have some low-key activities you can do solo.",
      options: ["Maybe some relaxing music", "Show me some fun stuff", "No, I'm good for now"],
      action: "redirected_activities"
    };
  }

  // 1 small thing suggestions based on mood
  if (moodScore >= 6) {
    return {
      text: "Love that! Hey, since you're in a good vibe, we have some awesome communities here where people share art, music, and stuff. Want to check them out?",
      options: ["Yeah, show me communities!", "Not right now, thanks", "What kind of communities?"],
      action: "redirected_communities"
    };
  } else if (moodScore >= 3) {
    return {
      text: "Thanks for sharing that with me. It's totally normal to feel that way. Instead of fixing everything at once, how about we just try 1 small thing right now to catch a break?",
      options: ["Like what?", "I just want to rest", "Maybe later"],
      action: "redirected_activities"
    };
  } else {
    // Low mood
    return {
      text: "I really appreciate you telling me that. Sometimes just saying it out loud is a big step. I've sent a note to one of our friendly guides who might bring you a warm cup of coffee and a chat later. For now, would you like to try a quick breathing trick just to slow things down?",
      options: ["Okay, let's try breathing", "I prefer some quiet music", "Just want to sit quietly"],
      action: "redirected_activities"
    };
  }
}
