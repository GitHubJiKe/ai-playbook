# pi Extensions 从科普到实战：打造 article-sync 自动文章转化扩展

> 从 pi Extensions 的完整概念科普入手，逐步分析项目现有脚本和技能，实现一个文件监控扩展——自动检测 articles/ 目录变化，触发 md-to-html skill 转化为 HTML 页面。经历 v1 到 v2 的迭代，从「通知但不自动执行」演进为「全自动转化 + list.html 增量更新」。

## 背景

pi 是一个极简的 AI 编程助手内核，其核心设计哲学是「内核保持最小，能力靠扩展」。其他工具内置的功能（Plan Mode、子代理、MCP 等）官方都不做，而是提供 Extensions 机制让用户自己实现。本次对话的目的是一边科普 Extensions 的概念和能力，一边用实际项目中的一个真实需求来练手——监控文章目录、自动触发转化。

## 过程

### Extensions 全面科普

首先系统梳理了 pi Extensions 的八大核心能力：注册自定义工具给 LLM 调用、拦截事件（如阻止 `rm -rf`）、注册命令、用户交互弹框、自定义 TUI 组件（甚至可以写游戏）、键盘快捷键、CLI 标志、以及注册自定义模型 Provider。这些能力通过事件驱动模型串联——扩展订阅生命周期事件（`session_start`、`tool_call`、`tool_result` 等），在关键时刻介入。

官方提供了 60+ 个完整示例覆盖所有场景，从最简单的 hello.ts 到完整的 Plan Mode 实现，甚至包括贪吃蛇和 Doom 游戏。

### 实战 v1：article-sync 扩展

项目中已有 `scripts/sync-articles.sh` 脚本（检测 articles/ 下哪些 Markdown 需要转化为 HTML）和 `md-to-html` skill（执行实际的 Markdown → HTML 转化）。需求很明确：当 articles/ 下有新文件或文件更新时，自动触发转化流程。

v1 核心设计：
- **复用 sync-articles.sh --json**：避免在 TypeScript 中重复实现文件映射逻辑（如 INDEX.md → list.html）
- **fs.watch 文件监控**：使用 Node.js 内置的 `fs.watch` 监听 articles/ 目录，2 秒防抖后触发检查
- **sendUserMessage 注入消息**：通过 `pi.sendUserMessage("/skill:md-to-html ...")` 模拟用户输入，触发 skill 执行转化
- **processedFiles 去重**：防止同一文件被重复转化
- **三种触发方式**：启动时检测并通知、文件变化时自动触发、`/sync-articles` 命令手动一键转化

### 迭代 v2：全自动 + 增量更新

v1 在实际使用中暴露出两个问题：启动时只通知不自动转化，导致用户容易错过；list.html 走 md-to-html 全流程会改变页面整体风格，且需要交互确认。v2 针对性改进：

- **启动时自动转化**：去掉了"只通知"的逻辑，`session_start` 时直接触发转化流程
- **list.html 增量更新**：不再走 md-to-html skill 全流程，而是直接读取现有 HTML，以程序化方式追加新条目，保持页面风格不变
- **双格式兼容**：自动检测 list.html 是卡片式（`.article-card`）还是表格式（`<tbody>`），使用对应的插入策略。卡片式在封底 `<section>` 前插入新卡片；表格式向 `<tbody>` 追加新行

### 调试：位置约定与项目信任

开发过程中遇到两个实际问题：

1. **扩展目录约定**：用户创建的 `extensions/`（根目录）不是 pi 的扩展目录。pi 只会自动发现 `.pi/extensions/`（点开头的隐藏目录），这是约定而非配置项。

2. **项目信任机制**：扩展放在 `.pi/extensions/` 后未能加载，原因是 pi 的 Project Trust 安全机制——`.pi/` 下的资源需要项目被信任后才会执行。解决方法是用 `pi --approve` 临时信任，或进入 pi 后输入 `/trust` 永久信任。

## 关键决策

| 决策 | 原因 |
|------|------|
| 复用 sync-articles.sh 而非重写检测逻辑 | 已有完善的 INDEX.md → list.html 映射、标题提取、摘要提取逻辑，避免 DRY 违背 |
| fs.watch + 2 秒防抖 | 等文件写入完成再读取，避免读到半截内容；防抖避免编辑器频繁保存触发多次转化 |
| v2：启动时自动转化（推翻 v1 设计） | 实际体验发现只通知不可靠，用户容易错过提示；自动执行更符合「全自动」的定位 |
| watcher 触发用 deliverAs:"followUp" | 避免 agent 正忙时 sendUserMessage 崩溃，等待空闲再插入转化请求 |
| 逐篇发送而非批量 | md-to-html skill 设计为一次处理一篇，逐篇发送确保每篇都走完整的四步流程 |
| v2：list.html 增量更新而非全量生成 | 全量生成会改变页面风格并需要交互确认；增量追加保持既有视觉风格，零交互 |
| v2：兼容卡片式/表格式两种 list.html | 历史遗留的不同风格页面共存；通过检测 `.article-card` 或 `<tbody>` 自动适配插入策略 |

## 产出清单

| 文件/操作 | 说明 |
|-----------|------|
| `.pi/extensions/article-sync/index.ts` | article-sync 扩展主文件（v2，~290 行 TypeScript） |
| 利用 `scripts/sync-articles.sh` | 已有脚本，扩展通过 pi.exec 调用其 --json 模式 |
| 利用 `md-to-html` skill | 已有技能，扩展通过 sendUserMessage 注入 `/skill:md-to-html` 命令触发 |

## 思考与备注

- **Extensions 的本质是「管道」**：不自己实现业务逻辑，而是连接已有的脚本和能力。article-sync 本身没有做任何文件转化工作，它只是一个连接 sync-articles.sh 和 md-to-html skill 的管道。
- **事件驱动模型的威力**：通过 `session_start` 初始化、`fs.watch` 事件监听、`sendUserMessage` 注入消息，整个流程完全自动化，用户在 pi 中只需要专注于与 AI 对话本身。
- **约定优于配置**：`.pi/extensions/` 的目录约定和项目信任机制，体现了 pi 的设计倾向——用目录结构和显式信任代替复杂的配置文件，降低了心智负担。
