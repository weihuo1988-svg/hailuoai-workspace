#!/bin/bash
set -e
CDN_MC="https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/214337_db01/workspace/mc-task.tar"
CDN_PORT="https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/214340_4969/workspace/portfolio.tar"
CDN_SLEEP="https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/214344_259a/workspace/sleep-aid.tar"
CDN_CHAT="https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/214348_7122/workspace/art-chat.tar"

echo "=== Download & Extract ==="
mkdir -p /var/www/{mc-task,portfolio,sleep-aid,art-chat}

echo "--> mc-task..."
curl -sL "$CDN_MC" -o /tmp/mc-task.tar && tar -xf /tmp/mc-task.tar -C /var/www/mc-task && echo "ok"

echo "--> portfolio..."
curl -sL "$CDN_PORT" -o /tmp/portfolio.tar && tar -xf /tmp/portfolio.tar -C /var/www/portfolio && echo "ok"

echo "--> sleep-aid..."
curl -sL "$CDN_SLEEP" -o /tmp/sleep-aid.tar && tar -xf /tmp/sleep-aid.tar -C /var/www/sleep-aid && echo "ok"

echo "--> art-chat..."
curl -sL "$CDN_CHAT" -o /tmp/art-chat.tar && tar -xf /tmp/art-chat.tar -C /var/www/art-chat && echo "ok"

echo "=== Write nginx.conf ==="
cat > /etc/nginx/conf.d/sites.conf << 'CONF'
server {
    listen 80;
    server_name _;
    root /var/www/mc-task;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    location /portfolio/ {
        alias /var/www/portfolio/;
        index index.html;
        try_files $uri $uri/ /portfolio/index.html;
    }
    location /sleep/ {
        alias /var/www/sleep-aid/;
        index index.html;
        try_files $uri $uri/ /sleep/index.html;
    }
    location /chat/ {
        alias /var/www/art-chat/;
        index index.html;
        try_files $uri $uri/ /chat/index.html;
    }
}
CONF
echo "conf written"

echo "=== Test & reload nginx ==="
nginx -t && nginx -s reload && echo "nginx reload ok"

echo "=== DONE ==="
echo "http://39.97.246.203/          (mc-task)"
echo "http://39.97.246.203/portfolio/"
echo "http://39.97.246.203/sleep/"
echo "http://39.97.246.203/chat/"
