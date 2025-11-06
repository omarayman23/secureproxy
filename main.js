// SecureProxy Main JavaScript Functionality
// Advanced proxy browser with privacy features and visual effects

class SecureProxy {
    constructor() {
        this.isConnected = false;
        this.currentServer = 'us-east';
        this.privacyLevel = 75;
        this.settings = {
            blockTrackers: true,
            blockCookies: true,
            httpsOnly: true,
            adBlocking: true
        };
        this.sessionHistory = [];
        this.connectionChart = null;
        this.privacyChart = null;
        
        // Backend URL - update this if your server IP changes
        this.backendUrl = 'http://35.196.124.59:3000';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.initializeCharts();
        this.startConnectionMonitoring();
        this.initializeAnimations();
        this.setupQuickAccessCarousel();
        this.checkBackendHealth();
    }
    
    async checkBackendHealth() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            const data = await response.json();
            console.log('✅ Backend is healthy:', data);
            this.updateConnectionStatus('connected');
        } catch (error) {
            console.error('❌ Backend health check failed:', error);
            this.showAlert('Warning: Cannot connect to proxy server. Please check if the backend is running.', 'warning');
            this.updateConnectionStatus('disconnected');
        }
    }
    
    setupEventListeners() {
        // URL Input and Browse Button
        const urlInput = document.getElementById('urlInput');
        const browseBtn = document.getElementById('browseBtn');
        
        if (urlInput && browseBtn) {
            browseBtn.addEventListener('click', () => this.handleBrowse());
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleBrowse();
            });
        }
        
        // Settings Page
        this.setupSettingsListeners();
        
        // Help Page
        this.setupHelpListeners();
        
        // Quick Access Cards
        this.setupQuickAccessListeners();
        
        // Proxy Server Selection
        this.setupServerSelectionListeners();
    }
    
    setupSettingsListeners() {
        // Privacy Level Slider
        const privacySlider = document.getElementById('privacyLevel');
        if (privacySlider) {
            privacySlider.addEventListener('input', (e) => {
                this.privacyLevel = parseInt(e.target.value);
                this.updatePrivacyLevelText();
            });
        }
        
        // Toggle Switches
        const toggles = document.querySelectorAll('.toggle-switch[data-setting]');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const setting = toggle.dataset.setting;
                this.toggleSetting(setting, toggle);
            });
        });
    }
    
    setupHelpListeners() {
        // Search Functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchDocumentation(e.target.value);
            });
        }
        
        // FAQ Items
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                const faqId = item.dataset.faq;
                this.toggleFAQ(faqId);
            });
        });
    }
    
    setupQuickAccessListeners() {
        const quickAccessCards = document.querySelectorAll('.quick-access-card');
        quickAccessCards.forEach(card => {
            card.addEventListener('click', () => {
                const siteName = card.querySelector('span').textContent.toLowerCase();
                this.handleQuickAccess(siteName);
            });
        });
    }
    
    setupServerSelectionListeners() {
        const serverCards = document.querySelectorAll('.proxy-server-card');
        serverCards.forEach(card => {
            card.addEventListener('click', () => {
                const serverId = card.dataset.server;
                this.selectProxyServer(serverId);
            });
        });
    }
    
    async handleBrowse() {
        const urlInput = document.getElementById('urlInput');
        let url = urlInput.value.trim();
        
        if (!url) {
            this.showAlert('Please enter a URL', 'warning');
            return;
        }
        
        // Add https:// if no protocol specified
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            urlInput.value = url;
        }
        
        this.showLoadingState(true);
        this.updateConnectionStatus('connecting');
        
        try {
            // Connect to backend proxy server
            const proxyResponse = await this.connectToProxy(url);
            
            if (proxyResponse.success) {
                // Display the proxied content
                this.displayProxiedContent(proxyResponse.data, url);
                
                // Add to session history
                this.addToHistory(url);
                
                // Update UI
                this.updateConnectionStatus('connected');
                this.showAlert('Connected successfully! Browsing through secure proxy.', 'success');
            } else {
                throw new Error(proxyResponse.error || 'Proxy connection failed');
            }
            
        } catch (error) {
            console.error('Browse error:', error);
            this.showAlert(`Connection failed: ${error.message}`, 'error');
            this.updateConnectionStatus('disconnected');
        } finally {
            this.showLoadingState(false);
        }
    }
    
    async connectToProxy(url) {
        try {
            console.log('🔗 Connecting to proxy for:', url);
            
            const proxyUrl = `${this.backendUrl}/proxy?url=${encodeURIComponent(url)}`;
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                // Try to get error details from response
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
                } catch (e) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            const data = await response.text();
            console.log('✅ Proxy response received');
            
            return {
                success: true,
                data: data
            };
            
        } catch (error) {
            console.error('❌ Proxy connection error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    displayProxiedContent(content, originalUrl) {
        // Create a new window to display the proxied content
        const newWindow = window.open('', '_blank', 'width=1200,height=800,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes');
        
        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>SecureProxy - ${this.extractDomain(originalUrl)}</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { 
                            margin: 0; 
                            padding: 0; 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        }
                        .proxy-header { 
                            background: linear-gradient(135deg, #1a1d29 0%, #0a0e1a 100%);
                            color: white; 
                            padding: 12px 20px;
                            border-bottom: 2px solid #00d4ff;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            position: sticky;
                            top: 0;
                            z-index: 10000;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                        }
                        .proxy-header-left {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        .proxy-logo {
                            width: 32px;
                            height: 32px;
                            background: linear-gradient(135deg, #00d4ff, #8b5cf6);
                            border-radius: 6px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            font-size: 18px;
                        }
                        .proxy-url {
                            font-size: 13px;
                            color: #94a3b8;
                            font-family: 'Courier New', monospace;
                            max-width: 500px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .security-badge {
                            background: #10b981;
                            color: white;
                            padding: 6px 16px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                        .proxy-content { 
                            width: 100%; 
                            min-height: calc(100vh - 56px);
                        }
                        .close-btn {
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            color: white;
                            padding: 6px 12px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 12px;
                            margin-left: 12px;
                            transition: all 0.2s;
                        }
                        .close-btn:hover {
                            background: rgba(255, 255, 255, 0.2);
                        }
                    </style>
                </head>
                <body>
                    <div class="proxy-header">
                        <div class="proxy-header-left">
                            <div class="proxy-logo">🛡️</div>
                            <div>
                                <strong style="font-size: 14px;">SecureProxy</strong>
                                <div class="proxy-url">${originalUrl}</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div class="security-badge">
                                <span>🔒</span>
                                <span>SECURE CONNECTION</span>
                            </div>
                            <button class="close-btn" onclick="window.close()">Close</button>
                        </div>
                    </div>
                    <div class="proxy-content">
                        ${content}
                    </div>
                </body>
                </html>
            `);
            newWindow.document.close();
        } else {
            // Fallback if popup was blocked
            this.showAlert('Popup blocked! Please allow popups for this site, or the content will be displayed below.', 'warning');
            
            // Display in current window as fallback
            setTimeout(() => {
                document.body.innerHTML = `
                    <div style="background: #0a0e1a; color: white; min-height: 100vh;">
                        <div style="background: linear-gradient(135deg, #1a1d29 0%, #0a0e1a 100%); padding: 15px 20px; border-bottom: 2px solid #00d4ff; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="font-size: 16px;">🛡️ SecureProxy</strong>
                                <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">${originalUrl}</div>
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <span style="background: #10b981; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                    🔒 SECURE CONNECTION
                                </span>
                                <button onclick="window.location.href='index.html'" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                                    ← Back to SecureProxy
                                </button>
                            </div>
                        </div>
                        <div style="padding: 20px; background: white; color: black; min-height: calc(100vh - 100px);">
                            ${content}
                        </div>
                    </div>
                `;
            }, 2000);
        }
    }
    
    handleQuickAccess(siteName) {
        const urlMap = {
            'google': 'https://www.google.com',
            'youtube': 'https://www.youtube.com',
            'reddit': 'https://www.reddit.com',
            'linkedin': 'https://www.linkedin.com',
            'x (twitter)': 'https://www.twitter.com',
            'whatsapp': 'https://web.whatsapp.com'
        };
        
        const url = urlMap[siteName];
        if (url) {
            const urlInput = document.getElementById('urlInput');
            if (urlInput) {
                urlInput.value = url;
                this.handleBrowse();
            }
        }
    }
    
    selectProxyServer(serverId) {
        // Remove previous selection
        document.querySelectorAll('.proxy-server-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked server
        const selectedCard = document.querySelector(`[data-server="${serverId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.currentServer = serverId;
            this.updateConnectionStatus('connecting');
            
            // Simulate server switch delay
            setTimeout(() => {
                this.updateConnectionStatus('connected');
                this.showAlert(`Switched to ${serverId.replace('-', ' ').toUpperCase()} server`, 'success');
            }, 1500);
        }
    }
    
    toggleSetting(setting, toggleElement) {
        this.settings[setting] = !this.settings[setting];
        toggleElement.classList.toggle('active', this.settings[setting]);
        
        // Update privacy score
        this.updatePrivacyScore();
        
        // Show feedback
        const status = this.settings[setting] ? 'enabled' : 'disabled';
        this.showAlert(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${status}`, 'info');
    }
    
    updatePrivacyLevelText() {
        const levelText = document.getElementById('privacyLevelText');
        if (levelText) {
            let level = 'Basic';
            if (this.privacyLevel > 33 && this.privacyLevel <= 66) level = 'Enhanced';
            if (this.privacyLevel > 66) level = 'Maximum';
            levelText.textContent = level;
        }
    }
    
    updatePrivacyScore() {
        // Calculate privacy score based on settings
        let score = 50; // Base score
        
        if (this.settings.blockTrackers) score += 15;
        if (this.settings.blockCookies) score += 15;
        if (this.settings.httpsOnly) score += 10;
        if (this.settings.adBlocking) score += 10;
        
        // Update privacy meter if it exists
        const privacyMeter = document.querySelector('.privacy-meter span');
        if (privacyMeter) {
            privacyMeter.textContent = `${score}%`;
        }
    }
    
    toggleFAQ(faqId) {
        const faqItem = document.querySelector(`[data-faq="${faqId}"]`);
        const faqAnswer = faqItem.querySelector('.faq-answer');
        const icon = document.querySelector(`[data-icon="${faqId}"]`);
        
        // Close other FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item.dataset.faq !== faqId) {
                item.classList.remove('active');
                item.querySelector('.faq-answer').classList.remove('active');
                item.querySelector('svg').style.transform = 'rotate(0deg)';
            }
        });
        
        // Toggle current FAQ
        faqItem.classList.toggle('active');
        faqAnswer.classList.toggle('active');
        
        const isActive = faqItem.classList.contains('active');
        icon.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
    }
    
    searchDocumentation(query) {
        const sections = document.querySelectorAll('.doc-section');
        const terms = query.toLowerCase().split(' ');
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            const matches = terms.some(term => text.includes(term));
            
            if (query && !matches) {
                section.style.opacity = '0.3';
                section.style.filter = 'blur(1px)';
            } else {
                section.style.opacity = '1';
                section.style.filter = 'none';
            }
        });
    }
    
    addToHistory(url) {
        const historyItem = {
            url: url,
            timestamp: new Date(),
            title: this.extractDomain(url)
        };
        
        this.sessionHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (this.sessionHistory.length > 10) {
            this.sessionHistory = this.sessionHistory.slice(0, 10);
        }
    }
    
    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    }
    
    showLoadingState(isLoading) {
        const browseBtn = document.getElementById('browseBtn');
        if (browseBtn) {
            if (isLoading) {
                browseBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                `;
                browseBtn.disabled = true;
            } else {
                browseBtn.innerHTML = 'Browse Securely';
                browseBtn.disabled = false;
            }
        }
    }
    
    updateConnectionStatus(status) {
        const statusIndicators = document.querySelectorAll('.status-indicator');
        const statusTexts = document.querySelectorAll('.status-indicator + span');
        
        statusIndicators.forEach(indicator => {
            indicator.className = `status-indicator status-${status}`;
        });
        
        statusTexts.forEach(text => {
            const statusMap = {
                'connected': 'Connected',
                'connecting': 'Connecting...',
                'disconnected': 'Disconnected'
            };
            text.textContent = statusMap[status] || 'Unknown';
        });
        
        this.isConnected = status === 'connected';
    }
    
    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
        
        // Set alert styling based on type
        const styles = {
            'success': 'bg-green-600 text-white',
            'error': 'bg-red-600 text-white',
            'warning': 'bg-yellow-600 text-white',
            'info': 'bg-cyan-600 text-white'
        };
        
        alert.className += ` ${styles[type] || styles.info}`;
        alert.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Animate in
        setTimeout(() => {
            alert.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.classList.add('translate-x-full');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
    
    initializeCharts() {
        // Connection Chart
        const connectionChartElement = document.getElementById('connection-chart');
        if (connectionChartElement && typeof echarts !== 'undefined') {
            this.connectionChart = echarts.init(connectionChartElement);
            
            const connectionOption = {
                backgroundColor: 'transparent',
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['00:00', '00:05', '00:10', '00:15', '00:20', '00:25', '00:30'],
                    axisLine: { lineStyle: { color: '#4a5568' } },
                    axisLabel: { color: '#94a3b8' }
                },
                yAxis: {
                    type: 'value',
                    axisLine: { lineStyle: { color: '#4a5568' } },
                    axisLabel: { color: '#94a3b8' },
                    splitLine: { lineStyle: { color: '#2d3748' } }
                },
                series: [{
                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                    type: 'line',
                    smooth: true,
                    lineStyle: { color: '#00d4ff', width: 2 },
                    itemStyle: { color: '#00d4ff' },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
                                { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
                            ]
                        }
                    }
                }]
            };
            
            this.connectionChart.setOption(connectionOption);
        }
        
        // Privacy Chart
        const privacyChartElement = document.getElementById('privacy-chart');
        if (privacyChartElement && typeof echarts !== 'undefined') {
            this.privacyChart = echarts.init(privacyChartElement);
            
            const privacyOption = {
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'item',
                    backgroundColor: '#1a1d29',
                    borderColor: '#00d4ff',
                    textStyle: { color: '#ffffff' }
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '50%'],
                    data: [
                        { value: 35, name: 'Trackers Blocked', itemStyle: { color: '#ef4444' } },
                        { value: 25, name: 'Ads Blocked', itemStyle: { color: '#f59e0b' } },
                        { value: 20, name: 'Cookies Blocked', itemStyle: { color: '#8b5cf6' } },
                        { value: 20, name: 'Secure Connections', itemStyle: { color: '#10b981' } }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 212, 255, 0.5)'
                        }
                    },
                    label: {
                        color: '#ffffff',
                        fontSize: 12
                    }
                }]
            };
            
            this.privacyChart.setOption(privacyOption);
        }
    }
    
    startConnectionMonitoring() {
        // Simulate real-time connection data
        setInterval(() => {
            if (this.connectionChart) {
                const option = this.connectionChart.getOption();
                const newData = option.series[0].data.slice(1);
                newData.push(Math.floor(Math.random() * 500) + 800);
                
                option.series[0].data = newData;
                this.connectionChart.setOption(option);
            }
        }, 5000);
    }
    
    setupQuickAccessCarousel() {
        if (typeof Splide !== 'undefined') {
            const splide = document.querySelector('.splide');
            if (splide) {
                new Splide('.splide', {
                    type: 'loop',
                    perPage: 4,
                    perMove: 1,
                    gap: '1rem',
                    autoplay: true,
                    interval: 3000,
                    pauseOnHover: true,
                    breakpoints: {
                        1024: { perPage: 3 },
                        768: { perPage: 2 },
                        480: { perPage: 1 }
                    }
                }).mount();
            }
        }
    }
    
    initializeAnimations() {
        // Initialize background effects
        this.createCanvasBackground();
        
        // Animate elements on page load
        if (typeof anime !== 'undefined') {
            // Hero text animation
            anime({
                targets: '.hero-text',
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 1000,
                delay: anime.stagger(200),
                easing: 'easeOutExpo'
            });
            
            // Cards animation
            anime({
                targets: '.help-card, .feature-card, .settings-card',
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                delay: anime.stagger(100),
                easing: 'easeOutExpo'
            });
        }
    }
    
    createCanvasBackground() {
        const canvas = document.getElementById('background-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const particleCount = 30;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around screen
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
                ctx.fill();
                
                // Pulse effect
                particle.opacity = 0.2 + Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.3;
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    loadSettings() {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('secureProxySettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        
        // Apply loaded settings to UI
        this.updateSettingsUI();
    }
    
    saveSettings() {
        localStorage.setItem('secureProxySettings', JSON.stringify(this.settings));
        this.showAlert('Settings saved successfully!', 'success');
    }
    
    updateSettingsUI() {
        // Update toggle switches
        Object.keys(this.settings).forEach(setting => {
            const toggle = document.querySelector(`[data-setting="${setting}"]`);
            if (toggle) {
                toggle.classList.toggle('active', this.settings[setting]);
            }
        });
        
        // Update privacy score
        this.updatePrivacyScore();
    }
    
    // Utility method to handle responsive charts
    handleResize() {
        if (this.connectionChart) {
            this.connectionChart.resize();
        }
        if (this.privacyChart) {
            this.privacyChart.resize();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.secureProxy = new SecureProxy();
    
    // Handle window resize for charts
    window.addEventListener('resize', () => {
        if (window.secureProxy) {
            window.secureProxy.handleResize();
        }
    });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureProxy;
}
