#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT="${DEPLOY_RUN_PORT:-5000}"

start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on 0.0.0.0:${PORT}..."
    PORT=${PORT} HOSTNAME=0.0.0.0 node dist/server.js
}

echo "Starting HTTP service on 0.0.0.0:${PORT}..."
start_service
