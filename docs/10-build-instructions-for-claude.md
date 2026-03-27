# VoxHire AI — Build Instructions for Claude

## Purpose
This file gives implementation instructions to Claude (or any coding LLM) for building the project correctly.

The goal is to ensure the generated code follows the intended architecture and does not become messy, generic, or “AI slop”.

---

## Important Build Expectations

### 1. Build This as a Real Product
Do not build this as:
- a toy chatbot
- a random prompt playground
- a generic dashboard CRUD app

Build this as:
- a polished voice-first interview simulation platform
- a premium modern web application
- a cleanly structured engineering project

---

### 2. Frontend Expectations
Frontend must use:
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **shadcn/ui**

Frontend should feel:
- sleek
- premium
- dark modern
- smooth and animated
- interview-product oriented

Frontend should include:
- landing page
- auth screens
- dashboard
- interview room UI
- report page
- session history page

Avoid:
- ugly admin-style layouts
- excessive clutter
- random AI-generated generic components
- poor spacing or weak visual hierarchy

---

### 3. Backend Expectations
Backend must use:
- **Node.js**
- preferably **NestJS**
- **Dockerized microservices**

Services should be separated cleanly.

Required services:
- API Gateway
- Auth Service
- Interview Orchestrator Service
- Voice Service
- Scoring Service
- Analytics Service
- Storage Service

Do not create a giant monolithic backend.

---

### 4. AI Integration Expectations
Use:
- **Whisper** for transcription
- **Gemini** for question generation and evaluation
- optionally structure the code so **DeepSeek** can be added later as fallback

The AI should be abstracted behind service interfaces so it can be swapped later.

Do not hardcode AI provider logic everywhere.

---

### 5. Database Expectations
Use:
- **PostgreSQL**
- **Prisma**

Keep schema clean and scalable.

Include migrations and seed setup where useful.

---

### 6. Project Quality Rules
The generated code must prioritize:
- readability
- modularity
- maintainability
- future scalability
- good folder structure
- reusable components
- proper environment variable handling

---

### 7. MVP Build Priority
First build the MVP only.

Must-have MVP:
- auth
- mode selection
- voice-based interview flow
- question generation
- answer transcription
- answer evaluation
- adaptive next-question logic
- final report

Do not overbuild phase-2 features too early.

---

### 8. Code Generation Instructions
When generating code:
- generate production-style structure
- avoid fake placeholder architecture
- avoid bloated unnecessary files
- keep components modular
- keep services clean
- use environment variables correctly
- include Docker setup
- include README instructions

---

### 9. Development Workflow Request
Claude should help build this in this order:

1. project structure
2. frontend shell
3. backend microservice skeleton
4. database schema
5. interview session flow
6. voice integration
7. AI integration
8. scoring logic
9. report generation
10. polishing

---

### 10. Important Final Rule
Every implementation decision should support this product identity:

> **VoxHire AI is a polished, voice-first, adaptive interview simulation platform — not just an AI chatbot app.**