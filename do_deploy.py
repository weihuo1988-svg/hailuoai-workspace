#!/usr/bin/env python3
"""Single-script deployment to Aliyun ECS"""
import subprocess, os, pty, select, time, termios, tty, base64, tarfile, io, sys

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'
PROJECTS = {
    'mc-task':   '/workspace/projects/mc-task-app/dist',
    'portfolio':  '/workspace/projects/portfolio/dist',
    'sleep-aid': '/workspace/projects/sleep-aid/dist',
    'art-chat':  '/workspace/projects/art-chat/dist',
}

def sshexec(cmd, timeout=30):
    pid, fd = pty.fork()
    if pid == 0:
        os.execvp('ssh', ['ssh', '-o', 'StrictHostKeyChecking=no',
                          '-o', 'NumberOfPasswordPrompts=1',
                          f'{USER}@{HOST}', '--', cmd])
    else:
        tty.setraw(fd)
        sent = False
        buf = b''
        start = time.time()
        while time.time() - start < timeout:
            r, _, _ = select.select([fd], [], [], 2)
            if fd in r:
                d = os.read(fd, 4096)
                if not d:
                    break
                sys.stdout.write(d.decode('utf-8', errors='replace'))
                buf += d
                if not sent and b'password:' in buf.lower():
                    time.sleep(0.15)
                    os.write(fd, (PASS + '\r').encode())
                    sent = True
                    buf = b''
            elif sent and time.time() - start > 3:
                break
        os.close(fd)
        os.waitpid(pid, 0)

# Step 1: Package
print("=== Packaging ===")
b64_files = {}
for name, path in PROJECTS.items():
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode='w') as tar:
        tar.add(path, arcname='.')
    b64 = base64.b64encode(buf.getvalue())
    b64_files[name] = b64
    print(f"  {name}: {len(b64)} b64 bytes")

# Step 2: Server dirs
print("\n=== Server setup ===")
sshexec("mkdir -p /var/www/{mc-task,portfolio,sleep-aid,art-chat}")

# Step 3: Upload per project via stdin pipe
print("\n=== Upload & extract ===")
for name, b64 in b64_files.items():
    print(f"  {name}...", end='', flush=True)
    receiver = (
        'python3 -c "'
        'import sys,base64,tarfile,io;'
        'tar=tarfile.open(fileobj=io.BytesIO(base64.b64decode(sys.stdin.buffer.read())));'
        'tar.extractall(\'/var/www/' + name + '\');'
        'print(\'extracted ok\')"'
    )
    proc = subprocess.Popen(
        ['ssh', '-o', 'StrictHostKeyChecking=no',
         '-o', 'NumberOfPasswordPrompts=1',
         f'{USER}@{HOST}', '--', receiver],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    out, _ = proc.communicate(input=b64, timeout=120)
    print(out.decode().strip() if out else 'ok')

# Step 4: Write nginx config
print("\n=== Nginx config ===")
conf = """server {
    listen 80;
    server_name _;
    root /var/www/mc-task;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    location /portfolio/ {
        alias /var/www/portfolio/;
        index index.html;
        try_files $uri $uri/ /portfolio/index.html;
    }
    location /sleep/ {
        alias /var/www/sleep-aid/;
        index index.html;
        try_files $uri $uri/ /sleep/index.html;
    }
    location /chat/ {
        alias /var/www/art-chat/;
        index index.html;
        try_files $uri $uri/ /chat/index.html;
    }
}
"""
conf_b64 = base64.b64encode(conf.encode()).decode()
print("  uploading nginx.conf...")
sshexec(f"echo {conf_b64} | base64 -d > /etc/nginx/conf.d/sites.conf && echo conf ok")

# Step 5: Reload
print("\n=== Reload nginx ===")
sshexec("nginx -t && echo config ok && nginx -s reload && echo reload ok")

print("\n" + "="*50)
print("DEPLOYED!")
print("mc-task:   http://39.97.246.203/")
print("portfolio: http://39.97.246.203/portfolio/")
print("sleep-aid: http://39.97.246.203/sleep/")
print("art-chat:  http://39.97.246.203/chat/")
