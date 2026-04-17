#!/usr/bin/env python3
"""Fix nginx.conf: remove http2 from port 80, redirect 443 to plain HTTP"""
import subprocess, os, base64

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'

def run(cmd, timeout=12):
    ask = '/tmp/askf.py'
    with open(ask, 'w') as f:
        f.write(f'#!/usr/bin/env python3\nimport sys\nsys.stdout.write("{PASS}")')
    os.chmod(ask, 0o755)
    env = os.environ.copy()
    env['SSH_ASKPASS'] = ask
    env['SSH_ASKPASS_REQUIRE'] = 'force'
    env['DISPLAY'] = ':0'
    p = subprocess.run(['ssh', '-o', 'StrictHostKeyChecking=no',
                     '-o', 'ConnectTimeout=8', '-o', 'BatchMode=yes',
                     f'{USER}@{HOST}', '--', cmd],
                    capture_output=True, text=True, timeout=timeout, env=env)
    return p.stdout, p.stderr

# Step 1: Fix nginx.conf - remove http2 from port 80, change 443 to HTTP
print("1. Fix nginx.conf (remove http2 from port 80)...")
fix_cmd = "sed -i 's|listen 80 http2;|listen 80;|g' /etc/nginx/nginx.conf && echo ok"
out, err = run(fix_cmd)
print((out + err).strip() or 'ok')

# Step 2: Change 443 server to plain HTTP (no SSL)
print("2. Change port 443 to plain HTTP...")
fix_cmd2 = "sed -i 's|listen 443 ssl http2;|listen 443;|g; s|listen 443 ssl;|listen 443;|g; s|ssl_certificate|#ssl_certificate|g; s|ssl_protocols|#ssl_protocols|g' /etc/nginx/nginx.conf && echo ok"
out, err = run(fix_cmd2)
print((out + err).strip() or 'ok')

# Step 3: Remove sites-enabled/default
print("3. Remove default site...")
out, err = run('rm -f /etc/nginx/sites-enabled/default && echo removed')
print((out + err).strip() or 'removed')

# Step 4: Write clean sites.conf  
print("4. Write clean sites.conf...")
nginx_conf = """server {
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
b64 = base64.b64encode(nginx_conf.encode()).decode()
out, err = run(f"python3 -c \"import base64; open('/etc/nginx/conf.d/sites.conf','wb').write(base64.b64decode('{b64}'))\" && echo ok")
print((out + err).strip() or 'ok')

# Step 5: Test and reload
print("5. Test nginx...")
out, err = run('nginx -t 2>&1')
print((out + err).strip())

print("6. Reload nginx...")
out, err = run('nginx -s reload 2>&1 && echo reloaded')
print((out + err).strip())

# Step 7: Verify all
print("7. Verify all sites...")
for name, path in [('mc-task(/mc_task)','/mc_task/'), ('portfolio','/portfolio/'), ('sleep-aid','/sleep/'), ('art-chat','/chat/')]:
    out, err = run(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost{path}')
    print(f"   {name}: HTTP {out.strip()}")
