#!/usr/bin/env python3
import subprocess, os

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'
ASK = '/tmp/askpass.sh'
with open(ASK, 'w') as f:
    f.write(f'#!/bin/sh\necho {PASS}\n')
os.chmod(ASK, 0o755)
ENV = {**os.environ, 'SSH_ASKPASS': ASK, 'SSH_ASKPASS_REQUIRE': 'force', 'DISPLAY': ':0'}

def run(cmd, timeout=60):
    p = subprocess.Popen(['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'PasswordAuthentication=yes', f'{USER}@{HOST}', '--', cmd],
                         stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=ENV)
    out = p.stdout.read()
    print(out.decode() if out else 'ok')
    p.wait()

print("下载升级包...")
run(f"curl -sL 'https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/224217_e8fc/workspace/mc-task-new.tar' -o /tmp/mc-task-new.tar && echo downloaded")

print("解压...")
run("rm -rf /var/www/mc-task && mkdir -p /var/www/mc-task && tar -xf /tmp/mc-task-new.tar -C /var/www/mc-task && echo extracted")

print("复制材质...")
run("cp -r /workspace/mc-textures /var/www/mc-task/public/ 2>/dev/null; ls /var/www/mc-task/public/mc-textures/blocks/ | head -3 && echo copied")

print("重载nginx...")
run("nginx -s reload")

print("DONE! 访问 http://39.97.246.203/")
