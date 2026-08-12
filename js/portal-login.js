import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    onAuthStateChanged,
    db,
    doc,
    serverTimestamp
} from "./firebase-config.js";
import { setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// ─── AUTH STATE: Redirect already-logged-in users away from this page ───────
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is already authenticated — send directly to dashboard
        window.location.href = 'portal.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // ─── SIGN IN FORM ─────────────────────────────────────────────────────────
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-msg');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            errorMsg.style.display = 'none';
            errorMsg.innerText = '';
            submitBtn.innerHTML = 'Authenticating... <i class="ri-loader-4-line ri-spin"></i>';
            submitBtn.disabled = true;

            try {
                const email = emailInput.value.trim();
                const password = passwordInput.value;

                await signInWithEmailAndPassword(auth, email, password);
                // onAuthStateChanged above will handle the redirect
                submitBtn.innerHTML = 'Success! Redirecting...';

            } catch (error) {
                console.error(error.code, error.message);
                errorMsg.style.display = 'block';

                switch (error.code) {
                    case 'auth/invalid-credential':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMsg.innerText = 'Invalid email or password. Please try again.';
                        break;
                    case 'auth/too-many-requests':
                        errorMsg.innerText = 'Account temporarily blocked. Reset your password or try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMsg.innerText = 'Network error. Please check your internet connection.';
                        break;
                    default:
                        errorMsg.innerText = 'An authentication error occurred. Please contact your case manager.';
                }

                submitBtn.innerHTML = 'Access Dashboard <i class="ri-arrow-right-line" style="margin-left:0.5rem;"></i>';
                submitBtn.disabled = false;
            }
        });
    }

    // ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const rawEmail = emailInput ? emailInput.value.trim() : '';
            const resetEmail = prompt('Please confirm your account email to receive a reset link:', rawEmail);

            if (resetEmail) {
                try {
                    await sendPasswordResetEmail(auth, resetEmail);
                    alert('If an account exists for ' + resetEmail + ', a password reset link has been sent!');
                } catch (error) {
                    console.error('Reset password error:', error);
                    alert('An error occurred. Please make sure the email is valid.');
                }
            }
        });
    }

    // ─── REGISTER FORM ────────────────────────────────────────────────────────
    const registerForm = document.getElementById('register-form');
    const regSubmitBtn = document.getElementById('reg-submit-btn');
    const regErrorMsg = document.getElementById('reg-error-msg');
    const regSuccessMsg = document.getElementById('reg-success-msg');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('reg-fullname').value.trim();
            const username = document.getElementById('reg-username').value.trim().toLowerCase();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;

            // Hide previous messages
            regErrorMsg.style.display = 'none';
            regSuccessMsg.style.display = 'none';

            // Validate passwords match
            if (password !== confirm) {
                regErrorMsg.innerText = 'Passwords do not match. Please try again.';
                regErrorMsg.style.display = 'block';
                return;
            }

            if (password.length < 8) {
                regErrorMsg.innerText = 'Password must be at least 8 characters.';
                regErrorMsg.style.display = 'block';
                return;
            }

            regSubmitBtn.innerHTML = 'Creating Account... <i class="ri-loader-4-line ri-spin"></i>';
            regSubmitBtn.disabled = true;

            try {
                // 1. Create Firebase Auth user
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // 2. Set display name in Auth
                await updateProfile(user, { displayName: fullName });

                // 3. Seed Firestore profile document at users/{uid}
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    fullName: fullName,
                    username: username,
                    email: email,
                    createdAt: serverTimestamp(),
                    caseStatus: 'Pending Assignment',
                    caseProgress: 0
                });

                // Show success — onAuthStateChanged will redirect
                regSubmitBtn.innerHTML = 'Account Created! Redirecting...';
                regSuccessMsg.innerText = 'Account created successfully! Taking you to your dashboard...';
                regSuccessMsg.style.display = 'block';

            } catch (error) {
                console.error('Registration error:', error.code, error.message);

                switch (error.code) {
                    case 'auth/email-already-in-use':
                        regErrorMsg.innerText = 'This email is already registered. Please sign in instead.';
                        break;
                    case 'auth/invalid-email':
                        regErrorMsg.innerText = 'Please enter a valid email address.';
                        break;
                    case 'auth/weak-password':
                        regErrorMsg.innerText = 'Password is too weak. Use at least 8 characters.';
                        break;
                    default:
                        regErrorMsg.innerText = 'Registration failed. Please try again.';
                }

                regErrorMsg.style.display = 'block';
                regSubmitBtn.innerHTML = 'Create My Account <i class="ri-user-add-line" style="margin-left:0.5rem;"></i>';
                regSubmitBtn.disabled = false;
            }
        });
    }
});
