# web-site 🌐

> **Public repository — `BreachToPatch` organization**
> The face of BreachToPatch. A fully static website hosted on GitHub Pages — no server, no database, no cost.

---

## What this repo is

`web-site` is the **public-facing website** of the BreachToPatch platform, accessible at:

```
https://breachtopatch.github.io
```

(A custom domain can be connected later via a `CNAME` file.)

The site is 100% static — plain HTML, CSS, and JavaScript. It has no backend server. All data (machines, scores, writeups) is fetched live from the **GitHub API** and from raw GitHub file URLs. This means:
- **Hosting cost: $0** (GitHub Pages is free)
- **Data is always fresh** — no manual deploys needed when a new machine is added or a score changes
- **No authentication server needed** — GitHub OAuth handles login

---

## What lives here

```
web-site/
├── README.md               ← You are here
├── index.html              ← Homepage: intro, how it works, featured machines
├── machines.html           ← Machine list with status (Red/Blue/Archived)
├── leaderboard.html        ← Live scoreboard
├── machine.html            ← Individual machine page (loaded dynamically)
├── css/
│   └── style.css           ← Dark terminal theme (JetBrains Mono, red/teal palette)
├── js/
│   ├── api.js              ← Wrapper for all GitHub API calls
│   ├── machines.js         ← Populates the machine list
│   ├── leaderboard.js      ← Populates the scoreboard from leaderboard.json
│   └── auth.js             ← GitHub OAuth login flow
└── assets/
    ├── logo.svg            ← The Bee-Path logo (stylized bee)
    └── favicon.ico
```

---

## How the data flows (no server needed)

```
GitHub API (free, public)
        │
        ├── List machines      → reads folder list from machines-public repo
        ├── Machine details    → reads README.md of each machine folder
        ├── Writeups           → reads files in writeups/ folder
        └── Recent activity    → reads GitHub Events API

Raw GitHub URLs (instant, no API limit)
        │
        └── Leaderboard data   → leaderboard/leaderboard.json

GitHub OAuth (for player login)
        │
        └── "Sign in with GitHub" → lets players submit writeups via the site
```

**API Rate Limiting:** The GitHub API allows 60 requests/hour unauthenticated. Once a player logs in with GitHub OAuth, this rises to 5,000 requests/hour. The site caches responses in `sessionStorage` to stay well within limits.

---

## Visual identity

| Element | Value |
|---------|-------|
| Font | JetBrains Mono (monospace, terminal feel) |
| Background | `#0d1117` (GitHub dark) |
| Red Team color | `#ff4444` |
| Blue Team color | `#00bcd4` (teal/cyan) |
| Text | `#e6edf3` |
| Accent | `#f0b429` (honey yellow — the bee) |
| Logo | Stylized bee, geometric, minimal |

The aesthetic is: **hacker terminal, but welcoming**. Not aggressive, not gamified to death — clean and professional, with just enough edge to signal "this is a security platform."

---

## GitHub OAuth — How player login works

Players click "Sign in with GitHub". This uses a **GitHub OAuth App** registered under the `BreachToPatch` organization:

1. Player is redirected to GitHub to authorize the app
2. GitHub redirects back with a token
3. The site uses that token to make authenticated API calls (5,000 req/hour)
4. The token also allows the site to create PRs on behalf of the player (for writeup submission)

> **Privacy:** The site only requests the `public_repo` scope — it can only interact with public repositories. No private data is ever accessed.

Setup instructions for the OAuth App are in [docs/SETUP_OAUTH.md](../docs/SETUP_OAUTH.md) *(coming soon)*.

---

## Deploying the site

GitHub Pages is enabled on the `main` branch of this repo. Every push to `main` is automatically live within ~1 minute. No build step, no CI needed — the files are served as-is.

To deploy:
```bash
git push origin main
# That's it.
```

---

## How this repo interacts with other repos

```
machines-public (BreachToPatch, public)
   └── Site reads machine READMEs, writeup lists, exploit files via GitHub API

leaderboard (BreachToPatch, public)
   └── Site fetches leaderboard.json for the scoreboard page

docs (BreachToPatch, public)
   └── Site links to guides hosted there

web-site (this repo)
   └── Hosted on GitHub Pages → https://breachtopatch.github.io
```
