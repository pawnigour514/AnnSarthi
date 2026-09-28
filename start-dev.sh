#!/usr/bin/env bash
# ==============================================================================
# AnnSarthi (SIH26234) — One-Click Development Orchestrator
# Boots AI Microservice (8000), Node.js Backend (5000), and React Frontend (5173)
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🌾 Starting AnnSarthi Smart Food Redistribution Ecosystem"
echo "   Problem Statement: SIH26234"
echo "=========================================================="

# 1. Setup & Activate Python AI Service Virtualenv
if [ ! -d "ai-service/venv" ]; then
    echo "📦 Creating Python virtual environment for AI microservice..."
    python3 -m venv ai-service/venv
    "$DIR/ai-service/venv/bin/pip" install --upgrade pip
    "$DIR/ai-service/venv/bin/pip" install -r ai-service/requirements.txt
fi

# 2. Check Node dependencies
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    (cd server && npm install)
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    (cd client && npm install)
fi

# 3. Seed Database
echo "🌱 Initializing Indore demonstration database seed..."
(cd server && node src/seed/seed.js) || true

# Function to clean up child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down AnnSarthi processes..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 4. Launch Services
echo "🚀 [1/3] Starting FastAPI AI Engine on http://localhost:8000 ..."
(cd ai-service && PYTHONPATH=. ./venv/bin/uvicorn app.main:app --port 8000 --host 0.0.0.0) &
AI_PID=$!

echo "🚀 [2/3] Starting Express Backend Server on http://localhost:5000 ..."
(cd server && npm run dev) &
SERVER_PID=$!

echo "🚀 [3/3] Starting Vite React Client on http://localhost:5173 ..."
(cd client && npm run dev) &
CLIENT_PID=$!

echo ""
echo "=========================================================="
echo "✅ AnnSarthi is live and running!"
echo "   - Frontend Web App : http://localhost:5173"
echo "   - Backend REST API : http://localhost:5000/api/v1"
echo "   - AI Microservice  : http://localhost:8000/docs"
echo "   - Demo Persona     : donor@demo.annsarthi.app / DemoPassword123!"
echo "   - Universal OTP    : 123456"
echo "=========================================================="
echo "Press Ctrl+C to terminate all services."
echo ""

wait
