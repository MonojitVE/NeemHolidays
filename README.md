# Travel Content Automation Agent

A full-stack AI-powered travel content automation platform built with React, FastAPI, MySQL, feedparser, APScheduler, and Groq API.

## Features

- JWT login/register
- Admin and reviewer roles
- RSS collection for Amsterdam, Paris, and Europe travel feeds
- Human feed approval before AI generation
- Groq-powered branded content generation
- Brand settings module
- Human content review and editing
- Manual social posting queue for LinkedIn, Facebook, and Instagram
- Dashboard analytics
- APScheduler daily RSS job

## Default Login

Email: `admin@example.com`
Password: `admin123`

## Local Setup Without Docker

### 1. Create MySQL Database

```sql
CREATE DATABASE travel_agent;
```

### 2. Backend Setup

```bash
cd backend
py -3.11 -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `backend/.env`:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/travel_agent
JWT_SECRET_KEY=change-this-secret
GROQ_API_KEY=your_groq_api_key_optional
```

Run backend:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Swagger API docs:

```text
http://localhost:8000/docs
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Docker Setup

```bash
copy backend/.env.example backend/.env
copy frontend/.env.example frontend/.env
docker compose up --build
```

## Recommended Workflow

1. Login as admin.
2. Go to **RSS Approval**.
3. Click **Fetch RSS Now**.
4. Approve useful feeds.
5. Click **Generate AI Content** for approved feeds.
6. Go to **Content Review**.
7. Edit and approve generated content.
8. Send approved content to social queue.
9. Go to **Social Queue**.
10. Copy content manually or mark it as posted.

## API Mode Note

This project includes manual social posting mode by default because LinkedIn, Facebook, and Instagram API posting requires app approval and permissions. You can extend `backend/app/services/social_service.py` for real API posting after credentials are approved.

## Deployment Guide

### Backend on Render

1. Push project to GitHub.
2. Create a Render Web Service.
3. Root directory: `backend`.
4. Build command:

```bash
pip install -r requirements.txt
```

5. Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

6. Add environment variables from `backend/.env.example`.
7. Use Render MySQL alternative or external free MySQL provider.

### Frontend on Vercel

1. Import GitHub repository in Vercel.
2. Root directory: `frontend`.
3. Build command:

```bash
npm run build
```

4. Output directory:

```bash
dist
```

5. Add environment variable:

```env
VITE_API_URL=https://your-render-backend-url/api
```

## Testing Checklist

- Register new reviewer
- Login as admin
- Fetch RSS feeds
- Approve feed
- Reject feed
- Mark feed important
- Generate AI content from approved feed
- Edit generated article
- Approve content
- Queue content for social media
- Copy social post
- Mark post as posted
- Update brand settings
- Check dashboard analytics

## Folder Structure

```text
travel-content-automation-agent/
  backend/
    app/
      agents/
      api/
      core/
      models/
      scheduler/
      schemas/
      services/
      main.py
    requirements.txt
    Dockerfile
    .env.example
  frontend/
    src/
      api/
      components/
      context/
      pages/
      utils/
      App.jsx
      main.jsx
      styles.css
    package.json
    vite.config.js
    Dockerfile
    .env.example
  docker-compose.yml
  README.md
```
