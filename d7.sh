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
    out = p.stdout.read()
    print(out.decode() if out else 'ok')
    p.wait()

print("=== nginx conf ===")
run("cat /etc/nginx/conf.d/sites.conf")

print("\n=== sleep-aid dist ===")
run("ls /var/www/sleep-aid/ && echo '---' && head -5 /var/www/sleep-aid/index.html")

print("\n=== test sleep-aid ===")
run("curl -sI http://localhost/sleep/ | head -5")

print("\n=== test root ===")
run("curl -sI http://localhost/ | head -5")
