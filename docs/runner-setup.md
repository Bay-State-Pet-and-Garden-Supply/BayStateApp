# Self-Hosted Runner Setup Guide

This guide explains how to set up a new computer as a runner for Bay State's distributed scraping system.

## Prerequisites

- **Python 3.9+**
- **Docker** (optional, but recommended for consistent browser environments)
- **Admin access** to the BayStateApp admin panel

---

## Step 1: Generate an API Key

1. Login to the **BayStateApp Admin Panel**
2. Navigate to **Scraper Network** → **Runner Accounts**
3. Click **"Create Runner"** and enter a unique name for this computer
4. **Copy the API key** (starts with `bsr_`) - this is only shown once!

> ⚠️ Save this key securely. If you lose it, you'll need to revoke and create a new one.

---

## Step 2: Installation

### Option A: Automatic Install (Recommended)

Run the new installer script on your machine (macOS/Linux). This handles Python setup, virtual environments, and configuration automatically.

```bash
curl -fsSL https://raw.githubusercontent.com/Bay-State-Pet-and-Garden-Supply/BayStateScraper/main/install.sh | bash
```

The interactive wizard will ask for your:
1. Runner Name
2. API URL (default provided)
3. API Key (from Step 1)

### Option B: Docker / GitHub Actions (Headless)

For headless CI/CD environments or manual Docker usage, configure these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SCRAPER_API_URL` | BayStateApp base URL | `https://app.baystatepet.com` |
| `SCRAPER_API_KEY` | Your API key from Step 1 | `bsr_abc123...` |
| `RUNNER_NAME` | Unique identifier | `prod-worker-1` |

### Option C: Desktop App (Development)

To run the scraper with a visual interface for debugging:

```bash
git clone https://github.com/Bay-State-Pet-and-Garden-Supply/BayStateScraper.git
cd BayStateScraper/ui && npm install
cd ../src-tauri && cargo tauri dev
```

---

## Step 3: Verify Connection

Once the installer completes or the runner starts, check the **Connected Runners** grid in the Admin Panel. You should see your runner with a green "Ready" status.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Runner not appearing | Check if the process is running and has network access to the App URL |
| "Invalid API key" | Verify the key in `.env` or secrets matches the Admin Panel |
| Browser errors | Run `python -m playwright install chromium` manually if needed |
