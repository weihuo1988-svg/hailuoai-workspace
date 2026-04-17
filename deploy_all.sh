#!/bin/bash
set -e
cd /workspace

echo "=== Packaging projects ==="
tar -cf mc-task-app.tar -C projects/mc-task-app/dist . && echo "mc-task-app.tar done"
tar -cf portfolio.tar -C projects/portfolio/dist . && echo "portfolio.tar done"
tar -cf sleep-aid.tar -C projects/sleep-aid/dist . && echo "sleep-aid.tar done"
tar -cf art-chat.tar -C projects/art-chat/dist . && echo "art-chat.tar done"

echo "=== Base64 sizes ==="
wc -c *.tar

echo "=== Uploading to server via SSH ==="
# Upload mc-task-app
python3 /workspace/ssh_interact.py "mkdir -p /var/www/mc-task" 2>/dev/null
cat mc-task-app.tar | base64 | python3 /workspace/ssh_interact.py "cat > /tmp/mc-task-app.tar.b64 && base64 -d /tmp/mc-task-app.tar.b64 > /tmp/mc-task-app.tar && tar -xf /tmp/mc-task-app.tar -C /var/www/mc-task && echo 'mc-task uploaded'" 2>&1 | grep -v "password:"

echo "mc-task-app uploaded"
