#!/usr/bin/env python3
"""Deployment via SSH_ASKPASS"""
import subprocess, os, base64, tarfile, io, sys

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'
ASKPASS = '/tmp/askpass.sh'
ENV = {**os.environ,
       'SSH_ASKPASS': ASKPASS,
       'SSH_ASKPASS_REQUIRE': 'force',
       'DISPLAY': ':0'}

# Write askpass script
with open(ASKPASS, 'w') as f:
    f.write(f'#!/bin/sh\necho {PASS}\n')
os.chmod(ASKPASS, 0o755)

def ssh(cmd, stdin_data=None, timeout=60):
    print(f"  SSH: {cmd[:50]}...")
    kw = {'stdin': subprocess.DEVNULL, 'stdout': subprocess.PIPE,
          'stderr': subprocess.STDOUT, 'env': ENV}
    if stdin_data:
        # Use PIPE and write later - but with SSH_ASKPASS it reads from the askpass script
        # So stdin must be /dev/null when using SSH_ASKPASS
        pass
    p = subprocess.run(['ssh', '-o', 'StrictHostKeyChecking=no',
                       '-o', 'PasswordAuthentication=yes',
                       f'{USER}@{HOST}', '--', cmd],
                      timeout=timeout, **kw)
    out = p.stdout.decode('utf-8', errors='replace')
    if out:
        print(out.strip())
    return p.returncode == 0

def ssh_pipein(cmd, stdin_data, timeout=60):
    """Send stdin_data to cmd via SSH where stdin_data is piped to SSH process"""
    print(f"  SSH PIPE: {cmd[:40]}...")
    kw = {'stdin': subprocess.PIPE, 'stdout': subprocess.PIPE,
          'stderr': subprocess.STDOUT, 'env': ENV}
    p = subprocess.Popen(['ssh', '-o', 'StrictHostKeyChecking=no',
                         '-o', 'PasswordAuthentication=yes',
                         f'{USER}@{HOST}', '--', cmd], **kw)
    p.stdin.write(stdin_data)
    p.stdin.close()
    out = p.stdout.read()
    p.wait()
    print(out.decode('utf-8', errors='replace').strip())
    return p.returncode == 0

PROJECTS = {
    'mc-task':   '/workspace/projects/mc-task-app/dist',
    'portfolio':  '/workspace/projects/portfolio/dist',
    'sleep-aid': '/workspace/projects/sleep-aid/dist',
    'art-chat':  '/workspace/projects/art-chat/dist',
}

print("=== Package ===")
b64 = {}
for name, path in PROJECTS.items():
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode='w') as tar:
        tar.add(path, arcname='.')
    b64[name] = base64.b64encode(buf.getvalue())
    print(f"  {name}: {len(b64[name])} b64 bytes")

print("\n=== Create dirs ===")
ssh('mkdir -p /var/www/{mc-task,portfolio,sleep-aid,art-chat}')

print("\n=== Upload & extract ===")
for name in b64:
    decoder = ("python3 -c "
               "'import sys,base64,tarfile,io;"
               "tar=tarfile.open(fileobj=io.BytesIO(base64.b64decode(sys.stdin.buffer.read())));"
               "tar.extractall(\"/var/www/" + name + "\");"
               "print(\"extracted\")'")
    ok = ssh_pipein(decoder, b64[name], timeout=120)
    print(f"  {name}: {'ok' if ok else 'FAIL'}")

print("\n=== Nginx config ===")
conf = """server {
    listen 80;
    server_name _;
    root /var/www/mc-task;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /portfolio/ { alias /var/www/portfolio/; index index.html; try_files $uri $uri/ /portfolio/index.html; }
    location /sleep/ { alias /var/www/sleep-aid/; index index.html; try_files $uri $uri/ /sleep/index.html; }
    location /chat/ { alias /var/www/art-chat/; index index.html; try_files $uri $uri/ /chat/index.html; }
}"""
conf_b64 = base64.b64encode(conf.encode()).decode()
ssh(f'echo {conf_b64} | base64 -d > /etc/nginx/conf.d/sites.conf && echo ok')

print("\n=== Reload nginx ===")
ssh('nginx -t && nginx -s reload && echo ok')

print("\n" + "="*50)
print("DONE! 4 projects deployed:")
print("  http://39.97.246.203/         (mc-task)")
print("  http://39.97.246.203/portfolio/")
print("  http://39.97.246.203/sleep/")
print("  http://39.97.246.203/chat/")
