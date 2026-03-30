#  Youth Mental Wellbeing Support System

A hybrid platform designed to provide **continuous emotional support for students (≤19 years)** by combining **AI-assisted interaction, peer support, and NGO-driven offline engagement**.

---

##  Problem

* Students hesitate to seek help due to **stigma, fear, and lack of awareness**
* Early mental distress often goes **unnoticed**
* NGO sessions are limited to **2 hours/week**, leaving no continuous support
* Volunteers are **not licensed professionals**, creating limitations in intervention

---

##  Solution

We built a **hybrid support system** that:

* Enables **anonymous emotional expression**
* Uses **AI for first-level interaction**
* Connects users to **trained volunteers (non-clinical support)**
* Ensures **continuous follow-up**
* Works for both:

  * Students with phone access (online system)
  * Students without phone access (offline NGO sessions)

---

## Core Concept

> Expression → Detection → Action → Follow-up

* **Expression**: User shares mood or thoughts
* **Detection**: System identifies emotional patterns
* **Action**: AI or volunteer responds
* **Follow-up**: System ensures continued support

---

## Target Users

* Students (Age ≤19)
* NGO Volunteers (~14,000 members)
* Admin / Organization

---

## System Architecture

### Online System

* Daily **mood check-in** (1–10 scale / emoji)
* **AI chatbot** for safe, anonymous conversation
* Smart **escalation to volunteers**
* Interest-based **activity spaces**
* **Nudges & reminders** for continued engagement

---

###  Offline System (NGO Integration)

* Conducted via weekly sessions
* Activities for:

  * Emotional expression
  * Trust building
  * Passion discovery
* Volunteers:

  * Record mood observations
  * Identify students needing attention
  * Provide **1-on-1 peer support**
  * Log updates into the system

---

##  Volunteer System

 Volunteers are NOT therapists

Their role:

* Listen and support
* Build trust
* Guide students to appropriate help
* Escalate when needed

---

##  Volunteer Dashboard (Frontend Focus)

Features:

* **Mentee Dropdown**

  * Select assigned students (anonymous IDs)

* **Current Work**

  * View student mood
  * Risk level classification
  * Recent interactions
  * Respond to flagged users

* **Upcoming Sessions**

  * Session schedule
  * Location & type
  * Preparation actions

* **Recent Activity**

  * Interaction logs
  * Timeline tracking

---

##  Risk Classification

Based on:

* Mood trends (not single input)
* Repeated negative patterns
* Chat signals

Levels:

* Low → AI support
* Medium → Volunteer suggested
* High → Priority escalation

---

##  Follow-Up System (Key Differentiator)

* Scheduled check-ins
* Small actionable tasks
* Mood tracking over time
* Ensures **no student is forgotten**

---

##  Design Principles

* Anonymous-first interaction
* Low effort, low friction UX
* Non-clinical, safe language
* No overwhelming features
* Mobile-first for students

---

##  Tech Stack (Placeholder)

* Frontend: React / Next.js
* Backend: Node.js / Firebase
* Database: MongoDB / Firestore
* AI: LLM-based conversational model

---

##  Ethics & Safety

* No medical advice provided
* Volunteers act only as **listeners & connectors**
* Privacy-first design
* Escalation mechanisms for high-risk cases

---

##  Key Differentiator

> Most solutions stop at one conversation.
> We ensure **continuous care through structured follow-up and hybrid support (online + offline).**

---

##  Future Scope

* Regional language support
* Voice-based interaction
* Advanced behavioral pattern detection
* NGO-wide analytics dashboard

---

##  Contributors

* Team Members:
K. Sai Deekshith
Mohammed Junead baba
M. Sandeep
K. Srivatsav Reddy
G. Neha Reddy

* NGO: Youngistaan

---

##  License

This project is for academic / hackathon purposes.
