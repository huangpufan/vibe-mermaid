<div align="center">

# Vibe Mermaid Editor

**用 AI 将自然语言转换为专业图表，支持 10+ 国内外 AI 服务商**

[English](./README.md) | 简体中文

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![CI](https://github.com/huangpufan/vibe-mermaid/actions/workflows/ci.yml/badge.svg)](https://github.com/huangpufan/vibe-mermaid/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[在线体验](https://mermaid-ai-six.vercel.app) · [报告 Bug](https://github.com/huangpufan/vibe-mermaid/issues) · [功能建议](https://github.com/huangpufan/vibe-mermaid/issues)

</div>

---

## 📸 项目截图

<div align="center">

### 首页
![首页](docs/screenshots/首页.png)

### 主页
![主页](docs/screenshots/主页.png)

</div>

---

## 为什么选择 Vibe Mermaid Editor？

| 传统方式 | Vibe Mermaid Editor |
|---------|-------------------|
| 需要学习 Mermaid 语法 | 用自然语言描述即可 |
| 手动调试语法错误 | **AI 智能检测并自动修复错误** ⚡ |
| 复制代码到其他工具渲染 | 实时预览，所见即所得 |
| 只能用一种 AI 服务 | **支持 10+ AI 服务商自由切换** |
| API Key 上传到服务器 | **本地存储，数据安全** |

## 特性亮点

### 🎯 核心优势

- **🤖 AI 智能修复**：语法错误？无需手动调试，AI 自动检测并修复，让你专注创作
- **💬 自然语言生成**：用中文/英文描述需求，AI 自动生成专业 Mermaid 代码
- **🔄 对话式优化**：多轮对话持续改进图表，支持智能追问建议
- **🎯 节点精准编辑**：框选或点击图表节点，针对性优化指定部分

### 🚀 效率工具

- **⚡ 实时预览**：Monaco Editor + Mermaid 实时渲染，所见即所得
- **⌨️ 快捷键支持**：9+ 快捷键，高效编辑体验
- **🎨 12 种主题**：精心设计的配色方案，一键切换
- **📤 多格式导出**：SVG 矢量图 / PNG 位图 / Markdown 代码

### 🔐 安全与灵活

- **🔒 本地存储**：API Key 仅存浏览器本地，数据安全有保障
- **🌐 10+ AI 服务商**：火山引擎、DeepSeek、OpenAI、Claude、智谱、Kimi 等自由切换
- **🌍 国际化**：中英文双语界面

## 快速开始

### 方式一：本地开发

```bash
# 克隆项目
git clone https://github.com/huangpufan/vibe-mermaid.git
cd vibe-mermaid

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 方式二：Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/huangpufan/vibe-mermaid)

### 方式三：Docker 部署

```bash
# 构建镜像
docker build -t vibe-mermaid .

# 运行容器
docker run -p 3000:3000 vibe-mermaid
```

## 使用指南

### 基础用法

1. 点击右上角 **配置 API Key** 按钮
2. 选择你的 AI 服务商（推荐 DeepSeek，性价比高）
3. 填入你的 API Key
4. 在 **AI 对话** 标签页输入描述，如：
   - "画一个用户登录的流程图"
   - "画一个电商下单的时序图"
   - "画一个微服务架构图"
5. 点击 **生成图表** 或按 `Ctrl/Cmd + Enter`

### 对话式优化

生成图表后，你可以继续对话来优化：
- "把登录失败的分支加上"
- "给每个节点加上颜色"
- "把时序图改成从右到左"

### 节点引用（精确编辑）

1. 点击预览区的 **引用** 按钮
2. 框选或点击想要修改的节点
3. 输入修改描述，如："把这个节点改成红色"

## 支持的 AI 服务商

### 国内服务商

| 服务商 | Base URL | 推荐模型 | 特点 |
|--------|----------|----------|------|
| **DeepSeek** | `https://api.deepseek.com` | deepseek-chat / deepseek-reasoner | 高性价比，推理能力强 |
| **硅基流动** | `https://api.siliconflow.cn/v1` | deepseek-ai/DeepSeek-V3 | 多模型聚合平台 |
| **火山引擎** | `https://ark.cn-beijing.volces.com/api/v3` | doubao-seed-1-6-251015 | 字节跳动出品，稳定快速 |
| **智谱 AI** | `https://open.bigmodel.cn/api/paas/v4` | glm-4.7 | 清华系，中文理解好 |
| **Kimi** | `https://api.moonshot.cn/v1` | kimi-k2-thinking | 月之暗面，长上下文，推理能力 |
| **MiniMax** | `https://api.minimax.chat/v1` | minimax-m2.1 | 稳定可靠 |
| **通义千问** | `https://dashscope.aliyuncs.com/compatible-mode/v1` | qwen3 / qwen-plus | 阿里云出品 |

### 国际服务商

| 服务商 | Base URL | 推荐模型 | 特点 |
|--------|----------|----------|------|
| **OpenAI** | `https://api.openai.com/v1` | gpt-4.1-mini / gpt-4o | 业界标杆 |
| **Anthropic** | `https://api.anthropic.com/v1` | claude-sonnet-4-5-20250929 | 代码能力强 |
| **OpenRouter** | `https://openrouter.ai/api/v1` | 多种模型 | 400+ 模型聚合平台 |
| **Google** | `https://generativelanguage.googleapis.com/v1beta/openai` | gemini-3-flash-preview | 快速高效 |

> **提示**：所有兼容 OpenAI API 格式的服务都可以使用，只需填入对应的 Base URL 和 API Key。

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Enter` | 生成图表 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` 或 `Ctrl/Cmd + Y` | 重做 |
| `Ctrl/Cmd + S` | 下载 SVG |
| `Ctrl/Cmd + Shift + S` | 下载 PNG |
| `Ctrl/Cmd + Shift + C` | 复制 Markdown 代码块 |
| `Ctrl/Cmd + 1` | 切换到 AI 对话 |
| `Ctrl/Cmd + 2` | 切换到代码编辑 |
| `Ctrl/Cmd + +/-` | 缩放图表 |
| `Ctrl/Cmd + 0` | 重置缩放 |

## 主题预览

支持 12 种精心设计的配色主题：

- **Default** - 经典蓝色
- **Forest** - 森林绿
- **Dark** - 深色模式
- **Neutral** - 中性灰
- **Tech Blue** - 科技蓝
- **Ocean Teal** - 海洋青
- **Sunset Orange** - 落日橙
- **Purple Dream** - 梦幻紫
- **Rose Pink** - 玫瑰粉
- **Emerald Green** - 翡翠绿
- **Amber Gold** - 琥珀金
- **Slate Modern** - 现代石板

## 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 16.1 + React 19.2 |
| **语言** | TypeScript 5 |
| **样式** | Tailwind CSS 4 |
| **图表** | Mermaid 11.12 |
| **编辑器** | Monaco Editor (VS Code 同源) |
| **状态管理** | Zustand 5 |
| **AI 调用** | OpenAI SDK (兼容所有 OpenAI 协议服务) |
| **测试** | Vitest 4 + Testing Library |

## 项目结构

```
src/
├── app/
│   ├── api/                    # API 路由
│   │   ├── generate/           # AI 生成图表
│   │   ├── chat/               # 多轮对话
│   │   ├── optimize/           # 提示词优化
│   │   ├── suggestions/        # 代码优化建议
│   │   └── chat-suggestions/   # 对话追问建议
│   ├── globals.css             # 全局样式
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页面
├── components/
│   ├── Editor.tsx              # 编辑器面板
│   ├── Preview.tsx             # 预览面板
│   ├── Header.tsx              # 顶部导航
│   ├── Settings.tsx            # 设置弹窗
│   ├── ChatPanel.tsx           # AI 对话面板
│   ├── Onboarding.tsx          # 新用户引导
│   ├── Suggestions.tsx         # 优化建议
│   └── LanguageSwitch.tsx      # 语言切换
└── lib/
    ├── store.ts                # Zustand 状态管理
    ├── mermaid.ts              # Mermaid 工具函数
    ├── useKeyboardShortcuts.ts # 键盘快捷键
    └── i18n/                   # 国际化
        ├── index.ts
        ├── zh.ts               # 中文
        └── en.ts               # 英文
```

## 常见问题

<details>
<summary><b>API Key 安全吗？</b></summary>

是的。API Key 仅保存在你的浏览器本地 (localStorage)，不会上传到任何服务器。所有 AI 请求都直接从你的浏览器发送到 AI 服务商。
</details>

<details>
<summary><b>支持哪些图表类型？</b></summary>

支持 Mermaid 所有图表类型：流程图、时序图、类图、状态图、ER 图、甘特图、饼图、Git 图、思维导图等。
</details>

<details>
<summary><b>如何添加新的 AI 服务商？</b></summary>

只要服务商兼容 OpenAI API 格式，就可以使用。在设置中选择"自定义"，填入 Base URL 和 API Key 即可。
</details>

<details>
<summary><b>图表显示乱码怎么办？</b></summary>

尝试切换不同的主题，或者在代码中手动调整字体设置。
</details>

## 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

贡献方式：
- 提交 Issue 报告 Bug 或建议新功能
- Fork 项目并提交 Pull Request
- 完善文档和翻译
- 分享给更多人

## Star History

如果这个项目对你有帮助，请点一个 Star 支持一下！

[![Star History Chart](https://api.star-history.com/svg?repos=huangpufan/vibe-mermaid&type=Date)](https://star-history.com/#huangpufan/vibe-mermaid&Date)

## 许可证

本项目采用 [MIT 许可证](./LICENSE)。

### 这意味着什么？

✅ **你可以**:
- 商业使用
- 修改代码
- 分发
- 私用
- 转授权

⚠️ **你需要**:
- 包含原始许可证和版权声明

❌ **限制**:
- 作者不承担责任
- 不提供任何保证

许可证中文说明请查看 [LICENSE_ZH.md](./LICENSE_ZH.md)。

---

**版权所有 (c) 2025 huangpufan**

## 致谢

- [Mermaid](https://mermaid.js.org/) - 优秀的图表生成库
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code 的编辑器核心
- [Mermaid Live Editor](https://mermaid.live/) - 官方编辑器，本项目的灵感来源

---

<div align="center">

**如果觉得有用，请给一个 Star 支持一下！**

Made with ❤️ by [huangpufan](https://github.com/huangpufan)

</div>
