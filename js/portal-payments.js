import { auth, db, onAuthStateChanged, collection, onSnapshot } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const paymentTbody = document.querySelector('.payment-history tbody');

    if (!paymentTbody) return;

    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        const uid = user.uid;

        const paymentsRef = collection(db, "users", uid, "payments");

        onSnapshot(paymentsRef, (snapshot) => {
            if (snapshot.empty) return; // Retain fallback static HTML if database is empty

            let html = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                const statusColor = data.status === 'Paid' ? 'var(--sage)' : '#64748b';
                const statusBg = data.status === 'Paid' ? 'rgba(123,168,143,.1)' : '#f1f5f9';

                html += `
                <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:1.2rem 1.5rem; font-size:0.9rem;">${data.date}</td>
                    <td style="padding:1.2rem 1.5rem; font-size:0.9rem; font-weight:500; color:var(--navy);">${data.description}</td>
                    <td style="padding:1.2rem 1.5rem; font-size:0.9rem; font-family:monospace; font-size:1rem;">${data.amount}</td>
                    <td style="padding:1.2rem 1.5rem;">
                        <span style="background:${statusBg}; color:${statusColor}; padding:0.4rem 0.8rem; border-radius:4px; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${data.status}</span>
                    </td>
                    <td style="padding:1.2rem 1.5rem; text-align:center;">
                        ${data.receiptUrl ? `<a href="${data.receiptUrl}" target="_blank" style="color:var(--navy); text-decoration:none; font-size:1.3rem;"><i class="ri-file-download-line"></i></a>` : '-'}
                    </td>
                </tr>`;
            });
            paymentTbody.innerHTML = html;
        });
    });
});
