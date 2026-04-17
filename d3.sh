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

print("下载MC材质...")
run("curl -sL 'https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/224335_2431/workspace/mc-textures.tar' -o /tmp/mc-textures.tar && echo downloaded")

print("解压到public目录...")
run("mkdir -p /var/www/mc-task/public/mc-textures && tar -xf /tmp/mc-textures.tar -C /var/www/mc-task/public/mc-textures && echo extracted")

print("验证文件...")
run("ls /var/www/mc-task/public/mc-textures/blocks/ | head -3 && ls /var/www/mc-task/public/mc-textures/items/ | head -3")

print("重载nginx...")
run("nginx -s reload")

print("\n升级版已上线！\nhttp://39.97.246.203/\nhttp://39.97.246.203/portfolio/\nhttp://39.97.246.203/sleep/\nhttp://39.97.246.203/chat/")
