#!/bin/bash
echo "Downloading new nginx.conf..."
curl -sL "https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/000047_b8c0/workspace/nginx_new.conf" -o /tmp/nginx_new.conf && echo downloaded

echo "Backup and replace nginx.conf..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak.$(date +%s)

echo "Remove sites-enabled/default..."
rm -f /etc/nginx/sites-enabled/default

echo "Copy new nginx.conf..."
cat /tmp/nginx_new.conf > /etc/nginx/nginx.conf && echo copied

echo "Test nginx..."
nginx -t 2>&1

echo "Reload nginx..."
nginx -s reload 2>&1 && echo reloaded

echo "Verify..."
curl -s http://localhost/mc_task/ | grep -o "<title>.*</title>"
curl -s http://localhost/portfolio/ | grep -o "<title>.*</title>"
curl -s http://localhost/sleep/ | grep -o "<title>.*</title>"
curl -s http://localhost/chat/ | grep -o "<title>.*</title>"
