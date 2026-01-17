/**
 * Monaco Editor 代码片段定义
 * 用于在编辑器中提供 Mermaid 语法的智能补全
 */

export interface Snippet {
  label: string;
  insertText: string;
  documentation: string;
  documentationZh: string;
}

/**
 * Mermaid 代码片段库
 */
export const MERMAID_SNIPPETS: Snippet[] = [
  // 流程图片段
  {
    label: 'flowchart',
    insertText: 'graph TD\n    A[${1:Start}] --> B[${2:Process}]\n    B --> C[${3:End}]',
    documentation: 'Create a basic flowchart',
    documentationZh: '创建基础流程图',
  },
  {
    label: 'flowchart-decision',
    insertText: 'graph TD\n    A[${1:Start}] --> B{${2:Decision}}\n    B -->|${3:Yes}| C[${4:Action 1}]\n    B -->|${5:No}| D[${6:Action 2}]',
    documentation: 'Create a flowchart with decision node',
    documentationZh: '创建带判断节点的流程图',
  },
  {
    label: 'flowchart-lr',
    insertText: 'graph LR\n    A[${1:Start}] --> B[${2:Process}]\n    B --> C[${3:End}]',
    documentation: 'Create a left-to-right flowchart',
    documentationZh: '创建从左到右的流程图',
  },
  
  // 时序图片段
  {
    label: 'sequence',
    insertText: 'sequenceDiagram\n    participant ${1:Alice}\n    participant ${2:Bob}\n    ${1:Alice}->>${2:Bob}: ${3:Hello}\n    ${2:Bob}-->>${1:Alice}: ${4:Hi}',
    documentation: 'Create a sequence diagram',
    documentationZh: '创建时序图',
  },
  {
    label: 'sequence-loop',
    insertText: 'sequenceDiagram\n    participant ${1:User}\n    participant ${2:System}\n    loop ${3:Every minute}\n        ${1:User}->>${2:System}: ${4:Request}\n        ${2:System}-->>${1:User}: ${5:Response}\n    end',
    documentation: 'Create a sequence diagram with loop',
    documentationZh: '创建带循环的时序图',
  },
  
  // 类图片段
  {
    label: 'class',
    insertText: 'classDiagram\n    class ${1:ClassName} {\n        +${2:attribute}\n        +${3:method()}\n    }',
    documentation: 'Create a class diagram',
    documentationZh: '创建类图',
  },
  {
    label: 'class-relationship',
    insertText: 'classDiagram\n    ${1:ClassA} <|-- ${2:ClassB}\n    ${1:ClassA} : +${3:method()}\n    ${2:ClassB} : +${4:method()}',
    documentation: 'Create a class diagram with inheritance',
    documentationZh: '创建带继承关系的类图',
  },
  
  // 状态图片段
  {
    label: 'state',
    insertText: 'stateDiagram-v2\n    [*] --> ${1:State1}\n    ${1:State1} --> ${2:State2}\n    ${2:State2} --> [*]',
    documentation: 'Create a state diagram',
    documentationZh: '创建状态图',
  },
  
  // ER 图片段
  {
    label: 'er',
    insertText: 'erDiagram\n    ${1:CUSTOMER} ||--o{ ${2:ORDER} : places\n    ${2:ORDER} ||--|{ ${3:LINE-ITEM} : contains',
    documentation: 'Create an entity relationship diagram',
    documentationZh: '创建实体关系图',
  },
  
  // 甘特图片段
  {
    label: 'gantt',
    insertText: 'gantt\n    title ${1:Project Schedule}\n    dateFormat YYYY-MM-DD\n    section ${2:Phase 1}\n    ${3:Task 1} :${4:2024-01-01}, ${5:30d}',
    documentation: 'Create a Gantt chart',
    documentationZh: '创建甘特图',
  },
  
  // 饼图片段
  {
    label: 'pie',
    insertText: 'pie title ${1:Chart Title}\n    "${2:Label 1}" : ${3:30}\n    "${4:Label 2}" : ${5:70}',
    documentation: 'Create a pie chart',
    documentationZh: '创建饼图',
  },
  
  // Git 图片段
  {
    label: 'git',
    insertText: 'gitGraph\n    commit\n    branch ${1:develop}\n    checkout ${1:develop}\n    commit\n    checkout main\n    merge ${1:develop}',
    documentation: 'Create a Git graph',
    documentationZh: '创建 Git 分支图',
  },
  
  // 旅程图片段
  {
    label: 'journey',
    insertText: 'journey\n    title ${1:User Journey}\n    section ${2:Phase}\n      ${3:Action}: ${4:5}: ${5:User}',
    documentation: 'Create a user journey diagram',
    documentationZh: '创建用户旅程图',
  },
  
  // 思维导图片段
  {
    label: 'mindmap',
    insertText: 'mindmap\n  root((${1:Central Idea}))\n    ${2:Topic 1}\n      ${3:Subtopic 1}\n      ${4:Subtopic 2}\n    ${5:Topic 2}',
    documentation: 'Create a mindmap',
    documentationZh: '创建思维导图',
  },
  
  // 时间线片段
  {
    label: 'timeline',
    insertText: 'timeline\n    title ${1:Timeline Title}\n    ${2:2020} : ${3:Event 1}\n    ${4:2021} : ${5:Event 2}',
    documentation: 'Create a timeline',
    documentationZh: '创建时间线',
  },
];

/**
 * 根据语言获取片段文档
 */
export function getSnippetDocumentation(snippet: Snippet, locale: 'en' | 'zh'): string {
  return locale === 'zh' ? snippet.documentationZh : snippet.documentation;
}

/**
 * 搜索片段
 */
export function searchSnippets(query: string): Snippet[] {
  const lowerQuery = query.toLowerCase();
  return MERMAID_SNIPPETS.filter(
    (snippet) =>
      snippet.label.toLowerCase().includes(lowerQuery) ||
      snippet.documentation.toLowerCase().includes(lowerQuery) ||
      snippet.documentationZh.includes(query)
  );
}
