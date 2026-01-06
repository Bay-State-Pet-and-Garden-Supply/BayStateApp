# Self-Hosted Runner Setup Guide

Set up a new scraping runner in **under 5 minutes**.

## TL;DR (One Command)

```bash
curl -fsSL https://raw.githubusercontent.com/Bay-State-Pet-and-Garden-Supply/BayStateScraper/main/scripts/bootstrap-runner.sh | bash
```

---

## What You'll Need

1. A Mac or Linux machine that stays powered on
2. A GitHub runner registration token (instructions below)
3. 5 minutes

---

## Step-by-Step Setup

### Step 1: Get Your Runner Token

1. Go to: **[Add New Runner](https://github.com/Bay-State-Pet-and-Garden-Supply/BayStateScraper/settings/actions/runners/new)**
2. Select your OS (macOS or Linux)
3. Copy the token from the `--token` part of the configure command

The token looks like: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Run the Bootstrap Script

Open Terminal and run:

```bash
curl -fsSL https://raw.githubusercontent.com/Bay-State-Pet-and-Garden-Supply/BayStateScraper/main/scripts/bootstrap-runner.sh | bash
```

The script will prompt you for:
- **Runner token**: Paste the token from Step 1
- **Runner name**: A name for this machine (e.g., "nicks-macbook")

### Step 3: Verify

Check your runner appears at:
**[GitHub Runners](https://github.com/Bay-State-Pet-and-Garden-Supply/BayStateScraper/settings/actions/runners)**

It should show as **Idle** (green dot).

---

## What the Bootstrap Script Does

1. **Installs Docker** (if not already installed)
2. **Downloads GitHub Actions Runner** (latest version)
3. **Configures the runner** with labels `self-hosted,docker`
4. **Pulls the Docker image** for scraping
5. **Installs as a system service** (auto-starts on boot)

---

## Architecture Overview

```
┌─────────────────┐                         ┌─────────────────────┐
│   BayStateApp   │   "Run scrape job"      │   GitHub Actions    │
│   (Admin Panel) │ ──────────────────────▶ │                     │
└─────────────────┘                         └──────────┬──────────┘
                                                       │
                                                       ▼
                                            ┌─────────────────────┐
                                            │   Your Laptop       │
                                            │   (Runner Service)  │
                                            │                     │
                                            │   Runs Docker       │
                                            │   container with    │
                                            │   scraper code      │
                                            └──────────┬──────────┘
                                                       │
         Results sent back                             │
┌─────────────────┐                                    │
│   BayStateApp   │ ◀──────────────────────────────────┘
│   (Database)    │
└─────────────────┘
```

---

## Required GitHub Secrets

These must be configured in the **BayStateScraper** repository settings by an admin:

| Secret | Description |
|--------|-------------|
| `SCRAPER_API_URL` | BayStateApp URL (e.g., `https://app.baystatepet.com`) |
| `SCRAPER_API_KEY` | Runner API key from Admin Panel |
| `SCRAPER_WEBHOOK_SECRET` | HMAC fallback signing key |
| `SCRAPER_CALLBACK_URL` | `{SCRAPER_API_URL}/api/admin/scraping/callback` |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `SETTINGS_ENCRYPTION_KEY` | Key for decrypting stored credentials |

---

## Managing Your Runner

### Service Commands (macOS)

```bash
cd ~/actions-runner

# Check status
./svc.sh status

# Stop the runner
./svc.sh stop

# Start the runner
./svc.sh start

# View logs
tail -f ~/Library/Logs/actions.runner.*.log
```

### Service Commands (Linux)

```bash
# Check status
sudo systemctl status actions.runner.*

# Stop the runner
sudo systemctl stop actions.runner.*

# Start the runner
sudo systemctl start actions.runner.*

# View logs
journalctl -u actions.runner.* -f
```

### Remove the Runner

```bash
cd ~/actions-runner
./svc.sh stop
./svc.sh uninstall
./config.sh remove --token YOUR_TOKEN
```

---

## Credential Security (Vault Pattern)

Site passwords (Phillips, Orgill, etc.) are **never stored on the runner**:

1. GitHub Actions passes "vault keys" to the Docker container
2. Container connects to Supabase and downloads encrypted settings
3. Container decrypts settings using `SETTINGS_ENCRYPTION_KEY`
4. Credentials exist only in memory during execution
5. Container exits and credentials are gone

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Docker not running" | Open Docker Desktop (macOS) or `sudo systemctl start docker` (Linux) |
| Runner shows offline | Check if service is running: `./svc.sh status` |
| Jobs stuck in "queued" | Verify runner has labels `self-hosted,docker` |
| "Permission denied" on Docker | Run `sudo usermod -aG docker $USER` and log out/in |
| Token expired | Get a new token from GitHub Settings |

---

## FAQ

**Q: Can I use my laptop while it's running jobs?**
A: Yes. Jobs run in Docker containers and don't interfere with normal use.

**Q: Does my laptop need to stay open?**
A: Yes, it needs to be powered on and connected to the internet. Sleep mode will pause jobs.

**Q: Can I have multiple runners?**
A: Yes! Run the bootstrap script on each machine with a unique name.

**Q: What happens if I close my laptop during a job?**
A: The job will fail and be marked as such. No data is lost.

---

## Alternative: Desktop App

For testing and debugging, use the Desktop App instead:

1. Download from [GitHub Releases](https://github.com/Bay-State-Pet-and-Garden-Supply/BayStateScraper/releases/latest)
2. Open the app
3. Enter your API key from Admin Panel → Scraper Network
4. Run scrapes manually with full visibility

The Desktop App is for **development/testing**. For production, use the GitHub Runner setup above.
