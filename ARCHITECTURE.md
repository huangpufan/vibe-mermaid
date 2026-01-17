# Architecture / 架构文档

This document provides an overview of the Vibe Mermaid Editor architecture.

本文档概述了 Vibe Mermaid Editor 的架构。

---

## 📐 High-Level Architecture / 高层架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / 浏览器                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  State Mgmt  │  │   Storage    │      │
│  │   UI 层      │  │  状态管理     │  │   存储       │      │
│  │              │  │              │  │              │      │
│  │  React 19    │◄─┤  Zustand 5   │◄─┤ localStorage │      │
│  │  Tailwind 4  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                                │
│         ▼                  ▼                                │
│  ┌──────────────────────────────────┐                      │
│  │      Core Features / 核心功能      │                      │
│  ├──────────────────────────────────┤                      │
│  │  Monaco Editor  │  Mermaid.js    │                      │
│  │  代码编辑器      │  图表渲染       │                      │
│  └──────────────────────────────────┘                      │
│         │                  │                                │
│         └──────────┬───────┘                                │
│                    ▼                                        │
│         ┌──────────────────────┐                           │
│         │   API Routes / API   │                           │
│         │   Next.js 16 API     │                           │
│         └──────────────────────┘                           │
│                    │                                        │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   AI Providers / AI  │
          │   OpenAI, Claude...  │
          └──────────────────────┘
```

---

## 🏗️ Project Structure / 项目结构


### Directory Layout / 目录布局

```
vibe-mermaid/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── generate/      # AI diagram generation
│   │   │   ├── chat/          # Multi-turn conversation
│   │   │   ├── optimize/      # Prompt optimization
│   │   │   ├── suggestions/   # Code suggestions
│   │   │   └── chat-suggestions/ # Follow-up suggestions
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   │
│   ├── components/            # React components
│   │   ├── Editor.tsx         # Code editor panel
│   │   ├── Preview.tsx        # Diagram preview
│   │   ├── ChatPanel.tsx      # AI chat interface
│   │   ├── Settings.tsx       # Settings modal
│   │   ├── Header.tsx         # Top navigation
│   │   └── ...
│   │
│   ├── lib/                   # Utilities & logic
│   │   ├── store.ts           # Zustand state management
│   │   ├── mermaid.ts         # Mermaid utilities
│   │   ├── i18n/              # Internationalization
│   │   ├── templates.ts       # Diagram templates
│   │   └── ...
│   │
│   ├── types/                 # TypeScript types
│   │   └── error.ts
│   │
│   └── __tests__/             # Test files
│       ├── components/        # Component tests
│       ├── lib/               # Utility tests
│       ├── api/               # API tests
│       ├── integration/       # Integration tests
│       └── e2e/               # E2E tests
│
├── public/                    # Static assets
├── .github/                   # GitHub configs
│   ├── workflows/             # CI/CD
│   └── ISSUE_TEMPLATE/        # Issue templates
├── docs/                      # Documentation
└── ...
```

---

## 🔄 Data Flow / 数据流

### 1. User Input → AI Generation / 用户输入 → AI 生成

```
User Input (Chat)
    │
    ▼
ChatPanel Component
    │
    ▼
API Route (/api/generate or /api/chat)
    │
    ├─► Validate input
    ├─► Build prompt
    ├─► Call AI provider (OpenAI SDK)
    │
    ▼
AI Provider Response
    │
    ▼
Parse & Validate Mermaid Code
    │
    ▼
Update Zustand Store
    │
    ▼
Preview Component Re-renders
```

### 2. Code Editing → Preview / 代码编辑 → 预览

```
Monaco Editor (User types)
    │
    ▼
onChange Event
    │
    ▼
Update Zustand Store (code state)
    │
    ▼
Preview Component (useEffect)
    │
    ├─► Validate syntax
    ├─► Render with Mermaid.js
    │
    ▼
Display Diagram or Error
```

### 3. Settings Management / 设置管理

```
Settings Modal
    │
    ▼
Update Zustand Store
    │
    ├─► Save to localStorage
    │
    ▼
Components React to State Changes
```

---

## 🧩 Key Components / 关键组件

### State Management (Zustand) / 状态管理

```typescript
interface AppState {
  // Code & Diagram
  code: string;
  setCode: (code: string) => void;
  
  // Chat History
  messages: Message[];
  addMessage: (message: Message) => void;
  
  // Settings
  apiKey: string;
  provider: AIProvider;
  theme: MermaidTheme;
  language: 'en' | 'zh';
  
  // UI State
  activeTab: 'chat' | 'editor';
  isGenerating: boolean;
  
  // History (Undo/Redo)
  history: string[];
  historyIndex: number;
}
```

### API Routes / API 路由

**1. `/api/generate` - Initial Generation / 初始生成**
- Input: User prompt
- Output: Mermaid code
- Features: Error detection, auto-fix

**2. `/api/chat` - Conversational Refinement / 对话式优化**
- Input: User message + context
- Output: Updated Mermaid code
- Features: Multi-turn context, node reference

**3. `/api/optimize` - Prompt Optimization / 提示词优化**
- Input: User prompt
- Output: Optimized prompt
- Features: Clarity improvement

**4. `/api/suggestions` - Code Suggestions / 代码建议**
- Input: Current code
- Output: Improvement suggestions
- Features: Best practices

**5. `/api/chat-suggestions` - Follow-up Suggestions / 追问建议**
- Input: Current diagram
- Output: Suggested questions
- Features: Context-aware

---

## 🔐 Security Architecture / 安全架构

### API Key Storage / API 密钥存储

```
┌─────────────────────────────────────┐
│         Browser / 浏览器             │
│  ┌───────────────────────────────┐  │
│  │      localStorage             │  │
│  │  - apiKey (encrypted)         │  │
│  │  - provider                   │  │
│  │  - baseUrl                    │  │
│  └───────────────────────────────┘  │
│              │                       │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │   Direct API Call             │  │
│  │   (No server storage)         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                │
                ▼
     ┌──────────────────────┐
     │   AI Provider API    │
     │   (OpenAI, Claude...)│
     └──────────────────────┘
```

**Key Points / 关键点:**
- API keys never sent to our servers / API 密钥从不发送到我们的服务器
- All AI calls are client-side / 所有 AI 调用都在客户端
- localStorage encryption recommended / 建议 localStorage 加密

---

## 🎨 UI Component Hierarchy / UI 组件层次

```
App (page.tsx)
├── Header
│   ├── Logo
│   ├── LanguageSwitch
│   ├── DarkModeSwitch
│   └── Settings Button
│
├── Main Content
│   ├── Editor Panel
│   │   ├── TabBar (Chat | Editor)
│   │   ├── ChatPanel
│   │   │   ├── MessageList
│   │   │   ├── InputArea
│   │   │   └── Suggestions
│   │   └── Editor (Monaco)
│   │
│   └── Preview Panel
│       ├── PreviewToolbar
│       │   ├── ThemeSelector
│       │   ├── ZoomControls
│       │   └── ExportButtons
│       └── PreviewCanvas
│           └── Mermaid Diagram
│
├── Settings Modal
│   ├── API Configuration
│   ├── Theme Settings
│   └── Keyboard Shortcuts
│
├── Onboarding
└── ErrorBoundary
```

---

## 🧪 Testing Strategy / 测试策略

### Test Pyramid / 测试金字塔

```
        ┌─────────┐
        │   E2E   │  ← Playwright (Planned)
        │  Tests  │
        └─────────┘
      ┌─────────────┐
      │ Integration │  ← Vitest + Testing Library
      │   Tests     │
      └─────────────┘
    ┌─────────────────┐
    │   Unit Tests    │  ← Vitest
    │  (Components,   │
    │   Utilities)    │
    └─────────────────┘
```

### Test Coverage / 测试覆盖

- **Unit Tests**: Components, utilities, hooks
- **Integration Tests**: API routes, workflows
- **E2E Tests**: Critical user journeys (planned)

---

## 🚀 Deployment / 部署

### Vercel Deployment / Vercel 部署

```
GitHub Push
    │
    ▼
Vercel CI/CD
    │
    ├─► Build (next build)
    ├─► Run tests
    ├─► Deploy to Edge Network
    │
    ▼
Production (mermaid-ai-six.vercel.app)
```

### Docker Deployment / Docker 部署

```
Dockerfile
    │
    ├─► Build stage (npm ci, npm run build)
    ├─► Production stage (node:20-alpine)
    │
    ▼
Docker Image
    │
    ▼
Container (Port 3000)
```

---

## 📊 Performance Considerations / 性能考虑

### Optimization Strategies / 优化策略

1. **Code Splitting** / 代码分割
   - Dynamic imports for heavy components
   - Monaco Editor lazy loading

2. **Caching** / 缓存
   - localStorage for settings
   - Mermaid render cache

3. **Debouncing** / 防抖
   - Editor input debouncing
   - API call throttling

4. **Bundle Size** / 包大小
   - Tree shaking
   - Minimal dependencies

---

## 🔮 Future Architecture / 未来架构

### Planned Improvements / 计划改进

1. **WebSocket for Real-time Collaboration** / WebSocket 实时协作
2. **Service Worker for Offline Support** / Service Worker 离线支持
3. **WebAssembly for Performance** / WebAssembly 性能优化
4. **Micro-frontend Architecture** / 微前端架构
5. **Plugin System** / 插件系统

---

**Last Updated / 最后更新**: 2025-01-17

For questions or suggestions, please open an issue on GitHub.

如有问题或建议，请在 GitHub 上提出 issue。
