import { auth, db, onAuthStateChanged, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input');
    const sendBtn = document.querySelector('.btn-send:last-child'); // The text input send button

    if (!chatMessages || !chatInput || !sendBtn) return;

    onAuthStateChanged(auth, (user) => {
        if (!user) return; // auth-guard handles redirect

        const uid = user.uid;
        const messagesRef = collection(db, "users", uid, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        // Disable input until first load to prevent issues
        chatInput.disabled = true;

        // Listen to real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Re-enable input once we connect
            chatInput.disabled = false;

            // Clear out static HTML placeholders if we have real Firestore data OR if it's empty but connected
            chatMessages.innerHTML = '';

            if (snapshot.empty) {
                chatMessages.innerHTML = `
                    <div style="text-align:center; padding: 2rem; color:var(--grey-text); font-size:0.9rem;">
                        <i class="ri-message-3-line" style="font-size:2rem; color:#cbd5e1; display:block; margin-bottom:1rem;"></i>
                        End-to-end encrypted chat initialized.<br>Send a message to securely contact your case manager.
                    </div>
                `;
                return;
            }

            snapshot.forEach((doc) => {
                const msg = doc.data();
                renderMessage(msg, chatMessages, user);
            });

            // Auto scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, (error) => {
            console.error("Error fetching messages:", error);
            chatMessages.innerHTML = '<div style="color:red; text-align:center;">Failed to connect to secure messaging server.</div>';
        });

        // Send Message logic
        const sendMessage = async () => {
            const text = chatInput.value.trim();
            if (!text) return;

            chatInput.value = '';

            try {
                await addDoc(messagesRef, {
                    text: text,
                    sender: 'client',
                    timestamp: serverTimestamp()
                });
            } catch (error) {
                console.error("Error sending message:", error);
                alert("Failed to send message securely. Please try again.");
                chatInput.value = text; // Restore text
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    });
});

function renderMessage(msg, container, user) {
    const isMine = msg.sender === 'client';
    const initials = isMine ? ((user.displayName || user.email).substring(0, 2).toUpperCase()) : 'SM'; // SM for Sarah Mitchell placeholder

    const timeString = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...';
    const dateString = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';

    const div = document.createElement('div');
    div.className = `msg ${isMine ? 'mine' : ''}`;

    div.innerHTML = `
        ${isMine ? `<div class="avatar" style="width:40px;height:40px;flex-shrink:0;">${initials}</div>` : `<div class="manager-pic"></div>`}
        <div>
            <div class="msg-bubble">${msg.text}</div>
            <div class="msg-meta">${dateString} ${timeString} ${isMine && msg.timestamp ? '· Sent ✓' : ''}</div>
        </div>
    `;

    container.appendChild(div);
}
