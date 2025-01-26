export class ChatInterface {
    constructor(container) {
        this.container = container;
        this.chatHistories = {};  // Separate history for each therapist
        this.currentTherapist = null;
        this.isLoading = false;
        this.therapists = [];
        this.initialize();
    }

    async initialize() {
        // Fetch therapists first
        try {
            const response = await fetch('http://localhost:5001/api/therapists');
            const data = await response.json();
            this.therapists = data.therapists;
            this.showTherapistList();
        } catch (error) {
            console.error('Error fetching therapists:', error);
        }
    }

    showTherapistList() {
        this.container.innerHTML = `
            <div class="chat-container">
                <header class="chat-header">
                    <div class="header-content">
                        <div class="header-title">
                            <h1>Chats</h1>
                        </div>
                        <div class="edit-button">Edit</div>
                    </div>
                </header>

                <div class="search-container">
                    <div class="search-bar">
                        <span class="search-icon">🔍</span>
                        <input type="text" placeholder="Search" disabled>
                    </div>
                </div>

                <div class="therapist-list">
                    ${this.therapists.map(therapist => this.renderTherapistListItem(therapist)).join('')}
                </div>

                <footer class="chat-footer">
                    <p>Select a therapist to begin your conversation.</p>
                </footer>
            </div>
        `;

        // Add click handlers for therapist selection
        this.therapists.forEach(therapist => {
            const element = document.querySelector(`[data-therapist-id="${therapist.id}"]`);
            if (element) {
                element.addEventListener('click', () => this.selectTherapist(therapist));
            }
        });
    }

    renderTherapistListItem(therapist) {
        return `
            <div class="therapist-item" data-therapist-id="${therapist.id}">
                <div class="therapist-avatar">
                    ${this.getTherapistIcon(therapist.id)}
                </div>
                <div class="therapist-info">
                    <h2>${therapist.name}</h2>
                    <p>${this.getTherapistPreview(therapist.id)}</p>
                </div>
                <div class="chevron">›</div>
            </div>
        `;
    }

    selectTherapist(therapist) {
        this.currentTherapist = therapist;
        if (!this.chatHistories[therapist.id]) {
            this.chatHistories[therapist.id] = [];
        }
        this.showChat();
    }

    showChat() {
        this.container.innerHTML = `
            <div class="chat-container">
                <header class="chat-header">
                    <div class="header-content">
                        <div class="back-button">
                            <span class="back-arrow">‹</span>
                        </div>
                        <div class="header-title">
                            <div class="contact-info">
                                <div class="contact-photo">
                                    ${this.getTherapistIcon(this.currentTherapist.id)}
                                </div>
                                <div class="title-text">
                                    <h1>${this.currentTherapist.name}</h1>
                                    <p class="header-subtitle">${this.currentTherapist.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div class="chat-messages" id="chat-messages">
                    ${this.chatHistories[this.currentTherapist.id].length === 0 ? this.getWelcomeMessage() : ''}
                </div>

                <div class="chat-input-container">
                    <textarea 
                        id="chat-input" 
                        placeholder="Share what's on your mind..." 
                        rows="2"
                    ></textarea>
                    <button id="send-button" class="send-button">
                        <span class="send-icon">➤</span>
                    </button>
                </div>

                <footer class="chat-footer">
                    <p>Note: This is a supportive AI chat service. For immediate crisis support, please contact professional mental health services.</p>
                </footer>
            </div>
        `;

        // Restore chat history
        const messagesContainer = document.getElementById('chat-messages');
        this.chatHistories[this.currentTherapist.id].forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.role}-message`;
            messageElement.textContent = message.content;
            messagesContainer.appendChild(messageElement);
        });

        // Setup event listeners
        this.messagesContainer = messagesContainer;
        this.input = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        
        this.setupEventListeners();
    }

    getTherapistPreview(therapistId) {
        const previews = {
            dawn: "Guides conversations through brief, caring\nmessages while asking gentle questions\nto help people find their own path forward.",
            alex: "Teaches you to spot unhelpful thoughts \nand replace them with better ones to\nimprove your mood and actions.",
            maya: "Explores how your past experiences\nshape your present life to help you grow\nand understand yourself.",
            james: "Creates a warm, accepting space\nwhere you can share openly while being\nsupported in your personal growth.",
            sarah: "Combines mindfulness with practical skills\nto help you handle emotions, stress, and\nrelationships better."
        };
        return previews[therapistId];
    }

    getTherapistIcon(therapistId) {
        const icons = {
            dawn: '💜',
            alex: '💚',
            maya: '💙',
            james: '🧡',
            sarah: '💛'
        };
        return icons[therapistId] || '👤';  // Default fallback icon
    }

    getWelcomeMessage() {
        return `
            <div class="welcome-message">
                <div class="message-icon">👋</div>
                <p>Hi! I'm ${this.currentTherapist.name}. I'm here to chat and support you. You can start with something like:</p>
                <div class="examples-container">
                    <div class="example-message">
                        I've been feeling overwhelmed at work lately...
                    </div>
                    <div class="example-message">
                        I need help working through a difficult decision...
                    </div>
                    <div class="example-message">
                        Could we have a casual chat? I just need someone to listen...
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        // Add back button handler
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.showTherapistList());
        }

        // Add click handlers for example messages
        document.querySelectorAll('.example-message').forEach(example => {
            example.addEventListener('click', () => {
                this.input.value = example.textContent.trim();
                this.input.focus();
            });
        });
    }

    async handleSend() {
        if (this.isLoading) return;
        
        const message = this.input.value.trim();
        if (!message) return;

        this.input.value = '';
        this.setLoading(true);
        await this.sendMessage(message);
        this.setLoading(false);
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        this.input.disabled = loading;
        
        if (loading) {
            this.sendButton.innerHTML = '<span class="loading-spinner">⌛</span>';
        } else {
            this.sendButton.innerHTML = '<span class="send-icon">➤</span>';
        }
    }

    async sendMessage(message) {
        // Add user message to chat immediately
        this.addMessage('user', message);

        try {
            const response = await fetch('http://localhost:5001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    therapist_id: this.currentTherapist.id,
                    history: this.chatHistories[this.currentTherapist.id]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.addMessage('assistant', data.response);
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('assistant', 'I apologize, but I encountered an error. Please try again in a moment.');
            this.setLoading(false);
        }
    }

    addMessage(role, content) {
        this.chatHistories[this.currentTherapist.id].push({ role, content });
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        messageElement.textContent = content;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}
