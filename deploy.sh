#!/bin/bash
#
# HailuoAI Workspace 部署脚本 - 部署到阿里云服务器
#
# 包含项目:
#   - portfolio     产品集首页 (/)
#   - sleep-aid     睡眠助手 (/sleep-aid/)
#   - mc-task       我的世界任务管理器 (/mc-task/)
#   - art-chat      艺术绘画聊天 (/art-chat/)
#
# 使用方法:
#   ./deploy.sh                    # 完整部署（构建所有前端 + 上传 + 重启服务）
#   ./deploy.sh --backend-only     # 仅重启后端服务
#   ./deploy.sh --build-only       # 仅本地构建
#
# 需要设置的环境变量:
#   DEPLOY_HOST     - 服务器地址 (如: your-server.com)
#   DEPLOY_USER     - SSH 用户名 (默认: root)
#   DEPLOY_PATH     - 部署路径 (默认: /opt/hailuoai)
#   DASHSCOPE_API_KEY - DashScope API Key
#

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 配置
DEPLOY_HOST="39.97.246.203"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/hailuoai}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_ed25519}"
DASHSCOPE_API_KEY=""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查配置并获取API Key
check_config() {
    if [ -z "$DEPLOY_HOST" ]; then
        error "请设置 DEPLOY_HOST 环境变量"
    fi

    # 展开 ~ 路径
    SSH_KEY="${SSH_KEY/#\~/$HOME}"

    # 检查 SSH 密钥是否存在
    if [ ! -f "$SSH_KEY" ]; then
        error "SSH 密钥不存在: $SSH_KEY\n请先运行以下命令配置 SSH 密钥认证:\n  ssh-keygen -t ed25519\n  ssh-copy-id $DEPLOY_USER@$DEPLOY_HOST"
    fi

    # 获取 DASHSCOPE_API_KEY（只输入一次）
    if [ -z "$DASHSCOPE_API_KEY" ]; then
        echo -n "请输入 DASHSCOPE_API_KEY: "
        read -s DASHSCOPE_API_KEY
        echo ""
    fi
}

# SSH 命令
ssh_cmd() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" "$@"
}

# SCP 命令
scp_cmd() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$@"
}

# 构建单个前端项目
build_project() {
    local name=$1
    local dir=$2
    log "构建 $name ..."
    cd "$SCRIPT_DIR/$dir"
    npm install
    npm run build:prod 2>/dev/null || npm run build
    cd "$SCRIPT_DIR"
}

# 构建统一前端
build_all_frontends() {
    log "开始构建统一前端项目..."

    # 统一前端包含所有页面: portfolio, sleep-aid, mc-task, art-chat
    build_project "unified-frontend" "frontend"

    log "前端构建完成"
}

# 准备部署包
prepare_package() {
    log "准备部署包..."
    cd "$SCRIPT_DIR"
    rm -rf .deploy
    mkdir -p .deploy/public

    # 复制后端文件
    cp backend/package.json .deploy/
    cp backend/server.js .deploy/

    # 复制统一前端构建产物到根目录
    cp -r frontend/dist/* .deploy/public/

    log "部署包准备完成"
}

# 上传到服务器
upload() {
    log "上传到服务器 $DEPLOY_HOST..."

    # 创建目录
    ssh_cmd "mkdir -p $DEPLOY_PATH"

    # 上传文件
    scp_cmd -r .deploy/* "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/"

    log "上传完成"
}

# 在服务器上安装依赖并启动
remote_setup() {
    log "在服务器上配置服务..."

    ssh_cmd << REMOTE_SCRIPT
set -e
cd $DEPLOY_PATH

# 安装依赖
npm install --production

# 创建 systemd 服务
sudo tee /etc/systemd/system/hailuoai.service > /dev/null << 'EOF'
[Unit]
Description=HailuoAI Workspace Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=80
EnvironmentFile=$DEPLOY_PATH/.env

[Install]
WantedBy=multi-user.target
EOF

# 重载 systemd 并重启服务
sudo systemctl daemon-reload
sudo systemctl enable hailuoai
sudo systemctl restart hailuoai

echo "服务已启动"
systemctl status hailuoai --no-pager || true
REMOTE_SCRIPT

    log "服务配置完成"
}

# 创建远程 .env 文件
setup_env() {
    if [ -n "$DASHSCOPE_API_KEY" ]; then
        log "配置环境变量..."
        ssh_cmd "echo 'DASHSCOPE_API_KEY=$DASHSCOPE_API_KEY' > $DEPLOY_PATH/.env && echo 'PORT=80' >> $DEPLOY_PATH/.env"
        log "环境变量配置完成"
    else
        warn "DASHSCOPE_API_KEY 未设置，请手动配置服务器上的 $DEPLOY_PATH/.env 文件"
    fi
}

# 仅重启后端
restart_backend() {
    check_config
    log "重启后端服务..."
    ssh_cmd "sudo systemctl restart hailuoai && systemctl status hailuoai --no-pager"
    log "后端已重启"
}

# 清理
cleanup() {
    cd "$SCRIPT_DIR"
    rm -rf .deploy
}

# 完整部署
full_deploy() {
    check_config
    build_all_frontends
    prepare_package
    upload
    setup_env
    remote_setup
    cleanup

    log "部署完成!"
    log ""
    log "访问地址:"
    log "  - 产品集首页:     http://$DEPLOY_HOST/"
    log "  - 睡眠助手:       http://$DEPLOY_HOST/sleep-aid/"
    log "  - 我的世界任务:   http://$DEPLOY_HOST/mc-task/"
    log "  - 艺术绘画聊天:   http://$DEPLOY_HOST/art-chat/"
}

# 主入口
case "${1:-}" in
    --backend-only)
        restart_backend
        ;;
    --build-only)
        build_all_frontends
        log "构建完成"
        ;;
    --help|-h)
        echo "HailuoAI Workspace 部署脚本"
        echo ""
        echo "项目:"
        echo "  - portfolio     产品集首页 (/)"
        echo "  - sleep-aid     睡眠助手 (/sleep-aid/)"
        echo "  - mc-task       我的世界任务管理器 (/mc-task/)"
        echo "  - art-chat      艺术绘画聊天 (/art-chat/)"
        echo ""
        echo "用法:"
        echo "  ./deploy.sh                完整部署"
        echo "  ./deploy.sh --backend-only 仅重启后端"
        echo "  ./deploy.sh --build-only   仅构建前端"
        echo ""
        echo "环境变量:"
        echo "  DEPLOY_HOST       服务器地址 (必需)"
        echo "  DEPLOY_USER       SSH 用户名 (默认: root)"
        echo "  DEPLOY_PATH       部署路径 (默认: /opt/hailuoai)"
        echo "  DASHSCOPE_API_KEY DashScope API Key"
        echo "  SSH_KEY           SSH 私钥路径 (默认: ~/.ssh/id_ed25519)"
        echo ""
        echo "首次使用请先配置 SSH 密钥认证:"
        echo "  ssh-keygen -t ed25519"
        echo "  ssh-copy-id root@39.97.246.203"
        ;;
    *)
        full_deploy
        ;;
esac
