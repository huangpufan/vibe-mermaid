/**
 * Prompt 效果测试
 * 
 * 这个测试文件使用真实的 API 调用来验证 prompt 的实际效果
 * 测试生成的 Mermaid 代码是否符合预期
 * 
 * 运行方式: npm run test:e2e
 * 
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from 'vitest';
import OpenAI from 'openai';
import { zh } from '@/lib/i18n/zh';

// 火山引擎 DeepSeek 配置
const API_CONFIG = {
  apiKey: '51861fae-1908-4a07-9d9a-51fea9a3c9a2',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  model: 'deepseek-v3-250324',
};

// 创建 OpenAI 客户端
let client: OpenAI;

beforeAll(() => {
  client = new OpenAI({
    apiKey: API_CONFIG.apiKey,
    baseURL: API_CONFIG.baseURL,
  });
});

// 辅助函数：调用 AI 生成 Mermaid 代码
async function generateMermaid(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: API_CONFIG.model,
    messages: [
      { role: 'system', content: zh.api.generateSystemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  let code = response.choices[0]?.message?.content || '';
  
  // 清理 markdown 代码块
  code = code
    .replace(/^```mermaid\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();

  return code;
}

// 辅助函数：验证 Mermaid 代码基本结构
function validateMermaidStructure(code: string, expectedType: string): boolean {
  const typePatterns: Record<string, RegExp> = {
    flowchart: /^(graph|flowchart)\s+(TD|TB|BT|LR|RL)/i,
    sequence: /^sequenceDiagram/i,
    class: /^classDiagram/i,
    state: /^stateDiagram(-v2)?/i,
    er: /^erDiagram/i,
    gantt: /^gantt/i,
    pie: /^pie/i,
    mindmap: /^mindmap/i,
    git: /^gitGraph/i,
  };

  const pattern = typePatterns[expectedType];
  return pattern ? pattern.test(code) : false;
}

// 辅助函数：检查代码是否包含特定元素
// function containsElements(code: string, elements: string[]): boolean {
//   return elements.every(el => code.includes(el));
// }

describe('Prompt 效果测试 - 图表类型识别', () => {
  it('应该正确生成流程图', async () => {
    const code = await generateMermaid('画一个用户登录流程图');
    
    console.log('生成的流程图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'flowchart')).toBe(true);
    expect(code.length).toBeGreaterThan(20);
  }, 30000);

  it('应该正确生成时序图', async () => {
    const code = await generateMermaid('画一个用户和服务器之间的登录时序图');
    
    console.log('生成的时序图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'sequence')).toBe(true);
    expect(code).toMatch(/->>|-->>|->>/); // 时序图箭头
  }, 30000);

  it('应该正确生成类图', async () => {
    const code = await generateMermaid('画一个动物类的继承关系图，包含狗和猫');
    
    console.log('生成的类图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'class')).toBe(true);
  }, 30000);

  it('应该正确生成状态图', async () => {
    const code = await generateMermaid('画一个订单状态流转图');
    
    console.log('生成的状态图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'state')).toBe(true);
  }, 30000);

  it('应该正确生成 ER 图', async () => {
    const code = await generateMermaid('画一个用户和订单的数据库关系图');
    
    console.log('生成的 ER 图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'er')).toBe(true);
  }, 30000);

  it('应该正确生成饼图', async () => {
    const code = await generateMermaid('画一个市场份额饼图，苹果40%，三星30%，其他30%');
    
    console.log('生成的饼图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'pie')).toBe(true);
  }, 30000);

  it('应该正确生成思维导图', async () => {
    const code = await generateMermaid('画一个前端技术栈的思维导图');
    
    console.log('生成的思维导图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'mindmap')).toBe(true);
  }, 30000);

  it('应该正确生成甘特图', async () => {
    const code = await generateMermaid('画一个软件开发项目的甘特图，包含需求、设计、开发、测试阶段');
    
    console.log('生成的甘特图代码:\n', code);
    
    expect(validateMermaidStructure(code, 'gantt')).toBe(true);
  }, 30000);
});

describe('Prompt 效果测试 - 内容准确性', () => {
  it('流程图应该包含用户描述的关键步骤', async () => {
    const code = await generateMermaid('画一个包含开始、输入用户名密码、验证、成功/失败、结束的登录流程图');
    
    console.log('登录流程图:\n', code);
    
    expect(validateMermaidStructure(code, 'flowchart')).toBe(true);
    // 检查是否包含关键概念（可能是中文或英文）
    const hasLogin = /登录|login|用户名|username|密码|password/i.test(code);
    const hasValidation = /验证|validate|check|判断/i.test(code);
    const hasResult = /成功|失败|success|fail|error/i.test(code);
    
    expect(hasLogin || hasValidation || hasResult).toBe(true);
  }, 30000);

  it('时序图应该包含正确的参与者', async () => {
    const code = await generateMermaid('画一个浏览器、服务器、数据库三者之间的请求时序图');
    
    console.log('三方时序图:\n', code);
    
    expect(validateMermaidStructure(code, 'sequence')).toBe(true);
    // 检查参与者
    const hasBrowser = /浏览器|browser|client|用户/i.test(code);
    const hasServer = /服务器|server|api/i.test(code);
    const hasDB = /数据库|database|db/i.test(code);
    
    expect(hasBrowser && hasServer && hasDB).toBe(true);
  }, 30000);

  it('类图应该包含正确的继承关系', async () => {
    const code = await generateMermaid('画一个 Vehicle 父类，Car 和 Bike 子类的类图');
    
    console.log('继承类图:\n', code);
    
    expect(validateMermaidStructure(code, 'class')).toBe(true);
    expect(code).toMatch(/Vehicle/i);
    expect(code).toMatch(/Car/i);
    expect(code).toMatch(/Bike/i);
    // 检查继承关系符号
    expect(code).toMatch(/<\|--|<\|\.\.|\|>/);
  }, 30000);
});

describe('Prompt 效果测试 - 复杂场景', () => {
  it('应该处理复杂的业务流程', async () => {
    const code = await generateMermaid(`
      画一个电商下单流程图，包含：
      1. 用户浏览商品
      2. 加入购物车
      3. 提交订单
      4. 选择支付方式
      5. 支付成功/失败分支
      6. 发货
      7. 确认收货
    `);
    
    console.log('电商流程图:\n', code);
    
    expect(validateMermaidStructure(code, 'flowchart')).toBe(true);
    expect(code.length).toBeGreaterThan(100); // 复杂流程应该有足够的代码量
    
    // 检查是否有分支结构
    const hasBranch = /\{[\s\S]*\}|-->[\s\S]*\|[\s\S]*\|/.test(code);
    expect(hasBranch).toBe(true);
  }, 30000);

  it('应该处理带条件的时序图', async () => {
    const code = await generateMermaid(`
      画一个 OAuth2 授权码流程的时序图，包含：
      用户、客户端应用、授权服务器、资源服务器
    `);
    
    console.log('OAuth2 时序图:\n', code);
    
    expect(validateMermaidStructure(code, 'sequence')).toBe(true);
    expect(code.length).toBeGreaterThan(100);
  }, 30000);

  it('应该处理多层级思维导图', async () => {
    const code = await generateMermaid(`
      画一个 Web 开发技术栈思维导图，包含：
      - 前端：HTML、CSS、JavaScript、React、Vue
      - 后端：Node.js、Python、Java
      - 数据库：MySQL、MongoDB、Redis
    `);
    
    console.log('技术栈思维导图:\n', code);
    
    expect(validateMermaidStructure(code, 'mindmap')).toBe(true);
    // 检查是否包含主要技术
    const hasFrontend = /前端|frontend|html|css|javascript/i.test(code);
    const hasBackend = /后端|backend|node|python|java/i.test(code);
    
    expect(hasFrontend && hasBackend).toBe(true);
  }, 30000);
});

describe('Prompt 效果测试 - 边界情况', () => {
  it('应该处理模糊的描述', async () => {
    const code = await generateMermaid('画个图');
    
    console.log('模糊描述生成的代码:\n', code);
    
    // 应该生成某种有效的图表
    const isValidChart = 
      validateMermaidStructure(code, 'flowchart') ||
      validateMermaidStructure(code, 'sequence') ||
      validateMermaidStructure(code, 'mindmap');
    
    expect(isValidChart).toBe(true);
  }, 30000);

  it('应该处理英文描述', async () => {
    const code = await generateMermaid('Draw a simple flowchart for user registration');
    
    console.log('英文描述生成的代码:\n', code);
    
    expect(validateMermaidStructure(code, 'flowchart')).toBe(true);
  }, 30000);

  it('应该处理混合中英文描述', async () => {
    const code = await generateMermaid('画一个 API request 的 flow，包含 authentication 和 error handling');
    
    console.log('混合语言描述生成的代码:\n', code);
    
    // 混合语言描述可能生成流程图或时序图，都是合理的
    const isValidChart = 
      validateMermaidStructure(code, 'flowchart') ||
      validateMermaidStructure(code, 'sequence');
    
    expect(isValidChart).toBe(true);
  }, 30000);
});

describe('Prompt 效果测试 - 代码质量', () => {
  it('生成的代码不应该包含 markdown 标记', async () => {
    const code = await generateMermaid('画一个简单的流程图');
    
    expect(code).not.toContain('```');
    expect(code).not.toContain('```mermaid');
  }, 30000);

  it('生成的代码应该有合理的结构', async () => {
    const code = await generateMermaid('画一个包含5个步骤的流程图');
    
    console.log('5步骤流程图:\n', code);
    
    expect(validateMermaidStructure(code, 'flowchart')).toBe(true);
    
    // 检查是否有多个节点（通过箭头数量判断）
    const arrowCount = (code.match(/-->/g) || []).length;
    expect(arrowCount).toBeGreaterThanOrEqual(4); // 5个步骤至少4个箭头
  }, 30000);

  it('节点命名应该使用中文', async () => {
    const code = await generateMermaid('画一个用户注册流程图');
    
    console.log('中文节点流程图:\n', code);
    
    // 检查是否包含中文字符
    const hasChineseInNodes = /\[.*[\u4e00-\u9fa5]+.*\]/.test(code);
    expect(hasChineseInNodes).toBe(true);
  }, 30000);
});
