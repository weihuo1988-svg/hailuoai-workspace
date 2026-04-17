#!/bin/bash
# Step 1: Fix nginx.conf - remove http2 from port 80
sed -i 's/listen 80 http2;/listen 80;/' /etc/nginx/nginx.conf

# Step 2: Remove sites-enabled/default  
rm -f /etc/nginx/sites-enabled/default

# Step 3: Write clean sites-enabled/sites.conf with default_server
cat > /etc/nginx/sites-enabled/sites.conf << 'ENDFILE'
server {
    listen 80 default_server;
    server_name _;
    root /var/www;
    index index.html;

    location / {
        root /var/www/mc-task;
        try_files $uri $uri/ /index.html;
    }

    location /mc_task/ {
        alias /var/www/mc-task/;
        try_files $uri $uri/;
    }

    location /portfolio/ {
        alias /var/www/portfolio/;
        try_files $uri $uri/;
    }

    location /sleep/ {
        alias /var/www/sleep-aid/;
        try_files $uri $uri/;
    }

    location /chat/ {
        alias /var/www/art-chat/;
        try_files $uri $uri/;
    }
}
ENDFILE

# Step 4: Test and reload
nginx -t && nginx -s reload

# Step 5: Verify
echo "=== VERIFICATION ==="
for path in /mc_task/ /portfolio/ /sleep/ /chat/; do
    code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost${path})
    title=$(curl -s http://localhost${path} | grep -o "<title>.*</title>" | head -1)
    echo "${path}: HTTP ${code} | ${title}"
done
