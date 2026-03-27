# VoxHire AI — Tech Stack

## Frontend
### Framework
**Next.js**

## Frontend Design Direction
The frontend should feel:
- premium
- modern
- smooth
- minimal but powerful
- recruiter-dashboard inspired

It should avoid looking like:
- an AI prompt playground
- a basic student dashboard
- a cluttered admin panel

## Frontend UI Suggestions
Use:
- dark modern theme
- glassmorphism / soft card layouts
- animated transitions
- waveform-based voice UI
- clean dashboard panels
- role selection cards
- interview timeline indicators
- score visualizations

## Suggested Frontend Libraries
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui
- React Query / TanStack Query
- Zustand (optional for local state)

---

## Backend
### Runtime
**Node.js**

### Backend Style
- microservice-based
- Dockerized
- modular and scalable

### Suggested Framework
**NestJS** is strongly recommended because it fits microservices better than raw Express.

Alternative:
- Express.js if you want simpler control

Recommended choice:
> **NestJS**

---

## AI Stack

### Speech-to-Text
**Whisper**

Use Whisper for:
- transcribing user voice responses
- extracting text for scoring and analysis

---

### LLM for Question Generation + Evaluation
### Recommended Primary Model
**Gemini**

Why:
- easier developer access
- good free-tier usability
- strong enough for generation and evaluation
- practical for prototype + scalable project

### Fallback / Secondary Model
**DeepSeek**

Why:
- useful as backup
- cost-friendly in many cases
- can later be integrated as alternate provider

### Final Recommendation
Use:
- **Whisper** for transcription
- **Gemini** for generation and evaluation
- **DeepSeek** as optional backup later

---

## Database
### Recommended Choice
**PostgreSQL**

Why:
- easy to integrate
- relational and structured
- scalable
- migration-friendly
- excellent ecosystem support

### ORM / Migration Tool
**Prisma**

Why:
- very clean schema modeling
- easy migrations
- beginner-friendly and production-usable
- good developer experience

### Final Database Recommendation
> **PostgreSQL + Prisma**

This is the best balance between:
- easy development
- clean schema
- future migration safety

---

## Queue / Background Jobs
### Recommended
**Redis + BullMQ**

Use for:
- async audio processing
- report generation
- delayed evaluation tasks
- background AI jobs

---

## Storage
### Recommended
**MinIO** or **local object storage during MVP**

Use for:
- audio files
- generated session artifacts
- downloadable reports

---

## DevOps / Infra
- Docker
- Docker Compose
- Nginx (optional later)
- GitHub Actions (optional later)

---

## Final Recommended Stack Summary

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui

### Backend
- Node.js
- NestJS
- Dockerized Microservices

### AI
- Whisper
- Gemini
- DeepSeek (optional fallback)

### Data / Infra
- PostgreSQL
- Prisma
- Redis
- BullMQ
- MinIO
- Docker Compose