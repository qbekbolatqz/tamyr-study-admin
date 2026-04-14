// ─── Tamyr Admin — Shared JS ───────────────────────────────────────────────
const SUPABASE_URL = 'https://acrbzirrytxzcenmphon.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjcmJ6aXJyeXR4emNlbm1waG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTAzMTMsImV4cCI6MjA5MDM2NjMxM30.i8FMvZxgsV9fPly_f_x_0rPogORJdWeY31NiM_y10-4';

const ADMIN_EMAILS = ['qbekbolat@proton.me']; // Add admin emails here

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  return session;
}

async function logout() {
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

function difficultyStars(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}

// ─── Active nav link ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => {
    if (l.getAttribute('href') === window.location.pathname.split('/').pop()) {
      l.classList.add('active');
    }
  });
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
