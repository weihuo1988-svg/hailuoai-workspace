#!/usr/bin/env python3
"""Minimal nginx fix: remove http2 from port 80, write clean sites.conf, reload"""
import subprocess, os, base64

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'

def run(cmd, timeout=12):
    ask = '/tmp/askx.py'
    with open(ask, 'w') as f:
        f.write(f'#!/usr/bin/env python3\nimport sys\nsys.stdout.write("{PASS}")')
    os.chmod(ask, 0o755)
    env = os.environ.copy()
    env['SSH_ASKPASS'] = ask
    env['SSH_ASKPASS_REQUIRE'] = 'force'
    env['DISPLAY'] = ':0'
    p = subprocess.run(['ssh', '-o', 'StrictHostKeyChecking=no',
                     '-o', 'ConnectTimeout=10', '-o', 'BatchMode=yes',
                     f'{USER}@{HOST}', '--', cmd],
                    capture_output=True, text=True, timeout=timeout, env=env)
    return p.stdout, p.stderr

# Fix 1: remove http2 from port 80
print("Fix port 80 (remove http2)...")
out, err = run("sed -i 's/listen 80 http2;/listen 80;/' /etc/nginx/nginx.conf && echo fixed")
print((out+err).strip() or 'ok')

# Fix 2: change 443 SSL to plain HTTP
print("Fix port 443 (remove SSL)...")
cmds = [
    "sed -i 's/listen 443 ssl http2;/listen 443;/' /etc/nginx/nginx.conf",
    "sed -i 's/listen 443 ssl;/listen 443;/' /etc/nginx/nginx.conf", 
    "sed -i 's/ssl_certificate/#ssl_certificate/' /etc/nginx/nginx.conf",
    "sed -i 's/ssl_certificate_key/#ssl_certificate_key/' /etc/nginx/nginx.conf",
    "sed -i 's/ssl_protocols/#ssl_protocols/' /etc/nginx/nginx.conf",
    "echo ssl_removed"
]
for c in cmds:
    out, err = run(c)
    
# Fix 3: remove sites-enabled/default
print("Remove default site...")
out, err = run("rm -f /etc/nginx/sites-enabled/default && echo removed")
print((out+err).strip() or 'removed')

# Fix 4: write clean sites.conf
print("Write sites.conf...")
conf = """server {
    listen 80;
    server_name _;
    root /var/www/mc-task;
    index index.html;

    location / {
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
"""
b64 = base64.b64encode(conf.encode()).decode()
cmd = f"python3 -c \"import base64; open('/etc/nginx/conf.d/sites.conf','wb').write(base64.b64decode('{b64}'))\""
out, err = run(cmd + " && echo written")
print((out+err).strip() or 'written')

# Fix 5: test and reload
print("Test nginx...")
out, err = run("nginx -t 2>&1")
print((out+err).strip())

print("Reload nginx...")
out, err = run("nginx -s reload 2>&1 && echo reloaded")
print((out+err).strip())

# Verify
print("Verify...")
for name, path in [('mc-task','/mc_task/'), ('portfolio','/portfolio/'), ('sleep','/sleep/'), ('chat','/chat/')]:
    out, err = run(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost{path}')
    print(f"  {name}: {out.strip()}")
