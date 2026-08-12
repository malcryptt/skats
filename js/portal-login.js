import { auth, signInWithEmailAndPassword } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-msg');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset state
        errorMsg.style.display = 'none';
        errorMsg.innerText = '';
        submitBtn.innerHTML = 'Authenticating... <i class="ri-loader-4-line ri-spin"></i>';
        submitBtn.disabled = true;

        try {
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Firebase Auth Call
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in successfully!", userCredential.user);

            submitBtn.innerHTML = 'Success! Redirecting...';

            // Redirect to dashboard
            window.location.href = 'portal.html';

        } catch (error) {
            console.error(error.code, error.message);
            errorMsg.style.display = 'block';

            // User-friendly error mapping
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMsg.innerText = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/too-many-requests':
                    errorMsg.innerText = 'Account temporarily blocked due to multiple failed attempts. Reset your password or try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMsg.innerText = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMsg.innerText = 'An authenticaton error occurred. Please contact your case manager.';
            }

            // Restore button
            submitBtn.innerHTML = 'Access Dashboard <i class="ri-arrow-right-line" style="margin-left:0.5rem;"></i>';
            submitBtn.disabled = false;
        }
    });
});
