#!/usr/bin/env python3
"""Fix: add default_server to sites.conf, remove http2 from nginx.conf port 80"""
import subprocess, os, base64

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'

def run(cmd, timeout=12):
    ask = '/tmp/askz.py'
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

# Fix 1: Remove http2 from nginx.conf port 80 (this is the KEY fix)
print("1. Remove http2 from nginx.conf port 80...")
out, err = run("sed -i 's/listen 80 http2;/listen 80;/' /etc/nginx/nginx.conf && echo fixed")
print((out+err).strip() or 'ok')

# Fix 2: Write sites.conf with default_server
print("2. Write sites.conf with default_server...")
conf = """server {
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
"""
b64 = base64.b64encode(conf.encode()).decode()
cmd = f"python3 -c \"import base64; open('/etc/nginx/conf.d/sites.conf','wb').write(base64.b64decode('{b64}'))\" && echo written"
out, err = run(cmd)
print((out+err).strip() or 'written')

# Fix 3: Remove sites-enabled/default
print("3. Remove sites-enabled/default...")
out, err = run("rm -f /etc/nginx/sites-enabled/default && echo removed")
print((out+err).strip() or 'removed')

# Fix 4: Test and reload
print("4. Test nginx...")
out, err = run("nginx -t 2>&1")
print((out+err).strip())

print("5. Reload nginx...")
out, err = run("nginx -s reload 2>&1 && echo reloaded")
print((out+err).strip())

# Fix 5: Verify
print("6. Verify from localhost...")
for name, path in [('mc-task /mc_task/','/mc_task/'), ('portfolio','/portfolio/'), ('sleep-aid','/sleep/'), ('art-chat','/chat/')]:
    out, err = run(f'curl -s http://localhost{path} | grep -o "<title>.*</title>"')
    print(f"   {name}: {out.strip()}")
