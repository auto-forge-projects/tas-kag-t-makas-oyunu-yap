#!/usr/bin/env bash
# AutoForge SSH-push uzak deploy. CI bunu sunucuda `bash -s` ile çalıştırır.
# Env: PROJECT IMAGE HOST HOST_PORT PORT CERT_BASE
# Yaptığı: imajı çek → container'ı 127.0.0.1:<host_port>'ta (yeniden) çalıştır →
# mevcut host nginx'e wildcard-cert'li server bloğu koy → nginx -t + reload.
# YALNIZ bu projeye dokunur (kendi adıyla). nginx -t geçmeden reload YOK → mevcut siteler güvende.
#
# NOT (private GHCR): imaj private ise sunucu bir kez `docker login ghcr.io` olmalı
# (read:packages token), ya da paketi public yap. Bu script pull'u doğrudan dener.
set -euo pipefail
: "${PROJECT:?} ${IMAGE:?} ${HOST:?} ${HOST_PORT:?} ${PORT:?} ${CERT_BASE:?}"

# Private GHCR paketleri için otomatik login (GHCR_TOKEN/GHCR_USER verilirse).
# Böylece paketi elle public yapmaya gerek kalmaz; verilmezse public paket varsayılır.
if [ -n "${GHCR_TOKEN:-}" ] && [ -n "${GHCR_USER:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null
fi

docker pull "$IMAGE"
docker rm -f "$PROJECT" >/dev/null 2>&1 || true
docker run -d --name "$PROJECT" --restart unless-stopped -p "127.0.0.1:${HOST_PORT}:${PORT}" "$IMAGE"

CONF="/etc/nginx/sites-available/${HOST}.conf"
sudo tee "$CONF" >/dev/null <<NG
server { listen 80; server_name ${HOST}; return 301 https://\$host\$request_uri; }
server {
  listen 443 ssl;
  server_name ${HOST};
  ssl_certificate ${CERT_BASE}/fullchain.pem;
  ssl_certificate_key ${CERT_BASE}/privkey.pem;
  location / {
    proxy_pass http://127.0.0.1:${HOST_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
NG
sudo ln -sf "$CONF" "/etc/nginx/sites-enabled/${HOST}.conf"
sudo nginx -t && sudo systemctl reload nginx
echo "deployed: https://${HOST}"
