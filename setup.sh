#!/bin/bash

# SecureProxy Backend Setup Script
# Run this on your Google Cloud instance

echo "🚀 Setting up SecureProxy Backend..."

# Update system
echo "📦 Updating system packages..."
sudo apt update

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Start the server with PM2
echo "🚀 Starting SecureProxy backend..."
pm2 start server.js --name secureproxy

# Save PM2 configuration
pm2 save

# Set PM2 to auto-start on reboot
pm2 startup systemd -u $USER --hp /home/$USER

# Display status
echo "✅ Setup complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Your SecureProxy backend is now running!"
echo "Backend URL: http://35.196.124.59:3000"
echo "Health Check: http://35.196.124.59:3000/health"
echo ""
echo "🔧 Useful commands:"
echo "  pm2 logs secureproxy    # View logs"
echo "  pm2 restart secureproxy # Restart service"
echo "  pm2 stop secureproxy    # Stop service"
echo "  pm2 status              # View all services"