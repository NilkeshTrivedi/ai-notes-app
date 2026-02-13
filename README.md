# AI Notes App

A full-featured AI-powered notes application with smart search, auto-summarization, tag suggestions, note generation, and Q&A on your notes.

## Features

### Core
- **User Authentication** – Register, login, JWT-protected routes
- **Notes CRUD** – Create, read, update, delete notes
- **Tags** – Organize notes with tags
- **Pin & Archive** – Pin important notes, archive old ones
- **Markdown Support** – Rich text with preview

### AI-Powered
- **Auto-Summarization** – Notes are automatically summarized for quick browsing
- **Smart Search** – Semantic search using embeddings (meaning-based, not just keywords)
- **AI Note Generation** – Describe what you want to write, AI generates the note
- **Improve Note** – Fix grammar, enhance clarity, add structure
- **Tag Suggestions** – AI suggests relevant tags for your notes
- **Ask AI** – Ask questions about your notes; AI answers from your content

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, OpenAI API
- **Frontend:** React, Vite, TypeScript, React Router, React Markdown, Lucide icons
- **AI:** OpenAI GPT-4o-mini, text-embedding-3-small

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### Backend

```bash
cd backend
npm install
```

Create `.env` (copy from `.env.example`):

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-notes
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-openai-api-key
```

Start:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend proxies `/api` to the backend at `http://localhost:5000`.

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register user |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Get current user |
| `/api/notes` | GET | List notes |
| `/api/notes` | POST | Create note |
| `/api/notes/:id` | GET/PUT/DELETE | Note CRUD |
| `/api/notes/tags` | GET | List all tags |
| `/api/ai/suggest-tags` | POST | Suggest tags |
| `/api/ai/generate` | POST | Generate note from prompt |
| `/api/ai/improve` | POST | Improve note content |
| `/api/ai/ask` | POST | Q&A on notes |
| `/api/ai/search` | GET | Semantic search |

## Project Structure

```
ai-notes-app/
├── backend/
│   ├── config/       # DB config
│   ├── controllers/  # Auth, notes, AI
│   ├── middleware/   # JWT auth
│   ├── models/       # User, Note
│   ├── routes/       # API routes
│   └── utils/        # AI services (OpenAI)
├── frontend/
│   └── src/
│       ├── api/      # API client
│       ├── components/
│       ├── context/  # Auth context
│       └── pages/
└── README.md
```

---

## GitHub

### Push to GitHub

1. **Initialize git** (if not already):

   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Notes app"
   ```

2. **Create a repo on GitHub**  
   Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `ai-notes-app`).

3. **Push**:

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ai-notes-app.git
   git branch -M main
   git push -u origin main
   ```

---

## Deployment

Deploy backend and frontend separately. Use MongoDB Atlas for the database.

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Add your IP to the allow list (or use `0.0.0.0/0` for testing)
4. Copy the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/ai-notes`)

### 2. Backend (Render / Railway)

**Render** (free tier):

1. Go to [render.com](https://render.com) and sign up
2. New → Web Service
3. Connect your GitHub repo and select it
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Environment variables:
   - `MONGO_URI` – your Atlas connection string
   - `JWT_SECRET` – random secret (e.g. `openssl rand -hex 32`)
   - `OPENAI_API_KEY` – your OpenAI key
   - `FRONTEND_URL` – your frontend URL (set after deploying frontend)
6. Deploy and copy the backend URL (e.g. `https://ai-notes-api.onrender.com`)

**Railway** (similar flow):

1. Go to [railway.app](https://railway.app) and connect GitHub
2. New Project → Deploy from Repo → select repo
3. Set root directory to `backend`
4. Add the same env vars and deploy

### 3. Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment variable:
   - `VITE_API_URL` – your backend URL (e.g. `https://ai-notes-api.onrender.com`)
5. Deploy and copy the frontend URL

### 4. Final setup

1. In the backend (Render/Railway), set:
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://ai-notes-app.vercel.app`)
2. Redeploy the backend

---

## License

MIT
