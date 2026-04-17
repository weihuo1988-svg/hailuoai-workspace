#!/usr/bin/env python3
"""Fix nginx in one shot: remove default site, write clean config, reload"""
import subprocess, os

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'

def ssh_cmd(cmd_str, timeout=20):
    """Run single SSH command, auto password via env var"""
    env = os.environ.copy()
    env['SSH_ASKPASS_REQUIRE'] = 'force'
    env['DISPLAY'] = ':0'
    ask = '/tmp/askpass.py'
    with open(ask, 'w') as f:
        f.write(f'#!/usr/bin/env python3\nimport sys\nsys.stdout.write("{PASS}")\n')
    os.chmod(ask, 0o755)
    env['SSH_ASKPASS'] = ask

    proc = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'PasswordAuthentication=yes',
         '-o', 'NumberOfPasswordPrompts=1', '-o', f'ConnectTimeout=10',
         f'{USER}@{HOST}', '--', cmd_str],
        capture_output=True, text=True, timeout=timeout, env=env
    )
    return proc.stdout, proc.stderr, proc.returncode

# Step 1: Remove sites-enabled/default
print("1. Removing sites-enabled/default...")
out, err, rc = ssh_cmd('rm -fv /etc/nginx/sites-enabled/default && echo removed')
print(out.strip() or err.strip())

# Step 2: Write clean nginx sites.conf
nginx_conf = """server {
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
"""

print("2. Writing clean sites.conf...")
conf_b64 = __import__('base64').b64encode(nginx_conf.encode()).decode()
out, err, rc = ssh_cmd(f'python3 -c "import base64; open(\'/etc/nginx/conf.d/sites.conf\',\'wb\').write(base64.b64decode(\'{conf_b64}\'))" && echo written')
print(out.strip() or err.strip())

# Step 3: Fix nginx.conf root (remove duplicate root)
print("3. Fixing nginx.conf root...")
out, err, rc = ssh_cmd("sed -i 's|root         /var/www/mc-task;|root         /var/www;|g' /etc/nginx/nginx.conf && echo fixed")
print(out.strip() or err.strip())

# Step 4: Test and reload
print("4. Testing nginx...")
out, err, rc = ssh_cmd('nginx -t 2>&1')
print(out.strip() or err.strip())

print("5. Reloading nginx...")
out, err, rc = ssh_cmd('nginx -s reload && echo reloaded')
print(out.strip() or err.strip())

# Step 6: Verify
print("6. Verifying all sites...")
tests = [
    ('mc-task',   '/'),
    ('portfolio', '/portfolio/'),
    ('sleep-aid', '/sleep/'),
    ('art-chat',  '/chat/'),
]
for name, path in tests:
    out, err, rc = ssh_cmd(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost{path}')
    code = out.strip()
    print(f"  {name}: HTTP {code}")
