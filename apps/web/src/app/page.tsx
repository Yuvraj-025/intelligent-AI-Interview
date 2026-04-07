"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: "🎙️",
    title: "Voice-First Interviews",
    description:
      "Questions are asked through natural AI-generated speech. Answer by speaking — just like a real interview.",
  },
  {
    icon: "🧠",
    title: "Adaptive Questioning",
    description:
      "Every question adapts based on your previous answers, targeting weak areas and adjusting difficulty.",
  },
  {
    icon: "⚡",
    title: "Rapid Fire Mode",
    description:
      "Test your speed and composure under pressure with timed questions and fast-paced transitions.",
  },
  {
    icon: "📊",
    title: "Weakness Mapping",
    description:
      "AI-powered analysis identifies your weak spots across topics, communication, and confidence.",
  },
  {
    icon: "📝",
    title: "Structured Reports",
    description:
      "Receive detailed post-interview reports with scores, strengths, weaknesses, and improvement plans.",
  },
  {
    icon: "🎯",
    title: "Role-Specific Prep",
    description:
      "Prepare for SDE, Frontend, Backend, Data Science, ML, HR, and DevOps interviews.",
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* ─── Navigation ─────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "16px 24px",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--gradient-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🎙️
            </div>
            <span
              style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}
            >
              <span className="text-gradient">Smart Ai</span> Interviewer
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/auth/login">
              <button className="btn-secondary" style={{ padding: "8px 20px", fontSize: 14 }}>
                Log In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────── */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 100,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 600,
            height: 600,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          className="container"
          initial="hidden"
          animate="visible"
          style={{ position: "relative", zIndex: 1 }}
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: "var(--accent-subtle)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--accent-light)",
              marginBottom: 24,
            }}
          >
            ✨ AI-Powered Voice Interview Simulation
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            style={{
              fontSize: "clamp(36px, 5vw, 72px)",
              fontWeight: 800,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              maxWidth: 800,
              margin: "0 auto 24px",
            }}
          >
            Prepare Like You&apos;re{" "}
            <span className="text-gradient">Already There</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              maxWidth: 600,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Smart Ai Interviewer simulates real interviews with adaptive voice-based
            questioning, real-time evaluation, and structured weakness mapping —
            so you walk in ready.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            style={{ display: "flex", gap: 16, justifyContent: "center" }}
          >
            <Link href="/auth/signup">
              <button className="btn-primary" style={{ padding: "14px 36px" }}>
                Start Practicing →
              </button>
            </Link>
            <button className="btn-secondary" style={{ padding: "14px 36px" }}>
              Watch Demo
            </button>
          </motion.div>

          {/* Voice waveform animation */}
          <motion.div
            custom={4}
            variants={fadeUp}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              marginTop: 60,
              height: 60,
              alignItems: "center",
            }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 3,
                  height: "100%",
                  background: `linear-gradient(to top, var(--accent), var(--voice-accent))`,
                  borderRadius: 2,
                  animation: `wave 1.2s ease-in-out ${i * 0.05}s infinite`,
                  opacity: 0.6 + Math.sin(i * 0.5) * 0.4,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Features Section ───────────────────────── */}
      <section className="section-padding">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <h2
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-1px",
                marginBottom: 16,
              }}
            >
              Designed to Make You{" "}
              <span className="text-gradient">Interview-Ready</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 16,
                maxWidth: 500,
                margin: "0 auto",
              }}
            >
              Every feature is built to simulate the real pressure and flow of
              professional interviews.
            </p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{ padding: 32 }}
              >
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 16,
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    background: "var(--accent-subtle)",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 8,
                    letterSpacing: "-0.3px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────── */}
      <section className="section-padding" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-1px",
              textAlign: "center",
              marginBottom: 64,
            }}
          >
            How <span className="text-gradient">Smart Ai Interviewer</span> Works
          </motion.h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 32,
              maxWidth: 1000,
              margin: "0 auto",
            }}
          >
            {[
              { step: "01", title: "Select Role & Mode", desc: "Choose your target role and interview style" },
              { step: "02", title: "Listen to Questions", desc: "AI interviewer asks questions via voice" },
              { step: "03", title: "Answer by Speaking", desc: "Respond naturally using your microphone" },
              { step: "04", title: "Get Evaluated", desc: "AI scores your answer in real-time" },
              { step: "05", title: "View Your Report", desc: "Detailed strengths, weaknesses & insights" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ textAlign: "center" }}
              >
                <div
                  className="text-gradient"
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    marginBottom: 12,
                    opacity: 0.8,
                  }}
                >
                  {item.step}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────── */}
      <section
        className="section-padding"
        style={{ textAlign: "center", position: "relative" }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: 500,
            height: 500,
            transform: "translateX(-50%)",
            background: "radial-gradient(circle, var(--voice-glow) 0%, transparent 70%)",
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container"
          style={{ position: "relative", zIndex: 1 }}
        >
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-1.5px",
              marginBottom: 16,
            }}
          >
            Ready to Ace Your{" "}
            <span className="text-gradient">Next Interview</span>?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 16,
              marginBottom: 32,
              maxWidth: 450,
              margin: "0 auto 32px",
            }}
          >
            Start practicing with AI-powered voice interviews. No credit card
            needed.
          </p>
          <Link href="/auth/signup">
            <button
              className="btn-primary"
              style={{ padding: "16px 40px", fontSize: 17 }}
            >
              Get Started for Free →
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─────────────────────────────────── */}
      <footer
        style={{
          padding: "32px 24px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          © {new Date().getFullYear()} Smart Ai Interviewer. Built for interview excellence.
        </p>
      </footer>
    </div>
  );
}
