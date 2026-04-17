#!/usr/bin/env python3
"""pty-based SSH: no TTY needed, password fed via pty slave"""
import subprocess, os, pty, select, sys, time

HOST, USER = '39.97.246.203', 'root'
PASS = 'Fusu1839045\n'  # newline terminates password input

def ssh_cmd(cmd, timeout=30):
    master_fd, slave_fd = pty.openpty()
    p = subprocess.Popen(
        ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=10',
         f'{USER}@{HOST}', cmd],
        stdin=slave_fd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        close_fds=True
    )
    os.close(slave_fd)
    out_chunks = []
    start = time.time()
    while True:
        if time.time() - start > timeout:
            p.kill()
            break
        r, _, _ = select.select([p.stdout, p.stderr], [], [], 1)
        if not r:
            if p.poll() is not None:
                break
            continue
        for f in r:
            d = os.read(f.fileno(), 4096)
            if not d:
                continue
            out_chunks.append(d)
            # Feed password if we see password prompt
            if b'password:' in d or b'Password:' in d:
                os.write(master_fd, PASS.encode())
                time.sleep(0.2)
    os.close(master_fd)
    p.wait()
    return b''.join(out_chunks).decode(errors='replace')

# Test auth
print('=== Testing SSH ===')
r = ssh_cmd('echo AUTH_OK', timeout=15)
print(r[:200])

# Now do the full nginx fix
print('=== Running nginx fix ===')
fix = '''python3 - << 'PYEOF'
import subprocess,os,re,urllib.request

# Fix nginx.conf
with open('/etc/nginx/nginx.conf') as f: c=f.read()
c = c.replace('listen 80 http2;', 'listen 80;')
with open('/etc/nginx/nginx.conf','w') as f: f.write(c)
print('http2 removed:', 'listen 80 http2' not in open('/etc/nginx/nginx.conf').read())

# Remove default site
subprocess.run(['rm','-f','/etc/nginx/sites-enabled/default'],check=True)

# Write sites.conf
SC = "server {\\n    listen 80 default_server;\\n    server_name _;\\n    root /var/www;\\n    index index.html;\\n\\n    location / {\\n        root /var/www/mc-task;\\n        try_files $uri $uri/ /index.html;\\n    }\\n\\n    location /mc_task/ {\\n        alias /var/www/mc-task/;\\n        try_files $uri $uri/;\\n    }\\n\\n    location /portfolio/ {\\n        alias /var/www/portfolio/;\\n        try_files $uri $uri/;\\n    }\\n\\n    location /sleep/ {\\n        alias /var/www/sleep-aid/;\\n        try_files $uri $uri/;\\n    }\\n\\n    location /chat/ {\\n        alias /var/www/art-chat/;\\n        try_files $uri $uri/;\\n    }\\n}"
with open('/etc/nginx/sites-enabled/sites.conf','w') as f: f.write(SC)
print('sites.conf written')

r = subprocess.run(['nginx','-t'],capture_output=True,text=True)
print('nginx -t:', r.stderr.strip())
r = subprocess.run(['nginx','-s','reload'],capture_output=True,text=True)
print('reload:', r.stderr.strip() or 'ok')

for pth in ['/mc_task/','/portfolio/','/sleep/','/chat/']:
    try:
        r = urllib.request.urlopen('http://localhost'+pth,timeout=3)
        h = r.read(500).decode('ignore')
        m = re.search('<title>([^<]+)</title>', h)
        print('LOCAL '+pth+': HTTP '+str(r.status)+' | '+(m.group(1) if m else '(no title)'))
    except Exception as e:
        print('LOCAL '+pth+': ERROR '+str(e))
PYEOF'''

r = ssh_cmd(fix, timeout=45)
print(r[:1500])
