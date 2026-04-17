#!/bin/bash
# Fix nginx: remove sites-enabled/default symlink and fix nginx.conf
# Move the default site away so sites.conf takes full control
mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak 2>/dev/null && echo "moved default" || echo "no default to move"

# Fix nginx.conf: set server root to /var/www (blank, just for cleanliness)
sed -i 's|root         /var/www/mc-task;|root         /var/www;|' /etc/nginx/nginx.conf 2>/dev/null && echo "nginx.conf root fixed" || echo "nginx.conf ok"

# Write clean sites.conf
cat > /etc/nginx/conf.d/sites.conf << 'CONF'
server {
    listen 80 default;
    server_name _;
    root /var/www/mc-task;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
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
CONF
echo "sites.conf written"

nginx -t && nginx -s reload && echo "nginx reloaded"
