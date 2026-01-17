/**
 * Mermaid 图表模板库
 * 提供常用的图表模板，帮助用户快速开始
 */

export interface DiagramTemplate {
  id: string;
  name: string;
  nameZh: string;
  category: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'gantt' | 'pie' | 'other';
  description: string;
  descriptionZh: string;
  code: string;
  tags: string[];
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  // Flowchart Templates
  {
    id: 'flowchart-basic',
    name: 'Basic Flowchart',
    nameZh: '基础流程图',
    category: 'flowchart',
    description: 'A simple flowchart with start, process, and end nodes',
    descriptionZh: '包含开始、处理和结束节点的简单流程图',
    code: `graph TD
    A[Start] --> B[Process]
    B --> C[End]`,
    tags: ['flowchart', 'basic', 'beginner'],
  },
  {
    id: 'flowchart-decision',
    name: 'Decision Flowchart',
    nameZh: '决策流程图',
    category: 'flowchart',
    description: 'Flowchart with decision points and multiple paths',
    descriptionZh: '包含决策点和多条路径的流程图',
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
    tags: ['flowchart', 'decision', 'conditional'],
  },
  {
    id: 'flowchart-complex',
    name: 'Complex Process',
    nameZh: '复杂流程',
    category: 'flowchart',
    description: 'Multi-step process with parallel branches',
    descriptionZh: '包含并行分支的多步骤流程',
    code: `graph TD
    A[Start] --> B[Initialize]
    B --> C{Check Status}
    C -->|Valid| D[Process Data]
    C -->|Invalid| E[Error Handler]
    D --> F[Validate]
    F -->|Pass| G[Save]
    F -->|Fail| E
    E --> H[Log Error]
    G --> I[Notify User]
    H --> I
    I --> J[End]`,
    tags: ['flowchart', 'complex', 'advanced'],
  },

  // Sequence Diagram Templates
  {
    id: 'sequence-basic',
    name: 'Basic Sequence',
    nameZh: '基础时序图',
    category: 'sequence',
    description: 'Simple interaction between two participants',
    descriptionZh: '两个参与者之间的简单交互',
    code: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hi Alice!`,
    tags: ['sequence', 'basic', 'communication'],
  },
  {
    id: 'sequence-api',
    name: 'API Request Flow',
    nameZh: 'API 请求流程',
    category: 'sequence',
    description: 'Client-server API interaction pattern',
    descriptionZh: '客户端-服务器 API 交互模式',
    code: `sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database
    C->>S: POST /api/data
    activate S
    S->>D: Query data
    activate D
    D-->>S: Return results
    deactivate D
    S-->>C: 200 OK
    deactivate S`,
    tags: ['sequence', 'api', 'backend'],
  },
  {
    id: 'sequence-auth',
    name: 'Authentication Flow',
    nameZh: '认证流程',
    category: 'sequence',
    description: 'User authentication sequence',
    descriptionZh: '用户认证时序图',
    code: `sequenceDiagram
    participant U as User
    participant C as Client
    participant A as Auth Server
    participant R as Resource Server
    U->>C: Login
    C->>A: POST /auth/login
    A-->>C: Access Token
    C->>R: GET /api/data (with token)
    R->>A: Validate Token
    A-->>R: Token Valid
    R-->>C: Protected Data
    C-->>U: Display Data`,
    tags: ['sequence', 'authentication', 'security'],
  },

  // Class Diagram Templates
  {
    id: 'class-basic',
    name: 'Basic Class',
    nameZh: '基础类图',
    category: 'class',
    description: 'Simple class with properties and methods',
    descriptionZh: '包含属性和方法的简单类图',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +move()
    }`,
    tags: ['class', 'basic', 'oop'],
  },
  {
    id: 'class-inheritance',
    name: 'Inheritance',
    nameZh: '继承关系',
    category: 'class',
    description: 'Class inheritance hierarchy',
    descriptionZh: '类继承层次结构',
    code: `classDiagram
    Animal <|-- Dog
    Animal <|-- Cat
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }`,
    tags: ['class', 'inheritance', 'oop'],
  },

  // State Diagram Templates
  {
    id: 'state-basic',
    name: 'Basic State Machine',
    nameZh: '基础状态机',
    category: 'state',
    description: 'Simple state transitions',
    descriptionZh: '简单的状态转换',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry`,
    tags: ['state', 'basic', 'fsm'],
  },
  {
    id: 'state-order',
    name: 'Order Status',
    nameZh: '订单状态',
    category: 'state',
    description: 'E-commerce order state flow',
    descriptionZh: '电商订单状态流转',
    code: `stateDiagram-v2
    [*] --> Pending
    Pending --> Paid: Payment Success
    Pending --> Cancelled: Cancel
    Paid --> Shipped: Ship
    Shipped --> Delivered: Deliver
    Delivered --> [*]
    Cancelled --> [*]`,
    tags: ['state', 'ecommerce', 'order'],
  },

  // ER Diagram Templates
  {
    id: 'er-basic',
    name: 'Basic ER Diagram',
    nameZh: '基础 ER 图',
    category: 'er',
    description: 'Simple entity relationship',
    descriptionZh: '简单的实体关系图',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date orderDate
    }`,
    tags: ['er', 'database', 'basic'],
  },

  // Gantt Chart Templates
  {
    id: 'gantt-project',
    name: 'Project Timeline',
    nameZh: '项目时间线',
    category: 'gantt',
    description: 'Project planning gantt chart',
    descriptionZh: '项目规划甘特图',
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements    :a1, 2024-01-01, 7d
    Design         :a2, after a1, 5d
    section Development
    Backend        :a3, after a2, 10d
    Frontend       :a4, after a2, 10d
    section Testing
    Testing        :a5, after a3, 5d
    Deployment     :a6, after a5, 2d`,
    tags: ['gantt', 'project', 'timeline'],
  },

  // Pie Chart Templates
  {
    id: 'pie-basic',
    name: 'Basic Pie Chart',
    nameZh: '基础饼图',
    category: 'pie',
    description: 'Simple data distribution',
    descriptionZh: '简单的数据分布图',
    code: `pie title Distribution
    "Category A" : 45
    "Category B" : 30
    "Category C" : 15
    "Category D" : 10`,
    tags: ['pie', 'chart', 'data'],
  },

  // Git Graph Template
  {
    id: 'git-workflow',
    name: 'Git Workflow',
    nameZh: 'Git 工作流',
    category: 'other',
    description: 'Git branching strategy',
    descriptionZh: 'Git 分支策略',
    code: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout develop
    merge feature
    checkout main
    merge develop
    commit`,
    tags: ['git', 'workflow', 'version-control'],
  },
];

/**
 * 按分类获取模板
 */
export function getTemplatesByCategory(category: DiagramTemplate['category']): DiagramTemplate[] {
  return DIAGRAM_TEMPLATES.filter((template) => template.category === category);
}

/**
 * 按标签搜索模板
 */
export function searchTemplatesByTag(tag: string): DiagramTemplate[] {
  return DIAGRAM_TEMPLATES.filter((template) => template.tags.includes(tag.toLowerCase()));
}

/**
 * 按关键词搜索模板
 */
export function searchTemplates(query: string, locale: 'en' | 'zh' = 'en'): DiagramTemplate[] {
  const lowerQuery = query.toLowerCase();
  return DIAGRAM_TEMPLATES.filter((template) => {
    const name = locale === 'zh' ? template.nameZh : template.name;
    const description = locale === 'zh' ? template.descriptionZh : template.description;
    return (
      name.toLowerCase().includes(lowerQuery) ||
      description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.includes(lowerQuery))
    );
  });
}

/**
 * 获取所有分类
 */
export const TEMPLATE_CATEGORIES = [
  { id: 'flowchart', name: 'Flowchart', nameZh: '流程图' },
  { id: 'sequence', name: 'Sequence', nameZh: '时序图' },
  { id: 'class', name: 'Class', nameZh: '类图' },
  { id: 'state', name: 'State', nameZh: '状态图' },
  { id: 'er', name: 'ER Diagram', nameZh: 'ER 图' },
  { id: 'gantt', name: 'Gantt', nameZh: '甘特图' },
  { id: 'pie', name: 'Pie Chart', nameZh: '饼图' },
  { id: 'other', name: 'Other', nameZh: '其他' },
] as const;
