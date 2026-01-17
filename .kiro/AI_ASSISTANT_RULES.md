# AI 助手工作规范

## 🚨🚨🚨 最高优先级规则：绝对禁止启动交互式进程

### ⛔ 绝对禁止的命令（会拦截所有后续操作）

```bash
# ❌❌❌ 绝对禁止 - 会进入交互式模式，拦截所有命令
npm test
vitest
npm run test
npx vitest

# ❌❌❌ 绝对禁止 - 任何带 watch 模式的命令
vitest --watch
npm test -- --watch
jest --watch
npm run dev  # 除非使用 controlPwshProcess

# ❌❌❌ 绝对禁止 - 任何交互式工具
vim
nano
less
more
```

### ✅ 唯一允许的测试命令

```bash
# ✅✅✅ 唯一正确的方式 - 一次性运行，不会阻塞
npm run test:run
vitest run
npx vitest run
npm run test:coverage
npm run test:e2e

# ✅ 运行特定测试文件
npx vitest run <filename>
npx vitest run snippets.test.ts
```

## 🚨 关键原则：避免自我掣肘

### 1. 进程管理规范

#### ❌ 绝对禁止的行为
- **绝对禁止**运行任何交互式命令（`npm test`、`vitest`、`vim` 等）
- **绝对禁止**运行任何 watch 模式的命令
- **绝对禁止**启动会拦截输入的进程
- **绝对禁止**在不使用 `controlPwshProcess` 的情况下启动长期运行的进程

#### ✅ 正确做法
- **必须**使用 `npm run test:run` 或 `vitest run` 运行一次性测试
- **必须**在命令中明确添加 `run` 参数
- **必须**使用 `controlPwshProcess` 工具管理需要长期运行的进程（如 dev server）
- **必须**在任务完成后立即验证没有进程在运行

#### 进程管理检查清单
```markdown
在执行任何命令前必须检查：
- [ ] 命令是否包含 `run` 参数？（测试命令必须有）
- [ ] 命令是否会进入交互式模式？（如果是，绝对禁止）
- [ ] 命令是否会阻塞后续操作？（如果是，绝对禁止）
- [ ] 是否需要使用 controlPwshProcess？（长期运行的进程）

任务完成后必须检查：
- [ ] 运行 listProcesses 确认无后台进程
- [ ] 可以正常执行 git status
- [ ] 可以正常执行其他命令
```

### 2. 命令执行前的强制检查

#### 在执行任何命令前，必须问自己：

1. **这个命令会阻塞吗？**
   - 如果会，绝对不能执行
   - 改用带 `run` 参数的版本

2. **这个命令会进入交互模式吗？**
   - 如果会，绝对不能执行
   - 寻找非交互式替代方案

3. **这个命令需要长期运行吗？**
   - 如果需要，必须使用 `controlPwshProcess`
   - 不能直接用 `executePwsh`

4. **我能在 5 秒内看到命令结果吗？**
   - 如果不能，这个命令可能有问题
   - 重新评估命令的正确性

### 2. 测试执行规范

#### ⚠️ 测试命令对照表

| ❌ 绝对禁止 | ✅ 正确命令 | 说明 |
|------------|-----------|------|
| `npm test` | `npm run test:run` | 会进入 watch 模式 |
| `vitest` | `vitest run` | 会进入交互模式 |
| `npm run test` | `npm run test:run` | 会进入 watch 模式 |
| `npx vitest` | `npx vitest run` | 会进入交互模式 |
| `vitest --watch` | `vitest run` | watch 模式会阻塞 |
| `npm test -- <file>` | `npx vitest run <file>` | 会进入交互模式 |

#### 单元测试
```bash
# ✅✅✅ 唯一正确的方式
npm run test:run

# ✅ 运行特定测试文件
npx vitest run snippets.test.ts

# ✅ 运行测试并查看覆盖率
npm run test:coverage

# ❌❌❌ 绝对禁止（会阻塞所有后续操作）
npm test
vitest
npm run test
npx vitest
```

#### E2E 测试
```bash
# ✅ 正确
npm run test:e2e

# ❌ 错误
npm test -- --config vitest.e2e.config.ts
```

#### 测试覆盖率
```bash
# ✅ 正确
npm run test:coverage
```

### 3. Git 操作规范

#### 提交前检查
1. **确认无进程运行**
   ```bash
   # 检查后台进程
   ps aux | grep -E "(vitest|node|npm)"
   ```

2. **运行完整测试**
   ```bash
   npm run test:run
   ```

3. **检查 TypeScript 编译**
   ```bash
   npx tsc --noEmit
   ```

4. **检查代码质量**
   ```bash
   npm run lint
   ```

#### Git 提交流程
```bash
# 1. 查看状态
git status

# 2. 添加文件
git add <files>

# 3. 提交
git commit -m "type: description"

# 4. 推送（如需要）
git push
```

### 4. 任务执行规范

#### 标准工作流程
1. **设计阶段**
   - 阅读需求和优化建议
   - 确定任务范围和目标
   - 设计实现方案

2. **实现阶段**
   - 编写代码
   - 编写测试
   - 运行测试验证（使用 `vitest run`）

3. **验证阶段**
   - 运行完整测试套件
   - 检查 TypeScript 编译
   - 检查代码诊断

4. **文档阶段**
   - 更新相关文档
   - 创建任务完成报告
   - 准备 Git 提交信息

5. **提交阶段**
   - **确保无进程运行**
   - 执行 Git 操作
   - 更新优化建议文档

### 5. 问题排查规范

#### 遇到进程阻塞时
```bash
# 1. 列出所有 Node 进程
ps aux | grep node

# 2. 找到 vitest 进程
ps aux | grep vitest

# 3. 终止进程
kill -9 <PID>

# 或批量终止
pkill -9 -f vitest
```

#### 遇到 Git 操作失败时
```bash
# 1. 检查是否有进程在运行
ps aux | grep -E "(vitest|node)"

# 2. 终止所有相关进程
pkill -9 -f vitest
pkill -9 -f node

# 3. 重新执行 Git 操作
git status
```

### 6. 代码质量规范

#### TypeScript
- 必须通过 `tsc --noEmit` 检查
- 必须无诊断错误
- 必须有完整的类型定义

#### 测试
- 单元测试覆盖率 > 80%
- 所有测试必须通过
- 必须包含边界情况测试

#### 文档
- 必须更新相关文档
- 必须包含使用示例
- 必须包含中英文双语

### 7. 紧急情况处理

#### 如果发现自己启动的进程阻塞了操作

1. **立即承认问题**
   ```
   "我发现我启动的 vitest 进程正在阻塞操作，让我立即清理。"
   ```

2. **执行清理**
   ```bash
   pkill -9 -f vitest
   ```

3. **验证清理**
   ```bash
   ps aux | grep vitest
   ```

4. **继续任务**
   ```
   "进程已清理，现在继续执行 Git 操作。"
   ```

### 8. 自检清单

每次任务完成前，必须检查：

```markdown
## 任务完成自检清单

### 代码质量
- [ ] TypeScript 编译无错误
- [ ] 无诊断问题
- [ ] 代码符合项目规范

### 测试
- [ ] 所有测试通过（使用 `vitest run`）
- [ ] 测试覆盖充分
- [ ] 无测试进程在后台运行

### 文档
- [ ] 更新了相关文档
- [ ] 创建了任务完成报告
- [ ] 准备了 Git 提交信息

### 进程管理
- [ ] 检查了 `listProcesses`
- [ ] 没有后台进程在运行
- [ ] 可以正常执行 Git 操作

### Git 操作
- [ ] 文件已添加
- [ ] 提交信息已准备
- [ ] 可以执行提交命令
```

## 📝 命令速查表

### 测试命令
```bash
# 运行所有测试（一次性）
npm run test:run

# 运行特定测试文件
npx vitest run <file>

# 运行测试覆盖率
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

### 进程管理
```bash
# 列出后台进程
ps aux | grep -E "(vitest|node|npm)"

# 终止 vitest 进程
pkill -9 -f vitest

# 终止所有 node 进程
pkill -9 -f node
```

### Git 操作
```bash
# 查看状态
git status

# 添加文件
git add <files>

# 提交
git commit -m "message"

# 查看日志
git log --oneline -5
```

### 代码检查
```bash
# TypeScript 编译检查
npx tsc --noEmit

# ESLint 检查
npm run lint

# 格式化代码
npx prettier --write <files>
```

## 🎯 核心原则总结

### 🚨 最重要的三条铁律

1. **绝对不要运行任何交互式命令**
   - 测试必须用 `vitest run`，不能用 `vitest`
   - 绝对不能用 `npm test`，必须用 `npm run test:run`
   - 任何会等待用户输入的命令都禁止

2. **执行命令前必须三思**
   - 这个命令会阻塞吗？
   - 这个命令会进入交互模式吗？
   - 这个命令 5 秒内能完成吗？

3. **发现问题立即承认**
   - 如果启动了阻塞进程，立即告知用户
   - 不要试图在被阻塞的情况下继续操作
   - 请求用户帮助清理进程

### 其他重要原则

4. **任务完成前必须清理所有进程**
5. **Git 操作前必须确认无进程运行**
6. **使用自检清单确保质量**
7. **长期运行的进程必须用 controlPwshProcess**

---

**文档版本**: v1.1  
**创建日期**: 2025-01-17  
**最后更新**: 2025-01-17  
**重要性**: 🚨🚨🚨 最高 - 违反将导致工作流程完全阻塞
