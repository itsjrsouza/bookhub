const STORAGE_KEY = 'bookhub-diario-sessoes';

const form = document.getElementById('session-form');
const bookInput = document.getElementById('book');
const pagesInput = document.getElementById('pages');
const dateInput = document.getElementById('date');
const notesInput = document.getElementById('notes');
const sessionsList = document.getElementById('sessions-list');
const emptyState = document.getElementById('empty-state');
const installBtn = document.getElementById('install-btn');
const connectionStatus = document.getElementById('connection-status');

dateInput.valueAsDate = new Date();

function getSessions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderSessions() {
  const sessions = getSessions();
  sessionsList.innerHTML = '';

  emptyState.hidden = sessions.length > 0;

  sessions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((session) => {
      const li = document.createElement('li');
      li.className = 'session-item';
      li.innerHTML = `
        <div class="session-content">
          <p class="session-title">📘 ${escapeHtml(session.book)}</p>
          <p class="session-meta">📅 ${formatDate(session.date)} · ${session.pages} página(s) lidas</p>
          ${session.notes ? `<p class="session-notes">${escapeHtml(session.notes)}</p>` : ''}
        </div>
        <button class="btn-delete" data-id="${session.id}" title="Remover sessão">🗑️</button>
      `;
      sessionsList.appendChild(li);
    });
}

function addSession(session) {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  renderSessions();
}

function deleteSession(id) {
  const sessions = getSessions().filter((session) => session.id !== id);
  saveSessions(sessions);
  renderSessions();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  addSession({
    id: crypto.randomUUID(),
    book: bookInput.value.trim(),
    pages: Number(pagesInput.value),
    date: dateInput.value,
    notes: notesInput.value.trim(),
  });

  form.reset();
  dateInput.valueAsDate = new Date();
  bookInput.focus();
});

sessionsList.addEventListener('click', (event) => {
  const button = event.target.closest('.btn-delete');
  if (!button) return;
  deleteSession(button.dataset.id);
});

renderSessions();

function updateConnectionStatus() {
  connectionStatus.textContent = navigator.onLine ? '🟢 Online' : '🔴 Offline (modo local)';
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .catch((err) => console.error('Falha ao registrar o service worker:', err));
  });
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  installBtn.hidden = true;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
});

window.addEventListener('appinstalled', () => {
  installBtn.hidden = true;
  deferredInstallPrompt = null;
});
