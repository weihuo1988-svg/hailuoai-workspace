import subprocess, os, pty, select, time

HOST='39.97.246.203'; USER='root'; PORT=22; PASS='Fusu1839045'

master, slave = pty.openpty()
proc = subprocess.Popen(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'ConnectTimeout=10',
     '-p', str(PORT), f'{USER}@{HOST}', 'ls /var/www/consolidated/ && echo DONE'],
    stdin=slave, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, close_fds=True
)
os.close(slave)
out = []; t0 = time.time(); pw_sent = False
while time.time()-t0 < 18:
    r, _, _ = select.select([proc.stdout], [], [], 0.3)
    if r:
        d = os.read(proc.stdout.fileno(), 2048)
        if d:
            out.append(d)
            txt = d.decode(errors='replace')
            if not pw_sent and len(txt) > 20:
                time.sleep(0.8)
                os.write(master, (PASS+'\n').encode())
                pw_sent = True
    if proc.poll() is not None: break
os.close(master); proc.wait()
result = b''.join(out).decode(errors='replace')
print(result[-800:])
