// Sample chat data in JSON format
const sampleChatsData = [
    {
        id: "chat1",
        title: "Web Design Tips",
        messages: [
            { sender: "user", text: "How do I create a responsive web design?" },
            { sender: "bot", text: "Use CSS media queries to adjust styles for different screen sizes. Start with mobile-first approach and use flexible units like rem, em, and percentages instead of fixed pixels." },
            { sender: "user", text: "What about flexbox and grid?" },
            { sender: "bot", text: "Flexbox is great for one-dimensional layouts, while CSS Grid excels at two-dimensional layouts. Both are essential for modern responsive design." }
        ]
    },
    {
        id: "chat2",
        title: "JavaScript Tutorial",
        messages: [
            { sender: "user", text: "What is the difference between var, let, and const?" },
            { sender: "bot", text: "var is function-scoped, let and const are block-scoped. Use const by default, let when you need to reassign. Avoid var in modern JavaScript." },
            { sender: "user", text: "Can you give me an example?" },
            { sender: "bot", text: "const name = 'John'; // Immutable reference\nlet age = 25; // Can be reassigned\nage = 26; // This works\nvar city = 'NYC'; // Avoid using var" }
        ]
    },
    {
        id: "chat3",
        title: "CSS Glass Effect",
        messages: [
            { sender: "user", text: "How do I create a glass morphism effect?" },
            { sender: "bot", text: "Use backdrop-filter: blur() along with a semi-transparent background. This creates the frosted glass effect. Add border and shadow for depth." },
            { sender: "user", text: "Is it supported in all browsers?" },
            { sender: "bot", text: "Chrome, Edge, and Safari support it well. Firefox has limited support. Always check caniuse.com for current browser compatibility." }
        ]
    }
];

// Chat data structure
let chats = [];
let currentChatId = null;

// DOM elements
const chatList = document.querySelector('.chat-list');
const messagesContainer = document.querySelector('.messages');
const inputField = document.querySelector('.glass-input');
const sendBtn = document.querySelector('.send-btn');
const newChatBtn = document.querySelector('.new-chat-btn');
const themeToggle = document.querySelector('.theme-toggle');
const divider = document.querySelector('.divider');
const leftPanel = document.querySelector('.left-panel');
const rightPanel = document.querySelector('.right-panel');

// Resizable split behavior
let isResizing = false;
let startX = 0;
let startLeftWidth = 0;

function startResize(event) {
    isResizing = true;
    startX = event.clientX || (event.touches && event.touches[0].clientX);
    startLeftWidth = leftPanel.getBoundingClientRect().width;
    divider.classList.add('active');
    document.body.style.cursor = 'col-resize';
}

function stopResize() {
    if (!isResizing) return;
    isResizing = false;
    divider.classList.remove('active');
    document.body.style.cursor = '';
}

function doResize(event) {
    if (!isResizing) return;
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const delta = clientX - startX;
    const newWidth = startLeftWidth + delta;
    const minWidth = 220;
    const maxWidth = Math.max(320, window.innerWidth * 0.6);

    if (newWidth < minWidth || newWidth > maxWidth) return;

    leftPanel.style.width = `${newWidth}px`;
    rightPanel.style.width = `calc(100% - ${newWidth}px - 10px)`;
}

divider.addEventListener('mousedown', startResize);
divider.addEventListener('touchstart', startResize, { passive: true });
window.addEventListener('mousemove', doResize);
window.addEventListener('touchmove', doResize, { passive: false });
window.addEventListener('mouseup', stopResize);
window.addEventListener('touchend', stopResize);

// Load chats from localStorage or use sample data
function loadChats() {
    const savedChats = localStorage.getItem('chatbotChats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
    } else {
        chats = JSON.parse(JSON.stringify(sampleChatsData));
        saveChats();
    }
}

// Save chats to localStorage
function saveChats() {
    localStorage.setItem('chatbotChats', JSON.stringify(chats));
}

// Theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('chatbotTheme', newTheme);
});

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('chatbotTheme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

// Create new chat
newChatBtn.addEventListener('click', () => {
    const chatId = Date.now().toString();
    const newChat = {
        id: chatId,
        title: `Chat ${chats.length + 1}`,
        messages: []
    };
    chats.push(newChat);
    currentChatId = chatId;
    saveChats();
    renderChatList();
    renderMessages();
});

// Render chat list
function renderChatList() {
    chatList.innerHTML = '';
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
        chatItem.textContent = chat.title;
        chatItem.addEventListener('click', () => {
            currentChatId = chat.id;
            renderChatList();
            renderMessages();
        });
        chatList.appendChild(chatItem);
    });
}

// Render messages
function renderMessages() {
    messagesContainer.innerHTML = '';
    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (currentChat && currentChat.messages.length > 0) {
        const messagesWrapper = document.createElement('div');
        messagesWrapper.className = 'messages-wrapper';

        currentChat.messages.forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${message.sender}`;
            messageEl.innerHTML = message.text.replace(/\n/g, '<br>');
            messagesWrapper.appendChild(messageEl);
        });

        messagesContainer.appendChild(messagesWrapper);
    } else {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">💬</div>
            <p>No messages yet. Start a conversation!</p>
        `;
        messagesContainer.appendChild(emptyState);
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
async function sendMessage() {
    const text = inputField.value.trim();
    if (!text || !currentChatId) return;

    const currentChat = chats.find(chat => chat.id === currentChatId);
    if (!currentChat) return;

    // Add user message
    currentChat.messages.push({ sender: 'user', text });
    saveChats();
    renderMessages();

    let response = await request(text);

    console.log(response);

    // Simulate bot response
    setTimeout(() => {
        currentChat.messages.push({ sender: 'bot', text: String(response) || "Sorry, I couldn't process your request." });
        saveChats();
        renderMessages();
    }, 5000);

    inputField.value = '';
}

sendBtn.addEventListener('click', sendMessage);
inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Initialize: Load chats from localStorage or sample data
loadChats();
if (chats.length > 0) {
    currentChatId = chats[0].id;
}
renderChatList();
renderMessages();


async function request(content) {
  const response =  await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
            'X-OpenRouter-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'stepfun/step-3.5-flash:free',
            messages: [
                {
                    role: 'user',
                    content: content,
                },
            ],
        }),
    });


    const data = await response.json();

    // API එකෙන් error එකක් ආවොත් ඒක පරීක්ෂා කිරීම
    if (!response.ok) {
        console.error("API Error:", data);
        return null;
    }

    return data.choices[0].message.content;

}