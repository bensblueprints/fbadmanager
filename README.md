# FB Ad Manager

A React + Express dashboard for managing Facebook Ads through the Meta Marketing API.

## Setup

1. Clone the repo
2. Add your Meta access token to `backend/.env`:
   ```
   META_ACCESS_TOKEN=your_token_here
   META_APP_ID=1367190391759798
   PORT=3001
   ```
3. Install and run:
   ```bash
   cd backend && npm install && npm run dev
   cd frontend && npm install && npm run dev
   ```
4. Open http://localhost:5173

## Features

- **Dashboard** — Spend, impressions, clicks, CTR, CPC stats with date presets
- **Campaigns** — List, create, pause/activate campaigns with bulk actions
- **Ad Sets** — View and manage ad sets per campaign
- **Insights** — Detailed reporting with date ranges and breakdowns (age, gender, platform, device, country)
- **Audiences** — Manage custom and lookalike audiences
