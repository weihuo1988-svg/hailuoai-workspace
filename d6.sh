#!/usr/bin/env python3
import subprocess, os
HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'
ASK = '/tmp/askpass.sh'
with open(ASK, 'w') as f: f.write(f'#!/bin/sh\necho {PASS}\n')
os.chmod(ASK, 0o755)
ENV = {**os.environ, 'SSH_ASKPASS': ASK, 'SSH_ASKPASS_REQUIRE': 'force', 'DISPLAY': ':0'}
def run(cmd):
    p = subprocess.Popen(['ssh','-o','StrictHostKeyChecking=no','-o','PasswordAuthentication=yes',f'{USER}@{HOST}','--',cmd],
                         stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=ENV)
    print(p.stdout.read().decode() if p.stdout.read() else 'ok')
    p.wait()
print("下载sleep-aid...")
run("curl -sL 'https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/234216_dc48/workspace/sleep-aid-new.tar' -o /tmp/sleep-aid-new.tar && echo downloaded")
print("解压...")
run("rm -rf /var/www/sleep-aid && mkdir -p /var/www/sleep-aid && tar -xf /tmp/sleep-aid-new.tar -C /var/www/sleep-aid && echo extracted")
print("检查资源路径...")
run("grep -o '/sleep/assets/' /var/www/sleep-aid/index.html | head -1")
print("reload...")
run("nginx -s reload")
print("Done!")
