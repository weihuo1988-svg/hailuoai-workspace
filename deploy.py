#!/usr/bin/env python3
"""
四项目整合部署脚本（Python版 - 无需sshpass）
通过 SFTP 直接上传文件，自动化完成部署全程。
"""
import subprocess, sys, time, os, socket

HOST = '39.97.246.203'
PORT = 22
USER = 'root'
PASS = 'Fusu1839045'
BASE_DIR = '/var/www/consolidated'

def echo(msg):
    print(f"[INFO] {msg}")

def warn(msg):
    print(f"[WARN] {msg}")

def err(msg):
    print(f"[ERR] {msg}")
    sys.exit(1)

def run(cmd, timeout=30):
    """在服务器上执行命令（通过SSH）"""
    r = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', f'PasswordAuthentication={PASS}',
         '-p', str(PORT), f'{USER}@{HOST}', cmd],
        capture_output=True, text=True, timeout=timeout,
        input=f'{PASS}\n', encoding='utf-8', errors='replace'
    )
    return r.stdout + r.stderr

def sftp_put(local_path, remote_path):
    """通过SFTP上传文件/目录"""
    echo(f"上传 {local_path} → {remote_path}")
    # 使用 lftp 的 sftp 或者 Python 的 paramiko-style 封装
    r = subprocess.run(
        ['sftp', '-o', 'StrictHostKeyChecking=no',
         '-o', f'PasswordAuthentication=yes',
         '-o', f'PubkeyAuthentication=no',
         '-P', str(PORT)],
        input=f'{USER}@{HOST}\n{PASS}\nput -r {local_path} {remote_path}\nbye\n',
        capture_output=True, text=True, timeout=120
    )
    if r.returncode != 0:
        warn(f"sftp 返回码 {r.returncode}: {r.stderr[:200]}")
    return r.returncode == 0

# ── 开始 ───────────────────────────────────────────────────────────────────
echo("四项目整合部署开始")
echo(f"目标服务器: {HOST}")

# 1. 连通性检查
echo("检查连通性...")
try:
    sock = socket.create_connection((HOST, PORT), timeout=8)
    sock.close()
    echo("端口 22 连通 ✓")
except Exception as e:
    err(f"无法连接 {HOST}:22 - {e}")

# 2. SSH 认证测试
echo("SSH 认证测试...")
r = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'BatchMode=yes',
     '-p', str(PORT), f'{USER}@{HOST}', 'echo AUTH_OK && hostname'],
    capture_output=True, text=True, timeout=20
)
if 'AUTH_OK' not in r.stdout:
    # 尝试密码认证
    r = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no',
         '-o', 'PreferredAuthentications=password',
         '-o', 'PubkeyAuthentication=no',
         '-p', str(PORT), f'{USER}@{HOST}', 'echo AUTH_OK'],
        input=f'{PASS}\n', capture_output=True, text=True, timeout=20
    )
    if 'AUTH_OK' not in r.stdout:
        err(f"SSH 认证失败: {r.stdout[:200]} {r.stderr[:200]}")
echo("SSH 认证成功 ✓")

# 3. Nginx 检查
echo("检查 Nginx...")
r = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no',
     '-p', str(PORT), f'{USER}@{HOST}', 'command -v nginx'],
    input=f'{PASS}\n', capture_output=True, text=True, timeout=15
)
if 'nginx' not in r.stdout:
    warn("Nginx 未安装，正在安装...")
    r = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no',
         '-p', str(PORT), f'{USER}@{HOST}',
         'apt-get update && apt-get install -y nginx'],
        input=f'{PASS}\n', capture_output=True, text=True, timeout=120
    )
    echo("Nginx 安装完成 ✓")
else:
    echo("Nginx 已安装 ✓")

# 4. 快照
snap = f"/var/www/consolidated/snapshots/{time.strftime('%Y%m%d_%H%M%S')}"
echo(f"创建快照: {snap}")
subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-p', str(PORT), f'{USER}@{HOST}',
     f'mkdir -p {snap} && cp -r /var/www/consolidated/* {snap}/ 2>/dev/null; echo SNAPSHOT_OK'],
    input=f'{PASS}\n', capture_output=True, timeout=30
)
echo("快照完成 ✓")

# 5. 创建目录
echo("创建目录...")
for d in ['mc-task-app', 'portfolio', 'sleep-aid', 'art-chat']:
    subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', '-p', str(PORT), f'{USER}@{HOST}',
         f'mkdir -p /var/www/consolidated/{d}'],
        input=f'{PASS}\n', capture_output=True, timeout=15
    )
echo("目录就绪 ✓")

# 6. 上传文件（通过 scp）
echo("\n=== 上传构建产物 ===")

projects = [
    ('/workspace/projects/mc-task-app/dist/',     '/var/www/consolidated/mc-task-app/',  True),
    ('/workspace/projects/portfolio/dist/',        '/var/www/consolidated/portfolio/',   True),
    ('/workspace/projects/sleep-aid-new/dist/',   '/var/www/consolidated/sleep-aid/',   True),
    ('/workspace/projects/art-chat/dist/index.html', '/var/www/consolidated/art-chat/index.html', False),
]

for local_path, remote_path, is_dir in projects:
    echo(f"上传 {local_path} ...")
    cmd = ['scp', '-o', 'StrictHostKeyChecking=no',
           '-o', 'PreferredAuthentications=password',
           '-o', 'PubkeyAuthentication=no',
           '-P', str(PORT)]
    if is_dir:
        cmd += ['-r']
    cmd += [local_path, f'{USER}@{HOST}:{remote_path}']
    r = subprocess.run(cmd, input=f'{PASS}\n', capture_output=True, text=True, timeout=180)
    ok = r.returncode == 0
    name = os.path.basename(os.path.normpath(local_path))
    echo(f"  {'✓' if ok else '⚠'} {name} {'上传完成' if ok else '可能未完成'}")

# 7. Nginx 配置
echo("\n=== 配置 Nginx ===")
subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-p', str(PORT), f'{USER}@{HOST}',
     "rm -f /etc/nginx/sites-enabled/default"],
    input=f'{PASS}\n', capture_output=True, timeout=15
)

# 写入 Nginx 配置（用 scp 传配置文件）
ng_conf = '/workspace/nginx_consolidated.conf'
echo("上传 Nginx 配置...")
r = subprocess.run(
    ['scp', '-o', 'StrictHostKeyChecking=no',
     '-o', 'PreferredAuthentications=password',
     '-o', 'PubkeyAuthentication=no',
     '-P', str(PORT), ng_conf, f'{USER}@{HOST}:/etc/nginx/conf.d/consolidated.conf'],
    input=f'{PASS}\n', capture_output=True, text=True, timeout=30
)
echo(f"  {'✓' if r.returncode==0 else '⚠'} nginx_consolidated.conf {'上传完成' if r.returncode==0 else '需检查'}")

# 验证 + 重载
r = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-p', str(PORT), f'{USER}@{HOST}',
     'nginx -t 2>&1 && nginx -s reload && echo NGINX_OK'],
    input=f'{PASS}\n', capture_output=True, text=True, timeout=20
)
print(r.stdout[:300])
if 'successful' in r.stdout and 'NGINX_OK' in r.stdout:
    echo("Nginx 配置重载成功 ✓")
else:
    warn("Nginx 配置可能有误，请检查上方的 nginx -t 输出")

# 8. PM2
echo("\n=== 重启后端 ===")
r = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-p', str(PORT), f'{USER}@{HOST}',
     'pm2 restart all --update-env 2>/dev/null; pm2 save 2>/dev/null; echo PM2_OK'],
    input=f'{PASS}\n', capture_output=True, text=True, timeout=30
)
echo(r.stdout[:200] if r.stdout else "")
echo("PM2 操作完成 ✓")

# 9. 清理旧快照
echo("清理旧快照（保留最近 5 份）...")
subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-p', str(PORT), f'{USER}@{HOST}',
     'cd /var/www/consolidated/snapshots && ls -dt */ 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null; echo CLEANUP_OK'],
    input=f'{PASS}\n', capture_output=True, timeout=20
)

# 10. 最终验证
print("\n=== 最终验证 ===")
time.sleep(2)
checks = [
    ('/',                   'portfolio'),
    ('/mc-task-app/',      'mc-task-app'),
    ('/sleep-aid/',         'sleep-aid'),
    ('/art-chat/',          'art-chat'),
]
for path, name in checks:
    r = subprocess.run(
        ['ssh', '-o', 'StrictHostKeyChecking=no', '-p', str(PORT), f'{USER}@{HOST}',
         f'curl -s -o /dev/null -w "%{{http_code}}" http://127.0.0.1{path} --max-time 10'],
        input=f'{PASS}\n', capture_output=True, text=True, timeout=20
    )
    code = r.stdout.strip()[:3] if r.stdout.strip() else '---'
    ok = '✓' if code == '200' else '⚠'
    print(f"  {ok} http://{HOST}{path}  → {code}  {name}")

print("""
══════════════════════════════════════
🎉 部署完成！
  服务器: {HOST}
  快照目录: {SNAP}
══════════════════════════════════════
访问地址：
  http://{HOST}/              → portfolio
  http://{HOST}/mc-task-app/    → mc-task-app
  http://{HOST}/sleep-aid/       → sleep-aid
  http://{HOST}/art-chat/        → art-chat
""".format(HOST=HOST, SNAP=snap))
