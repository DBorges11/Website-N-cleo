#!/bin/bash

# Server Setup Script for Núcleo EI UFP
# This script helps set up the production environment on your server

set -e

echo "🚀 Núcleo EI UFP - Server Setup"
echo "================================"
echo ""

# Check if running on server (not local machine)
if [ -f "package.json" ]; then
    echo "⚠️  Warning: This looks like a development environment."
    echo "This script is meant to run on your production server."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Install Docker first:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available!"
    echo "Make sure you have Docker Compose v2 installed"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Create application directory
APP_DIR="$HOME/nucleo-ei-ufp"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

echo "📁 Application directory: $APP_DIR"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."

    read -p "Enter your Docker Hub username: " DOCKERHUB_USERNAME
    read -p "Enter PostgreSQL username (default: nucleo_user): " POSTGRES_USER
    POSTGRES_USER=${POSTGRES_USER:-nucleo_user}

    read -s -p "Enter PostgreSQL password (will be hidden): " POSTGRES_PASSWORD
    echo ""

    if [ -z "$POSTGRES_PASSWORD" ]; then
        echo "❌ Password cannot be empty!"
        exit 1
    fi

    POSTGRES_DB=${POSTGRES_DB:-nucleo_db}

    cat > .env << EOF
# Database Configuration
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=$POSTGRES_DB

# Docker Hub Configuration
DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME

# Watchtower Notifications (optional)
WATCHTOWER_NOTIFICATION_URL=
EOF

    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists, skipping..."
fi

echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    echo ""
    echo "Please copy docker-compose.prod.yml to this directory:"
    echo "  scp docker-compose.prod.yml user@server:$APP_DIR/docker-compose.yml"
    echo ""
    echo "Or clone the repository:"
    echo "  git clone https://github.com/your-username/Website-N-cleo.git"
    echo "  cp Website-N-cleo/docker-compose.prod.yml $APP_DIR/docker-compose.yml"
    exit 1
fi

echo "✅ docker-compose.yml found"
echo ""

# Pull the latest images
echo "📥 Pulling Docker images..."
docker compose pull

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    docker compose ps
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Access your application at: http://localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker compose logs -f"
    echo "  - Restart: docker compose restart"
    echo "  - Stop: docker compose down"
    echo ""
    echo "Watchtower is monitoring for updates every 30 seconds."
    echo "Push to main branch to trigger automatic deployment!"
else
    echo "❌ Something went wrong. Check logs:"
    echo "  docker compose logs"
fi
