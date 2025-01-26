const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001'
    : 'https://therapy-chat-backend.onrender.com';  // Your Render backend URL

export { API_URL };
