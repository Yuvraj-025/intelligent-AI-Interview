# VoxHire AI — AI Behavior and Flow

## AI Responsibilities
The AI layer should perform the following tasks:

1. Generate interview questions
2. Adapt the next question based on previous answers
3. Evaluate answer quality
4. Analyze communication quality
5. Generate post-interview reports

---

## AI Workflow

### Step 1 — Interview Initialization
Inputs:
- selected role
- selected interview mode
- optional resume
- optional difficulty level

The AI should generate an interview path based on this context.

---

### Step 2 — Question Generation
The AI generates a suitable interview question based on:
- role
- topic
- difficulty
- previous answers
- interview mode

---

### Step 3 — Voice Output
The generated question is converted into spoken audio and played to the user.

---

### Step 4 — User Response Capture
The user responds by speaking.

The response audio is recorded.

---

### Step 5 — Speech-to-Text
Whisper transcribes the response audio into text.

---

### Step 6 — Answer Evaluation
The AI evaluates:
- correctness
- topic relevance
- answer completeness
- conceptual depth

---

### Step 7 — Communication Evaluation
The system also evaluates:
- filler words
- hesitation
- response pacing
- structure
- confidence indicators

---

### Step 8 — Adaptive Next Question Selection
The next question should be selected based on:
- weak areas
- previous score
- confidence level
- interview mode logic

---

## Normal Mode AI Behavior
In Normal Mode, the AI should:
- ask more realistic recruiter-style questions
- allow follow-up questions
- probe deeper into answers
- test understanding progressively

---

## Rapid Fire Mode AI Behavior
In Rapid Fire Mode, the AI should:
- ask shorter questions
- avoid long follow-up chains
- prioritize quick thinking
- keep high pacing
- enforce time pressure

---

## AI Evaluation Dimensions

### Semantic Evaluation
Checks:
- correctness
- concept understanding
- topic relevance
- explanation quality

### Communication Evaluation
Checks:
- speaking clarity
- filler density
- hesitation
- confidence proxy
- pace and structure

### Adaptive Evaluation
Checks:
- whether user is improving
- whether same weakness repeats
- whether topic should be revisited

---

## Important AI Rule
The AI should behave like an interviewer, not a tutor.

It should not:
- teach during the session
- reveal expected answers
- give direct hints before answer submission

It should:
- assess
- challenge
- adapt
- summarize

---

## Post-Session AI Output
At the end of a session, the AI should generate:
- overall feedback
- strengths summary
- weakness map
- suggested improvement path