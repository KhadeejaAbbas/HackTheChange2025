# HackTheChange Auth Frontend

A minimal React + Vite console for exercising every authentication endpoint (doctor/patient registration, login, confirmation, and resend code).

## Setup
1. `cd auth-frontend`
2. Install deps: `npm install`
3. Copy env template: `cp .env.example .env`
4. Set `VITE_API_BASE_URL` to your running server (default `http://localhost:3000`).
5. Start the dev server: `npm run dev`

## Features
- Separate cards for doctor and patient sign-up with all required fields (email, password, name, birthdate, gender, plus optional specialty/patient metadata).
- Sign-in form that shows raw Cognito token payloads.
- Confirm + resend flows for quick verification code testing.
- Inline status + JSON response rendering to debug errors fast.

Point the base URL at any deployed API to test live environments during demos.
