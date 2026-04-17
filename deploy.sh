#!/bin/bash
# =============================================================================
# 四项目整合 · 一键部署脚本（交互式版）
#
# 使用方式：
#   bash /workspace/deploy.sh
#   运行时按提示输入服务器 IP 和密码即可
#
# 依赖：sshpass（脚本会自动检测，如未安装会尝试安装）
#       如安装失败，会切换为 ssh -o NumberOfPasswordPrompts=1 交互模式
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

# ── 交互式输入 ────────────────────────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   四项目整合 · 一键部署              ║"
echo "╚════════════════════════════════════════╝"
echo ""

read -r -p "服务器 IP [39.97.246.203]: " SERVER_IP
echo ""
read -r -s -p "服务器密码: " PASS
echo ""

SERVER_IP=${SERVER_IP:-39.97.246.203}
SERVER="root@${SERVER_IP}"

[[ -z "$PASS" ]] && err "密码不能为空"

# ── 工具检测：优先 sshpass，降级为 ssh 交互 ───────────────────────────────
if command -v sshpass &>/dev/null; then
    AUTH_MODE="sshpass"
    log "认证方式: sshpass"
else
    # 检查是否可以通过 apt 安装
    if apt-get install -y sshpass &>/dev/null 2>&1; then
        AUTH_MODE="sshpass"
        log "sshpass 安装成功，认证方式: sshpass"
    else
        AUTH_MODE="interactive"
        warn "sshpass 安装失败，将使用交互式 SSH（运行时需要手动输入密码多次）"
        warn "建议在服务器上执行一次 ssh-copy-id 以避开交互："
        echo "  ssh-copy-id root@${SERVER_IP}"
    fi
fi

# ── SSH / SCP 命令构造 ───────────────────────────────────────────────────
if [[ "$AUTH_MODE" == "sshpass" ]]; then
    SSH_CMD() { sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$SERVER" "$1"; }
    SCP_CMD() { sshpass -p "$PASS" scp -o StrictHostKeyChecking=no "$1" "$SERVER:$2"; }
    SCP_DIR() { sshpass -p "$PASS" scp -r -o StrictHostKeyChecking=no "$1" "$SERVER:$2"; }
else
    SSH_CMD() { ssh -o StrictHostKeyChecking=no -o NumberOfPasswordPrompts=1 \
                     -o PreferredAuthentications=password \
                     "$SERVER" "$1"; }
    SCP_CMD() { scp -o StrictHostKeyChecking=no -o NumberOfPasswordPrompts=1 \
                     -o PreferredAuthentications=password \
                     "$1" "$SERVER:$2"; }
    SCP_DIR() { scp -r -o StrictHostKeyChecking=no -o NumberOfPasswordPrompts=1 \
                      -o PreferredAuthentications=password \
                      "$1" "$SERVER:$2"; }
fi

# ── 步骤 1: 验证连通 ─────────────────────────────────────────────────────
log "验证服务器连通..."
if ! timeout 5 bash -c "echo > /dev/tcp/${SERVER_IP}/22" 2>/dev/null; then
    err "无法连接 ${SERVER_IP}:22"
fi
log "端口连通 ✓"

AUTH_TEST=$(SSH_CMD "echo AUTH_OK && hostname" 2>&1)
if ! echo "$AUTH_TEST" | grep -q "AUTH_OK"; then
    err "SSH 认证失败，请检查密码是否正确。响应: $AUTH_TEST"
fi
log "SSH 认证成功 ✓"

# ── 步骤 2: Nginx 安装 ───────────────────────────────────────────────────
log "检查 Nginx..."
NGINX_CHECK=$(SSH_CMD "command -v nginx" 2>&1)
if echo "$NGINX_CHECK" | grep -qv "nginx"; then
    warn "Nginx 未安装，正在安装..."
    SSH_CMD "apt-get update && apt-get install -y nginx && echo NGINX_INSTALLED"
    log "Nginx 安装完成 ✓"
else
    log "Nginx 已安装 ✓"
fi

# ── 步骤 3: 快照 ─────────────────────────────────────────────────────────
SNAP="/var/www/consolidated/snapshots/$(date +%Y%m%d_%H%M%S)"
log "创建快照: $SNAP"
SSH_CMD "mkdir -p $SNAP && cp -r /var/www/consolidated/* $SNAP/ 2>/dev/null; echo SNAPSHOT_OK"

# ── 步骤 4: 创建目录 ─────────────────────────────────────────────────────
log "创建目录..."
for d in mc-task-app portfolio sleep-aid art-chat; do
    SSH_CMD "mkdir -p /var/www/consolidated/$d"
done
log "目录就绪 ✓"

# ── 步骤 5: 上传构建产物 ─────────────────────────────────────────────────
echo ""
log "=== 上传构建产物 ==="

log "上传 mc-task-app..."
SCP_DIR "/workspace/projects/mc-task-app/dist/" "/var/www/consolidated/mc-task-app/" && log "mc-task-app ✓"

log "上传 portfolio..."
SCP_DIR "/workspace/projects/portfolio/dist/" "/var/www/consolidated/portfolio/" && log "portfolio ✓"

log "上传 sleep-aid..."
SCP_DIR "/workspace/projects/sleep-aid-new/dist/" "/var/www/consolidated/sleep-aid/" && log "sleep-aid ✓"

log "上传 art-chat..."
SCP_CMD "/workspace/projects/art-chat/dist/index.html" "/var/www/consolidated/art-chat/index.html" && log "art-chat ✓"

# ── 步骤 6: Nginx 配置 ───────────────────────────────────────────────────
echo ""
log "=== 配置 Nginx ==="

SSH_CMD "rm -f /etc/nginx/sites-enabled/default"

NCONF=$(cat /workspace/nginx_consolidated.conf)
SSH_CMD "cat > /etc/nginx/conf.d/consolidated.conf << 'NGEOF'
${NCONF}
NGEOF"

NGINX_TEST=$(SSH_CMD "nginx -t 2>&1")
echo "$NGINX_TEST"
if echo "$NGINX_TEST" | grep -q "successful"; then
    SSH_CMD "nginx -s reload"
    log "Nginx 重载成功 ✓"
else
    err "Nginx 配置语法错误，部署中断。"
fi

# ── 步骤 7: PM2 后端 ─────────────────────────────────────────────────────
echo ""
log "重启后端服务..."
SSH_CMD "pm2 restart all --update-env 2>/dev/null; pm2 save 2>/dev/null; echo PM2_OK"

# ── 步骤 8: 清理旧快照 ─────────────────────────────────────────────────────
log "清理旧快照（保留最近 5 份）..."
SSH_CMD "cd /var/www/consolidated/snapshots && ls -dt */ 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null; echo CLEANUP_OK"

# ── 步骤 9: 验证 ─────────────────────────────────────────────────────────
echo ""
log "=== 最终验证 ==="
sleep 2

for pair in "/:portfolio" "/mc-task-app/:mc-task-app" "/sleep-aid/:sleep-aid" "/art-chat/:art-chat"; do
    path="${pair%%:*}"
    name="${pair##*:}"
    code=$(SSH_CMD "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1${path} --max-time 10" 2>&1 | tr -d '[:space:]')
    if [[ "$code" == "200" ]]; then
        echo -e "  ${GREEN}✓${NC} http://${SERVER_IP}${path}  → 200  ${name}"
    else
        echo -e "  ${YELLOW}⚠${NC}  http://${SERVER_IP}${path}  → ${code:--}  ${name}"
    fi
done

# ── 完成 ─────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "  服务器: $SERVER_IP"
echo "  快照目录: $SNAP"
echo "══════════════════════════════════════"
echo ""
echo "访问地址："
echo "  http://$SERVER_IP/            → portfolio（入口）"
echo "  http://$SERVER_IP/mc-task-app/  → mc-task-app"
echo "  http://$SERVER_IP/sleep-aid/     → sleep-aid"
echo "  http://$SERVER_IP/art-chat/      → art-chat"
echo ""
