# Online Judge Frontend

Phase 3 implements the frontend authentication module only.

## Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The default API base URL is:

```text
http://localhost:5000/api
```

Update `VITE_API_BASE_URL` in `.env` if the backend runs elsewhere.

## Manual Testing

1. Start the backend server.
2. Start the frontend with `npm run dev`.
3. Open `/register`, create a new user, and confirm redirect to `/login`.
4. Login with the new credentials and confirm redirect to `/profile`.
5. Refresh `/profile` and confirm the session persists from `localStorage`.
6. Click `Logout` and confirm access to `/profile` redirects back to `/login`.
7. Try invalid credentials and missing fields to confirm errors appear.

## Implemented Routes

- `/`
- `/login`
- `/register`
- `/profile`
- `/problems`
- `/problems/:id`

## Problems UI Testing

1. Start the backend and make sure published problems exist.
2. Open `/problems` and confirm problem cards show title, difficulty, tags, and a `Solve` button.
3. Search by title and confirm the list updates immediately.
4. Change the difficulty dropdown to `Easy`, `Medium`, and `Hard`.
5. Click a tag chip and confirm only matching problems remain.
6. Click `Solve` and confirm `/problems/:id` shows the full statement, examples, tags, and creator.
7. Stop the backend and refresh `/problems` to confirm an error message appears.
