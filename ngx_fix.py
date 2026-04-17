#!/usr/bin/env python3
"""One-shot nginx fix"""
import subprocess, os, base64

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'

def ssh(cmd, timeout=12):
    ask = '/tmp/ask.py'
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
    return p.stdout, p.stderr, p.returncode

# 1. Remove default site
print("Removing default site...")
out, err, rc = ssh('rm -f /etc/nginx/sites-enabled/default && echo ok')
print((out + err).strip() or f'rc={rc}')

# 2. Write clean config via python one-liner
conf = """server {
    listen 80 default;
    server_name _;
    root /var/www/mc-task;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /portfolio/ { alias /var/www/portfolio/; try_files $uri $uri/; }
    location /sleep/ { alias /var/www/sleep-aid/; try_files $uri $uri/; }
    location /chat/ { alias /var/www/art-chat/; try_files $uri $uri/; }
}"""

b64 = base64.b64encode(conf.encode()).decode()
cmd = f'python3 -c "import base64;open(\'/etc/nginx/conf.d/sites.conf\',\'wb\').write(base64.b64decode(\'{b64}\'))"'
print("Writing config...")
out, err, rc = ssh(cmd)
print((out + err).strip() or f'rc={rc}')

# 3. Fix nginx.conf root (make server-level root neutral /var/www)
print("Fixing nginx.conf root...")
out, err, rc = ssh("sed -i 's|root         /var/www/mc-task;|root         /var/www;|' /etc/nginx/nginx.conf && echo ok")
print((out + err).strip() or f'rc={rc}')

# 4. Test & reload
print("Testing nginx...")
out, err, rc = ssh('nginx -t 2>&1')
print((out + err).strip() or f'rc={rc}')

print("Reloading...")
out, err, rc = ssh('nginx -s reload 2>&1 && echo ok')
print((out + err).strip() or f'rc={rc}')

# 5. Verify all
print("\nVerification:")
for name, path in [('mc-task','/'), ('portfolio','/portfolio/'), ('sleep','/sleep/'), ('chat','/chat/')]:
    out, err, rc = ssh(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost{path}')
    print(f"  {name}: HTTP {out.strip()}")
