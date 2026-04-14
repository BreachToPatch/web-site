/* =====================================================================
   machines.js — populates the machines list page
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadMachines();
});

async function loadMachines() {
  const grid    = document.getElementById('machines-grid');
  const loading = document.getElementById('loading');

  try {
    const folders = await getMachines();

    // Fetch all READMEs in parallel
    const machines = await Promise.all(
      folders.map(async f => {
        try {
          const readme = await getMachineReadme(f.name);
          return parseMachine(readme, f.name);
        } catch {
          // If README fails, show a minimal card
          return {
            name: f.name, slug: f.name,
            difficulty: '?', category: '',
            status: 'unknown', description: '',
            githubUrl: `https://github.com/${ORG}/${MACHINES_REPO}/tree/main/${f.name}`
          };
        }
      })
    );

    loading.style.display = 'none';
    machines.forEach(m => {
      const card = document.createElement('div');
      card.innerHTML = renderCard(m);
      grid.appendChild(card.firstElementChild);
    });

    if (machines.length === 0) {
      loading.style.display = 'block';
      loading.textContent = 'No machines yet — check back soon.';
    }
  } catch (err) {
    loading.textContent = 'Could not load machines. GitHub API may be rate-limited.';
    console.error(err);
  }
}

function renderCard(m) {
  const statusMap = {
    red:      { label: '🔴 Red Team Active',  cls: 'status-red' },
    blue:     { label: '🔵 Blue Team Active', cls: 'status-blue' },
    archived: { label: '📦 Archived',          cls: 'status-archived' },
    unknown:  { label: '◦ Unknown',            cls: 'status-unknown' },
  };
  const s = statusMap[m.status] || statusMap.unknown;
  const diffCls = `diff-${(m.difficulty || '').toLowerCase()}`;

  return `
    <div class="machine-card">
      <div class="machine-header">
        <h3 class="machine-name">${escHtml(m.name)}</h3>
        <span class="status-badge ${s.cls}">${s.label}</span>
      </div>
      <div class="machine-meta">
        ${m.difficulty ? `<span class="difficulty ${diffCls}">${escHtml(m.difficulty)}</span>` : ''}
        ${m.category   ? `<span class="category">${escHtml(m.category)}</span>` : ''}
      </div>
      <p class="machine-desc">${escHtml(m.description) || 'A vulnerable machine waiting to be pwned.'}</p>
      <a href="${m.githubUrl}" class="btn btn-outline" target="_blank" rel="noopener">
        View on GitHub →
      </a>
    </div>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
