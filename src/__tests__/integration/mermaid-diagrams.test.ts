import { describe, it, expect, vi, beforeEach } from 'vitest';

// 使用 vi.hoisted 确保 mock 函数在 vi.mock 之前定义
const { mockParse } = vi.hoisted(() => ({
  mockParse: vi.fn(),
}));

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    parse: mockParse,
    render: vi.fn(),
  },
}));

// 在 mock 之后导入被测试的模块
import { validateMermaidCode } from '@/lib/mermaid';

describe('Mermaid 图表类型测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 默认所有代码都有效
    mockParse.mockResolvedValue(undefined);
  });

  describe('流程图 (Flowchart)', () => {
    const flowchartCases = [
      {
        name: '基本 TD 方向流程图',
        code: `graph TD
          A[开始] --> B[处理]
          B --> C[结束]`,
      },
      {
        name: 'LR 方向流程图',
        code: `graph LR
          A --> B --> C`,
      },
      {
        name: 'BT 方向流程图',
        code: `graph BT
          A --> B --> C`,
      },
      {
        name: 'RL 方向流程图',
        code: `graph RL
          A --> B --> C`,
      },
      {
        name: '带条件判断的流程图',
        code: `graph TD
          A[开始] --> B{条件判断}
          B -->|是| C[处理A]
          B -->|否| D[处理B]
          C --> E[结束]
          D --> E`,
      },
      {
        name: '带子图的流程图',
        code: `graph TD
          subgraph 子图1
            A --> B
          end
          subgraph 子图2
            C --> D
          end
          B --> C`,
      },
      {
        name: '带样式的流程图',
        code: `graph TD
          A[开始]:::green --> B[处理]:::blue
          classDef green fill:#9f6,stroke:#333
          classDef blue fill:#69f,stroke:#333`,
      },
      {
        name: '不同形状节点',
        code: `graph TD
          A[矩形] --> B(圆角矩形)
          B --> C{菱形}
          C --> D((圆形))
          D --> E>旗帜形]
          E --> F[[子程序]]`,
      },
      {
        name: '不同连接线样式',
        code: `graph TD
          A --> B
          A --- C
          A -.-> D
          A ==> E
          A -.- F
          A === G`,
      },
    ];

    flowchartCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('时序图 (Sequence Diagram)', () => {
    const sequenceCases = [
      {
        name: '基本时序图',
        code: `sequenceDiagram
          Alice->>Bob: Hello Bob
          Bob-->>Alice: Hi Alice`,
      },
      {
        name: '带参与者声明的时序图',
        code: `sequenceDiagram
          participant A as Alice
          participant B as Bob
          A->>B: Hello
          B-->>A: Hi`,
      },
      {
        name: '带激活框的时序图',
        code: `sequenceDiagram
          Alice->>+Bob: Hello
          Bob-->>-Alice: Hi`,
      },
      {
        name: '带循环的时序图',
        code: `sequenceDiagram
          Alice->>Bob: Hello
          loop 每天
            Bob->>Alice: 早安
          end`,
      },
      {
        name: '带条件的时序图',
        code: `sequenceDiagram
          Alice->>Bob: Hello
          alt 成功
            Bob->>Alice: 成功响应
          else 失败
            Bob->>Alice: 失败响应
          end`,
      },
      {
        name: '带注释的时序图',
        code: `sequenceDiagram
          Alice->>Bob: Hello
          Note right of Bob: 这是注释
          Note over Alice,Bob: 跨越多个参与者的注释`,
      },
    ];

    sequenceCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('类图 (Class Diagram)', () => {
    const classCases = [
      {
        name: '基本类图',
        code: `classDiagram
          class Animal {
            +String name
            +int age
            +eat()
            +sleep()
          }`,
      },
      {
        name: '带继承关系的类图',
        code: `classDiagram
          Animal <|-- Dog
          Animal <|-- Cat
          Animal : +String name
          Dog : +bark()
          Cat : +meow()`,
      },
      {
        name: '带各种关系的类图',
        code: `classDiagram
          classA --|> classB : 继承
          classC --* classD : 组合
          classE --o classF : 聚合
          classG --> classH : 关联
          classI -- classJ : 链接
          classK ..> classL : 依赖
          classM ..|> classN : 实现`,
      },
      {
        name: '带可见性修饰符的类图',
        code: `classDiagram
          class MyClass {
            +publicMethod()
            -privateMethod()
            #protectedMethod()
            ~packageMethod()
          }`,
      },
    ];

    classCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('状态图 (State Diagram)', () => {
    const stateCases = [
      {
        name: '基本状态图',
        code: `stateDiagram-v2
          [*] --> Active
          Active --> [*]`,
      },
      {
        name: '带转换的状态图',
        code: `stateDiagram-v2
          [*] --> Still
          Still --> Moving : 开始移动
          Moving --> Still : 停止
          Moving --> Crash : 碰撞
          Crash --> [*]`,
      },
      {
        name: '带复合状态的状态图',
        code: `stateDiagram-v2
          [*] --> First
          state First {
            [*] --> second
            second --> [*]
          }`,
      },
      {
        name: '带分支的状态图',
        code: `stateDiagram-v2
          state if_state <<choice>>
          [*] --> if_state
          if_state --> State1 : 条件1
          if_state --> State2 : 条件2`,
      },
    ];

    stateCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('ER 图 (Entity Relationship Diagram)', () => {
    const erCases = [
      {
        name: '基本 ER 图',
        code: `erDiagram
          CUSTOMER ||--o{ ORDER : places
          ORDER ||--|{ LINE-ITEM : contains`,
      },
      {
        name: '带属性的 ER 图',
        code: `erDiagram
          CUSTOMER {
            string name
            string email
            int id PK
          }
          ORDER {
            int id PK
            date created
            int customer_id FK
          }
          CUSTOMER ||--o{ ORDER : places`,
      },
      {
        name: '各种关系类型',
        code: `erDiagram
          A ||--|| B : "一对一"
          C ||--o{ D : "一对多"
          E }o--o{ F : "多对多"
          G |o--o| H : "零或一对零或一"`,
      },
    ];

    erCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('甘特图 (Gantt Chart)', () => {
    const ganttCases = [
      {
        name: '基本甘特图',
        code: `gantt
          title 项目计划
          dateFormat YYYY-MM-DD
          section 阶段1
          任务1 :a1, 2024-01-01, 30d
          任务2 :after a1, 20d`,
      },
      {
        name: '带里程碑的甘特图',
        code: `gantt
          title 项目计划
          dateFormat YYYY-MM-DD
          section 阶段1
          任务1 :a1, 2024-01-01, 30d
          里程碑1 :milestone, m1, 2024-01-31, 0d`,
      },
      {
        name: '多阶段甘特图',
        code: `gantt
          title 项目计划
          section 设计
          设计任务 :des1, 2024-01-01, 10d
          section 开发
          开发任务 :dev1, after des1, 20d
          section 测试
          测试任务 :test1, after dev1, 10d`,
      },
    ];

    ganttCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('饼图 (Pie Chart)', () => {
    const pieCases = [
      {
        name: '基本饼图',
        code: `pie title 分布
          "A" : 40
          "B" : 30
          "C" : 30`,
      },
      {
        name: '带标题的饼图',
        code: `pie showData
          title 市场份额
          "产品A" : 45
          "产品B" : 25
          "产品C" : 20
          "其他" : 10`,
      },
    ];

    pieCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('思维导图 (Mind Map)', () => {
    const mindmapCases = [
      {
        name: '基本思维导图',
        code: `mindmap
          root((中心主题))
            分支1
            分支2
            分支3`,
      },
      {
        name: '多层思维导图',
        code: `mindmap
          root((项目))
            设计
              UI设计
              UX设计
            开发
              前端
              后端
            测试`,
      },
      {
        name: '带图标的思维导图',
        code: `mindmap
          root((中心))
            A[方形]
            B(圆角)
            C((圆形))
            D))云形((`,
      },
    ];

    mindmapCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Git 图 (Git Graph)', () => {
    const gitCases = [
      {
        name: '基本 Git 图',
        code: `gitGraph
          commit
          commit
          branch develop
          checkout develop
          commit
          checkout main
          merge develop`,
      },
      {
        name: '带标签的 Git 图',
        code: `gitGraph
          commit id: "初始提交"
          commit id: "添加功能"
          branch feature
          commit id: "开发中"
          checkout main
          commit id: "修复bug" tag: "v1.0"`,
      },
    ];

    gitCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('用户旅程图 (User Journey)', () => {
    const journeyCases = [
      {
        name: '基本用户旅程图',
        code: `journey
          title 用户购物旅程
          section 浏览
            访问首页: 5: 用户
            搜索商品: 4: 用户
          section 购买
            加入购物车: 3: 用户
            结算: 2: 用户, 系统`,
      },
    ];

    journeyCases.forEach(({ name, code }) => {
      it(`${name} 应该有效`, async () => {
        const result = await validateMermaidCode(code);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('边界情况', () => {
    it('空代码应该调用 parse', async () => {
      await validateMermaidCode('');
      expect(mockParse).toHaveBeenCalled();
    });

    it('只有空格的代码应该调用 parse', async () => {
      await validateMermaidCode('   ');
      expect(mockParse).toHaveBeenCalled();
    });

    it('带注释的代码应该有效', async () => {
      const code = `graph TD
        %% 这是注释
        A --> B`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });

    it('带 init 指令的代码应该有效', async () => {
      const code = `%%{init: {"theme": "dark"}}%%
        graph TD
        A --> B`;
      const result = await validateMermaidCode(code);
      expect(result.valid).toBe(true);
    });
  });
});
