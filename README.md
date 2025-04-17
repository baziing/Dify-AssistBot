# AI客服助手

基于 Dify API 开发的智能客服系统，提供多语言支持和实时翻译功能。

## 功能特点

- 💬 智能对话：基于 Dify API 的智能对话系统
- 🌐 多语言支持：自动检测用户输入语言
- 🔄 实时翻译：内置翻译工具，支持工单内容和对话的实时翻译
- 📋 一键复制：支持复制对话内容和翻译结果
- 🎨 现代化界面：基于 React + TypeScript 构建的响应式界面
- 🚀 流畅体验：平滑的动画过渡效果
- 🎭 动画效果：使用 tw-animate-css 提供丰富的动画效果

## 技术栈

- Frontend:
  - Next.js 15.2.4
  - React 19
  - TypeScript
  - Tailwind CSS 4
  - Shadcn/ui (基于 Radix UI)
  - Lucide Icons
  - React Query
  - i18next

## 开发环境设置

1. 克隆项目
```bash
git clone [repository-url]
cd Dify-AssistBot
```

2. 安装依赖
```bash
cd frontend
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 主要功能

### 聊天界面
- 支持发送和接收消息
- 消息历史记录显示
- 新建聊天功能
- 流畅的动画过渡效果
- 一键复制消息内容

### 翻译工具
- 自动语言检测
- 实时翻译支持
- 可折叠的翻译面板（默认隐藏）
- 一键重置功能
- 复制翻译结果

### 工单内容
- 支持原文/译文切换显示
- 自动截断过长内容
- 展开/收起功能
- 优雅的动画效果
- 复制工单内容

### 搜索功能
- 关键词搜索
- 分页显示结果
- 复制搜索结果
- 独立会话管理

## 使用说明

1. 打开应用后，您可以直接开始与 AI 助手对话
2. 需要翻译功能时，点击右上角的"翻译工具"按钮
3. 使用翻译工具翻译工单内容或对话内容
4. 需要开始新对话时，点击"新建聊天"按钮
5. 需要搜索内容时，点击右上角的"检索"按钮
6. 将鼠标悬停在内容上，点击出现的复制图标可复制内容

## 配置说明

项目配置文件位于 `frontend/.env`：

```env
NEXT_PUBLIC_DIFY_API_KEY=dify_api_key
NEXT_PUBLIC_DIFY_API_ENDPOINT=dify_api_url
NEXT_PUBLIC_API_HOST=your_api_host
NEXT_PUBLIC_API_PORT=your_api_port
NEXT_PUBLIC_API_BASE_URL=your_api_url
NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000
```

## 注意事项

- 首次使用需要配置 Dify API 密钥
- 建议使用现代浏览器以获得最佳体验
- 翻译功能默认隐藏，可通过界面按钮开启
- 项目使用最新的 React 19 和 Next.js 15，确保您的开发环境兼容这些版本
- 复制功能使用传统的 document.execCommand 方法，确保兼容性
