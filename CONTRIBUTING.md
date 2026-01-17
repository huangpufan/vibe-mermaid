# Contributing Guide

Thank you for your interest in Vibe Mermaid Editor! We welcome all forms of contribution.

English | [简体中文](#贡献指南)

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be kind and respectful. We are committed to providing a friendly, safe, and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Search [Issues](https://github.com/huangpufan/mermaid-ai/issues) first to check if the problem already exists
2. If not, create a new Issue with:
   - Clear problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and system information
   - Screenshots (if applicable)

### Suggesting Features

1. Search Issues first to check for similar suggestions
2. Create a Feature Request explaining:
   - Feature description
   - Use case
   - Possible implementation (optional)

### Contributing Code

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/mermaid-ai.git
cd mermaid-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
src/
├── app/           # Next.js App Router
│   ├── api/       # API routes
│   └── page.tsx   # Main page
├── components/    # React components
├── lib/           # Utilities and state management
│   └── i18n/      # Internationalization
└── ...
```

### Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm start        # Start production server
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Add types to all exported functions and components
- Avoid using `any` type

### React

- Use functional components and Hooks
- Use PascalCase for component files
- Use camelCase for utility functions

### Styling

- Use Tailwind CSS
- Avoid inline styles
- Mobile-first responsive design

### i18n

If your changes involve UI text:

1. Add Chinese translation in `src/lib/i18n/zh.ts`
2. Add English translation in `src/lib/i18n/en.ts`
3. Use `t('key')` function to reference translations

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Code style (no functional changes) |
| `refactor` | Refactoring |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Build/tooling changes |

### Examples

```bash
feat(chat): add message retry functionality
fix(preview): correct SVG export with custom fonts
docs: update README with new AI providers
refactor(store): simplify state management logic
```

## Pull Request Process

1. **Ensure code passes checks**
   ```bash
   npm run lint
   npm run build
   ```

2. **Update documentation** if needed

3. **Fill in the PR template**
   - Describe your changes
   - Link related Issue
   - Add screenshots (if applicable)

4. **Wait for review**
   - Maintainers will review your PR as soon as possible
   - You may be asked for changes or more information
   - Once approved, it will be merged

## Contribution Areas

Not sure where to start? Here are some suggestions:

### Beginner Friendly

- Fix typos and documentation errors
- Improve translations
- Add code comments

### Intermediate

- Fix bugs labeled `good first issue`
- Add new theme colors
- Improve user experience

### Advanced

- Add new AI provider support
- Implement new diagram features
- Performance optimization

## Thank You

Thanks to everyone who contributes to this project!

---

# 贡献指南

感谢你对 Vibe Mermaid Editor 的关注！我们欢迎任何形式的贡献。

[English](#contributing-guide) | 简体中文

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)

## 行为准则

请保持友善和尊重。我们致力于为所有人提供一个友好、安全和包容的环境。

## 如何贡献

### 报告 Bug

1. 先搜索 [Issues](https://github.com/huangpufan/mermaid-ai/issues) 确认是否已有相同问题
2. 如果没有，创建一个新 Issue，并提供：
   - 清晰的问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 浏览器和系统信息
   - 相关截图（如适用）

### 建议新功能

1. 先搜索 Issues 确认是否已有类似建议
2. 创建 Feature Request，并说明：
   - 功能描述
   - 使用场景
   - 可能的实现方式（可选）

### 贡献代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的修改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 开发环境设置

### 前置要求

- Node.js 18+
- npm 或 pnpm

### 安装步骤

```bash
# 克隆你 fork 的仓库
git clone https://github.com/YOUR_USERNAME/mermaid-ai.git
cd mermaid-ai

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 项目结构

```
src/
├── app/           # Next.js App Router
│   ├── api/       # API 路由
│   └── page.tsx   # 主页面
├── components/    # React 组件
├── lib/           # 工具函数和状态管理
│   └── i18n/      # 国际化
└── ...
```

### 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run lint     # 运行 ESLint 检查
npm start        # 启动生产服务器
```

## 代码规范

### TypeScript

- 使用 TypeScript 严格模式
- 为所有导出的函数和组件添加类型
- 避免使用 `any` 类型

### React

- 使用函数组件和 Hooks
- 组件文件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

### 样式

- 使用 Tailwind CSS
- 避免内联样式
- 响应式设计优先

### 国际化

如果你的改动涉及用户界面文本：

1. 在 `src/lib/i18n/zh.ts` 添加中文翻译
2. 在 `src/lib/i18n/en.ts` 添加英文翻译
3. 使用 `t('key')` 函数引用翻译

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（不是新功能也不是修复） |
| `perf` | 性能优化 |
| `test` | 添加测试 |
| `chore` | 构建/工具变动 |

### 示例

```bash
feat(chat): add message retry functionality
fix(preview): correct SVG export with custom fonts
docs: update README with new AI providers
refactor(store): simplify state management logic
```

## Pull Request 流程

1. **确保代码通过检查**
   ```bash
   npm run lint
   npm run build
   ```

2. **更新文档**
   - 如果添加了新功能，更新 README
   - 如果改变了 API，更新相关文档

3. **填写 PR 模板**
   - 描述改动内容
   - 关联相关 Issue
   - 添加截图（如适用）

4. **等待审核**
   - 维护者会尽快审核你的 PR
   - 可能会要求修改或提供更多信息
   - 审核通过后会合并

## 贡献领域

不知道从哪里开始？以下是一些建议：

### 初学者友好

- 修复 typo 和文档错误
- 改进翻译
- 添加代码注释

### 中级

- 修复标记为 `good first issue` 的 Bug
- 添加新的主题配色
- 优化用户体验

### 高级

- 添加新的 AI 服务商支持
- 实现新的图表功能
- 性能优化

## 感谢

感谢所有为项目做出贡献的人！
