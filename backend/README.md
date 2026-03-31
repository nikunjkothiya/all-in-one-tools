# Backend Guide

This backend powers the tool APIs and the local monetization admin system.

## What It Includes

- Express API for the tool categories
- Local SQLite database bootstrap
- Seeded admin account
- Google AdSense settings and placement storage
- Meta Pixel settings storage
- Audit logging for admin changes

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend starts on `http://localhost:5000` by default.
The local `backend/.env` in this workspace is already configured for SQLite, admin seeding, and local development URLs.

## Important Environment Variables

```env
PORT=5000
SQLITE_PATH=data/all-tools.sqlite
JWT_SECRET=replace-this
JWT_EXPIRES_IN=24h
BASE_URL=http://localhost:5000
ADMIN_SEED_EMAIL=admin@alltools.local
ADMIN_SEED_PASSWORD=ChangeMe123!
ADMIN_SEED_NAME=Platform Admin
QPDF_PATH=/usr/bin/qpdf
TINYURL_API_BASE=https://tinyurl.com/api-create.php
```

## Local Database

The SQLite database file is created automatically under:

`backend/data/all-tools.sqlite`

Tables created on boot:
- `admin_users`
- `monetization_settings`
- `ad_slots`
- `audit_logs`

Seeded AdSense placements:
- `global-top`
- `home-after-hero`
- `tool-inline`

The backend does not use MongoDB in the current architecture.

## Admin API Areas

- `/api/admin/auth`
- `/api/admin/dashboard`
- `/api/admin/monetization/settings`
- `/api/admin/monetization/slots`
- `/api/admin/audit`
- `/api/public/monetization/bootstrap`
- `/api/public/monetization/slot`

## System Dependencies

- FFmpeg for media routes
- QPDF for PDF protection routes

Ubuntu/Debian example:

```bash
sudo apt update
sudo apt install ffmpeg qpdf
```
