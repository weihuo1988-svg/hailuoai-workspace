#!/usr/bin/env python3
"""Fix nginx http2 on port 80 issue - no shell interpretation of password"""
import subprocess, os, base64

HOST, USER = '39.97.246.203', 'root'
# Write password using Python - no shell interpretation
with open('/tmp/ap.py', 'w') as f:
    f.write('#!/usr/bin/env python3\nimport sys\nsys.stdout.write("Fusu1839045!")\n')
os.chmod('/tmp/ap.py', 0o755)

def ssh(cmd, timeout=25):
    env = os.environ.copy()
    env['SSH_ASKPASS'] = '/tmp/ap.py'
    env['SSH_ASKPASS_REQUIRE'] = 'force'
    env['DISPLAY'] = ':0'
    p = subprocess.Popen(
        ['ssh', '-o', 'StrictHostKeyChecking=no',
         '-o', 'ConnectTimeout=12', '-o', 'BatchMode=yes',
         f'{USER}@{HOST}', cmd],
        stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT, env=env
    )
    return p.communicate(timeout=timeout)[0].decode(errors='replace')

# Step 1: Fix nginx.conf - change "listen 80 http2;" to "listen 80;"
# (Keep "listen 80 http2 ssl;" untouched on port 443)
print("=== 1. Fix port 80 - remove http2 ===")
r = ssh("sed -i 's|listen 80 http2;|listen 80;|' /etc/nginx/nginx.conf && echo ok")
print(r.strip() or 'ok')

# Step 2: Remove sites-enabled/default
print("\n=== 2. Remove default site ===")
r = ssh("rm -f /etc/nginx/sites-enabled/default && echo removed")
print(r.strip() or 'removed')

# Step 3: Write clean sites-enabled/sites.conf with default_server
print("\n=== 3. Write sites.conf with default_server ===")
conf = (
    "server {\n"
    "    listen 80 default_server;\n"
    "    server_name _;\n"
    "    root /var/www;\n"
    "    index index.html;\n"
    "    location / {\n"
    "        root /var/www/mc-task;\n"
    "        try_files $uri $uri/ /index.html;\n"
    "    }\n"
    "    location /mc_task/ {\n"
    "        alias /var/www/mc-task/;\n"
    "        try_files $uri $uri/;\n"
    "    }\n"
    "    location /portfolio/ {\n"
    "        alias /var/www/portfolio/;\n"
    "        try_files $uri $uri/;\n"
    "    }\n"
    "    location /sleep/ {\n"
    "        alias /var/www/sleep-aid/;\n"
    "        try_files $uri $uri/;\n"
    "    }\n"
    "    location /chat/ {\n"
    "        alias /var/www/art-chat/;\n"
    "        try_files $uri $uri/;\n"
    "    }\n"
    "}\n"
)
b64 = base64.b64encode(conf.encode()).decode()
cmd = f'python3 -c "import base64;open(\'/etc/nginx/sites-enabled/sites.conf\',\'wb\').write(base64.b64decode(\'{b64}\'))" && echo written'
r = ssh(cmd)
print(r.strip() or 'written')

# Step 4: Test nginx config
print("\n=== 4. Test nginx config ===")
r = ssh('nginx -t 2>&1')
print(r.strip())

# Step 5: Reload nginx
print("\n=== 5. Reload nginx ===")
r = ssh('nginx -s reload 2>&1 && echo reloaded')
print(r.strip() or 'reloaded')

# Step 6: Verify from localhost
print("\n=== 6. Verify (localhost) ===")
r = ssh(
    'for p in /mc_task/ /portfolio/ /sleep/ /chat/; do '
    't=$(curl -s "http://localhost${p}" | grep -o "<title>[^<]*</title>" | head -1); '
    'echo "${p}: ${t}"; done'
)
print(r.strip())
