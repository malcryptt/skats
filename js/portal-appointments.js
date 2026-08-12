import { auth, db, onAuthStateChanged, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const apptGrid = document.querySelector('.appt-grid');
    const bookingForm = document.querySelector('.booking-form');

    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        const uid = user.uid;

        const apptsRef = collection(db, "users", uid, "appointments");

        // 1. Fetch existing appointments
        if (apptGrid) {
            const q = query(apptsRef, orderBy("date", "asc"));
            onSnapshot(q, (snapshot) => {
                if (snapshot.empty) return; // Keep static dummy data

                let html = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const meetingLink = data.link ? `<a href="${data.link}" target="_blank" class="btn-sm primary"><i class="ri-vidicon-line"></i> Join Session</a>` : '';

                    html += `
                    <div class="appt-card">
                        <div class="date-chip"><i class="ri-calendar-event-fill"></i> ${data.date} at ${data.time}</div>
                        <h3>${data.type}</h3>
                        <p><i class="ri-time-line"></i> ${data.duration || '60 mins'} • ${data.status}</p>
                        <div class="appt-actions">
                            ${meetingLink}
                            <a href="#" class="btn-sm" onclick="alert('Please message your case manager to reschedule within 24 hours of standard time.');"><i class="ri-calendar-check-line"></i> Reschedule</a>
                        </div>
                    </div>`;
                });
                apptGrid.innerHTML = html;
            });
        }

        // 2. Handle Booking form submission
        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = bookingForm.querySelector('button');
                btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Requesting...';
                btn.disabled = true;

                const inputs = bookingForm.querySelectorAll('select, input');

                try {
                    await addDoc(apptsRef, {
                        type: inputs[0].value,
                        date: inputs[1].value,
                        time: inputs[2].value,
                        status: 'Pending Confirmation',
                        createdAt: serverTimestamp()
                    });

                    alert("Appointment requested successfully! Your case manager will confirm the exact time.");
                    bookingForm.reset();
                } catch (error) {
                    console.error("Booking failed", error);
                    alert("Failed to submit request.");
                } finally {
                    btn.innerHTML = 'Request Appointment';
                    btn.disabled = false;
                }
            });
        }
    });
});
