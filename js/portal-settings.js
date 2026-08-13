import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc,
    signOut
} from "./firebase-config.js";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail }
    from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // ── DOM refs ──────────────────────────────────────────────────────────────
    const avatarEl = document.querySelector('.avatar');
    const nameEl = document.querySelector('.user-block div div:first-child');
    const caseTagEl = document.querySelector('.user-block div div:last-child');
    const saveBtn = document.querySelector('.settings-card:nth-child(2) .btn-primary');
    const pwBtn = document.querySelector('.settings-card:nth-child(3) .btn-primary');
    const logoutBtn = document.querySelector('.danger-zone a');

    // Case Identity fields (read-only)
    const caseNumInput = document.querySelectorAll('.settings-card')[0]?.querySelectorAll('.form-control')[0];
    const visaTypeInput = document.querySelectorAll('.settings-card')[0]?.querySelectorAll('.form-control')[1];
    const managerInput = document.querySelectorAll('.settings-card')[0]?.querySelectorAll('.form-control')[2];
    const filingInput = document.querySelectorAll('.settings-card')[0]?.querySelectorAll('.form-control')[3];

    // Contact info fields
    const nameInput = document.querySelectorAll('.settings-card')[1]?.querySelectorAll('.form-control')[0];
    const emailInput = document.querySelectorAll('.settings-card')[1]?.querySelectorAll('.form-control')[1];
    const phoneInput = document.querySelectorAll('.settings-card')[1]?.querySelectorAll('.form-control')[2];

    // Password fields
    const currentPwInput = document.querySelectorAll('.settings-card')[2]?.querySelectorAll('.form-control')[0];
    const newPwInput = document.querySelectorAll('.settings-card')[2]?.querySelectorAll('.form-control')[1];

    onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        // ── Fetch Firestore profile ───────────────────────────────────────────
        const snap = await getDoc(doc(db, 'users', user.uid));
        const profile = snap.exists() ? snap.data() : {};

        // ── Hydrate sidebar ───────────────────────────────────────────────────
        const initials = (profile.fullName || user.displayName || user.email || 'U')
            .split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

        if (avatarEl) avatarEl.textContent = initials;
        if (nameEl) nameEl.textContent = profile.fullName || user.displayName || user.email;
        if (caseTagEl) caseTagEl.textContent = profile.caseType || 'Case Pending';

        // ── Hydrate Case Identity (read-only) ─────────────────────────────────
        if (caseNumInput) caseNumInput.value = profile.caseNumber || 'Pending Assignment';
        if (visaTypeInput) visaTypeInput.value = profile.caseType || 'Pending Assignment';
        if (managerInput) managerInput.value = profile.caseManager || 'To Be Assigned';
        if (filingInput) filingInput.value = profile.filingDate || 'Pending';

        // ── Hydrate Contact Info ──────────────────────────────────────────────
        if (nameInput) nameInput.value = profile.fullName || user.displayName || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = profile.phone || '';

        // ── Save Contact Info ─────────────────────────────────────────────────
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;
                try {
                    await setDoc(doc(db, 'users', user.uid), {
                        fullName: nameInput.value.trim(),
                        phone: phoneInput.value.trim(),
                    }, { merge: true });

                    saveBtn.textContent = '✓ Saved!';
                    setTimeout(() => {
                        saveBtn.textContent = 'Save Changes';
                        saveBtn.disabled = false;
                    }, 2000);
                } catch (err) {
                    console.error(err);
                    saveBtn.textContent = 'Save Changes';
                    saveBtn.disabled = false;
                    alert('Could not save. Please try again.');
                }
            });
        }

        // ── Change Password ───────────────────────────────────────────────────
        if (pwBtn) {
            pwBtn.addEventListener('click', async () => {
                const currentPw = currentPwInput?.value;
                const newPw = newPwInput?.value;

                if (!currentPw || !newPw) {
                    alert('Please fill both password fields.');
                    return;
                }
                if (newPw.length < 8) {
                    alert('New password must be at least 8 characters.');
                    return;
                }

                pwBtn.textContent = 'Updating...';
                pwBtn.disabled = true;

                try {
                    const credential = EmailAuthProvider.credential(user.email, currentPw);
                    await reauthenticateWithCredential(user, credential);
                    await updatePassword(user, newPw);

                    currentPwInput.value = '';
                    newPwInput.value = '';
                    pwBtn.textContent = '✓ Password Updated!';
                    setTimeout(() => {
                        pwBtn.textContent = 'Update Password';
                        pwBtn.disabled = false;
                    }, 2500);
                } catch (err) {
                    console.error(err);
                    const msg = err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
                        ? 'Current password is incorrect.'
                        : 'Password update failed. Please try again.';
                    alert(msg);
                    pwBtn.textContent = 'Update Password';
                    pwBtn.disabled = false;
                }
            });
        }

        // ── Sign Out ──────────────────────────────────────────────────────────
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await signOut(auth);
                window.location.href = 'portal-login.html';
            });
        }
    });
});
