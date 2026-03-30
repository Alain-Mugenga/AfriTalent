// ===== AfriTalent – Main JS (no build tools needed) =====

export const API = '/api';

// Toast notifications
export function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}
window.showToast = showToast;

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinksEl = document.querySelector('.nav-links');
if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => navLinksEl.classList.toggle('open'));
}

// Scroll reveal
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}
initReveal();

// Animated counter
document.querySelectorAll('[data-count]').forEach(el => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current) + (el.dataset.suffix || '');
      }, 16);
      obs.disconnect();
    }
  });
  obs.observe(el);
});

// Auth state
export async function getAuthState() {
  try {
    const res = await fetch(`${API}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()).user;
  } catch { return null; }
}
window.getAuthState = getAuthState;

// Update nav based on login state
export async function updateNav() {
  const authContainer = document.getElementById('nav-auth');
  if (!authContainer) return;
  const user = await getAuthState();
  if (user) {
    authContainer.innerHTML = `
      <li><span style="color:rgba(255,255,255,0.7);padding:0.5rem 0.8rem;font-size:0.9rem">Hi, ${user.name.split(' ')[0]}</span></li>
      ${user.role === 'admin' ? '<li><a href="/pages/admin.html">Admin</a></li>' : ''}
      <li><a href="#" class="nav-btn" id="logout-btn">Logout</a></li>
    `;
    document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
      showToast('Logged out');
      setTimeout(() => window.location.href = '/', 800);
    });
  } else {
    authContainer.innerHTML = `
      <li><a href="/pages/login.html">Login</a></li>
      <li><a href="/pages/register.html" class="nav-btn">Join Now</a></li>
    `;
  }
}
updateNav();

// Helpers
export function sportEmoji(sport) {
  const map = { Football:'⚽', Basketball:'🏀', Athletics:'🏃', Boxing:'🥊', Swimming:'🏊', Tennis:'🎾', Cycling:'🚴', Weightlifting:'🏋️', Wrestling:'🤼', Rugby:'🏈' };
  return map[sport] || '🏅';
}
window.sportEmoji = sportEmoji;

export function countryFlag(country) {
  const map = { Rwanda:'🇷🇼', Burundi:'🇧🇮', Uganda:'🇺🇬', Kenya:'🇰🇪', Tanzania:'🇹🇿', Nigeria:'🇳🇬', Ghana:'🇬🇭', 'South Africa':'🇿🇦', Ethiopia:'🇪🇹', Senegal:'🇸🇳' };
  return map[country] || '🌍';
}
window.countryFlag = countryFlag;
