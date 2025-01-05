export class ChatInterface {
    constructor(container) {
        this.container = container;
        this.messages = [];
        this.isLoading = false;
        this.initialize();
    }

    initialize() {
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
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="5" fill="#FDB813"/>
                                        <path d="M12 4V6M12 18V20M4 12H6M18 12H20M6.34 6.34L7.76 7.76M16.24 16.24L17.66 17.66M17.66 6.34L16.24 7.76M7.76 16.24L6.34 17.66" 
                                              stroke="#FDB813" 
                                              strokeWidth="2.5" 
                                              strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <div class="title-text">
                                    <h1>Dawn</h1>
                                    <p class="header-subtitle">Every day brings new clarity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div class="chat-messages" id="chat-messages">
                    <div class="welcome-message">
                        <div class="message-icon">👋</div>
                        <p>Hi! I'm here to chat and support you. You can start with something like:</p>
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
                    <p>Note: This is a supportive chat service. For immediate crisis support, please contact professional mental health services.</p>
                </footer>
            </div>
        `;

        // Add styles specific to examples
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            .welcome-message {
                text-align: center;
                color: #666;
                margin: auto;
                max-width: 90%;
            }

            .welcome-message p {
                margin: 12px 0;
                font-size: 15px;
            }

            .examples-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 16px;
            }

            .example-message {
                background: #f5f5f5;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                color: #555;
                cursor: pointer;
                transition: background-color 0.2s;
                text-align: left;
                border-left: 3px solid #007AFF;
            }

            .example-message:hover {
                background: #e8e8e8;
            }

            .message-icon {
                font-size: 32px;
                margin-bottom: 12px;
                animation: wave 1s ease-in-out;
            }

            @keyframes wave {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(-20deg); }
                50% { transform: rotate(0deg); }
                75% { transform: rotate(20deg); }
                100% { transform: rotate(0deg); }
            }
        `;
        document.head.appendChild(styleSheet);

        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

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
                    history: this.messages
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
        this.messages.push({ role, content });
        
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
