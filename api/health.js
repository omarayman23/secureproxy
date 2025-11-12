module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        platform: 'vercel'
    });
};

