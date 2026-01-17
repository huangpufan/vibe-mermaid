# Security Policy / 安全策略

## Supported Versions / 支持的版本

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability / 报告漏洞

If you discover a security vulnerability, please follow these steps:

### English

1. **DO NOT** open a public issue
2. Email the maintainer at: huangpufan.cn@gmail.com or use GitHub Security Advisories
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

### 中文

1. **请勿**公开提交 Issue
2. 发送邮件至：huangpufan.cn@gmail.com 或使用 GitHub Security Advisories
3. 请包含以下信息：
   - 漏洞描述
   - 复现步骤
   - 潜在影响
   - 建议的修复方案（如有）

我们将在 48 小时内回复并与你一起解决问题。

## Security Best Practices / 安全最佳实践

When using Vibe Mermaid Editor:

- **API Keys**: Your API keys are stored locally in browser localStorage only
- **No Server Storage**: We never send or store your API keys on any server
- **Direct API Calls**: All AI requests go directly from your browser to the AI provider
- **HTTPS Only**: Always use HTTPS when deploying in production
- **Keep Dependencies Updated**: Regularly update dependencies to get security patches

使用 Vibe Mermaid Editor 时：

- **API 密钥**：你的 API 密钥仅存储在浏览器本地 localStorage 中
- **无服务器存储**：我们从不在任何服务器上发送或存储你的 API 密钥
- **直接 API 调用**：所有 AI 请求直接从你的浏览器发送到 AI 服务商
- **仅 HTTPS**：生产环境部署时始终使用 HTTPS
- **保持依赖更新**：定期更新依赖以获取安全补丁

## Disclosure Policy / 披露政策

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible
5. Credit the reporter (unless they wish to remain anonymous)

当我们收到安全漏洞报告时，我们将：

1. 确认问题并确定受影响的版本
2. 审计代码以查找类似问题
3. 为所有支持的版本准备修复
4. 尽快发布新版本
5. 致谢报告者（除非他们希望保持匿名）
