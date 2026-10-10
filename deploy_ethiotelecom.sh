#!/usr/bin/env bash
# ==============================================================================
# Korcha (ኮርቻ) - Ethio Telecom Linux Hosting & VPS Deployment Script
# Supports: Ubuntu 20.04 / 22.04 / 24.04 & Debian 11 / 12
# ==============================================================================

set -e

echo "🇪🇹 ========================================================"
echo "🇪🇹 Starting Korcha Deployment on Ethio Telecom VPS Server"
echo "🇪🇹 ========================================================"

# 1. Update OS packages
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw build-essential

# 2. Install Node.js 20 LTS (if not present)
if ! command -v node &> /dev/null; then
    echo "⬇️ Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 3. Install PM2 process manager
npm install -g pm2 telegraf dotenv

# 4. App Directory
APP_DIR="/var/www/korcha"
mkdir -p $APP_DIR
cd $APP_DIR

# 5. Clone or pull repo
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Cloning from GitHub: Hailegiorgisy/korcha..."
    git clone https://github.com/Hailegiorgisy/korcha.git .
else
    echo "🔄 Pulling latest commits..."
    git pull origin main
fi

# 6. Install dependencies
echo "📦 Installing production dependencies..."
npm install telegraf dotenv

# 7. Configure firewall
echo "🛡️ Configuring UFW firewall for Ethio Telecom..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# 8. Start with PM2
echo "🚀 Starting Korcha Telegram Bot with PM2..."
pm2 start ecosystem.config.cjs || pm2 start bot.js --name korcha-bot
pm2 save
pm2 startup systemd -u root --hp /root

echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "Check bot logs anytime with: pm2 logs korcha-telegram-bot"
