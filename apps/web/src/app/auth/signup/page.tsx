"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-primary)",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card"
        style={{ padding: 40, width: "100%", maxWidth: 420 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--gradient-accent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 16,
              }}
            >
              🎙️
            </div>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Create Your Account
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Start your interview preparation journey
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "var(--error)",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <div style={{ marginBottom: 24 }}>
          <GoogleSignInButton onError={setError} />
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>or sign up with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <button
            id="signup-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--accent-light)", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
