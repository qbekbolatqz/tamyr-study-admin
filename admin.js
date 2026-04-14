// ─── Tamyr Admin — Shared JS ───────────────────────────────────────────────
const SUPABASE_URL = 'https://acrbzirrytxzcenmphon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcmJ6aXJyeXR4emNlbm1waG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTAzMTMsImV4cCI6MjA5MDM2NjMxM30.i8FMvZxgsV9fPly_f_x_0rPogORJdWeY31NiM_y10-4';

const ADMIN_EMAILS = ['qbekbolat@proton.me'];

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Session timeout — 2 hours inactivity ─────────────────────────────────
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
let _activityTimer = null;

function _resetActivityTimer() {
  clearTimeout(_activityTimer);
  _activityTimer = setTimeout(async () => {
    await db.auth.signOut();
    window.location.href = 'index.html?reason=timeout';
  }, SESSION_TIMEOUT_MS);
}

function _startActivityTracking() {
  ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, _resetActivityTimer, { passive: true });
  });
  _resetActivityTimer(); // start the clock
}

// ─── Auth helpers ──────────────────────────────────────────────────────────
async function checkAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    await db.auth.signOut();
    window.location.href = 'index.html';
    return null;
  }

  // Enforce AAL2 if TOTP is enrolled
  const { data: aalData } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2') {
    // Has TOTP enrolled but not verified in this session
    await db.auth.signOut();
    window.location.href = 'index.html';
    return null;
  }

  // Show admin email in sidebar
  const emailEl = document.getElementById('adminEmail');
  if (emailEl) emailEl.textContent = session.user.email;

  _startActivityTracking();
  return session;
}

async function logout() {
  clearTimeout(_activityTimer);
  await db.auth.signOut();
  window.location.href = 'index.html';
}

// ─── UI helpers ────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('kk-KZ', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('kk-KZ', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

function difficultyStars(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}

// ─── Active nav link + logout ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-link');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(l => {
    if (l.getAttribute('href') === currentPage) l.classList.add('active');
  });
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
