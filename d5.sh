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
print("Downloading...")
run("curl -sL 'https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/233614_8a18/workspace/portfolio-new.tar' -o /tmp/portfolio-new.tar")
print("Extracting...")
run("rm -rf /var/www/portfolio && mkdir -p /var/www/portfolio && tar -xf /tmp/portfolio-new.tar -C /var/www/portfolio")
print("Reloading...")
run("nginx -s reload")
print("Done! http://39.97.246.203/portfolio/")
