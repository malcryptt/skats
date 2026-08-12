import { db, collection, addDoc, serverTimestamp } from "./firebase-config.js";

// Export standard function for any lead form
export async function submitLeadToFirebase(data, source) {
    try {
        const leadsRef = collection(db, "leads");
        await addDoc(leadsRef, {
            ...data,
            source: source,
            status: 'New',
            timestamp: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Error saving lead:", error);
        return { success: false, error };
    }
}

// Auto-bind contact form if it exists
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Extract values
            const inputs = contactForm.querySelectorAll('.form-field');
            const data = {
                name: inputs[0].value,
                email: inputs[1].value,
                phone: inputs[2].value,
                visaType: inputs[3].value,
                method: inputs[4].value,
                notes: inputs[5].value
            };

            const result = await submitLeadToFirebase(data, 'Contact Page');

            if (result.success) {
                submitBtn.innerHTML = '<i class="ri-check-line"></i> Request Sent';
                submitBtn.classList.add('btn-secondary'); // visually indicate success
                submitBtn.classList.remove('btn-primary');
                contactForm.reset();
                alert("Thank you! Your strategic consultation request has been received. Our team will contact you within 24 hours.");
            } else {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                alert("An error occurred. Please try again or email us directly.");
            }
        });
    }

    // Auto-bind Eligibility form if it exists
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Advance UI to processing state
            document.getElementById('step-4').classList.remove('active');
            document.getElementById('step-5').classList.add('active');
            // Hacky way to call global function updateProgress defined in html
            if (typeof window.updateProgress === 'function') window.updateProgress(5);

            // Extract values
            const inputs = leadForm.querySelectorAll('.form-control');
            const data = {
                name: inputs[0].value,
                email: inputs[1].value,
                phone: inputs[2].value,
                // userAnswers is a global var on the page
                quizData: window.userAnswers || {}
            };

            const result = await submitLeadToFirebase(data, 'Eligibility Quiz');

            if (result.success) {
                document.getElementById('processing-state').style.display = 'none';
                document.getElementById('success-state').style.display = 'block';
            } else {
                alert("We couldn't save your assessment. Please try again later.");
                document.getElementById('step-5').classList.remove('active');
                document.getElementById('step-4').classList.add('active');
            }
        });
    }
});
