# My PDF Workspace

基于 `Vite + React + TypeScript` 的前端项目，包含两块核心能力：

- PDF 上传与浏览（`pdf.js` 渲染）
- DeepSeek 对话（SSE 流式输出）+ 意图识别后自动生成 PDF

## 功能概览

### 1) PDF Viewer 页面

- 上传本地 PDF 文件
- 使用 `pdfjs-dist` 将页面渲染到 canvas
- 叠加 text layer，支持文本选择与复制

路由：`/`

### 2) DeepSeek Chat 页面

- 与 DeepSeek 进行流式对话（SSE，边生成边显示）
- 自动识别用户意图：
  - `chat`：普通对话
  - `generate_pdf`：生成 PDF 任务
- 当识别为 `generate_pdf` 时：
  - 先让模型返回结构化内容（标题、文件名、段落）
  - 再使用 `jsPDF` 在前端生成并下载 PDF

路由：`/chat`

## 技术栈

- React 19
- TypeScript
- Vite
- react-router-dom
- pdfjs-dist
- jsPDF

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录新建 `.env` 文件（不要提交到仓库）：

```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### 3. 启动开发环境

```bash
pnpm dev
```

### 4. 构建生产包

```bash
pnpm build
```

## 目录结构（核心）

```text
src/
  pages/
    PdfViewerPage.tsx        # PDF 浏览页面
    DeepSeekChatPage.tsx     # DeepSeek 对话页面
  services/
    deepseekApi.ts           # DeepSeek 基础 API（fetch）
    deepseekStream.ts        # SSE 流式解析
  utils/
    pdf.ts                   # jsPDF 生成工具
  types/
    deepseek.ts              # 对话与模型返回类型
```

## 交互说明

- 聊天输入框：
  - `Enter` 发送
  - `Ctrl/Cmd + Enter` 换行
  - 输入法组合中不会误发消息

## 注意事项

- 当前项目是纯前端调用 DeepSeek，`VITE_` 变量会注入到前端构建产物。
- 生产环境建议通过后端代理 API，避免暴露密钥。
- 当前 PDF 生成为“简化文本版”，未做中文字体内嵌；复杂排版/中文字体精确渲染不是本版本目标。

## 后续可扩展方向

- PDF 生成：增加模板、页眉页脚、表格
- 对话：会话持久化、多轮上下文裁剪
- 安全：后端代理 + 鉴权 + 限流
- 性能：路由级懒加载，优化大包体积
