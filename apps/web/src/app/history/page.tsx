"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserSessions, getStoredUser, isAuthenticated } from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const user = getStoredUser();
      if (user?.id) {
        const res = await getUserSessions(user.id);
        setSessions(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "var(--success)";
      case "IN_PROGRESS": return "var(--warning)";
      case "ABANDONED": return "var(--error)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: 24 }}>
      <div className="container" style={{ maxWidth: 800, paddingTop: 40 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <Link href="/dashboard" style={{ color: "var(--accent-light)", fontSize: 13, textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, letterSpacing: "-0.5px" }}>
            Session History
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            {sessions.length} {sessions.length === 1 ? "session" : "sessions"} total
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "var(--text-secondary)" }}>Loading sessions...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No sessions yet</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
              Start your first interview practice session!
            </p>
            <Link href="/dashboard">
              <button className="btn-primary" style={{ padding: "12px 32px" }}>
                Start Interview →
              </button>
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/report/${session.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    className="glass-card"
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>
                          {session.role?.replace(/_/g, " ")}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: `${statusColor(session.status)}20`,
                            color: statusColor(session.status),
                            fontWeight: 600,
                          }}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        {session.mode === "RAPID_FIRE" ? "⚡ Rapid Fire" : "🎯 Normal"} •{" "}
                        {session.difficulty} •{" "}
                        {session.startedAt ? formatDate(session.startedAt) : "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="text-gradient" style={{ fontSize: 22, fontWeight: 700 }}>
                        {session.overallScore ?? "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/ 10</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
