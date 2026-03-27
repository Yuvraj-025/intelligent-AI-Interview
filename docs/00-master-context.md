# VoxHire AI — Master Context

## Purpose of This File
This file is the **single source of truth** for the entire project.

Any coding assistant, AI model, or contributor working on this project must treat this file as the highest-level product and engineering context.

This file defines:
- what the product is
- what the product is not
- how the system should feel
- how the system should be built
- what rules are non-negotiable
- how implementation decisions should be made

This project must remain aligned with this document throughout development.

---

# 1. Product Identity

## Project Name
**VoxHire AI**

## Tagline
**Adaptive Voice-Based Interview Simulation & Weakness Mapping Platform**

## One-Line Product Definition
VoxHire AI is a **voice-first interview simulation platform** that asks users interview questions using generated speech, listens to spoken answers, evaluates performance, adapts future questions, and generates structured interview feedback.

## Product Positioning
This is **not** a generic chatbot project.

This is a:
- polished interview simulation product
- recruiter-style voice assessment platform
- structured AI interview engine
- modern, premium-feeling web product

## Core Product Promise
The system should simulate a realistic and intelligent interview experience by combining:
- voice-based questioning
- voice-based answering
- AI evaluation
- adaptive questioning
- structured post-session reporting

---

# 2. What This Product Is NOT

The product must **not** become any of the following:

- a random “AI prompt app”
- a generic LLM wrapper
- a plain chatbot with speech added
- a cluttered admin dashboard
- a college CRUD project with AI APIs glued on top
- a shallow question-answer toy

If implementation starts drifting toward those patterns, it must be corrected.

---

# 3. Product Experience Philosophy

The product should feel like:

- a modern interview cockpit
- a recruiter simulation studio
- a premium assessment platform
- a polished and intentional software product

The user experience should communicate:
- seriousness
- confidence
- clarity
- speed
- intelligence
- realism

## UX Keywords
Use these as directional references:
- sleek
- modern
- premium
- focused
- responsive
- immersive
- voice-first
- smooth
- structured

---

# 4. Core Interaction Model

The primary user interaction loop is:

1. The system asks a question using generated voice
2. The user responds by speaking
3. The system transcribes the answer
4. The system evaluates the answer
5. The system adapts the next question
6. The system generates a final report

This loop is the heart of the platform and must remain the central design principle.

---

# 5. Non-Negotiable Product Features

The following are mandatory product behaviors.

## 5.1 Voice-First Interviewing
The interviewer must ask questions using generated voice.

The candidate should primarily respond using voice input.

Text fallback can exist later, but the main experience is voice-first.

---

## 5.2 Multiple Interview Modes
The platform must support at least:

### Normal Interview Mode
- realistic pacing
- deeper questions
- conversational flow
- follow-up questions allowed

### Rapid Fire Mode
- short direct questions
- timer-based answering
- fast transitions
- pressure simulation

---

## 5.3 Adaptive Interview Flow
The next question must depend on prior user performance.

Question progression should consider:
- correctness
- confidence
- hesitation
- topic weakness
- answer quality
- interview mode

The system must not feel random.

---

## 5.4 Structured Final Report
Every session must end with:
- overall score
- strengths
- weaknesses
- communication analysis
- improvement suggestions

---

## 5.5 Real Product Quality
This must be built as a serious software product with:
- good UX
- modular backend
- clean architecture
- scalable structure
- maintainable code

---

# 6. Core Product Differentiator

The unique value of VoxHire AI is not simply:
> “AI asks interview questions”

The unique value is:

> **A voice-based adaptive interview engine that evaluates responses in real time and maps user weaknesses to drive future question flow.**

That is the core identity of the system.

All technical and UX decisions should strengthen this differentiator.

---

# 7. Target Users

Primary users include:
- students preparing for placements
- freshers preparing for interviews
- developers preparing for technical rounds
- users preparing for HR rounds
- candidates practicing under pressure

The product should feel useful to real job-seeking users, not just to project evaluators.

---

# 8. Product Behavior Rules

## 8.1 The AI Must Behave Like an Interviewer
The AI should behave like:
- a recruiter
- an evaluator
- an interviewer
- a challenge-driven assessment engine

It should **not** behave like:
- a tutor during the interview
- a teaching assistant
- a casual chatbot
- a spoon-feeding helper

---

## 8.2 No Answer Leakage
Before the user answers, the system must not reveal:
- expected answers
- hints
- direct solution clues
- answer structures

The interview must remain authentic.

---

## 8.3 Mode-Specific Personality
### Normal Mode
Should feel:
- realistic
- professional
- measured
- recruiter-like

### Rapid Fire Mode
Should feel:
- intense
- fast
- challenging
- pressure-oriented

---

## 8.4 Adaptive Logic Must Be Visible in Behavior
Even if the internal scoring logic is simple at first, the system should clearly feel adaptive.

The user should sense:
- “it is reacting to my performance”
- “it is testing my weak areas”
- “it is adjusting difficulty”

That perception matters.

---

# 9. Frontend Design Direction

## Frontend Framework
**Next.js**

## Frontend Identity
The frontend must look and feel like a polished product.

It should avoid:
- generic AI website templates
- bloated layouts
- cluttered dashboards
- weak visual hierarchy
- “AI slop” UI patterns

## Desired Frontend Feel
The UI should feel like:
- a premium SaaS product
- a modern interview platform
- a sleek assessment environment

## Design Language Suggestions
Use:
- dark modern theme
- glassy cards / soft surfaces
- smooth transitions
- subtle motion
- waveform-based voice UI
- clean typography
- spacious layout
- high-quality interaction states

## Pages Expected
At minimum, frontend should support:
- landing page
- authentication screens
- dashboard
- interview room
- report page
- session history page

---

# 10. Backend Engineering Direction

## Backend Runtime
**Node.js**

## Backend Architecture
The backend must use a **Dockerized microservice-based architecture**.

This project must not be implemented as one giant monolith if avoidable.

## Recommended Backend Framework
**NestJS** is preferred because it is cleaner for scalable Node.js service architecture.

If another framework is used, the architecture quality must still remain high.

## Required Backend Services
The architecture should include:

- API Gateway
- Auth Service
- Interview Orchestrator Service
- Voice Service
- Scoring Service
- Analytics Service
- Storage Service

These services may start lightweight but should remain structurally separated.

---

# 11. AI Stack Direction

## Speech-to-Text
Use **Whisper** for:
- transcribing user answers
- producing text for scoring and evaluation

## LLM / Reasoning Layer
Use **Gemini** as the primary model for:
- question generation
- answer evaluation
- report generation

## Optional Secondary Provider
Structure the AI layer so **DeepSeek** can be integrated later as fallback or alternate provider.

## Important AI Architecture Rule
AI provider logic must be abstracted cleanly.

Do not hardcode provider-specific logic everywhere.

The code should allow future model/provider swaps.

---

# 12. Database Direction

## Recommended Database
**PostgreSQL**

## ORM / Migrations
**Prisma**

## Database Philosophy
The schema should be:
- clean
- relational
- migration-friendly
- scalable
- easy to understand

The database should support:
- sessions
- questions
- responses
- scores
- reports
- weakness mapping

---

# 13. Supporting Infrastructure

Recommended support stack:

- **Redis** for queues/caching
- **BullMQ** for background jobs
- **MinIO** or local object storage for audio and artifacts
- **Docker Compose** for local orchestration

These should be used where helpful, not added just for complexity.

---

# 14. Implementation Priorities

The build should happen in this order:

## Phase 1 — Foundation
- repo structure
- frontend shell
- backend service skeleton
- shared packages
- Docker setup
- database schema

## Phase 2 — Core Interview Loop
- auth
- interview session creation
- mode selection
- question generation
- voice output
- voice input capture
- transcription
- evaluation
- adaptive next-question logic

## Phase 3 — Reporting
- score aggregation
- weakness mapping
- final report generation
- session history

## Phase 4 — Polish
- UI refinement
- smoother flows
- error handling
- loading states
- edge cases
- deployment readiness

---

# 15. MVP Scope Rules

## MVP Must Include
- user authentication
- interview mode selection
- voice-based questioning
- voice-based answering
- Whisper transcription
- AI evaluation
- adaptive question progression
- final report

## MVP Should Avoid Overbuilding
Do **not** prematurely add:
- facial emotion detection
- recruiter admin portals
- multiplayer live interviewing
- company dashboards
- heavy analytics platforms
- unnecessary AI complexity

The MVP must focus on the core product loop.

---

# 16. Code Quality Rules

Any generated or written code must follow these principles:

- modular
- readable
- maintainable
- production-leaning
- properly structured
- environment-variable driven
- reusable where reasonable
- not over-engineered
- not under-architected

Avoid:
- fake architecture with empty services
- bloated boilerplate without real use
- unnecessary abstraction too early
- duplicated provider logic
- random helper sprawl

---

# 17. Frontend Build Rules for AI Coding Assistants

When generating frontend code:

## Must Use
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui

## Must Prioritize
- premium visual quality
- spacing and hierarchy
- smooth interaction
- polished interview flow
- component consistency

## Must Avoid
- generic landing page clichés
- low-quality AI-generated sections
- weak typography
- cluttered dashboards
- excessive cards with no structure

---

# 18. Backend Build Rules for AI Coding Assistants

When generating backend code:

## Must Use
- Node.js
- microservice structure
- Dockerized services

## Recommended
- NestJS
- Prisma
- PostgreSQL
- Redis
- BullMQ

## Must Prioritize
- service separation
- clean API contracts
- event/task handling where useful
- maintainability
- scalability

## Must Avoid
- giant monolithic file structures
- business logic scattered across controllers
- tightly coupled AI provider code
- poor env/config handling

---

# 19. AI Behavior Rules for Coding Assistants

When implementing AI logic:

## The AI should:
- ask realistic interview questions
- evaluate answers fairly
- adapt future questions
- generate useful reports

## The AI should not:
- act like a tutor mid-session
- reveal answer hints before submission
- become overly conversational or casual
- break interview realism

The product must preserve interview authenticity.

---

# 20. Long-Term Vision

VoxHire AI should be capable of evolving into:

- a placement preparation platform
- a technical interview simulator
- a recruiter-style voice assessment system
- a structured interview intelligence product

Future directions may include:
- resume-aware interviewing
- job-description-aware interviewing
- company-specific interview modes
- performance tracking over time
- institution / recruiter analytics
- patent-oriented adaptive interview intelligence

---

# 21. Final Project Principle

Whenever there is uncertainty about design, architecture, or implementation direction, fall back to this principle:

> **VoxHire AI must feel like a polished, adaptive, voice-first interview simulation product — not a generic AI app.**

All decisions should strengthen that identity.