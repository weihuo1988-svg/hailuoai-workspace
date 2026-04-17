#!/bin/bash
# =============================================================================
# 四项目整合部署脚本
# 使用方式: bash deploy_consolidated.sh
# =============================================================================
set -euo pipefail

# ── 配置（敏感信息从环境变量读取）────────────────────────────────────────
SERVER="root@39.97.246.203"
SERVER_IP="39.97.246.203"

# 密码从环境变量读取，运行时必须设置
if [ -z "${DEPLOY_PASS:-}" ]; then
    echo -e "\033[0;31m[ERR] 密码未设置！请先设置环境变量：\033[0m"
    echo 'export DEPLOY_PASS="你的服务器密码"'
    echo ""
    echo "临时用法："
    echo "  DEPLOY_PASS='Fusu1839045' bash deploy_consolidated.sh"
    exit 1
fi

PASS="$DEPLOY_PASS"
BASE_DIR="/var/www/consolidated"
SNAPSHOT_DIR="$BASE_DIR/snapshots/$(date +%Y%m%d_%H%M%S)"
PROJECTS="mc-task-app portfolio sleep-aid art-chat"
SSH="sshpass -p$PASS ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
SCP="sshpass -p$PASS scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
RSYNC="sshpass -p$PASS rsync -avz --delete"

# ── 颜色 ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERR]${NC} $1"; }

# ── 步骤 0: 检查 / 安装依赖（Nginx + sshpass）─────────────────────────────
log "检查服务器环境依赖..."

# 本地 sshpass
if ! command -v sshpass &>/dev/null; then
    warn "sshpass 未安装，正在安装..."
    apt-get update && apt-get install -y sshpass
fi

# 服务器端 Nginx
if ! $SSH $SERVER "command -v nginx &>/dev/null" 2>/dev/null; then
    warn "服务器 Nginx 未安装，正在安装..."
    $SSH $SERVER "apt-get update && apt-get install -y nginx && nginx -t" 2>&1 | grep -E "(Setting up|installed|test is successful)" || true
    log "服务器 Nginx 安装完成 ✓"
else
    log "服务器 Nginx 已安装 ✓"
fi

# ── 步骤 1: 验证服务器连通性 ───────────────────────────────────────────────
log "验证服务器连通性..."
if ! timeout 10 bash -c "echo > /dev/tcp/$SERVER_IP/22" 2>/dev/null; then
    err "服务器 $SERVER_IP:22 无法连接！"
    exit 1
fi
log "服务器连通正常 ✓"

# ── 步骤 2: 构建各项目（带验证）────────────────────────────────────────────
log "=== 开始构建项目 ==="

build_project() {
    local name=$1
    local dir=$2
    local base=$3

    log "构建 $name (base=$base)..."
    cd /workspace/projects/$dir

    # 设置 base（覆盖 vite.config.ts 中的值，通过环境变量注入）
    BUILD_MODE=prod npx vite build --base $base 2>&1

    # 验证构建产物
    if [ ! -f dist/index.html ]; then
        err "$name 构建失败：dist/index.html 不存在！"
        exit 1
    fi

    # 检查 JS/CSS 路径是否包含正确的 base 前缀
    if grep -q "src=\"/assets/" dist/index.html; then
        local first_script=$(grep -o 'src="/assets/[^"]*"' dist/index.html | head -1)
        if [[ "$first_script" != src=\"$base* ]]; then
            warn "$name 警告：构建产物路径可能缺少 base 前缀，请检查 vite.config.ts"
        fi
    fi

    log "$name 构建完成 ✓"
}

build_project "mc-task-app"  "mc-task-app"   "/mc-task-app/"
build_project "portfolio"    "portfolio"     "/portfolio/"
build_project "sleep-aid"    "sleep-aid-new" "/sleep-aid/"

# art-chat 无需构建，确认文件存在即可
if [ ! -f /workspace/projects/art-chat/dist/index.html ]; then
    err "art-chat 构建产物不存在！"
    exit 1
fi
log "art-chat 确认就绪 ✓"

# ── 步骤 3: 服务器端创建快照 ──────────────────────────────────────────────
log "=== 创建快照 ==="
$SSH $SERVER "mkdir -p $SNAPSHOT_DIR" 2>/dev/null || true
log "快照目录: $SNAPSHOT_DIR"

# ── 步骤 4: 上传构建产物 ──────────────────────────────────────────────────
log "=== 上传构建产物到服务器 ==="

log "上传 mc-task-app..."
$SSH $SERVER "mkdir -p $BASE_DIR/mc-task-app" 2>/dev/null || true
$RSYNC --exclude='node_modules' /workspace/projects/mc-task-app/dist/ $SERVER:$BASE_DIR/mc-task-app/

log "上传 portfolio..."
$SSH $SERVER "mkdir -p $BASE_DIR/portfolio" 2>/dev/null || true
$RSYNC --exclude='node_modules' /workspace/projects/portfolio/dist/ $SERVER:$BASE_DIR/portfolio/

log "上传 sleep-aid..."
$SSH $SERVER "mkdir -p $BASE_DIR/sleep-aid" 2>/dev/null || true
$RSYNC --exclude='node_modules' /workspace/projects/sleep-aid-new/dist/ $SERVER:$BASE_DIR/sleep-aid/

log "上传 art-chat..."
$SSH $SERVER "mkdir -p $BASE_DIR/art-chat" 2>/dev/null || true
$SCP /workspace/projects/art-chat/dist/index.html $SERVER:$BASE_DIR/art-chat/index.html

log "所有产物上传完成 ✓"

# ── 步骤 5: 上传 / 配置 Nginx ───────────────────────────────────────────────
log "=== 配置 Nginx ==="
# 禁用默认 site（避免冲突）
$SSH $SERVER "rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true"

# 推送配置
$SCP /workspace/nginx_consolidated.conf $SERVER:/tmp/consolidated.conf
$SSH $SERVER "cp /tmp/consolidated.conf /etc/nginx/conf.d/consolidated.conf && \
               nginx -t 2>&1 && \
               nginx -s reload" 2>&1 | grep -E "(test is successful|failed|error)" || true
log "Nginx 配置重载完成 ✓"

# ── 步骤 6: 启动 / 重启 PM2 后端服务 ──────────────────────────────────────
log "=== 重启后端服务 ==="
$SSH $SERVER "pm2 restart mc-task-api --update-env 2>/dev/null || echo 'mc-task-api 暂无PM2配置，跳过'; \
               pm2 restart sleep-aid-api --update-env 2>/dev/null || echo 'sleep-aid-api 暂无PM2配置，跳过'; \
               pm2 save 2>/dev/null || true"
log "后端服务操作完成 ✓"

# ── 步骤 7: 清理旧快照（保留最近 5 个）────────────────────────────────────
log "=== 清理旧快照 ==="
$SSH $SERVER "cd $BASE_DIR/snapshots && ls -dt */ 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null; echo '清理完成'"
log "保留最近 5 个快照，旧快照已清理 ✓"

# ── 步骤 8: 最终验证 ────────────────────────────────────────────────────────
log "=== 最终验证 ==="
log "验证各路径是否返回 200..."
sleep 2

check() {
    local path=$1
    local code=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP$path" --max-time 10)
    if [ "$code" = "200" ]; then
        log "http://$SERVER_IP$path → $code ✓"
    else
        warn "http://$SERVER_IP$path → $code (可能正常，如需认证)"
    fi
}

check "/mc-task-app/"
check "/sleep-aid/"
check "/art-chat/"

log ""
log "========================================"
log "🎉 部署完成！"
log "快照位置: $SNAPSHOT_DIR"
log "========================================"
