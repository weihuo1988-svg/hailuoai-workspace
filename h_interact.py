#!/usr/bin/env python3
import subprocess, os, sys, pty, select, time, termios, fcntl, tty

HOST = '39.97.246.203'
USER = 'root'
PASS = 'Fusu1839045'
CMD = ' && '.join(sys.argv[1:]) if len(sys.argv) > 1 else 'echo connected'

def write_all(fd, data):
    while data:
        n = os.write(fd, data)
        data = data[n:]

pid, fd = pty.fork()

if pid == 0:
    # Child - run ssh
    os.execvp('ssh', ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'NumberOfPasswordPrompts=1', f'{USER}@{HOST}', CMD])
else:
    # Parent - interact
    old = termios.tcgetattr(fd)
    old[3] = old[3] & ~termios.ECHO  # echo off
    termios.tcsetattr(fd, termios.TCSADRAIN, old)
    
    sent_pass = False
    buf = b''
    
    while True:
        r, _, _ = select.select([fd, sys.stdin], [], [], 60)
        if not any(r):
            print('\n[timeout]')
            break
            
        if fd in r:
            try:
                d = os.read(fd, 1024)
                if not d:
                    break
                sys.stdout.write(d.decode('utf-8', errors='replace'))
                sys.stdout.flush()
                buf += d
                
                # Check if password prompt appeared
                if not sent_pass and (b'password:' in buf.lower() or b'password:' in d.lower()):
                    time.sleep(0.3)
                    write_all(fd, (PASS + '\r').encode())
                    sent_pass = True
                    buf = b''
            except OSError:
                break
        
        if sys.stdin in r:
            d = os.read(sys.stdin.fileno(), 1024)
            write_all(fd, d)
    
    # Cleanup
    os.close(fd)
    os.waitpid(pid, 0)
