#!/usr/bin/env python3
import subprocess, os, sys, tty, termios, select, time

HOST = '39.97.246.203'
USER = 'root'
PASS = 'Fusu1839045'
CMD = ' && '.join(sys.argv[1:]) if len(sys.argv) > 1 else 'echo connected'

proc = subprocess.Popen(
    ['ssh', '-tt', f'{USER}@{HOST}', CMD],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
    env={**os.environ, 'SSH_ASKPASS': '/workspace/ssh_pass.sh', 'SSH_ASKPASS_REQUIRE': 'force', 'DISPLAY': ':0'}
)

# Wait for password prompt, then send password
time.sleep(1)
proc.stdin.write((PASS + '\n').encode())
proc.stdin.flush()

# Read output
while True:
    r, _, _ = select.select([proc.stdout], [], [], 30)
    if not r:
        break
    data = os.read(proc.stdout.fileno(), 4096)
    if not data:
        break
    sys.stdout.write(data.decode('utf-8', errors='replace'))
    sys.stdout.flush()

proc.wait()
