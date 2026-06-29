#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

BACKEND_PID=""
FRONTEND_PID=""

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

cleanup() {
  local status=$?
  trap - EXIT INT TERM

  echo
  echo "Stopping services..."
  if [[ -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$FRONTEND_PID" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true

  exit "$status"
}

trap cleanup EXIT INT TERM

require_command uv
require_command npm

if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  npm --prefix "$ROOT_DIR/frontend" install
fi

echo "Starting backend on http://127.0.0.1:${BACKEND_PORT}"
(
  cd "$ROOT_DIR/backend"
  uv run uvicorn app.main:app --reload --host "$BACKEND_HOST" --port "$BACKEND_PORT"
) &
BACKEND_PID=$!

echo "Starting frontend on http://127.0.0.1:${FRONTEND_PORT}"
(
  cd "$ROOT_DIR/frontend"
  npm run dev -- --host "$FRONTEND_HOST" --port "$FRONTEND_PORT"
) &
FRONTEND_PID=$!

echo
echo "Services are starting. Press Ctrl+C to stop both."

while true; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "Backend process exited."
    exit 1
  fi

  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "Frontend process exited."
    exit 1
  fi

  sleep 1
done
