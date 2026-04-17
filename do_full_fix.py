#!/usr/bin/env python3
"""Single-shot nginx fix via base64-encoded heredoc script"""
import subprocess, os, base64

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'

script = r'''#!/bin/bash
# Remove http2 from nginx.conf port 80
sed -i 's/listen 80 http2;/listen 80;/' /etc/nginx/nginx.conf

# Remove default site that may conflict
rm -f /etc/nginx/sites-enabled/default

# Write clean sites-enabled/sites.conf
cat > /etc/nginx/sites-enabled/sites.conf << 'NGXEOF'
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
NGXEOF

# Test and reload
nginx -t 2>&1
nginx -s reload 2>&1
echo "=== RESULTS ==="
for path in /mc_task/ /portfolio/ /sleep/ /chat/; do
    title=$(curl -s "http://localhost${path}" | grep -o "<title>[^<]*</title>" | head -1)
    echo "${path}: ${title}"
done
'''

# Base64 encode to avoid heredoc issues with SSH
b64 = base64.b64encode(script.encode()).decode()

ask = '/tmp/ask.py'
with open(ask, 'w') as f:
    f.write(f'#!/bin/sh\n{PASS}')
os.chmod(ask, 0o755)
env = os.environ.copy()
env['SSH_ASKPASS'] = ask
env['SSH_ASKPASS_REQUIRE'] = 'force'
env['DISPLAY'] = ':0'

# Single SSH command: decode base64 script and execute it
cmd = f'python3 -c "import base64,os; os.makedirs(\'/tmp\',exist_ok=True); open(\'/tmp/f.sh\',\'wb\').write(base64.b64decode(\'{b64}\')); os.chmod(\'/tmp/f.sh\',0o755)" && bash /tmp/f.sh'

p = subprocess.Popen(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=15',
     f'{USER}@{HOST}', cmd],
    stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    env=env
)
out, err = p.communicate(timeout=45)
print(out.decode() if out else '')
if err:
    print('STDERR:', err.decode()[:200])
