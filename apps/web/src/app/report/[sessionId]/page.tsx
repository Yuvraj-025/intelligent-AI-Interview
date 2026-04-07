"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getReport, generateReport, isAuthenticated } from "@/lib/api";

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    loadReport();
  }, [sessionId]);

  const loadReport = async () => {
    try {
      const res = await getReport(sessionId);
      setReport(res.data);
    } catch {
      // Report might not exist yet — try generating
      await handleGenerateReport();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const res = await generateReport(sessionId);
      setReport(res.data);
    } catch (err: any) {
      setError("Could not generate report: " + (err.message || ""));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading report...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Extract report data
  const finalReport = report?.session?.finalReport || report?.finalReport;
  const session = report?.session || report;
  const topicBreakdown = report?.topicBreakdown || [];
  const overallScore = session?.overallScore || finalReport?.reportJson?.overallScore || 0;
  const strengths = finalReport?.strengthsSummary?.split("\n").filter(Boolean) || [];
  const weaknesses = finalReport?.weaknessSummary?.split("\n").filter(Boolean) || [];
  const suggestions = finalReport?.improvementSuggestions?.split("\n").filter(Boolean) || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: 24 }}>
      <div className="container" style={{ maxWidth: 800, paddingTop: 40 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <Link href="/dashboard" style={{ color: "var(--accent-light)", fontSize: 13, textDecoration: "none" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, letterSpacing: "-0.5px" }}>
            Interview Report
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            {session?.role} • {session?.mode === "RAPID_FIRE" ? "Rapid Fire" : "Normal"} Mode
            {session?.startedAt && ` • ${new Date(session.startedAt).toLocaleDateString()}`}
          </p>
        </motion.div>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--error)", fontSize: 14, marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: 40, textAlign: "center", marginBottom: 24 }}
        >
          <div className="text-gradient" style={{ fontSize: 64, fontWeight: 800 }}>
            {overallScore || "—"}
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Overall Score / 10
          </div>
        </motion.div>

        {/* Topic Breakdown */}
        {topicBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card"
            style={{ padding: 28, marginBottom: 24 }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "var(--voice-accent)" }}>
              📊 Topic Breakdown
            </h3>
            {topicBreakdown.map((t: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < topicBreakdown.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{t.topic}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: "var(--border)" }}>
                    <div style={{ width: `${(t.averageScore / 10) * 100}%`, height: "100%", borderRadius: 3, background: t.averageScore >= 7 ? "var(--success)" : t.averageScore >= 5 ? "var(--warning)" : "var(--error)" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", width: 28, textAlign: "right" }}>
                    {t.averageScore}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Strengths & Weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--success)", marginBottom: 16 }}>✅ Strengths</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {strengths.map((s: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", padding: "8px 0", borderBottom: i < strengths.length - 1 ? "1px solid var(--border)" : "none", lineHeight: 1.5 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--error)", marginBottom: 16 }}>⚠️ Weaknesses</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {weaknesses.map((w: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", padding: "8px 0", borderBottom: i < weaknesses.length - 1 ? "1px solid var(--border)" : "none", lineHeight: 1.5 }}>
                    {w}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}

        {/* Improvement Suggestions */}
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "var(--accent-light)" }}>
              💡 Improvement Suggestions
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {suggestions.map((s: string, i: number) => (
                <li key={i} style={{ fontSize: 14, color: "var(--text-secondary)", padding: "10px 0", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none", lineHeight: 1.5 }}>
                  {i + 1}. {s}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Generate report button if no report yet */}
        {!finalReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginTop: 24 }}>
            <button className="btn-primary" onClick={handleGenerateReport} disabled={generating} style={{ padding: "14px 36px", opacity: generating ? 0.7 : 1 }}>
              {generating ? "Generating Report..." : "Generate AI Report"}
            </button>
          </motion.div>
        )}

        {/* Question-level details */}
        {session?.responses?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "var(--text-secondary)" }}>
              Question-by-Question Breakdown
            </h3>
            {session.questions?.map((q: any, i: number) => {
              const response = session.responses?.find((r: any) => r.questionId === q.id);
              return (
                <div key={q.id} className="glass-card" style={{ padding: 20, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-light)" }}>Q{i + 1}: {q.topic}</span>
                    {response?.score && (
                      <span style={{ fontSize: 14, fontWeight: 700, color: response.score.finalScore >= 7 ? "var(--success)" : response.score.finalScore >= 5 ? "var(--warning)" : "var(--error)" }}>
                        {response.score.finalScore}/10
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.5 }}>
                    {q.questionText}
                  </p>
                  {response && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
                      Your answer: {response.transcript}
                    </p>
                  )}
                  {response?.score?.aiFeedback && (
                    <p style={{ fontSize: 12, color: "var(--voice-accent)", marginTop: 8, lineHeight: 1.5 }}>
                      💬 {response.score.aiFeedback}
                    </p>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
