# Attendance Monitoring App

A full-stack campus attendance platform built for students and campus staff.
It delivers secure JWT authentication, geofenced check-ins, role-based dashboards, real-time alerts, and notification tracking to simplify attendance workflows and improve campus accountability.

## Project overview

- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript + Mongoose
- Auth: JWT-based student/admin sessions
- Database: MongoDB
- Features: geofence attendance, role-based dashboards, notifications, and seeded test data
- Attendance tracking: geolocation-based check-in with nearest city validation, daily attendance records, and status tracking

## Project structure

- `frontend/`
  - `src/` — React pages, components, hooks, and API client
  - `public/` — static assets
  - `package.json` — frontend scripts and dependencies
- `backend/`
  - `src/app.ts` — Express application setup
  - `src/server.ts` — server bootstrap
  - `src/routes/` — API route definitions
  - `src/models/` — Mongoose schemas and models
  - `src/services/` — business and auth logic
  - `src/middleware/` — auth, error handling, and route guards
  - `src/config/` — environment and database configuration
  - `src/seeders/` — initial seed data loader
- `README.md` — project overview and setup instructions

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start backend and frontend in development mode:

```bash
npm --workspace backend run dev
npm --workspace frontend run dev
```

3. Build both apps for production:

```bash
npm --workspace backend run build
npm --workspace frontend run build
```

## Environment variables

Create `backend/.env` with:

- `PORT` — API port, default `5000`
- `JWT_SECRET` — JWT signing secret
- `JWT_EXPIRES_IN` — token lifetime (for example `24h`)
- `MONGO_URI` — MongoDB connection string
- `CLIENT_URL` — frontend origin for CORS

## Attendance tracking

Students mark attendance using location data from their browser or device.
The backend computes the nearest approved city using latitude/longitude, validates the student is within the allowed radius, and saves a daily attendance record with status, city, time, and distance.

## Authentication

- Login is handled by the backend and returns a JWT token.
- Student and admin users are routed to `/student` and `/admin` dashboards.
- Protected routes redirect unauthenticated users to the login page.

## Notes

This repository is designed for local development and can be extended with production-ready deployment, real email delivery, and stronger validation rules.

Made with ❤️ by Pratik Raj.
