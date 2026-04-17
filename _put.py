#!/usr/bin/env python3
"""PTY-based SSH that properly handles password via stdin redirection."""
import subprocess, os, pty, select, sys, time, tempfile

HOST = '39.97.246.203'
USER = 'root'
PASS = 'Fusu1839045'

def ssh_cmd(cmd, timeout=30):
    """Run a single command on the server via SSH with PTY + password."""
    master_fd, slave_fd = pty.openpty()
    env = os.environ.copy()
    env['SSH_ASKPASS'] = '/bin/cat'
    env['SSH_ASKPASS_REQUIRE'] = 'force'
    env['DISPLAY'] = 'dumb'

    # Build the SSH child process
    proc = subprocess.Popen(
        ['ssh', '-t', '-t',           # force PTY allocation
         '-o', 'StrictHostKeyChecking=no',
         '-o', 'ConnectTimeout=10',
         f'{USER}@{HOST}', cmd],
        stdin=slave_fd, stdout=subprocess.PIPE, stderr=slave_fd,
        close_fds=True, env=env
    )
    os.close(slave_fd)

    out_chunks, password_sent = [], False
    start = time.time()

    while True:
        if time.time() - start > timeout:
            proc.kill()
            return "TIMEOUT"
        r, _, _ = select.select([proc.stdout], [], [], 0.5)
        if r:
            d = os.read(proc.stdout.fileno(), 4096)
            if not d:
                break
            out_chunks.append(d)
            if b'password' in d.lower() and not password_sent:
                os.write(master_fd, (PASS + '\n').encode())
                password_sent = True
        if proc.poll() is not None:
            # drain remaining output
            try:
                while True:
                    d = os.read(proc.stdout.fileno(), 4096)
                    if not d: break
                    out_chunks.append(d)
            except: pass
            break

    os.close(master_fd)
    proc.wait()
    return b''.join(out_chunks).decode(errors='replace')


def scp_file(local_path, remote_path):
    """Upload a single file via SCP using subprocess + timeout."""
    print(f"  [SCP] {local_path} → {remote_path}")
    try:
        # Use SCP with password via PTY
        master_fd, slave_fd = pty.openpty()
        env = os.environ.copy()
        env['SSH_ASKPASS'] = '/bin/cat'
        env['SSH_ASKPASS_REQUIRE'] = 'force'
        env['DISPLAY'] = 'dumb'

        proc = subprocess.Popen(
            ['scp', '-o', 'StrictHostKeyChecking=no',
             local_path, f'{USER}@{HOST}:{remote_path}'],
            stdin=slave_fd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            close_fds=True, env=env
        )
        os.close(slave_fd)

        out, password_sent = [], False
        start = time.time()
        while True:
            if time.time() - start > 60:
                proc.kill()
                return False
            r, _, _ = select.select([proc.stdout, proc.stderr], [], [], 0.5)
            if not r and proc.poll() is not None:
                break
            for f in r:
                d = os.read(f.fileno(), 4096)
                if not d: continue
                out.append(d)
                if b'password' in d.lower() and not password_sent:
                    os.write(master_fd, (PASS + '\n').encode())
                    password_sent = True
        os.close(master_fd)
        proc.wait()
        ok = proc.returncode == 0
        print(f"  [{'OK' if ok else 'FAIL'}] {local_path}")
        return ok
    except Exception as e:
        print(f"  [ERR] {e}")
        return False


def scp_dir(local_path, remote_path):
    """Upload a directory via SCP -r."""
    print(f"  [SCP] {local_path}/ → {remote_path}/")
    try:
        master_fd, slave_fd = pty.openpty()
        env = os.environ.copy()
        env['SSH_ASKPASS'] = '/bin/cat'
        env['SSH_ASKPASS_REQUIRE'] = 'force'
        env['DISPLAY'] = 'dumb'

        proc = subprocess.Popen(
            ['scp', '-r', '-o', 'StrictHostKeyChecking=no',
             local_path, f'{USER}@{HOST}:{remote_path}'],
            stdin=slave_fd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            close_fds=True, env=env
        )
        os.close(slave_fd)

        out, password_sent = [], False
        start = time.time()
        while True:
            if time.time() - start > 120:
                proc.kill()
                return False
            r, _, _ = select.select([proc.stdout, proc.stderr], [], [], 0.5)
            if not r and proc.poll() is not None:
                break
            for f in r:
                d = os.read(f.fileno(), 4096)
                if not d: continue
                out.append(d)
                if b'password' in d.lower() and not password_sent:
                    os.write(master_fd, (PASS + '\n').encode())
                    password_sent = True
        os.close(master_fd)
        proc.wait()
        ok = proc.returncode == 0
        print(f"  [{'OK' if ok else 'FAIL'}] {local_path}/")
        return ok
    except Exception as e:
        print(f"  [ERR] {e}")
        return False


# ── DEPLOY ───────────────────────────────────────────────────────────────────
print("[INFO] 检查服务器连通性...")
r = ssh_cmd('echo AUTH_OK && uname -a', timeout=20)
if 'AUTH_OK' not in r:
    print("[ERR] SSH 连接失败！")
    print(r[:400])
    sys.exit(1)
print("[INFO] 服务器连通正常 ✓")

# Snapshot
snap = f"/var/www/consolidated/snapshots/20260417_{time.strftime('%H%M%S')}"
print(f"[INFO] 创建快照: {snap}")
ssh_cmd(f'mkdir -p {snap} && cp -r /var/www/consolidated/* {snap}/ 2>/dev/null; echo SNAPSHOT_OK', timeout=30)
print("[INFO] 快照完成 ✓")

# Create dirs
print("[INFO] 创建目录...")
for d in ['mc-task-app','portfolio','sleep-aid','art-chat']:
    ssh_cmd(f'mkdir -p /var/www/consolidated/{d}', timeout=10)
print("[INFO] 目录就绪 ✓")

# Upload
print("\n[INFO] 上传构建产物...")
scp_dir('/workspace/projects/mc-task-app/dist', '/var/www/consolidated/mc-task-app')
scp_dir('/workspace/projects/portfolio/dist', '/var/www/consolidated/portfolio')
scp_dir('/workspace/projects/sleep-aid-new/dist', '/var/www/consolidated/sleep-aid')
scp_file('/workspace/projects/art-chat/dist/index.html', '/var/www/consolidated/art-chat/index.html')
print("[INFO] 上传完成 ✓")

# Nginx
print("[INFO] 配置 Nginx...")
ng_conf = open('/workspace/nginx_consolidated.conf').read()
# Write via python on server
encoded = ng_conf.replace("'", "'\"'\"'")
ssh_cmd(f"python3 -c \"open('/etc/nginx/conf.d/consolidated.conf','w').write('''{ng_conf}''')\"", timeout=15)
ssh_cmd('rm -f /etc/nginx/sites-enabled/default', timeout=10)
r = ssh_cmd('nginx -t 2>&1 && nginx -s reload 2>&1', timeout=15)
print(r[:300])
print("[INFO] Nginx 完成 ✓")

# PM2
print("[INFO] 重启后端...")
r = ssh_cmd('pm2 restart all --update-env 2>/dev/null; pm2 save 2>/dev/null; echo PM2_OK', timeout=30)
print(r[:200])

# Cleanup snapshots
print("[INFO] 清理旧快照...")
ssh_cmd('cd /var/www/consolidated/snapshots && ls -dt */ 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null; echo CLEANUP_OK', timeout=15)

# Verify
print("\n[INFO] 最终验证...")
time.sleep(2)
for path, name in [('/', 'portfolio'), ('/mc-task-app/', 'mc-task-app'), ('/sleep-aid/', 'sleep-aid'), ('/art-chat/', 'art-chat')]:
    r = ssh_cmd(f'curl -s -o /dev/null -w "%{{http_code}}" http://127.0.0.1{path} --max-time 10', timeout=15)
    code = r.strip()[:3] if r.strip() else '???'
    mark = '✓' if code == '200' else f'⚠{code}'
    print(f"  http://39.97.246.203{path} → {mark} {name}")

print("\n🎉 部署完成！")
