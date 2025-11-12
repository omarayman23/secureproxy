module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.json({
        server: 'SecureProxy Backend',
        version: '2.0.0',
        platform: 'Vercel',
        features: [
            'CORS enabled',
            'Request forwarding',
            'URL rewriting',
            'Timeout handling',
            'User-agent masking',
            'POST support'
        ],
        ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip,
        userAgent: req.get('User-Agent')
    });
};

