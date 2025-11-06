const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { URL } = require('url');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint
app.get('/proxy', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        
        if (!targetUrl) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }
        
        // Validate URL
        let parsedUrl;
        try {
            parsedUrl = new URL(targetUrl);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        
        // Make the request to the target URL
        const response = await axios({
            method: 'GET',
            url: targetUrl,
            headers: {
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            },
            timeout: 30000,
            maxRedirects: 5,
            validateStatus: function (status) {
                return status < 500; // Don't throw error for 4xx status codes
            }
        });
        
        // Set appropriate headers
        res.set({
            'Content-Type': response.headers['content-type'] || 'text/html',
            'X-Proxy-Status': 'success',
            'X-Original-Url': targetUrl,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        
        // Send the response data
        res.send(response.data);
        
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ 
            error: 'Proxy request failed', 
            details: error.message,
            code: error.code 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Server info endpoint
app.get('/info', (req, res) => {
    res.json({
        server: 'SecureProxy Backend',
        version: '1.0.0',
        features: [
            'CORS enabled',
            'Request forwarding',
            'Timeout handling',
            'User-agent preservation'
        ],
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`SecureProxy Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Test proxy: http://localhost:${PORT}/proxy?url=https://httpbin.org/ip`);
});