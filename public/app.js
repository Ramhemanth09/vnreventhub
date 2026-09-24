// Client-side Application State
let currentUser = null;

const API_BASE = '/api';

// DOM Elements
const eventsGrid = document.getElementById('eventsGrid');
const myRegistrationsList = document.getElementById('myRegistrationsList');
const adminEventsList = document.getElementById('adminEventsList');
const adminRegistrationsList = document.getElementById('adminRegistrationsList');
const navAuthSection = document.getElementById('navAuthSection');
const userProfileSection = document.getElementById('userProfileSection');
const navUserName = document.getElementById('navUserName');
const navUserRole = document.getElementById('navUserRole');
const myRegNavBtn = document.getElementById('myRegNavBtn');
const adminNavBtn = document.getElementById('adminNavBtn');

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupModals();
  setupForms();
  await checkAuth();
  loadEvents();
});

// Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Navigation Tab Switching
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const viewId = btn.getAttribute('data-view');
      switchView(viewId);
    });
  });
}

function switchView(viewId) {
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach((s) => s.classList.remove('active'));

  const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
  const activeSection = document.getElementById(viewId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeSection) activeSection.classList.add('active');

  if (viewId === 'eventsView') loadEvents();
  if (viewId === 'myRegistrationsView') loadMyRegistrations();
  if (viewId === 'adminView') {
    loadAdminEvents();
    loadAdminRegistrations();
  }
}

// Authentication Check on Page Load
async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && data.data.user) {
        currentUser = data.data.user;
        renderUserHeader();
        return;
      }
    }
    currentUser = null;
    renderGuestHeader();
  } catch (err) {
    currentUser = null;
    renderGuestHeader();
  }
}

function renderUserHeader() {
  navAuthSection.style.display = 'none';
  userProfileSection.style.display = 'flex';
  navUserName.textContent = currentUser.name;
  navUserRole.textContent = currentUser.role;

  if (currentUser.role === 'ADMIN') {
    myRegNavBtn.style.display = 'inline-block';
    adminNavBtn.style.display = 'inline-block';
  } else {
    myRegNavBtn.style.display = 'inline-block';
    adminNavBtn.style.display = 'none';
  }
}

function renderGuestHeader() {
  navAuthSection.style.display = 'flex';
  userProfileSection.style.display = 'none';
  myRegNavBtn.style.display = 'none';
  adminNavBtn.style.display = 'none';
}

// Quick Login Demo Helper
async function quickLogin(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok && data && data.data && data.data.user) {
      currentUser = data.data.user;
      renderUserHeader();
      showToast(`Logged in as ${currentUser.name} (${currentUser.role})`, 'success');
      loadEvents();
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showToast('Network error during login.', 'error');
  }
}

// Modal Handlers
function setupModals() {
  document.getElementById('openLoginModalBtn').onclick = () => openModal('loginModal');
  document.getElementById('openRegisterModalBtn').onclick = () => openModal('registerModal');
  document.getElementById('logoutBtn').onclick = handleLogout;
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function switchModal(fromId, toId) {
  closeModal(fromId);
  openModal(toId);
}

// Form Handlers
function setupForms() {
  // Login Form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data && data.data && data.data.user) {
        currentUser = data.data.user;
        closeModal('loginModal');
        renderUserHeader();
        showToast('Login successful!', 'success');
        loadEvents();
      } else {
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (err) {
      showToast('Network error during login', 'error');
    }
  });

  // Register Form (Complete Student Profile)
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const rollNo = document.getElementById('regRollNo').value;
    const year = document.getElementById('regYear').value;
    const branch = document.getElementById('regBranch').value;
    const section = document.getElementById('regSection').value;
    const mobileNo = document.getElementById('regMobileNo').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rollNo,
          year,
          branch,
          section,
          mobileNo,
          email,
          password,
          role
        }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data && data.data && data.data.user) {
        currentUser = data.data.user;
        closeModal('registerModal');
        document.getElementById('registerForm').reset();
        renderUserHeader();
        showToast(`Welcome ${currentUser.name}! Account created and signed in.`, 'success');
        loadEvents();
      } else {
        const errMsg = data.errors ? data.errors.map((e) => e.message).join(', ') : data.message;
        showToast(errMsg || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Network error during registration', 'error');
    }
  });

  // Create Event Form (Admin)
  document.getElementById('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('evTitle').value;
    const description = document.getElementById('evDescription').value;
    const dateTime = new Date(document.getElementById('evDateTime').value).toISOString();
    const venue = document.getElementById('evVenue').value;
    const capacity = parseInt(document.getElementById('evCapacity').value, 10);
    const status = document.getElementById('evStatus').value;

    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dateTime, venue, capacity, status }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Event created successfully!', 'success');
        document.getElementById('createEventForm').reset();
        loadAdminEvents();
      } else {
        const errMsg = data.errors ? data.errors.map((e) => e.message).join(', ') : data.message;
        showToast(errMsg || 'Failed to create event', 'error');
      }
    } catch (err) {
      showToast('Network error while creating event', 'error');
    }
  });
}

// Logout Handler
async function handleLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    currentUser = null;
    renderGuestHeader();
    showToast('Logged out successfully', 'info');
    switchView('eventsView');
  } catch (err) {
    showToast('Logout failed', 'error');
  }
}

// 1. Load Events (Discovery View)
async function loadEvents() {
  eventsGrid.innerHTML = '<div class="loader">Fetching events...</div>';
  try {
    const res = await fetch(`${API_BASE}/events`, { credentials: 'include' });
    const result = await res.json();

    if (!result || !result.success || !result.data || !Array.isArray(result.data.events) || result.data.events.length === 0) {
      eventsGrid.innerHTML = `<div class="empty-state">No events available at this time.</div>`;
      return;
    }

    eventsGrid.innerHTML = result.data.events.map((event) => {
      const dateFormatted = new Date(event.dateTime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const registered = event.registeredCount || 0;
      const capacity = event.capacity || 1;
      const pct = Math.min(100, Math.round((registered / capacity) * 100));

      return `
        <div class="card event-card">
          <div>
            <div class="event-header">
              <h3 class="event-title">${escapeHtml(event.title)}</h3>
              <span class="badge badge-${(event.status || 'DRAFT').toLowerCase()}">${event.status}</span>
            </div>
            <p class="event-desc">${escapeHtml(event.description)}</p>
          </div>

          <div>
            <div class="event-meta">
              <div class="meta-row"><span>📍</span> <strong>${escapeHtml(event.venue)}</strong></div>
              <div class="meta-row"><span>⏰</span> ${dateFormatted}</div>
              
              <div class="capacity-bar-container">
                <div class="capacity-labels">
                  <span>Capacity: ${registered} / ${capacity} Filled</span>
                  <span>${event.availableSeats ?? 0} Left</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill ${event.isFull ? 'full' : ''}" style="width: ${pct}%"></div>
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-block" 
              ${event.isFull || event.status !== 'PUBLISHED' ? 'disabled' : ''} 
              onclick="handleRegister('${event._id}')">
              ${event.isFull ? '🚫 Event Full' : event.status !== 'PUBLISHED' ? 'Not Available' : '🎟️ Register Now'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    eventsGrid.innerHTML = '<div class="empty-state">Failed to reach server.</div>';
  }
}

// 2. Register for Event Handler
async function handleRegister(eventId) {
  if (!currentUser) {
    showToast('Please log in or sign up first to register for events', 'info');
    openModal('loginModal');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/registrations/events/${eventId}/register`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Successfully registered for event!', 'success');
      loadEvents();
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showToast('Network error during registration', 'error');
  }
}

// 3. Load My Registrations View
async function loadMyRegistrations() {
  myRegistrationsList.innerHTML = '<div class="loader">Loading registrations...</div>';
  try {
    const res = await fetch(`${API_BASE}/registrations/my`, { credentials: 'include' });
    const result = await res.json();

    if (!result || !result.success || !result.data || !Array.isArray(result.data.registrations) || result.data.registrations.length === 0) {
      myRegistrationsList.innerHTML = '<div class="empty-state">You have not registered for any events yet.</div>';
      return;
    }

    myRegistrationsList.innerHTML = result.data.registrations.map((reg) => {
      const ev = reg.event || {};
      const dateFormatted = ev.dateTime ? new Date(ev.dateTime).toLocaleString() : 'N/A';
      const isPast = ev.dateTime && new Date(ev.dateTime) <= new Date();
      const isCancelable = reg.status === 'REGISTERED' && !isPast && ev.status !== 'CANCELLED';

      return `
        <div class="card mt-4">
          <div class="event-header">
            <div>
              <h3>${escapeHtml(ev.title || 'Event Removed')}</h3>
              <p class="section-desc">📍 ${escapeHtml(ev.venue || 'N/A')} • ⏰ ${dateFormatted}</p>
            </div>
            <span class="badge badge-${(reg.status || 'REGISTERED').toLowerCase()}">${reg.status}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Registered on: ${new Date(reg.registeredAt).toLocaleDateString()}</span>
            ${
              isCancelable
                ? `<button class="btn btn-outline-danger btn-sm" onclick="cancelRegistration('${reg._id}')">Cancel Registration</button>`
                : `<span style="font-size: 0.8rem; color: var(--text-secondary);">${reg.status === 'CANCELLED' ? 'Cancelled' : 'Non-cancelable'}</span>`
            }
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    myRegistrationsList.innerHTML = '<div class="empty-state">Failed to load registrations.</div>';
  }
}

// 4. Cancel Student Registration
async function cancelRegistration(registrationId) {
  if (!confirm('Are you sure you want to cancel this registration?')) return;

  try {
    const res = await fetch(`${API_BASE}/registrations/${registrationId}/cancel`, {
      method: 'PATCH',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Registration cancelled successfully', 'success');
      loadMyRegistrations();
    } else {
      showToast(data.message || 'Failed to cancel', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// 5. Admin: Load Events Table
async function loadAdminEvents() {
  adminEventsList.innerHTML = '<div class="loader">Loading...</div>';
  try {
    const res = await fetch(`${API_BASE}/events`, { credentials: 'include' });
    const result = await res.json();

    if (!result || !result.success || !result.data || !Array.isArray(result.data.events) || result.data.events.length === 0) {
      adminEventsList.innerHTML = '<div class="empty-state">No events found.</div>';
      return;
    }

    adminEventsList.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${result.data.events.map(ev => `
            <tr>
              <td><strong>${escapeHtml(ev.title)}</strong><br><small style="color:var(--text-secondary)">${escapeHtml(ev.venue)}</small></td>
              <td>${ev.registeredCount ?? 0} / ${ev.capacity}</td>
              <td><span class="badge badge-${(ev.status || 'DRAFT').toLowerCase()}">${ev.status}</span></td>
              <td>
                ${ev.status === 'DRAFT' ? `<button class="btn btn-outline btn-sm" onclick="adminPublishEvent('${ev._id}')">Publish</button>` : ''}
                ${ev.status !== 'CANCELLED' ? `<button class="btn btn-outline-danger btn-sm" onclick="adminCancelEvent('${ev._id}')">Cancel</button>` : '<small>Cancelled</small>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    adminEventsList.innerHTML = '<div class="empty-state">Failed to load admin events.</div>';
  }
}

// Admin: Publish Event
async function adminPublishEvent(id) {
  try {
    const res = await fetch(`${API_BASE}/events/${id}/publish`, {
      method: 'PATCH',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Event published to students!', 'success');
      loadAdminEvents();
    } else {
      showToast(data.message || 'Failed', 'error');
    }
  } catch (err) {
    showToast('Error publishing event', 'error');
  }
}

// Admin: Cancel Event
async function adminCancelEvent(id) {
  if (!confirm('Are you sure you want to cancel this event? Students will no longer be able to register.')) return;
  try {
    const res = await fetch(`${API_BASE}/events/${id}/cancel`, {
      method: 'PATCH',
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Event marked as CANCELLED', 'success');
      loadAdminEvents();
    } else {
      showToast(data.message || 'Failed', 'error');
    }
  } catch (err) {
    showToast('Error cancelling event', 'error');
  }
}

// 6. Admin: Load Registrations Table (With Student Details)
async function loadAdminRegistrations() {
  adminRegistrationsList.innerHTML = '<div class="loader">Loading roster...</div>';
  try {
    const res = await fetch(`${API_BASE}/admin/registrations`, { credentials: 'include' });
    const result = await res.json();

    if (!result || !result.success || !result.data || !Array.isArray(result.data.registrations) || result.data.registrations.length === 0) {
      adminRegistrationsList.innerHTML = '<div class="empty-state">No student registrations recorded yet.</div>';
      return;
    }

    adminRegistrationsList.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Student Details</th>
            <th>Branch / Year / Sec</th>
            <th>Event Registered</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${result.data.registrations.map((reg) => {
            const u = reg.user || {};
            const ev = reg.event || {};
            return `
              <tr>
                <td>
                  <strong>${escapeHtml(u.name || 'Unknown')}</strong><br>
                  <small style="color:var(--text-secondary)">🆔 Roll: ${escapeHtml(u.rollNo || 'N/A')} | 📞 ${escapeHtml(u.mobileNo || 'N/A')}</small><br>
                  <small style="color:var(--accent-primary)">✉️ ${escapeHtml(u.email || '')}</small>
                </td>
                <td>
                  <strong>${escapeHtml(u.branch || 'N/A')}</strong><br>
                  <small style="color:var(--text-secondary)">${escapeHtml(u.year || 'N/A')} - Sec ${escapeHtml(u.section || 'N/A')}</small>
                </td>
                <td>
                  <strong>${escapeHtml(ev.title || 'Deleted Event')}</strong><br>
                  <small style="color:var(--text-secondary)">📍 ${escapeHtml(ev.venue || 'N/A')}</small>
                </td>
                <td><span class="badge badge-${(reg.status || 'REGISTERED').toLowerCase()}">${reg.status}</span></td>
                <td>
                  <select onchange="adminUpdateRegStatus('${reg._id}', this.value)" style="padding: 0.25rem 0.5rem; font-size: 0.78rem;">
                    <option value="REGISTERED" ${reg.status === 'REGISTERED' ? 'selected' : ''}>REGISTERED</option>
                    <option value="ATTENDED" ${reg.status === 'ATTENDED' ? 'selected' : ''}>ATTENDED</option>
                    <option value="CANCELLED" ${reg.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                  </select>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    adminRegistrationsList.innerHTML = '<div class="empty-state">Failed to load roster.</div>';
  }
}

// Admin: Update Student Registration Status
async function adminUpdateRegStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/admin/registrations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Status updated to ${newStatus}`, 'success');
      loadAdminRegistrations();
    } else {
      showToast(data.message || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Error updating status', 'error');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
