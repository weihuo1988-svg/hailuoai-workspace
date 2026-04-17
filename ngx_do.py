#!/usr/bin/env python3
"""Nginx fix: remove http2, write sites.conf, reload, verify"""
import subprocess, os, base64

HOST, USER = '39.97.246.203', 'root'
PASS = 'Fusu1839045'

inner_py = (
    "import subprocess,os,re,urllib.request\n"
    "with open('/etc/nginx/nginx.conf') as f: c=f.read()\n"
    "c=c.replace('listen 80 http2;','listen 80;')\n"
    "with open('/etc/nginx/nginx.conf','w') as f: f.write(c)\n"
    "print('http2 removed:', 'listen 80 http2' not in open('/etc/nginx/nginx.conf').read())\n"
    "subprocess.run(['rm','-f','/etc/nginx/sites-enabled/default'],check=True)\n"
    "SC='server {\\n    listen 80 default_server;\\n    server_name _;\\n    root /var/www;\\n    index index.html;\\n\\n    location / {\\n        root /var/www/mc-task;\\n        try_files $uri $uri/ /index.html;\\n    }\\n\\n    location /mc_task/ {\\n        alias /var/www/mc-task/;\\n        try_files $uri $uri/;\\n    }\\n\\n    location /portfolio/ {\\n        alias /var/www/portfolio/;\\n        try_files $uri $uri/;\\n    }\\n\\n    location /sleep/ {\\n        alias /var/www/sleep-aid/;\\n        try_files $uri $uri/;\\n    }\\n\\n    location /chat/ {\\n        alias /var/www/art-chat/;\\n        try_files $uri $uri/;\\n    }\\n}'\n"
    "with open('/etc/nginx/sites-enabled/sites.conf','w') as f: f.write(SC)\n"
    "print('sites.conf written')\n"
    "r=subprocess.run(['nginx','-t'],capture_output=True,text=True); print('nginx -t:',r.stderr.strip())\n"
    "r=subprocess.run(['nginx','-s','reload'],capture_output=True,text=True); print('reload:',r.stderr.strip() or 'ok')\n"
    "for p in ['/mc_task/','/portfolio/','/sleep/','/chat/']:\n"
    " try:\n"
    "  r=urllib.request.urlopen('http://localhost'+p,timeout=3)\n"
    "  h=r.read(500).decode('ignore')\n"
    "  m=re.search('<title>([^<]+)</title>',h)\n"
    "  print('LOCAL '+p+': HTTP '+str(r.status)+' | '+(m.group(1) if m else '(no title)'))\n"
    " except Exception as e:\n"
    "  print('LOCAL '+p+': ERROR '+str(e))\n"
)

ask = '/tmp/ask.py'
with open(ask, 'w') as f:
    f.write(f'#!/bin/sh\n{PASS}')
os.chmod(ask, 0o755)
env = os.environ.copy()
env['SSH_ASKPASS'] = ask
env['SSH_ASKPASS_REQUIRE'] = 'force'
env['DISPLAY'] = ':0'

b64 = base64.b64encode(inner_py.encode()).decode()

p = subprocess.Popen(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=15',
     f'{USER}@{HOST}',
     f'python3 -c "import base64,os;open(\'/tmp/ng.py\',\'wb\').write(base64.b64decode(\'{b64}\'));os.chmod(\'/tmp/ng.py\',0o755)" && python3 /tmp/ng.py'],
    stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env
)
out, _ = p.communicate(timeout=55)
print(out.decode() if out else '')
