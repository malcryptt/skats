import { auth, db, onAuthStateChanged, collection, onSnapshot, query } from "./firebase-config.js";

const WHATSAPP_NUMBER = "2348130833062";
const CONTACT_EMAIL = "info@skatsconsults.com";

document.addEventListener('DOMContentLoaded', () => {
    const uploadBox = document.querySelector('.upload-box');
    const docListContainer = document.querySelector('.doc-list-container');

    // Build and inject the submission modal
    const modal = document.createElement('div');
    modal.id = 'doc-submit-modal';
    modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(11,37,69,0.7); backdrop-filter:blur(4px); z-index:9999; align-items:center; justify-content:center;';

    const card = document.createElement('div');
    card.style.cssText = 'background:white; border-radius:12px; padding:2.5rem; max-width:480px; width:90%; text-align:center; box-shadow:0 25px 60px rgba(0,0,0,0.2);';
    card.innerHTML = [
        '<div style="font-size:3rem; margin-bottom:1rem;">&#x1F512;</div>',
        '<h2 style="font-family:Fraunces,serif; color:#0B2545; margin-bottom:0.5rem; font-size:1.5rem;">Submit Your Documents Securely</h2>',
        '<p style="color:#64748b; font-size:0.95rem; margin-bottom:2rem; line-height:1.6;">',
        'For maximum security, please send your documents directly to your case manager via WhatsApp or email. ',
        'Your files will be handled with strict confidentiality.',
        '</p>',
        '<div style="display:flex; flex-direction:column; gap:1rem;">',
        '<a id="modal-whatsapp" href="#" target="_blank" rel="noopener"',
        ' style="background:#25D366; color:white; padding:1rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:600; display:flex; align-items:center; justify-content:center; gap:0.7rem; font-size:1rem;">',
        '<i class="ri-whatsapp-fill" style="font-size:1.3rem;"></i> Send via WhatsApp',
        '</a>',
        '<a id="modal-email" href="#"',
        ' style="background:#0B2545; color:white; padding:1rem 1.5rem; border-radius:8px; text-decoration:none; font-weight:600; display:flex; align-items:center; justify-content:center; gap:0.7rem; font-size:1rem;">',
        '<i class="ri-mail-send-fill" style="font-size:1.3rem;"></i> Send via Email',
        '</a>',
        '<button id="modal-close" style="background:transparent; border:1px solid #cbd5e1; color:#64748b; padding:0.8rem; border-radius:8px; cursor:pointer; font-size:0.9rem;">',
        'Close',
        '</button>',
        '</div>',
        '<p style="margin-top:1.5rem; font-size:0.78rem; color:#94a3b8;">',
        '<i class="ri-shield-keyhole-line"></i> WhatsApp is end-to-end encrypted. Your documents are protected.',
        '</p>'
    ].join('');

    modal.appendChild(card);
    document.body.appendChild(modal);

    // Wire up the upload zone to open the modal
    if (uploadBox) {
        uploadBox.addEventListener('click', () => {
            const waText = encodeURIComponent("Hello Skats Consults, I would like to securely submit my documents for my visa case.");
            const emailBody = encodeURIComponent("Hello Skats Consults,\n\nI would like to submit my documents for my visa case. Please find the required files attached.\n\nKind regards");
            const emailSubject = encodeURIComponent("Document Submission \u2014 Visa Case");

            document.getElementById('modal-whatsapp').href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + waText;
            document.getElementById('modal-email').href = "mailto:" + CONTACT_EMAIL + "?subject=" + emailSubject + "&body=" + emailBody;

            modal.style.display = 'flex';
        });
    }

    // Close modal handlers
    document.getElementById('modal-close').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Firestore: listen for documents saved by admin (for future use / when Storage is unlocked)
    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        const uid = user.uid;
        const docsRef = collection(db, "users", uid, "documents");
        const q = query(docsRef);

        if (docListContainer) {
            onSnapshot(q, (snapshot) => {
                if (snapshot.empty) return; // Keep static HTML placeholders

                let html = '';
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    const iconColor = data.name && data.name.toLowerCase().includes('.pdf') ? '#ef4444' : '#3b82f6';
                    const statusClass = data.status === 'Verified' ? 'approved' : 'review';
                    html += [
                        '<div class="doc-card">',
                        '<div class="doc-header">',
                        '<div class="doc-name"><i class="ri-file-cloud-line" style="color:' + iconColor + ';"></i> ' + data.name + '</div>',
                        '<span class="badge ' + statusClass + '">' + data.status + '</span>',
                        '</div>',
                        '<div class="upload-meta"><span><i class="ri-user-line"></i> Submitted by Client</span></div>',
                        '</div>'
                    ].join('');
                });
                docListContainer.innerHTML = html;
            });
        }
    });
});
