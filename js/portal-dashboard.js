import { auth, db, onAuthStateChanged, doc, getDoc, collection, query, where, getDocs } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    // We only execute dashboard logic when auth is resolved
    onAuthStateChanged(auth, async (user) => {
        if (!user) return; // auth-guard handles the redirect

        const uid = user.uid;

        try {
            // Fetch User Profile / Case Data from Firestore
            const userDocRef = doc(db, "users", uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                renderDashboard(data);
            } else {
                console.warn("No custom Firestore data found for user. Displaying default UI.");
                // We could seed the DB here, but for now we let the static HTML render.

                // Let's at least update the name
                const nameElements = document.querySelectorAll('.auth-user-name');
                const initialsElements = document.querySelectorAll('.avatar');

                const fallbackName = user.displayName || user.email.split('@')[0];
                const fallbackInitials = fallbackName.substring(0, 2).toUpperCase();

                nameElements.forEach(el => el.textContent = fallbackName);
                initialsElements.forEach(el => el.textContent = fallbackInitials);
            }
        } catch (error) {
            console.error("Error fetching Firestore data:", error);
        }
    });
});

function renderDashboard(data) {
    // 1. Sidebar profile
    const nameEl = document.querySelector('.user-block > div > div:first-child');
    const visaEl = document.querySelector('.user-block > div > div:last-child');
    const avatar = document.querySelector('.user-block .avatar');

    if (nameEl) nameEl.textContent = data.displayName || data.email;
    if (visaEl) visaEl.textContent = data.caseType || "Pending Allocation";
    if (avatar && data.displayName) {
        const parts = data.displayName.split(' ');
        if (parts.length > 1) {
            avatar.textContent = parts[0][0] + parts[1][0];
        } else {
            avatar.textContent = parts[0].substring(0, 2).toUpperCase();
        }
    }

    // 2. Page Header
    const titleObj = document.querySelector('.page-title p');
    if (titleObj) titleObj.textContent = `Track your ${data.caseType || 'Visa'} processing status in real-time.`;

    // 3. Stats Row
    const daysEl = document.querySelector('.stat-card:nth-child(1) .value');
    const docEl = document.querySelector('.stat-card:nth-child(2) .value');
    const milestoneEl = document.querySelector('.stat-card:nth-child(3) .value');

    if (daysEl && data.daysInProcess) daysEl.textContent = data.daysInProcess;
    if (docEl && data.docsVerified && data.docsRequired) {
        docEl.innerHTML = `${data.docsVerified} <span style="font-size:1rem;color:var(--grey-text);">/ ${data.docsRequired}</span>`;
    }
    if (milestoneEl && data.nextMilestone) milestoneEl.textContent = data.nextMilestone;

    // 4. Stepper mapping
    const steps = document.querySelectorAll('.stepper .step');
    if (steps && data.currentStep !== undefined) {
        steps.forEach((step, index) => {
            step.classList.remove('completed', 'active', 'upcoming');
            if (index < data.currentStep) {
                step.classList.add('completed');
                step.querySelector('.step-icon').innerHTML = '<i class="ri-check-line"></i>';
            } else if (index === data.currentStep) {
                step.classList.add('active');
                step.querySelector('.step-icon').innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';
            } else {
                step.classList.add('upcoming');
                step.querySelector('.step-icon').innerHTML = '';
            }
        });
    }
}
