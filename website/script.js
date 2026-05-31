// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu close on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});

// Reveal on scroll with IntersectionObserver
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Smooth anchor scrolling with offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// ===== VISIT COUNTER (localStorage) =====
(function trackVisit() {
  const key = 'zoid_visits';
  let count = parseInt(localStorage.getItem(key) || '0', 10);
  count++;
  localStorage.setItem(key, String(count));
})();

// ===== GITHUB OAUTH DEVICE FLOW =====
const GH_KEY = 'zoid_gh_token';
const GH_USER_KEY = 'zoid_gh_user';

function getStoredToken() { return localStorage.getItem(GH_KEY); }
function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(GH_USER_KEY)); }
  catch { return null; }
}

function updateNavUI() {
  const btn = document.getElementById('navGhBtn');
  const label = document.getElementById('navGhLabel');
  const user = getStoredUser();
  if (user) {
    const existingImg = btn.querySelector('img');
    if (existingImg) existingImg.remove();
    const img = document.createElement('img');
    img.src = user.avatar_url;
    img.alt = user.login;
    img.width = 18;
    img.height = 18;
    btn.prepend(img);
    label.textContent = user.login;
    btn.classList.add('gh-signed-in');
  } else {
    const existingImg = btn.querySelector('img');
    if (existingImg) existingImg.remove();
    const svg = btn.querySelector('svg');
    if (svg) btn.prepend(svg);
    label.textContent = 'Sign in';
    btn.classList.remove('gh-signed-in');
  }
  updateDashboardUser();
}

function updateDashboardUser() {
  const container = document.getElementById('dashUser');
  const user = getStoredUser();
  if (user) {
    container.style.display = 'flex';
    document.getElementById('dashUserAvatar').src = user.avatar_url;
    document.getElementById('dashUserAvatar').alt = user.login;
    document.getElementById('dashUserName').textContent = user.login;
  } else {
    container.style.display = 'none';
  }
}

async function startGitHubAuth() {
  if (getStoredToken()) return;
  try {
    const res = await fetch('/api/github?action=device-code', { method: 'POST' });
    const data = await res.json();
    if (data.error) { alert('Failed to start GitHub auth: ' + data.error); return; }

    showOAuthModal(data.user_code, data.verification_uri, data.device_code, data.interval || 5);
  } catch (err) {
    alert('Failed to start GitHub authentication. Check that GITHUB_CLIENT_ID is configured on the server.');
  }
}

function showOAuthModal(userCode, verifyUri, deviceCode, interval) {
  const existing = document.querySelector('.oauth-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'oauth-overlay';
  overlay.innerHTML = `
    <div class="oauth-modal">
      <button class="oauth-close" onclick="this.closest('.oauth-overlay').remove()">&times;</button>
      <h3>Sign in with GitHub</h3>
      <p>Enter the code below on GitHub to authorize Zoid Editor.</p>
      <div class="oauth-code">${userCode}</div>
      <a href="${verifyUri}" target="_blank" rel="noopener" class="oauth-btn" onclick="event.stopPropagation()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        Open GitHub
      </a>
      <div class="oauth-status"><span class="spinner"></span>Waiting for you to authorize...</div>
      <button class="btn-secondary" onclick="cancelOAuthPoll();this.closest('.oauth-overlay').remove()" style="margin-top:16px;padding:8px 20px;font-size:12px">Cancel</button>
    </div>
  `;
  document.body.appendChild(overlay);

  pollForToken(deviceCode, interval, overlay);
}

let pollTimer = null;
function cancelOAuthPoll() {
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
}

async function pollForToken(deviceCode, interval, overlay) {
  cancelOAuthPoll();
  const statusEl = overlay.querySelector('.oauth-status');

  try {
    const res = await fetch('/api/github?action=poll-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_code: deviceCode }),
    });
    const data = await res.json();

    if (data.access_token) {
      localStorage.setItem(GH_KEY, data.access_token);
      await fetchGitHubUser(data.access_token);
      overlay.remove();
      updateNavUI();
      return;
    }

    if (data.error === 'authorization_pending') {
      // Still waiting
    } else if (data.error === 'slow_down') {
      interval += 5;
    } else if (data.error === 'expired_token') {
      statusEl.innerHTML = 'Code expired. Please try again.';
      return;
    } else if (data.error === 'access_denied') {
      statusEl.innerHTML = 'Authorization denied.';
      return;
    } else if (data.error) {
      statusEl.innerHTML = 'Error: ' + (data.error_description || data.error);
      return;
    }

    pollTimer = setTimeout(() => pollForToken(deviceCode, interval, overlay), interval * 1000);
  } catch (err) {
    statusEl.innerHTML = 'Connection error. Retrying...';
    pollTimer = setTimeout(() => pollForToken(deviceCode, interval, overlay), 5000);
  }
}

async function fetchGitHubUser(token) {
  try {
    const res = await fetch('/api/github?action=user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await res.json();
    if (user.login) {
      localStorage.setItem(GH_USER_KEY, JSON.stringify({
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name || user.login,
      }));
    }
  } catch {}
}

function signOutGitHub() {
  localStorage.removeItem(GH_KEY);
  localStorage.removeItem(GH_USER_KEY);
  updateNavUI();
}

// ===== DASHBOARD STATS =====
async function loadDashboardStats() {
  try {
    const [repoRes, releasesRes] = await Promise.all([
      fetch('/api/github?action=repo-stats'),
      fetch('/api/github?action=releases'),
    ]);
    const repo = await repoRes.json();
    const releases = await releasesRes.json();

    if (repo.stargazers_count !== undefined) {
      document.getElementById('dashStarsNum').textContent = formatNum(repo.stargazers_count);
    }
    if (repo.forks_count !== undefined) {
      document.getElementById('dashForksNum').textContent = formatNum(repo.forks_count);
    }
    if (repo.open_issues_count !== undefined) {
      document.getElementById('dashIssuesNum').textContent = formatNum(repo.open_issues_count);
    }

    if (Array.isArray(releases) && releases.length > 0) {
      const latest = releases[0];
      document.getElementById('dashVersionNum').textContent = latest.tag_name || latest.name || '--';

      let totalDownloads = 0;
      releases.forEach(r => {
        if (r.assets) {
          r.assets.forEach(a => { totalDownloads += a.download_count || 0; });
        }
      });
      document.getElementById('dashDownloadsNum').textContent = formatNum(totalDownloads);
    }
  } catch {}
}

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// Visit count from localStorage
(function showVisitCount() {
  const count = parseInt(localStorage.getItem('zoid_visits') || '0', 10);
  document.getElementById('dashVisitsNum').textContent = formatNum(count);
})();

// ===== INIT =====
updateNavUI();
loadDashboardStats();
