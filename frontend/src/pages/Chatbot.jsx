import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, RotateCcw, Sparkles } from 'lucide-react';

// Embedded question banks (client-side for fast chatbot UX)
const questionBanks = {
  "6-12": [
    {
      id: 1, question: "How are you feeling today? 😊",
      options: [
        { text: "Very Happy! 🌟", score: 5 }, { text: "Happy 😊", score: 4 },
        { text: "Okay 😐", score: 3 }, { text: "A little sad 😢", score: 2 },
        { text: "Very sad 😞", score: 1 }
      ]
    },
    {
      id: 2, question: "Did you enjoy school today?",
      options: [
        { text: "Loved it! ❤️", score: 5 }, { text: "It was good", score: 4 },
        { text: "It was okay", score: 3 }, { text: "Not really", score: 2 },
        { text: "I didn't want to go", score: 1 }
      ]
    },
    {
      id: 3, question: "Did you play with friends today?",
      options: [
        { text: "Yes, lots of fun! 🎮", score: 5 }, { text: "A little bit", score: 4 },
        { text: "Not much", score: 3 }, { text: "I played alone", score: 2 },
        { text: "Nobody wanted to play with me", score: 1 }
      ]
    },
    {
      id: 4, question: "How do you feel about learning new things?",
      options: [
        { text: "I love learning! 📚", score: 5 }, { text: "It's fun sometimes", score: 4 },
        { text: "It's okay", score: 3 }, { text: "It's hard", score: 2 },
        { text: "I don't like it", score: 1 }
      ]
    },
    {
      id: 5, question: "Do you feel safe and happy at home?",
      options: [
        { text: "Yes, always! 🏠", score: 5 }, { text: "Most of the time", score: 4 },
        { text: "Sometimes", score: 3 }, { text: "Not really", score: 2 },
        { text: "No", score: 1 }
      ]
    }
  ],
  "13-19": [
    {
      id: 1, question: "How would you rate your overall mood today?",
      options: [
        { text: "Excellent - I feel great!", score: 5 }, { text: "Good - Things are going well", score: 4 },
        { text: "Average - Neither good nor bad", score: 3 }, { text: "Low - Feeling down", score: 2 },
        { text: "Very low - Struggling today", score: 1 }
      ]
    },
    {
      id: 2, question: "How well are you handling academic pressure?",
      options: [
        { text: "Managing very well", score: 5 }, { text: "Quite well", score: 4 },
        { text: "It's manageable", score: 3 }, { text: "Feeling overwhelmed", score: 2 },
        { text: "Can't cope at all", score: 1 }
      ]
    },
    {
      id: 3, question: "How are your relationships with friends and family?",
      options: [
        { text: "Strong and supportive", score: 5 }, { text: "Generally good", score: 4 },
        { text: "Some ups and downs", score: 3 }, { text: "Feeling disconnected", score: 2 },
        { text: "Very isolated", score: 1 }
      ]
    },
    {
      id: 4, question: "How confident do you feel about yourself?",
      options: [
        { text: "Very confident", score: 5 }, { text: "Fairly confident", score: 4 },
        { text: "Neutral", score: 3 }, { text: "Low confidence", score: 2 },
        { text: "No confidence at all", score: 1 }
      ]
    },
    {
      id: 5, question: "Have you been sleeping well recently?",
      options: [
        { text: "Yes, sleeping great", score: 5 }, { text: "Mostly good sleep", score: 4 },
        { text: "Inconsistent", score: 3 }, { text: "Poor sleep", score: 2 },
        { text: "Barely sleeping", score: 1 }
      ]
    },
    {
      id: 6, question: "Do you feel like you have someone to talk to when things get tough?",
      options: [
        { text: "Yes, multiple people", score: 5 }, { text: "Yes, at least one person", score: 4 },
        { text: "Sometimes", score: 3 }, { text: "Not really", score: 2 },
        { text: "I feel completely alone", score: 1 }
      ]
    }
  ]
};

function generateSuggestions(answers, ageGroup) {
  const totalScore = answers.reduce((s, a) => s + a.score, 0);
  const maxPossible = answers.length * 5;
  const percentage = (totalScore / maxPossible) * 100;
  const suggestions = [];
  let moodLevel = "";
  let emoji = "";

  if (percentage >= 80) {
    moodLevel = "excellent"; emoji = "🌟";
    suggestions.push("You're doing great! Keep up the positive energy!", "Consider sharing your positivity with a friend who might need it.", "Try journaling about what made today good.");
  } else if (percentage >= 60) {
    moodLevel = "good"; emoji = "😊";
    suggestions.push("You're doing well! Here are ways to boost your mood:", "Try 10 minutes of your favorite activity today.", "Take a short walk in fresh air - it works wonders! 🌿", "Talk to a friend or family member about your day.");
  } else if (percentage >= 40) {
    moodLevel = "moderate"; emoji = "😐";
    suggestions.push("It's okay to have average days. Here are some tips:", "Practice deep breathing - try 4-7-8 technique.", "Write down 3 things you're grateful for.", "Listen to your favorite uplifting music. 🎵");
    if (ageGroup === "13-19") suggestions.push("Remember: it's okay to not be okay. You're not alone.", "Try the Pomodoro technique for managing academic pressure.");
  } else if (percentage >= 20) {
    moodLevel = "low"; emoji = "😢";
    suggestions.push("We notice you're going through a tough time. Please know you're not alone. 💙", "Consider reaching out to a trusted adult or counselor.", "Try grounding exercises: name 5 things you see, 4 you hear, 3 you touch.", "It's okay to ask for help - it shows courage, not weakness.");
    if (ageGroup === "13-19") suggestions.push("Call NIMHANS helpline: 080-46110007 or iCall: 9152987821");
  } else {
    moodLevel = "critical"; emoji = "🆘";
    suggestions.push("We care about you and want to make sure you're safe. 💙", "Please talk to a trusted adult as soon as possible.", "Helplines: Vandrevala Foundation: 1860-2662-345 (24/7)", "iCall: 9152987821 • NIMHANS: 080-46110007", "You matter, and help is always available.");
  }

  return { moodLevel, percentage: Math.round(percentage), totalScore, maxPossible, suggestions, emoji };
}

export default function Chatbot() {
  const [ageGroup, setAgeGroup] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text, isBot, options = null) => {
    setMessages(prev => [...prev, { text, isBot, options, timestamp: Date.now() }]);
  };

  const startChat = (ag) => {
    setAgeGroup(ag);
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
    setMessages([]);
    
    setTimeout(() => {
      addMessage(`Welcome! I'm here to check in on how you're feeling. Let's start with a few questions. 💚`, true);
      setTimeout(() => {
        const questions = questionBanks[ag];
        addMessage(questions[0].question, true, questions[0].options);
        setShowOptions(true);
      }, 800);
    }, 300);
  };

  const handleAnswer = (option) => {
    setShowOptions(false);
    addMessage(option.text, false);

    const newAnswers = [...answers, { question: questionBanks[ageGroup][currentQ].question, ...option }];
    setAnswers(newAnswers);

    const nextQ = currentQ + 1;
    const questions = questionBanks[ageGroup];

    if (nextQ < questions.length) {
      setTimeout(() => {
        const responses = ["Thanks for sharing!", "I understand.", "Got it, thank you!", "I hear you.", "Thank you for being honest."];
        addMessage(responses[Math.floor(Math.random() * responses.length)], true);
        setTimeout(() => {
          setCurrentQ(nextQ);
          addMessage(questions[nextQ].question, true, questions[nextQ].options);
          setShowOptions(true);
        }, 600);
      }, 500);
    } else {
      setTimeout(() => {
        addMessage("Thank you for completing the check-in! Let me analyze your responses... 🔍", true);
        setTimeout(() => {
          const res = generateSuggestions(newAnswers, ageGroup);
          setResult(res);
        }, 1200);
      }, 500);
    }
  };

  const reset = () => {
    setAgeGroup(null);
    setCurrentQ(0);
    setAnswers([]);
    setMessages([]);
    setResult(null);
    setShowOptions(false);
  };

  // Age group selection
  if (!ageGroup) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1>🤖 Mood Check-in Chatbot</h1>
          <p>An AI-powered conversational tool that checks your wellbeing and provides personalized suggestions</p>
        </div>

        <div className="chatbot-container">
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: 8, fontSize: 24 }}>
              Welcome to the Mood Check-in
            </h2>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: 32, fontSize: 15 }}>
              This is a safe space. Your responses help us understand how you're feeling and provide support.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontWeight: 600 }}>
              Select your age group to begin:
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button className="btn btn-primary btn-lg" onClick={() => startChat("6-12")}
                style={{ minWidth: 200 }}>
                👶 Children (6-12)
              </button>
              <button className="btn btn-accent btn-lg" onClick={() => startChat("13-19")}
                style={{ minWidth: 200 }}>
                🧑‍🎓 Teens (13-19)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🤖 Mood Check-in</h1>
          <p>Age Group: {ageGroup === '6-12' ? 'Children (6-12)' : 'Teens (13-19)'}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={reset}>
          <RotateCcw size={14} /> Start Over
        </button>
      </div>

      <div className="chatbot-container">
        {/* Progress */}
        {!result && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>
              <span>Question {Math.min(currentQ + 1, questionBanks[ageGroup].length)} of {questionBanks[ageGroup].length}</span>
              <span>{Math.round((answers.length / questionBanks[ageGroup].length) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill purple" style={{ width: `${(answers.length / questionBanks[ageGroup].length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="card" style={{ maxHeight: result ? 'none' : 500, overflowY: 'auto', marginBottom: 20 }}>
          <div className="chatbot-messages">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`chat-avatar ${msg.isBot ? 'bot-avatar' : 'user-avatar'}`}>
                    {msg.isBot ? '🤖' : '👤'}
                  </div>
                  <div>
                    <div className="chat-bubble">{msg.text}</div>
                    {msg.options && showOptions && i === messages.length - 1 && (
                      <div className="chat-options">
                        {msg.options.map((opt, j) => (
                          <button key={j} className="chat-option-btn" onClick={() => handleAnswer(opt)}>
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            className="card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mood-result">
              <div className="mood-emoji">{result.emoji}</div>
              <div className={`mood-score ${result.moodLevel}`}>{result.percentage}%</div>
              <div className="mood-label">Wellbeing score: {result.moodLevel}</div>

              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Outfit' }}>{result.totalScore}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Outfit' }}>{result.maxPossible}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Max Possible</div>
                </div>
              </div>

              <h3 style={{ textAlign: 'left', fontSize: 16, marginBottom: 16 }}>
                <Sparkles size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Personalized Suggestions
              </h3>
              <ul className="suggestions-list">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="suggestion-item">{s}</li>
                ))}
              </ul>

              <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={reset}>
                  <RotateCcw size={16} /> Take Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
