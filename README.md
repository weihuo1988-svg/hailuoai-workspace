# HailuoAI Workspace

海螺AI产品集合，统一的 React 前端应用 + 共享后端服务。

## 项目列表

| 路由 | 说明 |
|------|------|
| `/` | 产品集首页 |
| `/sleep-aid` | 睡眠助手 - 认知洗牌助眠 |
| `/mc-task` | 我的世界任务管理器 |
| `/art-chat` | 画画问答 |

## 项目结构

```
├── frontend/              # 统一前端 (React + Vite + React Router)
│   ├── src/
│   │   ├── App.tsx        # 路由配置
│   │   ├── pages/
│   │   │   ├── Portfolio.tsx    # 首页
│   │   │   ├── SleepAid.tsx     # 睡眠助手
│   │   │   ├── ArtChat.tsx      # 画画问答
│   │   │   └── mc-task/         # 我的世界任务
│   │   └── ...
│   └── vite.config.ts
├── backend/               # 共享后端 (Express + TTS API)
├── deploy.sh              # 部署脚本
└── package.json
```

## 本地开发

```bash
# 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 设置环境变量 (sleep-aid TTS 需要)
export DASHSCOPE_API_KEY=your-api-key

# 启动后端
cd backend && node server.js

# 启动前端 (另一个终端)
cd frontend && npm run dev
```

## 部署到阿里云

```bash
# 设置环境变量
export DEPLOY_HOST=your-server.com
export DASHSCOPE_API_KEY=your-api-key

# 完整部署
./deploy.sh

# 仅重启后端
./deploy.sh --backend-only

# 仅构建前端
./deploy.sh --build-only
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DASHSCOPE_API_KEY` | 阿里云 DashScope API Key | (必需) |
| `DEPLOY_HOST` | 服务器地址 | (必需) |
| `DEPLOY_USER` | SSH 用户名 | root |
| `DEPLOY_PATH` | 部署路径 | /opt/hailuoai |
| `SSH_KEY` | SSH 私钥路径 | - |
| `PORT` | 后端端口 | 3001 |

## API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/tts` | POST | 文本转语音 |
| `/api/tts-preview` | POST | 预览音色 |
| `/health` | GET | 健康检查 |

## 技术栈

- **前端**: React 18 + TypeScript + Vite + React Router
- **后端**: Express.js + DashScope TTS API
- **部署**: 阿里云 ECS + systemd
