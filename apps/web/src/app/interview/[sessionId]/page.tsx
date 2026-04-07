"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  getSession,
  submitAnswer,
  completeSession,
  synthesizeSpeech,
  isAuthenticated,
} from "@/lib/api";

type InterviewPhase = "loading" | "listening" | "recording" | "processing" | "completed";

/** Extend window type for SpeechRecognition (browser Speech API) */
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export default function InterviewRoomPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  // ── Voice recorder hook (waveform + MediaRecorder) ──
  const [isRecording, setIsRecording] = useState(false);
  const [analyserData, setAnalyserData] = useState<Uint8Array | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const [phase, setPhase] = useState<InterviewPhase>("loading");
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(7);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [error, setError] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const liveTranscriptRef = useRef("");
  // Refs to avoid stale closures in frozen useCallback handlers
  const currentQuestionRef = useRef<any>(null);
  const sessionIdRef = useRef<string>("");
  const processAnswerRef = useRef<(transcript: string) => void>(() => {});

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/login");
    }
  }, [router]);

  // Keep refs in sync with latest state so frozen callbacks always have fresh values
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Load session data
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await getSession(sessionId);
        const data = res.data;
        setSession(data);

        const mode = data.mode;
        setTotalQuestions(mode === "RAPID_FIRE" ? 10 : 7);

        // Find the latest unanswered question
        const questions = data.questions || [];
        const responses = data.responses || [];
        const answeredIds = new Set(responses.map((r: any) => r.questionId));
        const unanswered = questions.find((q: any) => !answeredIds.has(q.id));

        if (unanswered) {
          setCurrentQuestion(unanswered);
          currentQuestionRef.current = unanswered;
          setQuestionIndex(unanswered.orderIndex);
          setPhase("listening");
          playQuestionAudio(unanswered.questionText, data.mode);
        } else if (data.status === "COMPLETED") {
          setPhase("completed");
        }
      } catch (err: any) {
        setError("Failed to load session. " + (err.message || ""));
      }
    }
    if (sessionId) loadSession();
  }, [sessionId]);

  // Play question using TTS
  const playQuestionAudio = async (text: string, mode?: string) => {
    setIsPlayingAudio(true);

    const startRecordingPhase = (interviewMode?: string) => {
      setIsPlayingAudio(false);
      setPhase("recording");
      if (interviewMode === "RAPID_FIRE") {
        setTimer(60);
        timerIntervalRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev !== null && prev <= 1) {
              handleStopRecording();
              if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
              return 0;
            }
            return prev !== null ? prev - 1 : null;
          });
        }, 1000);
      }
    };

    try {
      const res = await synthesizeSpeech(text);
      const audioBase64 = res.data.audio;
      const audioSrc = `data:audio/mp3;base64,${audioBase64}`;

      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.onended = () => startRecordingPhase(mode);
      audio.onerror = () => {
        // Fallback: browser speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.onend = () => startRecordingPhase(mode);
        window.speechSynthesis.speak(utterance);
      };

      // Safety: if audio never fires, transition after 15s max
      const safetyTimer = setTimeout(() => startRecordingPhase(mode), 15000);
      audio.onended = () => { clearTimeout(safetyTimer); startRecordingPhase(mode); };

      await audio.play();
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => startRecordingPhase(mode);
      utterance.onerror = () => startRecordingPhase(mode);
      window.speechSynthesis.speak(utterance);
    }
  };


  // ── Recording handlers using Web Speech API + MediaRecorder waveform ──

  const updateAnalyser = useCallback(() => {
    if (analyserRef.current) {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      setAnalyserData(new Uint8Array(data));
    }
    animationRef.current = requestAnimationFrame(updateAnalyser);
  }, []);

  const handleStartRecording = useCallback(async () => {
    setTranscript("");
    setLiveTranscript("");
    liveTranscriptRef.current = "";
    setEvaluation(null);
    setMicError(null);
    recordingStartTimeRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // Waveform analyser
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;
      updateAnalyser();

      // Web Speech API for live transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += t + " ";
            } else {
              interim = t;
            }
          }
          if (final) {
            liveTranscriptRef.current += final;
          }
          setLiveTranscript(liveTranscriptRef.current + interim);
        };

        recognition.onerror = () => { /* silent */ };
        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);
    } catch (err: any) {
      setMicError("Microphone access denied. Please allow microphone access.");
    }
  }, [updateAnalyser]);

  const handleStopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      setTimer(null);
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setAnalyserData(null);
    setIsRecording(false);

    // Always use the ref — avoids stale closure grabbing null currentQuestion
    const finalTranscript = liveTranscriptRef.current.trim() || "(no speech detected)";
    setTranscript(finalTranscript);
    // Call via ref so we always get the latest processAnswer (which reads currentQuestionRef)
    processAnswerRef.current(finalTranscript);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const processAnswer = async (transcriptText: string) => {
    const question = currentQuestionRef.current;    // ← always fresh, never stale
    const sid = sessionIdRef.current;

    if (!question) {
      setError("No active question found. Please reload the page.");
      return;
    }

    setPhase("processing");
    const durationSeconds = (Date.now() - recordingStartTimeRef.current) / 1000;

    try {
      // Submit answer — backend evaluates clarity, confidence, hesitation via Gemini
      // and returns adaptive next question based on weaknesses found
      const res = await submitAnswer(
        sid,
        question.id,
        transcriptText || "(no response)",
        undefined,
        durationSeconds,
      );

      const result = res.data;
      setEvaluation(result.evaluation);

      if (result.completed) {
        // All questions answered
        setTimeout(() => setPhase("completed"), 2500);
      } else if (result.nextQuestion) {
        // Adaptive next question (chosen by Gemini based on this answer's weak areas)
        setTimeout(() => {
          setCurrentQuestion(result.nextQuestion);
          currentQuestionRef.current = result.nextQuestion;
          setQuestionIndex(result.nextQuestion.orderIndex);
          setTranscript("");
          setLiveTranscript("");
          liveTranscriptRef.current = "";
          setEvaluation(null);
          setPhase("listening");
          playQuestionAudio(result.nextQuestion.questionText, result.nextQuestion.mode || session?.mode);
        }, 3000);
      }
    } catch (err: any) {
      setError("Failed to process answer: " + (err.message || "Unknown error"));
      setPhase("recording");
    }
  };

  // Keep processAnswerRef updated every render so the frozen handleStopRecording
  // always invokes the current closure (which has up-to-date refs)
  processAnswerRef.current = processAnswer;


  // End session early
  const handleEndSession = async () => {
    try {
      await completeSession(sessionId);
      setPhase("completed");
    } catch {
      router.push(`/report/${sessionId}`);
    }
  };

  if (phase === "completed") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", maxWidth: 500 }}
        >
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Interview Complete!
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Your responses have been evaluated. View your detailed report to see
            strengths, weaknesses, and improvement suggestions.
          </p>
          <button
            className="btn-primary"
            onClick={() => router.push(`/report/${sessionId}`)}
            style={{ padding: "14px 36px" }}
          >
            View Report →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Session header bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "12px 24px",
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          <span className="text-gradient">Smart Ai Interviewer</span>
        </span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Question {questionIndex + 1} / {totalQuestions}
          </span>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              background:
                session?.mode === "RAPID_FIRE"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "var(--accent-subtle)",
              color:
                session?.mode === "RAPID_FIRE"
                  ? "var(--error)"
                  : "var(--accent-light)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {session?.mode === "RAPID_FIRE" ? "⚡ Rapid Fire" : "🎯 Normal"}
          </span>
          {timer !== null && (
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                background: timer < 10 ? "rgba(239, 68, 68, 0.2)" : "rgba(234, 179, 8, 0.15)",
                color: timer < 10 ? "var(--error)" : "var(--warning)",
                fontSize: 14,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {timer}s
            </span>
          )}
        </div>
        <button
          className="btn-secondary"
          onClick={handleEndSession}
          style={{ padding: "6px 16px", fontSize: 12 }}
        >
          End Session
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          top: 52,
          left: 0,
          right: 0,
          height: 3,
          background: "var(--border)",
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
          style={{
            height: "100%",
            background: "var(--gradient-accent)",
            borderRadius: 2,
          }}
        />
      </div>

      {error && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            borderRadius: 10,
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "var(--error)",
            fontSize: 13,
            zIndex: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Main interview area */}
      <div style={{ maxWidth: 700, width: "100%", textAlign: "center", marginTop: 40 }}>
        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card"
              style={{ padding: 36, marginBottom: 36 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--accent-light)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                  }}
                >
                  AI Interviewer
                </div>
                {isPlayingAudio && (
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      height: 16,
                    }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 2,
                          height: "100%",
                          background: "var(--accent-light)",
                          borderRadius: 1,
                          animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p
                style={{
                  fontSize: 19,
                  fontWeight: 500,
                  lineHeight: 1.7,
                  color: "var(--text-primary)",
                }}
              >
                &quot;{currentQuestion.questionText}&quot;
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    padding: "3px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                  }}
                >
                  {currentQuestion.topic}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    padding: "3px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                  }}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "recording" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 28 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: isRecording
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "var(--gradient-accent)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                position: "relative",
                margin: "0 auto",
              }}
            >
              {isRecording ? "⏹️" : "🎤"}
              {isRecording && (
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "2px solid #ef4444",
                    animation: "pulse-ring 1.5s ease-out infinite",
                  }}
                />
              )}
            </motion.button>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 12 }}>
              {isRecording ? "Recording... Click to stop" : "Click to start answering"}
            </p>
            {/* Live transcript preview while recording */}
            {isRecording && liveTranscript && (
              <p style={{
                color: "var(--text-muted)",
                fontSize: 12,
                marginTop: 8,
                fontStyle: "italic",
                maxWidth: 500,
                margin: "8px auto 0",
              }}>
                💬 {liveTranscript}
              </p>
            )}
            {micError && (
              <p style={{ color: "var(--error)", fontSize: 12, marginTop: 8 }}>
                {micError}
              </p>
            )}
          </motion.div>
        )}

        {/* Voice Waveform (live during recording) */}
        {isRecording && analyserData && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              height: 50,
              alignItems: "end",
              marginBottom: 28,
            }}
          >
            {Array.from({ length: 40 }).map((_, i) => {
              const value = analyserData[i * 2] || 0;
              const height = Math.max(4, (value / 255) * 50);
              return (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: `${height}px`,
                    background:
                      value > 150
                        ? "var(--accent)"
                        : value > 80
                        ? "var(--voice-accent)"
                        : "var(--text-muted)",
                    borderRadius: 2,
                    transition: "height 0.05s ease",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Processing state */}
        {phase === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: 28 }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent)",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Analyzing your response...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {/* Listening state (question being read) */}
        {phase === "listening" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: 28 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 4,
                height: 40,
                alignItems: "center",
              }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: "100%",
                    background: "var(--accent-light)",
                    borderRadius: 2,
                    animation: `wave 1s ease-in-out ${i * 0.05}s infinite`,
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 12 }}>
              Listen to the question...
            </p>
          </motion.div>
        )}

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: 20, textAlign: "left", marginBottom: 20 }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your Answer
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {transcript}
            </p>
          </motion.div>
        )}

        {/* Evaluation (brief inline feedback) */}
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: 20, marginBottom: 20 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginBottom: 12,
              }}
            >
              {[
                { label: "Score", value: evaluation.finalScore, color: "var(--accent-light)" },
                { label: "Clarity", value: evaluation.clarityScore, color: "var(--voice-accent)" },
                { label: "Confidence", value: evaluation.confidenceScore, color: "var(--success)" },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            {evaluation.feedback && (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  fontStyle: "italic",
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                {evaluation.feedback}
              </p>
            )}
          </motion.div>
        )}

        {/* Loading state */}
        {phase === "loading" && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent)",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "var(--text-secondary)" }}>Loading interview...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
