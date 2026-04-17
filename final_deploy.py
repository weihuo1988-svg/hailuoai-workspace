#!/usr/bin/env python3
import os, base64

script = open('/workspace/server_deploy.sh').read()
b64 = base64.b64encode(script.encode()).decode()

cmd = f'echo {b64} | base64 -d > /tmp/d.sh && chmod +x /tmp/d.sh && bash /tmp/d.sh 2>&1'

askpass = '''#!/bin/sh
echo Fusu1839045'''
open('/tmp/askpass.sh','w').write(askpass)
os.chmod('/tmp/askpass.sh', 0o755)

env = {**os.environ, 'SSH_ASKPASS': '/tmp/askpass.sh',
       'SSH_ASKPASS_REQUIRE': 'force', 'DISPLAY': ':0'}

import subprocess
p = subprocess.Popen(
    ['ssh', '-o', 'StrictHostKeyChecking=no',
     '-o', 'PasswordAuthentication=yes',
     'root@39.97.246.203', '--', cmd],
    stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env
)
out = p.stdout.read()
print(out.decode('utf-8', errors='replace'))
p.wait()
