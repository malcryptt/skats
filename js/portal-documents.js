import { auth, storage, db, onAuthStateChanged, ref, uploadBytesResumable, getDownloadURL, collection, addDoc, onSnapshot, query, serverTimestamp } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-upload');
    const uploadBtn = document.querySelector('.upload-box');
    const docListContainer = document.querySelector('.doc-list-container'); // Need to ensure this class exists in html

    if (!fileInput || !uploadBtn) return;

    // Trigger file select on box click
    uploadBtn.addEventListener('click', (e) => {
        if (e.target === fileInput) return;
        fileInput.click();
    });

    onAuthStateChanged(auth, (user) => {
        if (!user) return;
        const uid = user.uid;

        // Listen for user's documents
        const docsRef = collection(db, "users", uid, "documents");
        const q = query(docsRef);

        if (docListContainer) {
            onSnapshot(q, (snapshot) => {
                if (snapshot.empty) return; // Keep static placeholders if no real docs exist

                let html = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const statusClass = data.status === 'Verified' ? 'status-verified' : data.status === 'Review' ? 'status-review' : 'status-resubmit';
                    const iconColor = data.url.includes('.pdf') ? '#ef4444' : '#3b82f6';

                    html += `
                    <div class="doc-item">
                        <div class="doc-icon"><i class="ri-file-cloud-line" style="color:${iconColor}; font-size:1.5rem;"></i></div>
                        <div class="doc-info">
                            <h4>${data.name}</h4>
                            <p>${data.size || 'Unknown size'} • Uploaded via portal</p>
                        </div>
                        <div class="doc-status ${statusClass}">
                            <i class="${data.status === 'Verified' ? 'ri-checkbox-circle-fill' : 'ri-time-fill'}"></i> ${data.status}
                        </div>
                        <a href="${data.url}" target="_blank" class="doc-action" style="background:transparent; border:none; cursor:pointer;" title="Download">
                            <i class="ri-download-2-line"></i>
                        </a>
                    </div>`;
                });
                docListContainer.innerHTML = html;
            });
        }

        // Handle File Selection and Upload
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Simple validation
            if (file.size > 15 * 1024 * 1024) {
                alert("File too large. Maximum size is 15MB.");
                return;
            }

            const storageRef = ref(storage, `users/${uid}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Change UI to loading
            const originalBoxHtml = uploadBtn.innerHTML;
            uploadBtn.innerHTML = `<div style="text-align:center; padding: 2rem;">
                <i class="ri-loader-4-line ri-spin" style="font-size:2rem; color:var(--navy);"></i>
                <div style="margin-top:0.5rem; font-weight:500;">Encrypting and Uploading...</div>
            </div>`;

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Optional: could render progress bar here using (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                },
                (error) => {
                    console.error("Upload failed:", error);
                    alert("Secure upload failed. Please try again.");
                    uploadBtn.innerHTML = originalBoxHtml;
                },
                async () => {
                    // Success! Get URL and write to Firestore
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    await addDoc(docsRef, {
                        name: file.name,
                        url: downloadURL,
                        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                        status: 'Review',
                        timestamp: serverTimestamp()
                    });

                    // Restore UI
                    uploadBtn.innerHTML = originalBoxHtml;
                    fileInput.value = ''; // reset input
                    alert("Document securely uploaded and submitted for review!");
                }
            );
        });
    });
});
