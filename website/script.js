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

// ===== USAGE TRACKING (localStorage) =====
function getTracker(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
}
function setTracker(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function trackVisit() {
  if (!trackingEnabled) return;
  const visits = getTracker('zd_visits', 0) + 1;
  setTracker('zd_visits', visits);
  const first = getTracker('zd_firstVisit', Date.now());
  setTracker('zd_firstVisit', first);
  const activity = getTracker('zd_activity', []);
  activity.unshift({ type: 'visit', text: 'Visited the website', time: Date.now() });
  setTracker('zd_activity', activity.slice(0, 50));
}
trackVisit();

function trackDownload() {
  if (!trackingEnabled) return;
  const dls = getTracker('zd_downloads', 0) + 1;
  setTracker('zd_downloads', dls);
  const activity = getTracker('zd_activity', []);
  activity.unshift({ type: 'download', text: 'Downloaded Zoid Editor', time: Date.now() });
  setTracker('zd_activity', activity.slice(0, 50));
}

function trackFeature(name) {
  if (!trackingEnabled) return;
  const features = getTracker('zd_features', []);
  if (!features.includes(name)) {
    features.push(name);
    setTracker('zd_features', features);
    const activity = getTracker('zd_activity', []);
    activity.unshift({ type: 'feature', text: `Explored: ${name}`, time: Date.now() });
    setTracker('zd_activity', activity.slice(0, 50));
  }
}

// Track feature section views
const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const name = entry.target.getAttribute('data-feature');
      if (name) trackFeature(name);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-feature]').forEach(el => featureObserver.observe(el));

// Track download clicks
document.querySelectorAll('.download-btns a').forEach(a => {
  a.addEventListener('click', trackDownload);
});

function getSessionTime() {
  const first = getTracker('zd_firstVisit', Date.now());
  const ms = Date.now() - first;
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return '<1m';
}

function getActivity() {
  return getTracker('zd_activity', []);
}

// ===== WEBSITE THEME =====
function setWebsiteTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('zd_theme', theme);
  document.querySelectorAll('.dash-toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === theme);
  });
}

(function loadTheme() {
  const theme = localStorage.getItem('zd_theme') || 'dark';
  setWebsiteTheme(theme);
})();

function toggleNotify(on) {
  localStorage.setItem('zd_notify', String(on));
  const cb = document.getElementById('dashNotifyToggle');
  if (cb) cb.checked = on;
}

(function loadNotify() {
  const on = localStorage.getItem('zd_notify') !== 'false';
  const cb = document.getElementById('dashNotifyToggle');
  if (cb) cb.checked = on;
})();

let trackingEnabled = true;

function toggleTracking(on) {
  trackingEnabled = on;
  localStorage.setItem('zd_tracking', String(on));
  const cb = document.getElementById('dashTrackingToggle');
  if (cb) cb.checked = on;
}

(function loadTracking() {
  const stored = localStorage.getItem('zd_tracking');
  trackingEnabled = stored !== 'false';
  const cb = document.getElementById('dashTrackingToggle');
  if (cb) cb.checked = trackingEnabled;
})();

function clearAllData() {
  if (!confirm('This will clear all local data including settings, usage tracking, and GitHub authentication. Are you sure?')) return;
  localStorage.removeItem('zd_visits');
  localStorage.removeItem('zd_downloads');
  localStorage.removeItem('zd_features');
  localStorage.removeItem('zd_firstVisit');
  localStorage.removeItem('zd_activity');
  localStorage.removeItem('zd_theme');
  localStorage.removeItem('zd_notify');
  localStorage.removeItem('zd_tracking');
  localStorage.removeItem(GH_KEY);
  localStorage.removeItem(GH_USER_KEY);
  // Reload page to reset everything
  window.location.reload();
}

// ===== GITHUB OAUTH DEVICE FLOW =====
const GH_KEY = 'zd_gh_token';
const GH_USER_KEY = 'zd_gh_user';

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
    btn.querySelectorAll('img').forEach(i => i.remove());
    const svg = btn.querySelector('svg');
    if (svg) svg.remove();
    const img = document.createElement('img');
    img.src = user.avatar_url;
    img.alt = user.login;
    img.width = 18;
    img.height = 18;
    btn.prepend(img);
    label.textContent = user.login;
    btn.classList.add('gh-signed-in');
  } else {
    btn.querySelectorAll('img').forEach(i => i.remove());
    let svg = btn.querySelector('svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
      svg.setAttribute('viewBox', '0 0 16 16');
      svg.setAttribute('fill', 'currentColor');
      svg.innerHTML = '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>';
      btn.prepend(svg);
    }
    label.textContent = 'Sign in';
    btn.classList.remove('gh-signed-in');
  }
  updateDashboard();
}

function updateDashboard() {
  const user = getStoredUser();
  const personal = document.getElementById('dashPersonal');
  const subtitle = document.getElementById('dashSubtitle');

  if (user) {
    personal.style.display = 'block';
    subtitle.textContent = 'Welcome back, ' + (user.name || user.login) + '!';
    document.getElementById('dashAvatar').src = user.avatar_url;
    document.getElementById('dashAvatar').alt = user.login;
    document.getElementById('dashDisplayName').textContent = user.name || user.login;
    document.getElementById('dashLogin').textContent = '@' + user.login;

    // Fill usage stats
    document.getElementById('dashMyVisits').textContent = formatNum(getTracker('zd_visits', 0));
    document.getElementById('dashMyDownloads').textContent = formatNum(getTracker('zd_downloads', 0));
    document.getElementById('dashMyFeatures').textContent = getTracker('zd_features', []).length;
    document.getElementById('dashMyTime').textContent = getSessionTime();

    // Fill activity log
    const activity = getActivity();
    const container = document.getElementById('dashActivity');
    if (activity.length === 0) {
      container.innerHTML = '<p class="dash-activity-empty">No activity yet.</p>';
    } else {
      container.innerHTML = activity.slice(0, 20).map(a => {
        const icon = a.type === 'visit' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
          : a.type === 'download' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        return `<div class="dash-activity-item">
          <div class="dash-activity-icon">${icon}</div>
          <span class="dash-activity-text">${a.text}</span>
          <span class="dash-activity-time">${timeAgo(a.time)}</span>
        </div>`;
      }).join('');
    }

    // Reload settings toggles
    loadNotify();
    loadTracking();
  } else {
    personal.style.display = 'none';
    subtitle.textContent = 'Sign in with GitHub to access your personal dashboard.';
  }
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}

async function startGitHubAuth() {
  if (getStoredToken()) {
    window.location.hash = '#dashboard';
    return;
  }
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
      <a href="${verifyUri}" target="_blank" rel="noopener" class="oauth-btn">
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
    if (data.error === 'authorization_pending') {}
    else if (data.error === 'slow_down') { interval += 5; }
    else if (data.error === 'expired_token') { statusEl.innerHTML = 'Code expired. Please try again.'; return; }
    else if (data.error === 'access_denied') { statusEl.innerHTML = 'Authorization denied.'; return; }
    else if (data.error) { statusEl.innerHTML = 'Error: ' + (data.error_description || data.error); return; }
    pollTimer = setTimeout(() => pollForToken(deviceCode, interval, overlay), interval * 1000);
  } catch {
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
    if (Array.isArray(releases) && releases.length > 0) {
      const latest = releases[0];
      document.getElementById('dashVersionNum').textContent = latest.tag_name || latest.name || '--';
      let totalDownloads = 0;
      releases.forEach(r => {
        if (r.assets) r.assets.forEach(a => { totalDownloads += a.download_count || 0; });
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

// ===== INIT =====
updateNavUI();
loadDashboardStats();
