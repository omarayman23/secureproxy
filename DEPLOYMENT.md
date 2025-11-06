# SecureProxy Backend Deployment Guide

## Google Cloud Deployment Instructions

### 1. SSH into your Google Cloud instance
```bash
ssh your-username@35.196.124.59
```

### 2. Install Node.js and npm
```bash
# Update package lists
sudo apt update

# Install Node.js (version 18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Upload files to your server
You can use SCP to upload the files:
```bash
# From your local machine, upload the entire directory
scp -r /path/to/secureproxy-files your-username@35.196.124.59:/home/your-username/
```

### 4. Install dependencies and start the server
```bash
# Navigate to the uploaded directory
cd /home/your-username/secureproxy-files

# Install dependencies
npm install

# Start the server
npm start
```

### 5. Configure firewall (if needed)
```bash
# Allow traffic on port 3000
sudo ufw allow 3000

# Or if using Google Cloud Firewall, configure it in the console
```

### 6. Set up as a service (optional, for production)
```bash
# Create a systemd service file
sudo nano /etc/systemd/system/secureproxy.service
```

Add this content:
```ini
[Unit]
Description=SecureProxy Backend
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/secureproxy-files
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable secureproxy
sudo systemctl start secureproxy
sudo systemctl status secureproxy
```

### 7. Test the backend
Once the server is running, test it with:
```bash
curl http://35.196.124.59:3000/health
```

You should see:
```json
{"status":"healthy","timestamp":"2024-11-07T...","version":"1.0.0"}
```

### 8. Test proxy functionality
```bash
curl "http://35.196.124.59:3000/proxy?url=https://httpbin.org/ip"
```

## Alternative: Using PM2 for process management

### Install PM2
```bash
npm install -g pm2
```

### Start with PM2
```bash
pm2 start server.js --name secureproxy
pm2 status
pm2 logs secureproxy
```

### Set PM2 to auto-start on reboot
```bash
pm2 startup
pm2 save
```

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
2. **Authentication**: Add API key authentication for production use
3. **HTTPS**: Set up SSL certificates for production deployment
4. **Monitoring**: Implement logging and monitoring
5. **Firewall**: Restrict access to necessary ports only

## Troubleshooting

### Port already in use
```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill the process if needed
sudo kill -9 <PID>
```

### Permission issues
```bash
# Fix file permissions
sudo chown -R your-username:your-username /home/your-username/secureproxy-files
```

### Connection refused
- Check if the server is running: `sudo systemctl status secureproxy`
- Check firewall settings
- Verify the IP address and port

## Frontend Configuration

The frontend is already configured to connect to your backend at `http://35.196.124.59:3000`. Once the backend is running, the proxy functionality will work immediately.

## Support

If you encounter issues during deployment, please check:
1. Server logs: `sudo journalctl -u secureproxy -f`
2. Application logs: Check the PM2 logs if using PM2
3. Network connectivity: Ensure port 3000 is accessible
4. Firewall settings: Both local and Google Cloud firewall rules