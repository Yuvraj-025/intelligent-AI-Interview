const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('voxhire_token') : null;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  return data;
}

// ─── Auth API ──────────────────────────────────────

export async function signup(name: string, email: string, password: string) {
  const res = await apiFetch<{ success: boolean; data: { user: any; token: string } }>('/auth/signup', {
    method: 'POST',
    body: { name, email, password },
  });
  if (res.data.token) {
    localStorage.setItem('voxhire_token', res.data.token);
    localStorage.setItem('voxhire_user', JSON.stringify(res.data.user));
  }
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await apiFetch<{ success: boolean; data: { user: any; token: string } }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (res.data.token) {
    localStorage.setItem('voxhire_token', res.data.token);
    localStorage.setItem('voxhire_user', JSON.stringify(res.data.user));
  }
  return res.data;
}

export async function googleLogin(idToken: string) {
  const res = await apiFetch<{ success: boolean; data: { user: any; token: string } }>('/auth/google', {
    method: 'POST',
    body: { idToken },
  });
  if (res.data.token) {
    localStorage.setItem('voxhire_token', res.data.token);
    localStorage.setItem('voxhire_user', JSON.stringify(res.data.user));
  }
  return res.data;
}

export async function getProfile() {
  return apiFetch<{ success: boolean; data: any }>('/auth/profile');
}

export function logout() {
  localStorage.removeItem('voxhire_token');
  localStorage.removeItem('voxhire_user');
  window.location.href = '/auth/login';
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('voxhire_user');
  return user ? JSON.parse(user) : null;
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('voxhire_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─── Interview API ─────────────────────────────────

export async function createSession(role: string, mode: string, difficulty?: string) {
  return apiFetch<{ success: boolean; data: any }>('/interview/sessions', {
    method: 'POST',
    body: { role, mode, difficulty: difficulty || 'MEDIUM' },
  });
}

export async function getSession(sessionId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/interview/sessions/${sessionId}`);
}

export async function submitAnswer(sessionId: string, questionId: string, transcript: string, audioUrl?: string, durationSeconds?: number) {
  return apiFetch<{ success: boolean; data: any }>(`/interview/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: { questionId, transcript, audioUrl, durationSeconds },
  });
}

export async function completeSession(sessionId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/interview/sessions/${sessionId}/complete`, {
    method: 'POST',
  });
}

export async function getReport(sessionId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/interview/sessions/${sessionId}/report`);
}

// ─── Voice API ─────────────────────────────────────

export async function synthesizeSpeech(text: string, voice?: string) {
  return apiFetch<{ success: boolean; data: { audio: string; format: string; encoding: string } }>('/voice/synthesize', {
    method: 'POST',
    body: { text, voice },
  });
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('voxhire_token') : null;
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const res = await fetch(`${API_BASE}/voice/transcribe`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Transcription failed');
  return data.data.transcript;
}

// ─── Analytics API ─────────────────────────────────

export async function getUserSessions(userId: string) {
  return apiFetch<{ success: boolean; data: any[] }>(`/analytics/users/${userId}/sessions`);
}

export async function generateReport(sessionId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/analytics/sessions/${sessionId}/generate-report`, {
    method: 'POST',
  });
}
