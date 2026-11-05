# Daemon demo

A marketing workspace for businesses and agencies, with project conversations, a shared campaign plan, a campaign map, and creative previews.

[Open the demo](https://daemon-frontend-nine.vercel.app/)

## Run locally

Use Node.js 22.12 or newer.

```sh
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173/.

## Build and test

Run these commands from `frontend`.

```sh
npm run build
npx playwright install chromium
npm run test:e2e
```

## Deploy on Vercel

Set the project root directory to `frontend` and use the Vite framework preset. The build command is `npm run build` and the output directory is `dist`.

This frontend demo stores workspace data in the browser. Agent responses, account flows, campaign approvals, and publishing are simulated.
