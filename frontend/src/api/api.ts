// Use full URL when backend runs separately (e.g. production); otherwise use proxy path
const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const url = `${API}${endpoint}`;
  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new Error(msg.includes('fetch') ? 'Cannot reach server. Is the backend running on port 5000?' : msg);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => fetchApi('/auth/me'),
};

export const notesApi = {
  getAll: (params?: { q?: string; tag?: string; archived?: string }) => {
    const search = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi(`/notes${search ? `?${search}` : ''}`);
  },
  getOne: (id: string) => fetchApi(`/notes/${id}`),
  create: (body: { title?: string; content?: string; tags?: string[]; isPinned?: boolean; color?: string }) =>
    fetchApi('/notes', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, unknown>) =>
    fetchApi(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) =>
    fetchApi(`/notes/${id}`, { method: 'DELETE' }),
  getTags: () => fetchApi('/notes/tags'),
};

export const aiApi = {
  suggestTags: (title: string, content: string) =>
    fetchApi('/ai/suggest-tags', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),
  generate: (prompt: string) =>
    fetchApi('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
  improve: (title: string, content: string) =>
    fetchApi('/ai/improve', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),
  ask: (question: string) =>
    fetchApi('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  search: (q: string) =>
    fetchApi(`/ai/search?q=${encodeURIComponent(q)}`),
};
