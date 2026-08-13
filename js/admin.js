import {
    auth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
    db, collection, onSnapshot, query, orderBy
} from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {

    const overlay = document.getElementById('admin-login-overlay');
    const dashboardUi = document.getElementById('admin-dashboard-ui');

    // Auth Form
    const loginForm = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('admin-login-btn');
    const errorMsg = document.getElementById('admin-error');

    // Display state based on auth
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Logged in — hide overlay, show dashboard 
            // In a real production app, we would verify a Custom Claim (e.g., admin: true) here.
            overlay.style.display = 'none';
            dashboardUi.style.display = 'grid';

            // Start fetching data
            hydrateDashboard();
        } else {
            // Not logged in — show overlay
            overlay.style.display = 'flex';
            dashboardUi.style.display = 'none';
        }
    });

    // Login logic
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';
            loginBtn.textContent = 'Authenticating...';
            loginBtn.disabled = true;

            try {
                await signInWithEmailAndPassword(auth, emailInput.value.trim(), passInput.value);
                // onAuthStateChanged will handle the UI switch
            } catch (error) {
                console.error(error);
                errorMsg.textContent = 'Invalid admin credentials.';
                errorMsg.style.display = 'block';
                loginBtn.textContent = 'Authenticate';
                loginBtn.disabled = false;
            }
        });
    }

    // Logout logic
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await signOut(auth);
            // onAuthStateChanged will handle the UI switch back to login
        });
    }

    // ── Hydrate Dashboard Data ───────────────────────────────────────────────
    function hydrateDashboard() {
        // 1. Listen to LEADS
        const leadsQ = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
        onSnapshot(leadsQ, (snapshot) => {
            const tbody = document.getElementById('leads-tbody');
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">No leads found.</td></tr>';
                return;
            }

            let html = '';
            snapshot.forEach(docSnap => {
                const data = docSnap.data();

                // Format Date
                let dateStr = 'Unknown';
                if (data.timestamp?.toDate) {
                    dateStr = data.timestamp.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                }

                // Format Details based on form type (Eligibility vs Contact)
                let details = '';
                if (data.source === 'Eligibility Quiz') {
                    details = `<span style="font-size:0.8rem; color:#64748b;">Visa: ${data.visaType} | Region: ${data.region}</span>`;
                } else if (data.source === 'Contact Form') {
                    details = `<span style="font-size:0.8rem; color:#64748b;">Subj: ${data.subject} | Msg: ${data.message?.substring(0, 30)}...</span>`;
                }

                html += `
                <tr>
                    <td>${dateStr}</td>
                    <td><strong>${data.name || 'N/A'}</strong></td>
                    <td>${data.email || 'N/A'}</td>
                    <td><span class="status-badge ${data.source === 'Eligibility Quiz' ? 'status-active' : 'status-new'}">${data.source || 'Unknown'}</span></td>
                    <td>${details}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }, (error) => {
            console.error("Leads fetch error (Check Firestore Rules):", error);
            document.getElementById('leads-tbody').innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#ef4444;">Error loading leads. Check Firestore Rules.</td></tr>`;
        });

        // 2. Listen to USERS (Clients)
        const clientsQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        onSnapshot(clientsQ, (snapshot) => {
            const tbody = document.getElementById('clients-tbody');
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">No registered clients found.</td></tr>';
                return;
            }

            let html = '';
            snapshot.forEach(docSnap => {
                const data = docSnap.data();

                let dateStr = 'Unknown';
                if (data.createdAt?.toDate) {
                    dateStr = data.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                }

                html += `
                <tr>
                    <td>${dateStr}</td>
                    <td><strong>${data.fullName || data.username || 'New User'}</strong></td>
                    <td>${data.email || 'N/A'}</td>
                    <td><span class="status-badge status-new">${data.caseStatus || 'Pending'}</span></td>
                    <td>
                        <div style="background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden; width:100px;">
                            <div style="background:var(--sky-blue); height:100%; width:${data.caseProgress || 0}%;"></div>
                        </div>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }, (error) => {
            console.error("Users fetch error (Check Firestore Rules):", error);
            document.getElementById('clients-tbody').innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#ef4444;">Error loading clients. You must update Firestore Rules to allow admin access.</td></tr>`;
        });
    }

});
