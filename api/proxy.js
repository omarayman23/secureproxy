const axios = require('axios');
const { URL } = require('url');

// Function to rewrite URLs in HTML to go through proxy
function rewriteHTML(html, targetUrl, proxyBase) {
    try {
        const urlObj = new URL(targetUrl);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
        
        // Rewrite absolute URLs in src, href, action, and other attributes
        const urlAttributes = ['src', 'href', 'action', 'data-src', 'data-href', 'background', 'poster'];
        
        urlAttributes.forEach(attr => {
            // Match attribute="url" or attribute='url'
            const regex = new RegExp(`(${attr}\\s*=\\s*["'])(https?:\\/\\/[^"']+)(["'])`, 'gi');
            html = html.replace(regex, (match, prefix, url, suffix) => {
                try {
                    // Skip if it's already a proxy URL or is a data URL
                    if (url.includes('/api/proxy?url=') || url.startsWith('data:') || url.startsWith('#')) {
                        return match;
                    }
                    return `${prefix}${proxyBase}/api/proxy?url=${encodeURIComponent(url)}${suffix}`;
                } catch (e) {
                    return match;
                }
            });
        });
        
        // Rewrite URLs in CSS (url(...))
        html = html.replace(/url\(["']?(https?:\/\/[^"')]+)["']?\)/gi, (match, url) => {
            try {
                if (url.includes('/api/proxy?url=') || url.startsWith('data:')) {
                    return match;
                }
                return `url(${proxyBase}/api/proxy?url=${encodeURIComponent(url)})`;
            } catch (e) {
                return match;
            }
        });
        
        // Rewrite relative URLs in src and href
        html = html.replace(/(src|href)\s*=\s*["'](?!http|\/\/|data:|#|javascript:|mailto:)([^"']+)["']/gi, (match, attr, relativeUrl) => {
            try {
                const absoluteUrl = new URL(relativeUrl, baseUrl).href;
                return `${attr}="${proxyBase}/api/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
            } catch (e) {
                return match;
            }
        });
        
        // Add base tag to help with relative URLs
        const baseTag = `<base href="${baseUrl}">`;
        if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>${baseTag}`);
        } else if (html.includes('<html>')) {
            html = html.replace('<html>', `<html><head>${baseTag}</head>`);
        } else {
            html = baseTag + html;
        }
        
        return html;
    } catch (error) {
        console.error('Error rewriting HTML:', error);
        return html;
    }
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const targetUrl = req.query.url;
        
        if (!targetUrl) {
            return res.status(400).json({ 
                error: 'URL parameter is required',
                usage: '/api/proxy?url=https://example.com'
            });
        }
        
        // Validate URL
        let parsedUrl;
        try {
            parsedUrl = new URL(targetUrl);
            
            // Security: Block internal/private IPs
            if (['localhost', '127.0.0.1', '0.0.0.0'].some(ip => parsedUrl.hostname.includes(ip))) {
                return res.status(403).json({ error: 'Access to internal URLs is forbidden' });
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }
        
        console.log(`📡 Proxying ${req.method} request to: ${targetUrl}`);
        
        // Get proxy base URL
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const proxyBase = `${protocol}://${host}`;
        
        // Make the request to the target URL
        const axiosConfig = {
            method: req.method === 'POST' ? 'POST' : 'GET',
            url: targetUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            },
            timeout: 25000, // Vercel has 10s limit for hobby, 60s for pro - keep under limit
            maxRedirects: 5,
            validateStatus: function (status) {
                return status < 600;
            },
            responseType: 'arraybuffer'
        };
        
        if (req.method === 'POST') {
            axiosConfig.data = req.body;
            axiosConfig.headers['Content-Type'] = req.headers['content-type'] || 'application/json';
        }
        
        const response = await axios(axiosConfig);
        
        // Determine content type
        const contentType = response.headers['content-type'] || 'text/html';
        
        console.log(`✅ Response received - Status: ${response.status}, Content-Type: ${contentType}`);
        
        // Set response headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('X-Proxy-Status', 'success');
        res.setHeader('X-Original-Url', targetUrl);
        res.setHeader('X-Original-Status', response.status);
        
        // Handle different content types
        if (contentType.includes('text/html')) {
            // For HTML, rewrite URLs to go through proxy
            let html = response.data.toString('utf-8');
            
            // Add proxy notification banner
            const proxyBanner = `
                <div style="position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #1a1d29 0%, #0a0e1a 100%); color: white; padding: 12px 20px; border-bottom: 2px solid #00d4ff; z-index: 999999; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #00d4ff, #8b5cf6); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px;">🛡️</div>
                        <div>
                            <strong style="font-size: 14px;">SecureProxy</strong>
                            <div style="font-size: 12px; color: #94a3b8; font-family: 'Courier New', monospace;">${targetUrl}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="background: #10b981; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">🔒 SECURE</span>
                    </div>
                </div>
                <div style="height: 56px;"></div>
            `;
            
            // Inject banner after body tag
            if (html.includes('<body')) {
                html = html.replace(/(<body[^>]*>)/i, `$1${proxyBanner}`);
            } else {
                html = proxyBanner + html;
            }
            
            // Rewrite URLs to go through proxy
            html = rewriteHTML(html, targetUrl, proxyBase);
            
            // Inject JavaScript to intercept navigation
            const navigationScript = `
                <script>
                (function() {
                    const proxyBase = '${proxyBase}';
                    
                    // Intercept all link clicks
                    document.addEventListener('click', function(e) {
                        let target = e.target;
                        while (target && target.tagName !== 'A') {
                            target = target.parentElement;
                        }
                        if (target && target.href && !target.href.startsWith(proxyBase)) {
                            e.preventDefault();
                            e.stopPropagation();
                            const newUrl = proxyBase + '/api/proxy?url=' + encodeURIComponent(target.href);
                            if (window.parent !== window) {
                                try {
                                    window.parent.document.getElementById('proxyFrame').src = newUrl;
                                } catch(err) {
                                    window.location.href = newUrl;
                                }
                            } else {
                                window.location.href = newUrl;
                            }
                            return false;
                        }
                    }, true);
                    
                    // Intercept form submissions
                    document.addEventListener('submit', function(e) {
                        const form = e.target;
                        if (form.action && !form.action.startsWith(proxyBase)) {
                            e.preventDefault();
                            if (form.method.toLowerCase() === 'get') {
                                const url = new URL(form.action, window.location.href);
                                const formData = new FormData(form);
                                formData.forEach((value, key) => {
                                    url.searchParams.append(key, value);
                                });
                                const newUrl = proxyBase + '/api/proxy?url=' + encodeURIComponent(url.href);
                                if (window.parent !== window) {
                                    try {
                                        window.parent.document.getElementById('proxyFrame').src = newUrl;
                                    } catch(err) {
                                        window.location.href = newUrl;
                                    }
                                } else {
                                    window.location.href = newUrl;
                                }
                            }
                        }
                    }, true);
                })();
                </script>
            `;
            
            // Inject script before closing body tag
            if (html.includes('</body>')) {
                html = html.replace('</body>', navigationScript + '</body>');
            } else {
                html += navigationScript;
            }
            
            return res.send(html);
        } else if (contentType.includes('javascript') || contentType.includes('json')) {
            return res.send(response.data.toString('utf-8'));
        } else {
            return res.send(response.data);
        }
        
    } catch (error) {
        console.error('❌ Proxy error:', error.message);
        
        const errorDetails = {
            error: 'Proxy request failed',
            message: error.message,
            code: error.code,
            url: req.query.url
        };
        
        if (error.response) {
            errorDetails.status = error.response.status;
            errorDetails.statusText = error.response.statusText;
        }
        
        return res.status(500).json(errorDetails);
    }
};

