#!/usr/bin/env python3
"""Deploy mc_task + portfolio + fix nginx to /mc_task/ subdir"""
import subprocess, os, base64

HOST, USER, PASS = '39.97.246.203', 'root', 'Fusu1839045'
CDN_MC = 'https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/235617_a7e3/workspace/mc_task.tar'
CDN_PORT = 'https://cdn.hailuoai.com/cdn_upload/20260415/490189496558104584/377634894254251/235643_0b8d/workspace/portfolio-new2.tar'

def ssh_cmd(cmd_str, timeout=15):
    ask = '/tmp/askp.py'
    with open(ask, 'w') as f:
        f.write(f'#!/usr/bin/env python3\nimport sys\nsys.stdout.write("{PASS}")')
    os.chmod(ask, 0o755)
    env = os.environ.copy()
    env['SSH_ASKPASS'] = ask
    env['SSH_ASKPASS_REQUIRE'] = 'force'
    env['DISPLAY'] = ':0'
    p = subprocess.run(['ssh', '-o', 'StrictHostKeyChecking=no',
                       '-o', 'ConnectTimeout=8', '-o', 'BatchMode=yes',
                       f'{USER}@{HOST}', '--', cmd_str],
                      capture_output=True, text=True, timeout=timeout, env=env)
    return p.stdout, p.stderr, p.returncode

def run(cmd_str, timeout=15):
    print(f"  CMD: {cmd_str[:60]}...")
    out, err, rc = ssh_cmd(cmd_str, timeout)
    print((out + err).strip() or f'rc={rc}')

print("=== Step 1: Write nginx config (mc-task → /mc_task/) ===")
nginx_conf = """server {
    listen 80;
    server_name _;
    root /var/www;
    index index.html;

    location /mc_task/ {
        alias /var/www/mc-task/;
        try_files $uri $uri/;
    }

    location /portfolio/ {
        alias /var/www/portfolio/;
        try_files $uri $uri/;
    }

    location /sleep/ {
        alias /var/www/sleep-aid/;
        try_files $uri $uri/;
    }

    location /chat/ {
        alias /var/www/art-chat/;
        try_files $uri $uri/;
    }
}
"""
b64 = base64.b64encode(nginx_conf.encode()).decode()
run(f"python3 -c \"import base64;open('/etc/nginx/conf.d/sites.conf','wb').write(base64.b64decode('{b64}'))\" && echo conf_written")

print("\n=== Step 2: Download & deploy mc_task ===")
run(f"curl -sL '{CDN_MC}' -o /tmp/mc_task.tar && echo downloaded")
run("rm -rf /var/www/mc-task && mkdir -p /var/www/mc-task && tar -xf /tmp/mc_task.tar -C /var/www/mc-task && echo extracted")

print("\n=== Step 3: Download & deploy portfolio ===")
run(f"curl -sL '{CDN_PORT}' -o /tmp/portfolio-new2.tar && echo downloaded")
run("rm -rf /var/www/portfolio && mkdir -p /var/www/portfolio && tar -xf /tmp/portfolio-new2.tar -C /var/www/portfolio && echo extracted")

print("\n=== Step 4: Reload nginx ===")
run("nginx -t 2>&1")
run("nginx -s reload 2>&1")

print("\n=== Step 5: Verify ===")
for name, path in [('mc-task', '/mc_task/'), ('portfolio', '/portfolio/'), ('sleep', '/sleep/'), ('chat', '/chat/')]:
    out, err, rc = ssh_cmd(f'curl -s -o /dev/null -w "%{{http_code}}" http://localhost{path}')
    print(f"  {name}: HTTP {out.strip()}")
