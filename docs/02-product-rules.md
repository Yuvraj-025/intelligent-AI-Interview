# VoxHire AI — Product Rules

## Core Product Rules

### Rule 1 — Voice-First Interaction
The interviewer must ask questions using **voice generation**.

The user should primarily respond using **voice input**.

Text-based fallback may be added later, but the main interaction model is voice-first.

---

### Rule 2 — Interview Modes
The system must support at least two interview modes:

#### A. Normal Interview Mode
- realistic interview pacing
- follow-up questions allowed
- deeper conceptual questions
- more conversational flow

#### B. Rapid Fire Mode
- short and direct questions
- strict timer-based answering
- high-pressure interview simulation
- faster transitions between questions

---

### Rule 3 — Adaptive Questioning
The next question should not be random.

It must depend on:
- previous answer correctness
- hesitation level
- communication clarity
- response speed
- topic weakness
- mode type

---

### Rule 4 — No Answer Leakage
The system must never reveal:
- expected answer
- ideal answer hints
- solution cues

before the user submits their answer.

---

### Rule 5 — Evaluation Dimensions
Each response must be evaluated on multiple dimensions.

Minimum evaluation dimensions:
- semantic correctness
- topic coverage
- communication clarity
- response confidence
- filler words
- hesitation / pause behavior
- response duration
- structure of explanation

---

### Rule 6 — Session Summary Required
Every interview session must end with a structured summary.

This summary should include:
- overall score
- topic-wise performance
- strengths
- weaknesses
- communication observations
- confidence observations
- suggested improvement areas

---

### Rule 7 — Mode-Specific Behavior
The system must behave differently depending on interview mode.

#### Normal Mode should prioritize:
- realism
- follow-up logic
- concept depth
- conversational interviewing

#### Rapid Fire Mode should prioritize:
- speed
- concise answering
- pressure simulation
- response agility

---

### Rule 8 — Role Context Awareness
The interview should adapt based on:
- selected role
- user experience level
- interview category

Examples:
- SDE interview
- Frontend interview
- Backend interview
- Data Science interview
- HR interview
- Cloud / DevOps interview

---

### Rule 9 — Privacy and Audio Handling
Audio files should only be stored if required for:
- transcript generation
- session playback
- user-saved reports

Otherwise, temporary audio should be deleted after processing.

---

### Rule 10 — Product Quality
The product should not feel like:
- a basic chatbot wrapper
- a plain CRUD college project
- a generic AI prompt playground

It should feel like:
- a focused interview simulation system
- a structured voice assessment product
- a premium interview preparation experience