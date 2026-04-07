"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { googleLogin } from "@/lib/api";

// Extend window for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onError?: (error: string) => void;
}

export default function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  useEffect(() => {
    // Load the Google Identity Services script
    if (document.getElementById("google-gis-script")) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !window.google || !buttonRef.current || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 320,
      logo_alignment: "left",
    });
  }, [scriptLoaded, clientId]);

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) {
      onError?.("Google sign-in failed. No credential received.");
      return;
    }

    setLoading(true);
    try {
      await googleLogin(response.credential);
      router.push("/dashboard");
    } catch (err: any) {
      onError?.(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!clientId || clientId.includes("your-google")) {
    // No client ID configured — show a disabled placeholder
    return (
      <div style={{ textAlign: "center" }}>
        <button
          disabled
          style={{
            width: "100%",
            maxWidth: 320,
            padding: "12px 24px",
            borderRadius: 20,
            border: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            color: "var(--text-muted)",
            fontSize: 14,
            cursor: "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            margin: "0 auto",
            opacity: 0.5,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          Google Sign-In (configure Client ID)
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10, 10, 15, 0.6)",
            borderRadius: 20,
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <div
        ref={buttonRef}
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: 44,
        }}
      />
    </div>
  );
}
