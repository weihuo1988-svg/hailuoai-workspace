#!/bin/bash
#
# HailuoAI Workspace 云端部署脚本 - 在云服务器上拉取代码并部署
#
# 包含项目:
#   - portfolio     产品集首页 (/)
#   - sleep-aid     睡眠助手 (/sleep-aid/)
#   - mc-task       我的世界任务管理器 (/mc-task/)
#   - art-chat      艺术绘画聊天 (/art-chat/)
#   - adventure     小探险家亲子打卡 (/adventure/)
#
# 使用方法:
#   ./deploy_cloud.sh <DASHSCOPE_API_KEY>              # 完整部署
#   ./deploy_cloud.sh --restart-only                   # 仅重启后端服务
#
# 前提条件:
#   - 服务器上已安装 git, node, npm
#   - 已配置 git 仓库访问权限 (SSH key 或 HTTPS token)
#

set -e

# 配置
DEPLOY_PATH="/opt/hailuoai"
GIT_REPO="git@github.com:weihuo1988-svg/hailuoai-workspace.git"
GIT_BRANCH="main"

# 解析参数
DASHSCOPE_API_KEY=""
ACTION=""

for arg in "$@"; do
    case "$arg" in
        --restart-only|--help|-h)
            ACTION="$arg"
            ;;
        *)
            if [ -z "$DASHSCOPE_API_KEY" ]; then
                DASHSCOPE_API_KEY="$arg"
            fi
            ;;
    esac
done

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 检查必要依赖
check_dependencies() {
    log "检查依赖..."

    command -v git >/dev/null 2>&1 || error "请先安装 git"
    command -v node >/dev/null 2>&1 || error "请先安装 node"
    command -v npm >/dev/null 2>&1 || error "请先安装 npm"

    log "依赖检查通过"
}

# 拉取或克隆代码
pull_code() {
    log "拉取代码..."

    if [ -d "$DEPLOY_PATH" ]; then
        # 目录存在，拉取最新代码
        cd "$DEPLOY_PATH"
        git reset --hard # 强制清除所有本地修改
        git clean -fd    # 删除所有未跟踪的文件和目录
        git pull origin "$GIT_BRANCH"
        log "代码已更新到最新版本"
    else
        # 首次部署，克隆仓库
        log "首次部署，克隆仓库..."
        mkdir -p "$(dirname "$DEPLOY_PATH")"
        git clone -b "$GIT_BRANCH" "$GIT_REPO" "$DEPLOY_PATH"
        log "仓库克隆完成"
    fi
}

# 构建前端
build_frontend() {
    log "构建前端..."

    cd "$DEPLOY_PATH/frontend"
    npm install
    npm run build:prod 2>/dev/null || npm run build

    log "前端构建完成"
}

# 准备部署目录
prepare_deploy() {
    log "准备部署目录..."

    cd "$DEPLOY_PATH"

    # 创建运行目录
    mkdir -p "$DEPLOY_PATH/run/public"

    # 复制后端文件
    cp backend/package.json run/
    cp backend/server.js run/

    # 复制前端构建产物
    cp -r frontend/dist/* run/public/

    log "部署目录准备完成"
}

# 安装后端依赖
install_backend_deps() {
    log "安装后端依赖..."

    cd "$DEPLOY_PATH/run"
    npm install --production

    log "后端依赖安装完成"
}

# 配置环境变量
setup_env() {
    local env_file="$DEPLOY_PATH/run/.env"

    if [ -z "$DASHSCOPE_API_KEY" ]; then
        error "请提供 DASHSCOPE_API_KEY 参数\n用法: ./deploy_cloud.sh <DASHSCOPE_API_KEY>"
    fi

    log "配置环境变量..."
    echo "DASHSCOPE_API_KEY=$DASHSCOPE_API_KEY" > "$env_file"
    echo "PORT=80" >> "$env_file"
    log "环境变量配置完成"
}

# 配置 systemd 服务
setup_systemd() {
    log "配置 systemd 服务..."

    sudo tee /etc/systemd/system/hailuoai.service > /dev/null << EOF
[Unit]
Description=HailuoAI Workspace Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_PATH/run
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=80
EnvironmentFile=$DEPLOY_PATH/run/.env

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable hailuoai

    log "systemd 服务配置完成"
}

# 重启服务
restart_service() {
    log "重启服务..."

    sudo systemctl restart hailuoai

    # 等待服务启动
    sleep 2

    if systemctl is-active --quiet hailuoai; then
        log "服务已启动"
        systemctl status hailuoai --no-pager || true
    else
        error "服务启动失败，请检查日志: journalctl -u hailuoai -f"
    fi
}

# 显示部署信息
show_info() {
    local host=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

    log ""
    log "部署完成!"
    log ""
    log "访问地址:"
    log "  - 产品集首页:     http://$host/"
    log "  - 睡眠助手:       http://$host/sleep-aid/"
    log "  - 我的世界任务:   http://$host/mc-task/"
    log "  - 艺术绘画聊天:   http://$host/art-chat/"
    log "  - 小探险家打卡:   http://$host/adventure/"
    log ""
    log "常用命令:"
    log "  查看日志: journalctl -u hailuoai -f"
    log "  重启服务: systemctl restart hailuoai"
    log "  停止服务: systemctl stop hailuoai"
}

# 仅重启服务
do_restart_only() {
    restart_service
}

# 完整部署
full_deploy() {
    check_dependencies
    pull_code
    build_frontend
    prepare_deploy
    install_backend_deps
    setup_env
    setup_systemd
    restart_service
    show_info
}

# 显示帮助
show_help() {
    echo "HailuoAI Workspace 云端部署脚本"
    echo ""
    echo "项目:"
    echo "  - portfolio     产品集首页 (/)"
    echo "  - sleep-aid     睡眠助手 (/sleep-aid/)"
    echo "  - mc-task       我的世界任务管理器 (/mc-task/)"
    echo "  - art-chat      艺术绘画聊天 (/art-chat/)"
    echo "  - adventure     小探险家打卡 (/adventure/)"
    echo ""
    echo "用法:"
    echo "  ./deploy_cloud.sh <DASHSCOPE_API_KEY>  完整部署"
    echo "  ./deploy_cloud.sh --restart-only       仅重启服务"
    echo ""
    echo "首次使用前请确保:"
    echo "  1. 服务器上已安装 git, node, npm"
    echo "  2. 已配置 git 仓库访问权限 (SSH key)"
}

# 主入口
case "$ACTION" in
    --restart-only)
        do_restart_only
        ;;
    --help|-h)
        show_help
        ;;
    *)
        full_deploy
        ;;
esac
