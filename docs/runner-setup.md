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

For headless CI/CD environments or manual Docker usage, configure the following environment variables. These use a "Vault Pattern" where the runner fetches encrypted credentials at runtime.

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `SCRAPER_API_URL` | Yes | BayStateApp base URL | Your deployment URL |
| `SCRAPER_API_KEY` | Yes | Runner authentication | Admin Panel → Runners → Create |
| `SCRAPER_WEBHOOK_SECRET` | Yes | HMAC fallback signing | Generate with `openssl rand -hex 32` |
| `SCRAPER_CALLBACK_URL` | Yes | Callback endpoint | `{SCRAPER_API_URL}/api/admin/scraping/callback` |
| `SUPABASE_URL` | Yes | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Yes | Service role key | Supabase Dashboard → Settings → API → service_role |
| `SETTINGS_ENCRYPTION_KEY` | Yes | Decrypt stored credentials | Same key used when encrypting settings |
| `RUNNER_NAME` | Yes | Unique identifier | e.g., `prod-worker-1` |

### Setting Up GitHub Secrets

If you are using GitHub Actions to trigger scrapes, you must add these variables as **Repository Secrets**:

1. Go to your repository on GitHub.
2. Navigate to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret** for each item in the table above.

### Credential Flow (Vault Pattern)

The runner does not store site passwords (like Phillips or Orgill) in the environment. Instead:
1. GitHub Actions passes "vault keys" (Supabase URL/Key and Encryption Key) to the Docker container.
2. The runner connects to the Supabase Vault and downloads encrypted settings.
3. The runner decrypts these settings using the `SETTINGS_ENCRYPTION_KEY`.
4. Site credentials are now available in memory for the scraper to perform login actions.

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
