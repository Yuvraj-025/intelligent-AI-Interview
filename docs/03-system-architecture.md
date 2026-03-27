# VoxHire AI — System Architecture

## Architecture Style
The backend must use a **Dockerized microservice-based architecture**.

The system should be modular and production-style rather than monolithic.

---

## High-Level Architecture

### Frontend
- Next.js web application
- modern interview dashboard UI
- real-time session screens
- voice playback and recording UI
- performance report UI

### Backend
Node.js microservices responsible for:
- auth
- interview orchestration
- voice processing
- scoring
- analytics
- storage

### AI Layer
Responsible for:
- speech-to-text
- question generation
- answer evaluation
- report generation

### Database Layer
Responsible for:
- user data
- interview sessions
- transcripts
- scores
- reports
- analytics

---

## Services Breakdown

### 1. API Gateway
Acts as the main entry point for frontend requests.

Responsibilities:
- request routing
- auth middleware
- rate limiting
- aggregation of service responses

---

### 2. Auth Service
Handles:
- signup
- login
- session tokens
- user profile basics

---

### 3. Interview Orchestrator Service
This is the core system controller.

Responsibilities:
- start interview sessions
- choose next question
- manage mode logic
- handle timing
- control interview progression

This is the most important service in the platform.

---

### 4. Voice Service
Handles all voice-related functionality.

Responsibilities:
- voice generation for questions
- receiving user voice input
- sending audio to Whisper
- returning transcript output

---

### 5. Scoring Service
Evaluates each user response.

Responsibilities:
- semantic correctness scoring
- filler word detection
- hesitation scoring
- communication scoring
- confidence indicators
- timing-based scoring

---

### 6. Analytics / Report Service
Responsible for post-session intelligence.

Responsibilities:
- weakness mapping
- strengths detection
- session summary generation
- trend reports
- final interview readiness output

---

### 7. Storage Service
Responsible for managing:
- audio files
- generated reports
- transcript files
- session artifacts

---

## Suggested Request Flow

1. User starts interview session
2. Interview Orchestrator creates session state
3. AI generates first question
4. Voice Service converts question to spoken audio
5. Frontend plays question
6. User answers using microphone
7. Voice Service sends audio to Whisper
8. Transcript is returned
9. Scoring Service evaluates transcript
10. Interview Orchestrator selects next question
11. Loop continues until interview ends
12. Analytics Service generates final report

---

## Suggested Architecture Diagram (Conceptual)

Frontend (Next.js)
↓
API Gateway
↓
---------------------------------------------------
| Auth Service | Interview Orchestrator | Voice Service |
| Scoring Service | Analytics Service | Storage Service |
---------------------------------------------------
↓
Database + Object Storage + AI APIs

---

## Architecture Goals
The architecture should prioritize:
- modularity
- clean separation of concerns
- easy debugging
- future scalability
- easier migration and maintenance