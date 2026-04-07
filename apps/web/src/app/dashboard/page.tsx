"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSession, getStoredUser, logout, isAuthenticated } from "@/lib/api";

const roles = [
  { id: "SOFTWARE_ENGINEER", label: "Software Engineer", icon: "💻" },
  { id: "FRONTEND_DEVELOPER", label: "Frontend Developer", icon: "🎨" },
  { id: "BACKEND_DEVELOPER", label: "Backend Developer", icon: "⚙️" },
  { id: "DATA_ANALYST", label: "Data Analyst", icon: "📊" },
  { id: "DATA_SCIENTIST", label: "Data Scientist", icon: "🔬" },
  { id: "ML_ENGINEER", label: "ML Engineer", icon: "🤖" },
  { id: "HR_BEHAVIORAL", label: "HR / Behavioral", icon: "🤝" },
  { id: "CLOUD_DEVOPS", label: "Cloud / DevOps", icon: "☁️" },
];

const difficulties = [
  { id: "EASY", label: "Easy", color: "#22c55e" },
  { id: "MEDIUM", label: "Medium", color: "#eab308" },
  { id: "HARD", label: "Hard", color: "#ef4444" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    setUser(getStoredUser());
  }, [router]);

  const handleStartInterview = async () => {
    if (!selectedRole || !selectedMode) {
      setError("Please select a role and interview mode.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await createSession(selectedRole, selectedMode, selectedDifficulty);
      const sessionId = res.data.session.id;
      router.push(`/interview/${sessionId}`);
    } catch (err: any) {
      setError(err.message || "Failed to start interview. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Top bar */}
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          <span style={{ fontSize: 18, fontWeight: 700 }}>
            <span className="text-gradient">Vox</span>Hire AI
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link
            href="/history"
            style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}
          >
            Session History
          </Link>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accent-subtle)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--accent-light)",
            }}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </header>

      <div className="container" style={{ padding: "48px 24px" }}>
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48 }}
        >
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-1px",
              marginBottom: 8,
            }}
          >
            Hi {user?.name?.split(" ")[0] || "there"}, ready to practice?
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Select a role, mode, and difficulty to begin your session.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "var(--error)",
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 40 }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text-secondary)",
            }}
          >
            1. Choose Your Role
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {roles.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  padding: 18,
                  cursor: "pointer",
                  textAlign: "left",
                  background:
                    selectedRole === role.id
                      ? "var(--accent-subtle)"
                      : "var(--bg-card)",
                  border: `2px solid ${
                    selectedRole === role.id
                      ? "var(--accent)"
                      : "var(--border)"
                  }`,
                  borderRadius: 12,
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{role.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{role.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ marginBottom: 40 }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text-secondary)",
            }}
          >
            2. Interview Mode
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              maxWidth: 500,
            }}
          >
            {[
              {
                id: "NORMAL",
                icon: "🎯",
                label: "Normal Mode",
                desc: "7 questions, realistic pacing, follow-ups",
              },
              {
                id: "RAPID_FIRE",
                icon: "⚡",
                label: "Rapid Fire",
                desc: "10 questions, timed, fast-paced",
              },
            ].map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMode(mode.id)}
                style={{
                  padding: 24,
                  cursor: "pointer",
                  textAlign: "left",
                  background:
                    selectedMode === mode.id
                      ? "var(--accent-subtle)"
                      : "var(--bg-card)",
                  border: `2px solid ${
                    selectedMode === mode.id
                      ? "var(--accent)"
                      : "var(--border)"
                  }`,
                  borderRadius: 12,
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>
                  {mode.icon}
                </div>
                <div
                  style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}
                >
                  {mode.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.4,
                  }}
                >
                  {mode.desc}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 48 }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: "var(--text-secondary)",
            }}
          >
            3. Difficulty
          </h2>
          <div style={{ display: "flex", gap: 10 }}>
            {difficulties.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: `2px solid ${
                    selectedDifficulty === d.id ? d.color : "var(--border)"
                  }`,
                  background:
                    selectedDifficulty === d.id
                      ? `${d.color}15`
                      : "var(--bg-card)",
                  color:
                    selectedDifficulty === d.id
                      ? d.color
                      : "var(--text-secondary)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={handleStartInterview}
            className="btn-primary"
            disabled={loading || !selectedRole || !selectedMode}
            style={{
              padding: "16px 48px",
              fontSize: 16,
              opacity: loading || !selectedRole || !selectedMode ? 0.5 : 1,
              cursor:
                loading || !selectedRole || !selectedMode
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Starting Interview..." : "Start Interview →"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
