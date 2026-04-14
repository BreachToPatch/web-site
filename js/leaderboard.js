/* =====================================================================
   leaderboard.js — populates the leaderboard page
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadLeaderboard();
});

async function loadLeaderboard() {
  const tbody   = document.getElementById('leaderboard-body');
  const loading = document.getElementById('loading');
  const meta    = document.getElementById('last-updated');

  try {
    const data = await getLeaderboard();

    if (meta && data.last_updated) {
      meta.textContent = 'Last updated: ' + new Date(data.last_updated).toLocaleString();
    }

    loading.style.display = 'none';

    if (!data.players || data.players.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty">
            No players yet — be the first to pwn a machine!
          </td>
        </tr>`;
      return;
    }

    data.players.forEach((player, i) => {
      const rank = i + 1;
      const rankDisplay = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const badges = (player.badges || []).join(' ');
      const avatarUrl = `https://github.com/${player.github_username}.png?size=32`;

      const tr = document.createElement('tr');
      if (rank <= 3) tr.classList.add('top-rank');
      tr.innerHTML = `
        <td class="rank">${rankDisplay}</td>
        <td>
          <a href="${escHtml(player.github_profile)}" target="_blank" rel="noopener" class="player-link">
            <img src="${avatarUrl}" alt="" class="avatar" onerror="this.style.display='none'">
            <span>@${escHtml(player.github_username)}</span>
          </a>
        </td>
        <td class="points">${player.points}</td>
        <td>${player.pwns  || 0}</td>
        <td>${player.patches || 0}</td>
        <td class="badges">${badges || '—'}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    loading.textContent = 'Could not load leaderboard.';
    console.error(err);
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
