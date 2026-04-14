/* =====================================================================
   api.js — GitHub API wrapper for BreachToPatch
   Handles fetching, caching, and parsing of GitHub data.
   No server needed — everything reads from public GitHub endpoints.
   ===================================================================== */

const GITHUB_API    = 'https://api.github.com';
const RAW_GITHUB    = 'https://raw.githubusercontent.com';
const ORG           = 'BreachToPatch';
const MACHINES_REPO = 'machines-public';
const LB_REPO       = 'leaderboard';
const CACHE_TTL_MS  = 5 * 60 * 1000; // cache for 5 minutes

// ---------------------------------------------------------------------------
// Cache helpers (sessionStorage — cleared when the tab closes)
// ---------------------------------------------------------------------------
function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem('btop_' + key);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return value;
  } catch { return null; }
}

function cacheSet(key, value) {
  try {
    sessionStorage.setItem('btop_' + key, JSON.stringify({ value, ts: Date.now() }));
  } catch { /* storage full — ignore */ }
}

// ---------------------------------------------------------------------------
// Core fetch helper — adds auth token if available, uses cache
// ---------------------------------------------------------------------------
async function ghFetch(url) {
  const cached = cacheGet(url);
  if (cached !== null) return cached;

  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  const token = sessionStorage.getItem('gh_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`);
  const data = await res.json();
  cacheSet(url, data);
  return data;
}

// ---------------------------------------------------------------------------
// Get the list of machine folders from machines-public
// Returns array of { name, url } objects (directories only, no hidden folders)
// ---------------------------------------------------------------------------
async function getMachines() {
  const url = `${GITHUB_API}/repos/${ORG}/${MACHINES_REPO}/contents/`;
  const items = await ghFetch(url);
  return items.filter(i => i.type === 'dir' && !i.name.startsWith('.'));
}

// ---------------------------------------------------------------------------
// Get and decode the README.md of a specific machine
// Returns the markdown string
// ---------------------------------------------------------------------------
async function getMachineReadme(machineName) {
  const url = `${GITHUB_API}/repos/${ORG}/${MACHINES_REPO}/contents/${machineName}/README.md`;
  const data = await ghFetch(url);
  // GitHub returns content as base64 with newlines — strip them before decoding
  return atob(data.content.replace(/\n/g, ''));
}

// ---------------------------------------------------------------------------
// Parse machine metadata from its README markdown
// ---------------------------------------------------------------------------
function parseMachine(markdown, slug) {
  const get = (re) => { const m = markdown.match(re); return m ? m[1].trim() : ''; };

  const name = get(/^#\s+Machine:\s+(.+)/m).replace(/\s*\(v[\d.]+\)/, '') || slug;
  const difficulty = get(/\*\*Difficulty\*\*:\s+(.+)/);
  const category   = get(/\*\*Category\*\*:\s+(.+)/);

  // Status: look for the status line in the README
  let status = 'unknown';
  if (/🔴/.test(markdown))       status = 'red';
  else if (/🔵/.test(markdown))  status = 'blue';
  else if (/archived/i.test(markdown)) status = 'archived';

  // Description: first paragraph inside the Description section
  const descMatch = markdown.match(/###\s+Description\s*\n+([\s\S]+?)(?:\n\n|>)/);
  const description = descMatch ? descMatch[1].replace(/\n/g, ' ').trim() : '';

  const githubUrl = `https://github.com/${ORG}/${MACHINES_REPO}/tree/main/${slug}`;

  return { name, slug, difficulty, category, status, description, githubUrl };
}

// ---------------------------------------------------------------------------
// Fetch the leaderboard JSON directly from raw GitHub URL (no API limit)
// ---------------------------------------------------------------------------
async function getLeaderboard() {
  const url = `${RAW_GITHUB}/${ORG}/${LB_REPO}/main/leaderboard.json`;
  const cached = cacheGet(url);
  if (cached !== null) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
  const data = await res.json();
  cacheSet(url, data);
  return data;
}
