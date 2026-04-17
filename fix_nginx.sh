server {
    listen 80;
    server_name _;
    root /var/www;
    index index.html;

    location / {
        root /var/www/mc-task;
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
