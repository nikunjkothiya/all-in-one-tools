# All-in-One Tools

A full-stack utility platform with browser-based tools for text, image, PDF, media, file, web, data, privacy, loader, and miscellaneous workflows.

The project now includes a lightweight local monetization system built for:
- Google AdSense placements
- Meta Pixel tracking
- A seeded admin account backed by local SQLite

It does not include a custom manual-ad inventory system.

## Stack

- Frontend: React + Material UI
- Backend: Node.js + Express
- Local database: SQLite via `better-sqlite3`
- Realtime: Socket.IO for long-running media jobs

## Monetization Setup

The backend seeds a local SQLite database at:

`backend/data/all-tools.sqlite`

The seeded tables are:
- `admin_users`
- `monetization_settings`
- `ad_slots`
- `audit_logs`

Built-in AdSense placements:
- `global-top`
- `home-after-hero`
- `tool-inline`

Admin capabilities:
- Sign in with a local admin account
- Enable or disable Google AdSense
- Save the AdSense client ID
- Enable or disable Meta Pixel
- Save the Meta Pixel ID
- Configure the built-in AdSense placement slots
- Review recent admin activity

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:5000/api`  
Admin login: `http://localhost:3000/admin/login`

For this workspace, both `backend/.env` and `frontend/.env` are already aligned with the current SQLite + admin setup, so you can start both servers directly without recreating them.

## Default Admin Account

The first server start seeds an admin account only when these backend env values are set:

```env
ADMIN_SEED_EMAIL=admin@alltools.local
ADMIN_SEED_PASSWORD=ChangeMe123!
ADMIN_SEED_NAME=Platform Admin
```

Change the password in `backend/.env` before deploying.
The current local development env is configured to seed that admin user.

## Environment Notes

Backend env highlights:

```env
PORT=5000
BASE_URL=http://localhost:5000
SQLITE_PATH=data/all-tools.sqlite
JWT_SECRET=replace-this
QPDF_PATH=/usr/bin/qpdf
ADMIN_SEED_EMAIL=admin@alltools.local
ADMIN_SEED_PASSWORD=ChangeMe123!
ADMIN_SEED_NAME=Platform Admin
TINYURL_API_BASE=https://tinyurl.com/api-create.php
```

The backend no longer uses MongoDB for this project. Local persistence is handled by SQLite only.

Frontend env highlights:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_BASE=/api
```

## Required System Packages

- FFmpeg for media tools
- QPDF for PDF password features

Examples:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg qpdf
```

## Current Scope

- Public tool pages can render Google AdSense slots when configured.
- Meta Pixel is loaded from backend-managed settings.
- Placeholder blocks can be shown until production ad IDs are added.
- No manual banner/image/HTML ad management is included.

## Project Structure

```text
all-in-one-tools/
├── backend/
│   ├── data/               # SQLite database file
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── README.md
```
