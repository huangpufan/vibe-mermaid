export const zh = {
  // 通用
  common: {
    cancel: '取消',
    save: '保存配置',
    loading: '加载中...',
    close: '关闭',
    apply: '应用',
    applying: '应用中...',
    required: '必填',
  },

  // Header 组件
  header: {
    tagline: '智能图表生成器',
    openSource: '开源免费',
    syntaxDocs: '语法文档',
    github: 'GitHub',
    configApi: '配置 API',
    apiConfigured: 'API 已配置',
  },

  // Settings 组件
  settings: {
    title: 'API 配置',
    subtitle: '选择 AI 服务商并配置密钥',
    selectProvider: '选择服务商',
    apiKey: 'API Key',
    apiKeyPlaceholder: '输入你的 API Key',
    baseUrl: 'API Base URL',
    modelName: '模型名称',
    modelPlaceholder: '选择或输入模型名称',
    modelHint: '可从下拉列表选择或手动输入自定义模型',
    privacyTitle: '隐私保护',
    privacyDesc: '你的 API Key 仅保存在浏览器本地存储中，不会上传到任何服务器。所有 AI 请求直接从你的浏览器发送到 API 服务商。',
  },

  // Editor 组件
  editor: {
    loadingEditor: '加载编辑器...',
    aiChat: 'AI 对话',
    mermaidCode: 'Mermaid 代码',
    syntaxError: '语法错误',
    clickToViewNew: '点击查看新内容',
    validating: '验证中...',
  },

  // Preview 组件
  preview: {
    title: '预览',
    renderSuccess: '渲染成功',
    rendering: '渲染中...',
    zoomOut: '缩小',
    zoomIn: '放大',
    resetZoom: '重置缩放',
    reference: '引用',
    selecting: '选择中',
    referenceHint: '框选或点击图表元素引用',
    count: '个',
    selectTheme: '选择配色主题',
    themeCount: '共 {count} 种配色方案',
    copyCode: '复制代码',
    copyMarkdown: '复制 Markdown 代码块',
    downloadSvg: '下载 SVG',
    downloadPng: '下载 PNG',
    renderError: '渲染错误',
    checkSyntax: '请检查 Mermaid 语法',
    waitingInput: '等待输入',
    waitingInputDesc: '在左侧输入自然语言描述或 Mermaid 代码，图表将在这里实时预览',
    selectNodes: '点击选择节点，或拖拽框选多个',
    escToExit: 'ESC 退出',
    renderFailed: '渲染失败',
    // 节点类型
    nodeTypeDecision: '判断',
    nodeTypeEvent: '事件',
    nodeTypeNode: '节点',
    unnamedNode: '未命名节点',
  },

  // ChatPanel 组件
  chat: {
    aiThinking: 'AI 思考中...',
    aiAssistant: 'AI 助手',
    cancelRequest: '取消',
    clearChat: '清空对话',
    welcomeTitle: '你好，我是 Marina',
    welcomeDesc: '告诉我你想画什么图表，我会通过对话帮你完成',
    tryThese: '试试这些：',
    loadingSuggestions: '正在生成追问建议...',
    chartGenerated: '图表已生成，请查看右侧预览',
    configApiFirst: '请先配置 API Key',
    chatFailed: '对话失败',
    errorOccurred: '抱歉，出现了一些问题',
    unknownError: '未知错误',
    inputPlaceholder: '描述你想要的图表...',
    inputPlaceholderWithRef: '针对 {count} 个节点说点什么...',
    sendHint: '按 Enter 发送，Shift + Enter 换行',
    userMessage: '用户消息',
    aiMessage: 'AI助手消息',
    aiTyping: 'AI正在输入',
    // 引用相关
    reference: '引用',
    nodeCount: '{count} 个节点',
    removeReference: '移除此引用',
    clearAllReferences: '清除所有引用',
    // 快捷建议
    quickFlowchart: '流程图',
    quickSequence: '时序图',
    quickClass: '类图',
    quickMindmap: '思维导图',
    quickFlowchartPrompt: '帮我画一个流程图',
    quickSequencePrompt: '帮我画一个时序图',
    quickClassPrompt: '帮我画一个类图',
    quickMindmapPrompt: '帮我画一个思维导图',
  },

  // Suggestions 组件
  suggestions: {
    analyzing: 'AI 正在分析...',
    generating: '正在生成优化建议',
    title: 'AI 优化建议',
    desc: '点击应用任意建议来优化你的图表',
    applyThis: '应用此建议',
    closeSuggestions: '关闭建议',
    codePreview: '代码预览',
  },

  // Onboarding 组件
  onboarding: {
    title: 'Vibe-Mermaid',
    subtitle1: '智能图表生成器，让复杂的流程图、时序图、架构图',
    subtitle2: '只需一句话',
    badge: '开源免费 · 隐私安全 · 本地存储',
    // 功能介绍
    feature1Title: '自然语言生成',
    feature1Desc: '用简单的文字描述，AI 自动生成专业的 Mermaid 图表代码',
    feature2Title: '智能对话',
    feature2Desc: '通过对话持续优化图表，支持引用节点进行精准修改',
    feature3Title: '多格式导出',
    feature3Desc: '一键导出 SVG、PNG 或 Markdown，满足各种使用场景',
    feature4Title: '丰富主题',
    feature4Desc: '12 种精美配色主题，让你的图表更加专业美观',
    // 配置
    configTitle: '开始配置',
    configSubtitle: '选择你的 AI 服务商并填入 API Key，即刻开启智能图表之旅',
    selectProvider: '选择 AI 服务商',
    enterApiKey: '输入 API Key',
    apiKeyPlaceholder: '输入你的 {provider} API Key',
    privacyTitle: '隐私保护',
    privacyDesc: '你的 API Key 仅保存在浏览器本地存储中，不会上传到任何服务器。所有 AI 请求直接从你的浏览器发送到 API 服务商。',
    startButton: '开始使用 Vibe-Mermaid',
    enterApiKeyToContinue: '请先输入 API Key 以继续',
    footer: 'Vibe-Mermaid · 开源免费的智能图表生成器',
    // API 连通性测试
    testingConnection: '正在验证 API 连接...',
    connectionSuccess: '连接成功！',
    connectionSuccessDesc: '正在进入主界面...',
    connectionTestFailed: 'API 连接测试失败',
    apiKeyInvalid: 'API Key 无效或已过期',
    rateLimited: '请求过于频繁，请稍后重试',
    connectionTimeout: '连接超时，请检查网络',
    networkError: '网络连接失败，请检查 API 地址',
    endpointNotFound: 'API 端点不存在，请检查 Base URL',
    retryButton: '重试',
    changeSettings: '修改配置',
  },

  // 页面
  page: {
    title: 'Vibe Mermaid Editor - 智能图表生成器',
    description: '使用自然语言生成 Mermaid 图表，开源免费，自带 API Key 即可使用',
    loadingEditor: '加载编辑器...',
    loadingPreview: '加载预览...',
  },

  // 主题
  themes: {
    default: '默认',
    defaultDesc: 'Mermaid 默认蓝色配色',
    forest: '森林',
    forestDesc: '绿色调',
    dark: '深色',
    darkDesc: '深色背景',
    darkBlue: '深蓝',
    darkBlueDesc: '深色蓝色调',
    darkPurple: '深紫',
    darkPurpleDesc: '深色紫色调',
    neutral: '中性',
    neutralDesc: '灰色调',
    techBlue: '天蓝',
    techBlueDesc: '浅蓝色调',
    oceanTeal: '青色',
    oceanTealDesc: '青绿色调',
    sunsetOrange: '橙色',
    sunsetOrangeDesc: '橙色调',
    purpleDream: '紫色',
    purpleDreamDesc: '紫色调',
    rosePink: '粉色',
    rosePinkDesc: '粉色调',
    emeraldGreen: '绿色',
    emeraldGreenDesc: '浅绿色调',
    amberGold: '金黄',
    amberGoldDesc: '黄色调',
    slateModern: '石板灰',
    slateModernDesc: '深灰色调',
  },

  // 深色模式
  darkMode: {
    system: '跟随系统',
    light: '浅色模式',
    dark: '深色模式',
  },

  // 快捷键
  shortcuts: {
    title: '键盘快捷键',
    tip: '按 ? 键随时打开此帮助面板',
    // 类别
    editing: '编辑',
    export: '导出',
    navigation: '导航',
    view: '视图',
    help: '帮助',
    // 快捷键描述
    generate: '生成图表',
    undo: '撤销',
    redo: '重做',
    downloadSvg: '下载 SVG',
    downloadPng: '下载 PNG',
    copyMarkdown: '复制 Markdown',
    switchToChat: '切换到对话',
    switchToCode: '切换到代码',
    zoomIn: '放大',
    zoomOut: '缩小',
    resetZoom: '重置缩放',
    showHelp: '显示快捷键',
    exitReferenceMode: '退出引用模式',
  },

  // 模板
  templates: {
    title: '图表模板',
    search: '搜索模板...',
    allCategories: '全部',
    noResults: '未找到模板',
    footer: '显示 {count} 个模板',
    openTemplates: '模板',
  },

  // 导出
  export: {
    title: '导出图表',
    format: '导出格式',
    quality: '图片质量',
    qualityStandard: '标准',
    qualityHigh: '高清',
    qualityUltra: '超清',
    qualityMax: '极致',
    pngDesc: '位图格式，适合分享',
    pdfDesc: '文档格式，适合打印',
    pdfNotice: 'PDF 导出功能需要安装 jspdf 库。如未安装，将自动使用高清 PNG 导出。',
    export: '导出',
    exporting: '导出中...',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',
  },

  // 服务商
  providers: {
    siliconflow: '硅基流动',
    siliconflowDesc: '多模型聚合',
    volcEngine: '火山引擎',
    volcEngineDesc: '豆包 Seed-1.6',
    deepseek: 'DeepSeek',
    deepseekDesc: 'DeepSeek V3.2',
    zhipu: '智谱 AI',
    zhipuDesc: 'GLM-4 Flash',
    kimi: 'Kimi',
    kimiDesc: 'Moonshot K2',
    minimax: 'MiniMax',
    minimaxDesc: 'MiniMax M2.1',
    qwen: '通义千问',
    qwenDesc: 'Qwen Plus',
    openai: 'OpenAI',
    openaiDesc: 'GPT-4.1 Mini',
    anthropic: 'Anthropic',
    anthropicDesc: 'Claude Sonnet 4.5',
    openrouter: 'OpenRouter',
    openrouterDesc: '400+ 模型聚合',
    google: 'Google',
    googleDesc: 'Gemini 3 Flash',
  },

  // API 系统提示
  api: {
    // generate route
    generateSystemPrompt: `你是一个专业的 Mermaid 图表生成专家。

用户会用自然语言描述他们想要的图表，你需要将其转换为正确的 Mermaid 代码。

重要规则：
1. 只输出 Mermaid 代码，不要有任何解释或 markdown 代码块标记
2. 确保代码语法正确，可以被 Mermaid 正确渲染
3. 根据描述选择最合适的图表类型（flowchart、sequenceDiagram、classDiagram、stateDiagram-v2、erDiagram、gantt、pie、mindmap、gitGraph 等）
4. 使用清晰的节点命名和关系描述
5. 如果描述不够清晰，使用合理的默认值补充
6. 节点文本语言应与用户输入语言保持一致：用户用中文描述则节点用中文，用户用英文描述则节点用英文
7. 对于流程图，优先使用 flowchart 而不是 graph 关键字`,

    fixSystemPrompt: `你是一个 Mermaid 代码修复专家。

用户会提供有语法错误的 Mermaid 代码和错误信息，你需要修复这些错误。

重要规则：
1. 只输出修复后的 Mermaid 代码，不要有任何解释或 markdown 代码块标记
2. 保持原有的图表结构和内容
3. 只修复语法错误，不要改变图表的含义
4. 修复所有语法错误，确保代码可以正确渲染`,

    configApiFirst: '请先配置 API Key',
    enterDescription: '请输入描述',
    generateFailed: '生成失败',

    // chat route
    chatSystemPrompt: `你是一位专业的图表设计助手，擅长帮助用户创建各种类型的 Mermaid 图表。

你的工作流程：
1. **理解需求**：仔细理解用户想要创建什么类型的图表
2. **收集信息**：通过对话收集必要的细节，包括：
   - 图表类型（流程图、时序图、类图、状态图、ER图、甘特图、饼图、思维导图、Git图等）
   - 主要元素/节点
   - 元素之间的关系/流程
   - 任何特殊要求（样式、方向等）
3. **生成图表**：当信息足够时，生成 Mermaid 代码

响应格式规则：
- 当你需要继续对话收集信息时，只输出对话文本
- 当你认为信息足够，准备生成图表时，使用以下格式：
  [你的回复文本]
  ---MERMAID_CODE---
  [Mermaid代码]
  ---END_MERMAID_CODE---

对话风格：
- 保持简洁，不要过度询问
- 给出具体的选项或建议，帮助用户做决定
- 如果用户的描述已经足够清晰，可以直接生成图表
- 生成图表后，询问用户是否需要调整

支持的图表类型说明：
- flowchart/graph: 流程图，用于展示流程、决策等
- sequenceDiagram: 时序图，用于展示对象间的交互顺序
- classDiagram: 类图，用于展示类的结构和关系
- stateDiagram-v2: 状态图，用于展示状态转换
- erDiagram: ER图，用于展示实体关系
- gantt: 甘特图，用于展示项目时间线
- pie: 饼图，用于展示比例分布
- mindmap: 思维导图，用于展示层次结构
- gitGraph: Git图，用于展示分支和提交`,

    chatInvalidRequest: '请求格式错误',
    chatInvalidParams: '请求参数无效',
    chatMessagesEmpty: '消息列表不能为空',
    chatApiKeyInvalid: 'API Key 无效或已过期',
    chatRateLimited: '请求过于频繁，请稍后重试',
    chatTimeout: '请求超时，请重试',

    // optimize route
    optimizeSystemPrompt: `你是一个 Mermaid 图表描述优化助手。

用户会给你一段简短的自然语言描述，你需要将其优化为更详细、更适合生成图表的描述。

核心原则：不添加内容，只优化表达

禁止：
- 不要添加用户没有提到的步骤
- 不要添加用户没有提到的分支
- 不要添加用户没有提到的细节
- 不要改变用户的原意

允许：
- 让表达更清晰
- 补充流程的开始和结束
- 明确节点之间的关系
- 使用更规范的图表术语`,

    optimizeConfigApiFirst: '请先配置 API Key',
    optimizeEnterDescription: '请输入需要优化的描述',
    optimizeFailed: '优化失败',

    // suggestions route
    suggestionsSystemPrompt: `你是一个专业的 Mermaid 图表优化专家。

用户会给你一段 Mermaid 代码，你需要分析这个图表并提供 4 个不同方向的优化建议。

每个建议应该包含：
1. 简短的标题（5-10个字）
2. 简短的描述（说明这个优化的好处）
3. 修改后的完整 Mermaid 代码

建议的方向可以包括：
- 添加更多细节或步骤
- 简化结构
- 添加错误处理或异常流程
- 优化布局或样式
- 添加注释或说明`,

    suggestionsConfigApiFirst: '请先配置 API Key',
    suggestionsMissingCode: '缺少图表代码',
    suggestionsFailed: '生成建议失败',

    // chat-suggestions route
    chatSuggestionsSystemPrompt: `你是一个专业的图表设计助手。

根据当前的对话上下文，生成 3 个用户可能想要问的追问问题。

要求：
- 每个问题简短（10-20字）
- 问题应该是具体的、可操作的
- 帮助用户完善和优化当前图表
- 如果图表刚生成，可以建议添加更多细节或调整样式`,

    chatSuggestionsConfigApiFirst: '请先配置 API Key',
    chatSuggestionsMissingHistory: '缺少对话历史',
    chatSuggestionsFailed: '生成建议失败',
  },
};

// 定义翻译结构类型（使用 string 而不是字面量类型）
type DeepStringify<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepStringify<T[K]> }
    : T;

export type TranslationKeys = DeepStringify<typeof zh>;
