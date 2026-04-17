#!/usr/bin/env python3
"""Adapted from pty_ssh.py - SSH via PTY with password."""
import subprocess, os, pty, select, time

HOST='39.97.246.203'; USER='root'; PORT=22; PASS='Fusu1839045\n'

def ssh_cmd(cmd, timeout=30):
    master_fd, slave_fd = pty.openpty()
    env = os.environ.copy()
    env.update({
        'SSH_ASKPASS': '/bin/cat',
        'SSH_ASKPASS_REQUIRE': 'force',
        'DISPLAY': 'dumb'
    })

    proc = subprocess.Popen(
        ['ssh', '-tt',
         '-o', 'StrictHostKeyChecking=no',
         '-o', 'ConnectTimeout=10',
         '-p', str(PORT),
         f'{USER}@{HOST}', cmd],
        stdin=slave_fd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        close_fds=True,
        env=env
    )
    os.close(slave_fd)

    out_chunks = []
    pw_sent = False
    start = time.time()

    while True:
        elapsed = time.time() - start
        if elapsed > timeout:
            proc.kill()
            return 'TIMEOUT'
        r, _, _ = select.select([proc.stdout], [], [], 0.5)
        if r:
            d = os.read(proc.stdout.fileno(), 4096)
            if d:
                out_chunks.append(d)
                txt = d.decode(errors='replace')
                if not pw_sent and 'password' in txt.lower():
                    os.write(master_fd, PASS.encode())
                    pw_sent = True
        if proc.poll() is not None:
            break

    os.close(master_fd)
    proc.wait()
    return b''.join(out_chunks).decode(errors='replace')


print("=== SSH连通测试 ===")
r = ssh_cmd('echo AUTH_OK && hostname && uptime', 18)
print(r[-600:])
