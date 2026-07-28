#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Node not found, install nodejs.org"; exit 1; }
[ ! -d node_modules ] && npm install --no-audit --no-fund
[ ! -f secrets.env ] && cp secrets.env.example secrets.env && echo "Edit secrets.env"
echo "[bridge] http://localhost:8787"
node bridge.js
