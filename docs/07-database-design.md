# VoxHire AI — Database Design

## Recommended Database
**PostgreSQL**

## ORM
**Prisma**

---

## Core Entities

### 1. User
Stores user profile information.

Suggested fields:
- id
- name
- email
- password_hash
- created_at
- updated_at

---

### 2. InterviewSession
Stores each interview session.

Suggested fields:
- id
- user_id
- mode
- role
- difficulty
- started_at
- ended_at
- overall_score
- summary_status

---

### 3. Question
Stores generated questions for a session.

Suggested fields:
- id
- session_id
- question_text
- topic
- difficulty
- order_index
- question_type
- generated_by

---

### 4. Response
Stores user responses to each question.

Suggested fields:
- id
- question_id
- session_id
- transcript
- audio_url
- duration_seconds
- submitted_at

---

### 5. Score
Stores response evaluation.

Suggested fields:
- id
- response_id
- semantic_score
- clarity_score
- confidence_score
- hesitation_score
- filler_score
- final_score
- ai_feedback

---

### 6. WeaknessTag
Stores detected weakness areas.

Suggested fields:
- id
- session_id
- topic
- weakness_type
- severity

Examples:
- DSA
- Communication
- Confidence
- Time Pressure
- Filler Overuse

---

### 7. FinalReport
Stores session summary.

Suggested fields:
- id
- session_id
- strengths_summary
- weakness_summary
- improvement_suggestions
- report_json
- created_at

---

## Suggested Relationships

- One User → Many InterviewSessions
- One InterviewSession → Many Questions
- One InterviewSession → Many Responses
- One Response → One Score
- One InterviewSession → Many WeaknessTags
- One InterviewSession → One FinalReport

---

## Migration Philosophy
Keep the schema simple in MVP.

Do not over-normalize early.

The schema should prioritize:
- clarity
- easy development
- easy migrations
- report generation support

---

## Future Additions
Later you can add:
- resume table
- role templates
- interview templates
- company-specific interview sets
- session replay metadata