#!/bin/bash
# ============================================================
#  Virtual Road Lab — One-Click Startup Script
#  Run this from the project root: bash start.sh
# ============================================================

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         Virtual Road Lab — Startup Script                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Check prerequisites ─────────────────────────────────
command -v node  >/dev/null || { echo "❌  Node.js not found. Install from https://nodejs.org"; exit 1; }
command -v npm   >/dev/null || { echo "❌  npm not found."; exit 1; }
command -v python3 >/dev/null || { echo "❌  Python 3 not found."; exit 1; }

echo "✅  Node  $(node --version)"
echo "✅  npm   $(npm --version)"
echo "✅  Python $(python3 --version)"
echo ""

# ── 2. Install frontend deps if needed ─────────────────────
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "📦  Installing frontend dependencies…"
  cd "$ROOT/frontend"
  npm install
  echo "✅  Frontend deps installed."
fi

# ── 3. Install backend deps if needed ──────────────────────
if ! python3 -c "import fastapi" 2>/dev/null; then
  echo "📦  Installing Python backend dependencies…"
  pip install -r "$ROOT/backend/requirements.txt" --break-system-packages -q
  echo "✅  Backend deps installed."
fi

# ── 4. Launch backend ──────────────────────────────────────
echo ""
echo "🚀  Starting FastAPI backend on http://127.0.0.1:8000 …"
cd "$ROOT/backend"
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 2

# Quick health check
if curl -s http://127.0.0.1:8000/api/health | grep -q '"ok"'; then
  echo "✅  Backend healthy!"
else
  echo "⚠️  Backend may still be starting — watch the log above."
fi

# ── 5. Launch frontend ──────────────────────────────────────
echo ""
echo "🌐  Starting Vite frontend on http://localhost:5173 …"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Open your browser → http://localhost:5173               ║"
echo "║  Backend API docs  → http://127.0.0.1:8000/docs          ║"
echo "║  Press Ctrl+C to stop both servers                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 6. Cleanup on exit ─────────────────────────────────────
trap "echo ''; echo 'Shutting down…'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
