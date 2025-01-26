const config = {
    API_URL: process.env.NODE_ENV === 'production' 
        ? 'https://your-render-service-name.onrender.com'  // Replace with your Render URL
        : 'http://localhost:5001'
};

export default config;