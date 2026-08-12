import { auth, onAuthStateChanged } from "./firebase-config.js";

// Basic routing guard
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Not logged in, redirect to login page
        window.location.href = 'portal-login.html';
    } else {
        // Authenticated! 
        // We can inject user data into the UI if needed
        const authNameElements = document.querySelectorAll('.auth-user-name');
        authNameElements.forEach(el => {
            el.textContent = user.displayName || user.email.split('@')[0];
        });
    }
});

// Bind universal logout buttons
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            import("./firebase-config.js").then(({ auth, signOut }) => {
                signOut(auth).then(() => {
                    window.location.href = 'portal-login.html';
                });
            });
        });
    });
});
