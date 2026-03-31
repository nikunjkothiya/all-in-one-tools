# Frontend Guide

This frontend is the public tool interface plus the local monetization admin UI.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The app runs on `http://localhost:3000` by default.
The local `frontend/.env` in this workspace is already configured to point at the backend on `http://localhost:5000/api`.

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_BASE=/api
```

Google AdSense and Meta Pixel IDs are not stored in the frontend env. They are managed from the backend-powered admin panel.

## Frontend Monetization Features

- `/admin/login` for admin authentication
- `/admin` for monetization management
- Public Google AdSense slot rendering
- Meta Pixel page-view tracking
- Placeholder rendering when production ad IDs are not configured yet

## Built-In Placement Locations

- `global-top`
- `home-after-hero`
- `tool-inline`
