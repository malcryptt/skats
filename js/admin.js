import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut }
    from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot }
    from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// ── Firebase Init (self-contained so no cross-module import issues) ───────────
const firebaseConfig = {
    apiKey: "AIzaSyAsFfZN11JQuRQ1XM7aDJVMUatmgdmFUaE",
    authDomain: "skats-consults.firebaseapp.com",
    projectId: "skats-consults",
    storageBucket: "skats-consults.firebasestorage.app",
    messagingSenderId: "98599347696",
    appId: "1:98599347696:web:9627898c512fa6c3126935"
};

const app = initializeApp(firebaseConfig, "admin-app");
const auth = getAuth(app);
const db = getFirestore(app);

// ── Element refs ──────────────────────────────────────────────────────────────
const overlay = document.getElementById('admin-login-overlay');
const dashboardUi = document.getElementById('admin-dashboard-ui');
const loginForm = document.getElementById('admin-login-form');
const emailInput = document.getElementById('admin-email');
const passInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('admin-login-btn');
const errorMsg = document.getElementById('admin-error');
const logoutBtn = document.getElementById('admin-logout');

// ── Auth state monitoring ─────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    if (user) {
        overlay.style.display = 'none';
        dashboardUi.style.display = 'grid';
        hydrateDashboard();
    } else {
        overlay.style.display = 'flex';
        dashboardUi.style.display = 'none';
    }
});

// ── Login ─────────────────────────────────────────────────────────────────────
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    errorMsg.style.display = 'none';
    loginBtn.textContent = 'Authenticating...';
    loginBtn.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, emailInput.value.trim(), passInput.value);
    } catch (error) {
        console.error('Admin login error:', error.code, error.message);
        const messages = {
            'auth/user-not-found': 'No admin account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/invalid-credential': 'Incorrect email or password.',
            'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
        };
        errorMsg.textContent = messages[error.code] || 'Authentication failed. Please try again.';
        errorMsg.style.display = 'block';
        loginBtn.textContent = 'Authenticate';
        loginBtn.disabled = false;
    }
});

// ── Logout ────────────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
});

// ── Hydrate dashboard ─────────────────────────────────────────────────────────
function hydrateDashboard() {

    // --- Leads ---
    onSnapshot(collection(db, 'leads'), (snapshot) => {
        const tbody = document.getElementById('leads-tbody');
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">No leads yet.</td></tr>';
            return;
        }
        let html = '';
        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            let dateStr = '—';
            if (d.timestamp?.toDate) {
                dateStr = d.timestamp.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
            let details = '';
            if (d.source === 'Eligibility Quiz') {
                details = `<span style="font-size:.8rem;color:#64748b">Visa: ${d.visaType || '—'} | Region: ${d.region || '—'}</span>`;
            } else if (d.source === 'Contact Form') {
                details = `<span style="font-size:.8rem;color:#64748b">Subj: ${d.subject || '—'}</span>`;
            }
            html += `<tr>
                <td>${dateStr}</td>
                <td><strong>${d.name || 'N/A'}</strong></td>
                <td>${d.email || 'N/A'}</td>
                <td><span class="status-badge ${d.source === 'Eligibility Quiz' ? 'status-active' : 'status-new'}">${d.source || 'Unknown'}</span></td>
                <td>${details}</td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }, (err) => {
        document.getElementById('leads-tbody').innerHTML =
            `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#ef4444;">Permission denied — update your Firestore Rules to grant admin read access to /leads.</td></tr>`;
        console.error('Leads error:', err.code, err.message);
    });

    // --- Clients (users collection) ---
    onSnapshot(collection(db, 'users'), (snapshot) => {
        const tbody = document.getElementById('clients-tbody');
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">No registered clients yet.</td></tr>';
            return;
        }
        let html = '';
        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            let dateStr = '—';
            if (d.createdAt?.toDate) {
                dateStr = d.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            }
            html += `<tr>
                <td>${dateStr}</td>
                <td><strong>${d.fullName || d.username || 'New User'}</strong></td>
                <td>${d.email || 'N/A'}</td>
                <td><span class="status-badge status-new">${d.caseStatus || 'Pending'}</span></td>
                <td>
                    <div style="background:#e2e8f0;height:6px;border-radius:3px;overflow:hidden;width:100px;">
                        <div style="background:#1B6FA8;height:100%;width:${d.caseProgress || 0}%;"></div>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }, (err) => {
        document.getElementById('clients-tbody').innerHTML =
            `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#ef4444;">Permission denied — update your Firestore Rules to grant admin read access to /users.</td></tr>`;
        console.error('Users error:', err.code, err.message);
    });
}
