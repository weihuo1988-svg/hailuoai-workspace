#!/usr/bin/env python3
"""Use Python stdout as askpass - no shell interpretation of password"""
import subprocess, os, pty, select, time

HOST, USER = '39.97.246.203', 'root'
PASS = 'Fusu1839045!'

def make_askpass():
    """Write Python askpass that outputs password via sys.stdout.write directly"""
    content = f'#!/usr/bin/env python3\nimport sys\nsys.stdout.write("{PASS}")\n'
    with open('/tmp/ap.py', 'w') as f:
        f.write(content)
    os.chmod('/tmp/ap.py', 0o755)

def ssh_pty(cmd, timeout=30):
    make_askpass()
    master_fd, slave_fd = pty.openpty()
    env = os.environ.copy()
    env['SSH_ASKPASS'] = '/tmp/ap.py'
    env['SSH_ASKPASS_REQUIRE'] = 'force'
    env['DISPLAY'] = ':0'
    
    p = subprocess.Popen(
        ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=10',
         '-o', 'BatchMode=yes',  # Important: use BatchMode with SSH_ASKPASS
         f'{USER}@{HOST}', cmd],
        stdin=slave_fd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        close_fds=True, env=env
    )
    os.close(slave_fd)
    
    out = b''
    start = time.time()
    while time.time() - start < timeout:
        try:
            r, _, _ = select.select([p.stdout], [], [], 1)
            if r:
                d = os.read(p.stdout.fileno(), 4096)
                if d: out += d
                else: break
            elif p.poll() is not None:
                break
        except: break
    os.close(master_fd)
    p.wait(timeout=5)
    return out.decode(errors='replace')

print('=== Test ===')
r = ssh_pty('echo AUTH_OK && echo DONE')
print(r[:300])

print('=== Nginx Fix ===')
fix = """sed -i 's/listen 80 http2;/listen 80;/' /etc/nginx/nginx.conf && echo http2_removed && rm -f /etc/nginx/sites-enabled/default && echo removed_default"""
r = ssh_pty(fix, timeout=20)
print(r[:300])

print('=== Write sites.conf ===')
sites = "server { listen 80 default_server; server_name _; root /var/www; index index.html; location / { root /var/www/mc-task; try_files $uri $uri/ /index.html; } location /mc_task/ { alias /var/www/mc-task/; try_files $uri $uri/; } location /portfolio/ { alias /var/www/portfolio/; try_files $uri $uri/; } location /sleep/ { alias /var/www/sleep-aid/; try_files $uri $uri/; } location /chat/ { alias /var/www/art-chat/; try_files $uri $uri/; } }"
b64_sites = __import__('base64').b64encode(sites.encode()).decode().replace('+', '-').replace('/', '_')
r = ssh_pty(f'python3 -c "import base64,urllib.parse; open(\'/etc/nginx/sites-enabled/sites.conf\',\'wb\').write(urllib.parse.unquote_plus(base64.b64decode(\"{b64_sites}\").decode()))" && echo sites_written', timeout=20)
print(r[:300])

print('=== Reload ===')
r = ssh_pty('nginx -t 2>&1 && nginx -s reload 2>&1 && echo reloaded', timeout=15)
print(r[:300])

print('=== Verify ===')
r = ssh_pty('for p in /mc_task/ /portfolio/ /sleep/ /chat/; do echo -n "$p: "; curl -s "http://localhost${p}" | grep -o "<title>[^<]*</title>" | head -1; done', timeout=20)
print(r[:500])
