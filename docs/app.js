import { ChatInterface } from './components/ChatInterface.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('chat-container');
    const chatInterface = new ChatInterface(container);
});