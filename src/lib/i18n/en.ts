import type { TranslationKeys } from './zh';

export const en: TranslationKeys = {
  // Common
  common: {
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    close: 'Close',
    apply: 'Apply',
    applying: 'Applying...',
    required: 'Required',
  },

  // Header component
  header: {
    tagline: 'Smart Diagram Generator',
    openSource: 'Open Source',
    syntaxDocs: 'Syntax Docs',
    github: 'GitHub',
    configApi: 'Configure API',
    apiConfigured: 'API Configured',
  },

  // Settings component
  settings: {
    title: 'API Configuration',
    subtitle: 'Select AI provider and configure key',
    selectProvider: 'Select Provider',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your API Key',
    baseUrl: 'API Base URL',
    modelName: 'Model Name',
    modelPlaceholder: 'Select or enter model name',
    modelHint: 'Select from dropdown or enter custom model',
    privacyTitle: 'Privacy Protection',
    privacyDesc: 'Your API Key is stored only in browser local storage and will not be uploaded to any server. All AI requests are sent directly from your browser to the API provider.',
  },

  // Editor component
  editor: {
    loadingEditor: 'Loading editor...',
    aiChat: 'AI Chat',
    mermaidCode: 'Mermaid Code',
    syntaxError: 'Syntax Error',
    clickToViewNew: 'Click to view new content',
    validating: 'Validating...',
  },

  // Preview component
  preview: {
    title: 'Preview',
    renderSuccess: 'Rendered',
    rendering: 'Rendering...',
    zoomOut: 'Zoom Out',
    zoomIn: 'Zoom In',
    resetZoom: 'Reset Zoom',
    reference: 'Reference',
    selecting: 'Selecting',
    referenceHint: 'Click or drag to select elements',
    count: '',
    selectTheme: 'Select Theme',
    themeCount: '{count} themes available',
    copyCode: 'Copy Code',
    copyMarkdown: 'Copy Markdown',
    downloadSvg: 'Download SVG',
    downloadPng: 'Download PNG',
    renderError: 'Render Error',
    checkSyntax: 'Please check Mermaid syntax',
    waitingInput: 'Waiting for Input',
    waitingInputDesc: 'Enter natural language description or Mermaid code on the left, the diagram will be previewed here',
    selectNodes: 'Click to select nodes, or drag to select multiple',
    escToExit: 'ESC to exit',
    renderFailed: 'Render failed',
    // Node types
    nodeTypeDecision: 'Decision',
    nodeTypeEvent: 'Event',
    nodeTypeNode: 'Node',
    unnamedNode: 'Unnamed node',
  },

  // ChatPanel component
  chat: {
    aiThinking: 'AI is thinking...',
    aiAssistant: 'AI Assistant',
    cancelRequest: 'Cancel',
    clearChat: 'Clear Chat',
    welcomeTitle: 'Hello, I\'m Marina',
    welcomeDesc: 'Tell me what diagram you want to create, I\'ll help you through conversation',
    tryThese: 'Try these:',
    loadingSuggestions: 'Generating suggestions...',
    chartGenerated: 'Diagram generated, check the preview on the right',
    configApiFirst: 'Please configure API Key first',
    chatFailed: 'Chat failed',
    errorOccurred: 'Sorry, something went wrong',
    unknownError: 'Unknown error',
    inputPlaceholder: 'Describe the diagram you want...',
    inputPlaceholderWithRef: 'Say something about {count} nodes...',
    sendHint: 'Press Enter to send, Shift + Enter for new line',
    userMessage: 'User message',
    aiMessage: 'AI assistant message',
    aiTyping: 'AI is typing',
    // Reference related
    reference: 'Reference',
    nodeCount: '{count} nodes',
    removeReference: 'Remove this reference',
    clearAllReferences: 'Clear all references',
    // Quick suggestions
    quickFlowchart: 'Flowchart',
    quickSequence: 'Sequence',
    quickClass: 'Class Diagram',
    quickMindmap: 'Mind Map',
    quickFlowchartPrompt: 'Help me draw a flowchart',
    quickSequencePrompt: 'Help me draw a sequence diagram',
    quickClassPrompt: 'Help me draw a class diagram',
    quickMindmapPrompt: 'Help me draw a mind map',
  },

  // Suggestions component
  suggestions: {
    analyzing: 'AI is analyzing...',
    generating: 'Generating optimization suggestions',
    title: 'AI Suggestions',
    desc: 'Click to apply any suggestion to optimize your diagram',
    applyThis: 'Apply',
    closeSuggestions: 'Close suggestions',
    codePreview: 'Code Preview',
  },

  // Onboarding component
  onboarding: {
    title: 'Vibe-Mermaid',
    subtitle1: 'Smart diagram generator, create complex flowcharts, sequence diagrams, architecture diagrams',
    subtitle2: 'with just one sentence',
    badge: 'Open Source · Privacy First · Local Storage',
    // Feature introduction
    feature1Title: 'Natural Language',
    feature1Desc: 'Describe in simple words, AI generates professional Mermaid code automatically',
    feature2Title: 'Smart Conversation',
    feature2Desc: 'Optimize diagrams through conversation, support node reference for precise editing',
    feature3Title: 'Multi-format Export',
    feature3Desc: 'One-click export to SVG, PNG or Markdown for various use cases',
    feature4Title: 'Rich Themes',
    feature4Desc: '12 beautiful color themes to make your diagrams more professional',
    // Configuration
    configTitle: 'Get Started',
    configSubtitle: 'Select your AI provider and enter API Key to start your smart diagram journey',
    selectProvider: 'Select AI Provider',
    enterApiKey: 'Enter API Key',
    apiKeyPlaceholder: 'Enter your {provider} API Key',
    privacyTitle: 'Privacy Protection',
    privacyDesc: 'Your API Key is stored only in browser local storage and will not be uploaded to any server. All AI requests are sent directly from your browser to the API provider.',
    startButton: 'Start Using Vibe-Mermaid',
    enterApiKeyToContinue: 'Please enter API Key to continue',
    footer: 'Vibe-Mermaid · Open Source Smart Diagram Generator',
    // API connection test
    testingConnection: 'Verifying API connection...',
    connectionSuccess: 'Connection successful!',
    connectionSuccessDesc: 'Entering main interface...',
    connectionTestFailed: 'API connection test failed',
    apiKeyInvalid: 'API Key is invalid or expired',
    rateLimited: 'Too many requests, please try again later',
    connectionTimeout: 'Connection timeout, please check network',
    networkError: 'Network connection failed, please check API URL',
    endpointNotFound: 'API endpoint not found, please check Base URL',
    retryButton: 'Retry',
    changeSettings: 'Change Settings',
  },

  // Page
  page: {
    title: 'Vibe Mermaid Editor - Smart Diagram Generator',
    description: 'Generate Mermaid diagrams with natural language, open source and free, bring your own API Key',
    loadingEditor: 'Loading editor...',
    loadingPreview: 'Loading preview...',
  },

  // Themes
  themes: {
    default: 'Default',
    defaultDesc: 'Mermaid default blue',
    forest: 'Forest',
    forestDesc: 'Green tones',
    dark: 'Dark',
    darkDesc: 'Dark background',
    darkBlue: 'Dark Blue',
    darkBlueDesc: 'Dark blue tones',
    darkPurple: 'Dark Purple',
    darkPurpleDesc: 'Dark purple tones',
    neutral: 'Neutral',
    neutralDesc: 'Gray tones',
    techBlue: 'Sky Blue',
    techBlueDesc: 'Light blue tones',
    oceanTeal: 'Teal',
    oceanTealDesc: 'Teal tones',
    sunsetOrange: 'Orange',
    sunsetOrangeDesc: 'Orange tones',
    purpleDream: 'Purple',
    purpleDreamDesc: 'Purple tones',
    rosePink: 'Pink',
    rosePinkDesc: 'Pink tones',
    emeraldGreen: 'Green',
    emeraldGreenDesc: 'Light green tones',
    amberGold: 'Gold',
    amberGoldDesc: 'Yellow tones',
    slateModern: 'Slate',
    slateModernDesc: 'Dark gray tones',
  },

  // Dark mode
  darkMode: {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },

  // Keyboard shortcuts
  shortcuts: {
    title: 'Keyboard Shortcuts',
    tip: 'Press ? to open this help panel anytime',
    // Categories
    editing: 'Editing',
    export: 'Export',
    navigation: 'Navigation',
    view: 'View',
    help: 'Help',
    // Shortcut descriptions
    generate: 'Generate diagram',
    undo: 'Undo',
    redo: 'Redo',
    downloadSvg: 'Download SVG',
    downloadPng: 'Download PNG',
    copyMarkdown: 'Copy Markdown',
    switchToChat: 'Switch to chat',
    switchToCode: 'Switch to code',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    showHelp: 'Show shortcuts',
    exitReferenceMode: 'Exit reference mode',
  },

  // Templates
  templates: {
    title: 'Diagram Templates',
    search: 'Search templates...',
    allCategories: 'All',
    noResults: 'No templates found',
    footer: 'Showing {count} templates',
    openTemplates: 'Templates',
  },

  // Export
  export: {
    title: 'Export Diagram',
    format: 'Export Format',
    quality: 'Image Quality',
    qualityStandard: 'Standard',
    qualityHigh: 'High',
    qualityUltra: 'Ultra',
    qualityMax: 'Maximum',
    pngDesc: 'Raster format, good for sharing',
    pdfDesc: 'Document format, good for printing',
    pdfNotice: 'PDF export requires jspdf library. If not installed, high-res PNG will be used instead.',
    export: 'Export',
    exporting: 'Exporting...',
    exportSuccess: 'Export successful',
    exportFailed: 'Export failed',
  },

  // Providers
  providers: {
    siliconflow: 'SiliconFlow',
    siliconflowDesc: 'Multi-model Hub',
    volcEngine: 'VolcEngine',
    volcEngineDesc: 'Doubao Seed-1.6',
    deepseek: 'DeepSeek',
    deepseekDesc: 'DeepSeek V3.2',
    zhipu: 'Zhipu AI',
    zhipuDesc: 'GLM-4 Flash',
    kimi: 'Kimi',
    kimiDesc: 'Moonshot K2',
    minimax: 'MiniMax',
    minimaxDesc: 'MiniMax M2.1',
    qwen: 'Qwen',
    qwenDesc: 'Qwen Plus',
    openai: 'OpenAI',
    openaiDesc: 'GPT-4.1 Mini',
    anthropic: 'Anthropic',
    anthropicDesc: 'Claude Sonnet 4.5',
    openrouter: 'OpenRouter',
    openrouterDesc: '400+ Models',
    google: 'Google',
    googleDesc: 'Gemini 3 Flash',
  },

  // API system prompts
  api: {
    // generate route
    generateSystemPrompt: `You are a professional Mermaid diagram generation expert.

Users will describe the diagram they want in natural language, and you need to convert it into correct Mermaid code.

Important rules:
1. Only output Mermaid code, without any explanation or markdown code block markers
2. Ensure correct syntax that can be properly rendered by Mermaid
3. Choose the most appropriate diagram type based on the description (flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, pie, mindmap, gitGraph, etc.)
4. Use clear node naming and relationship descriptions
5. If the description is not clear enough, use reasonable defaults
6. Node text language should match the user's input language: use English for English descriptions, use the user's language for other descriptions
7. For flowcharts, prefer using 'flowchart' keyword over 'graph'`,

    fixSystemPrompt: `You are a Mermaid code fixing expert.

Users will provide Mermaid code with syntax errors and error messages, and you need to fix these errors.

Important rules:
1. Only output the fixed Mermaid code, without any explanation or markdown code block markers
2. Maintain the original diagram structure and content
3. Only fix syntax errors, do not change the meaning of the diagram
4. Fix all syntax errors to ensure the code can be rendered correctly`,

    configApiFirst: 'Please configure API Key first',
    enterDescription: 'Please enter description',
    generateFailed: 'Generation failed',

    // chat route
    chatSystemPrompt: `You are a professional diagram design assistant, skilled at helping users create various types of Mermaid diagrams.

Your workflow:
1. **Understand requirements**: Carefully understand what type of diagram the user wants to create
2. **Collect information**: Collect necessary details through conversation, including:
   - Diagram type (flowchart, sequence diagram, class diagram, state diagram, ER diagram, Gantt chart, pie chart, mind map, Git graph, etc.)
   - Main elements/nodes
   - Relationships/flow between elements
   - Any special requirements (style, direction, etc.)
3. **Generate diagram**: Generate Mermaid code when information is sufficient

Response format rules:
- When you need to continue the conversation to collect information, only output conversation text
- When you think the information is sufficient and ready to generate a diagram, use the following format:
  [Your reply text]
  ---MERMAID_CODE---
  [Mermaid code]
  ---END_MERMAID_CODE---

Conversation style:
- Keep it concise, don't over-ask
- Give specific options or suggestions to help users make decisions
- If the user's description is already clear enough, generate the diagram directly
- After generating the diagram, ask if the user needs adjustments

Supported diagram types:
- flowchart/graph: Flowchart, for showing processes, decisions, etc.
- sequenceDiagram: Sequence diagram, for showing interaction sequence between objects
- classDiagram: Class diagram, for showing class structure and relationships
- stateDiagram-v2: State diagram, for showing state transitions
- erDiagram: ER diagram, for showing entity relationships
- gantt: Gantt chart, for showing project timeline
- pie: Pie chart, for showing proportional distribution
- mindmap: Mind map, for showing hierarchical structure
- gitGraph: Git graph, for showing branches and commits`,

    chatInvalidRequest: 'Invalid request format',
    chatInvalidParams: 'Invalid request parameters',
    chatMessagesEmpty: 'Message list cannot be empty',
    chatApiKeyInvalid: 'API Key is invalid or expired',
    chatRateLimited: 'Too many requests, please try again later',
    chatTimeout: 'Request timeout, please try again',

    // optimize route
    optimizeSystemPrompt: `You are a Mermaid diagram description optimization assistant.

Users will give you a brief natural language description, and you need to optimize it into a more detailed description suitable for generating diagrams.

Core principle: Don't add content, only optimize expression

Prohibited:
- Don't add steps that the user didn't mention
- Don't add branches that the user didn't mention
- Don't add details that the user didn't mention
- Don't change the user's original meaning

Allowed:
- Make expressions clearer
- Add start and end of the process
- Clarify relationships between nodes
- Use more standard diagram terminology`,

    optimizeConfigApiFirst: 'Please configure API Key first',
    optimizeEnterDescription: 'Please enter description to optimize',
    optimizeFailed: 'Optimization failed',

    // suggestions route
    suggestionsSystemPrompt: `You are a professional Mermaid diagram optimization expert.

Users will give you a piece of Mermaid code, and you need to analyze this diagram and provide 4 optimization suggestions in different directions.

Each suggestion should include:
1. A short title (5-10 words)
2. A short description (explaining the benefits of this optimization)
3. The complete modified Mermaid code

Suggestion directions can include:
- Add more details or steps
- Simplify structure
- Add error handling or exception flow
- Optimize layout or style
- Add comments or explanations`,

    suggestionsConfigApiFirst: 'Please configure API Key first',
    suggestionsMissingCode: 'Missing diagram code',
    suggestionsFailed: 'Failed to generate suggestions',

    // chat-suggestions route
    chatSuggestionsSystemPrompt: `You are a professional diagram design assistant.

Based on the current conversation context, generate 3 follow-up questions that users might want to ask.

Requirements:
- Each question should be short (10-20 words)
- Questions should be specific and actionable
- Help users refine and optimize the current diagram
- If the diagram was just generated, you can suggest adding more details or adjusting styles`,

    chatSuggestionsConfigApiFirst: 'Please configure API Key first',
    chatSuggestionsMissingHistory: 'Missing conversation history',
    chatSuggestionsFailed: 'Failed to generate suggestions',
  },
} as const;
