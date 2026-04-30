#!/bin/bash
set -e

cd /opt/fonosystem

echo "🔄 Puxando mudanças do GitHub..."
git pull origin main

echo "🐳 Reconstruindo containers..."
docker compose build --no-cache
docker compose up -d

echo "✅ Deploy concluído!"
docker compose ps
