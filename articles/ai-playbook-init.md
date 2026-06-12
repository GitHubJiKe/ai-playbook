# AI Playbook 仓库初始化：从空目录到完整技能体系

> 一次对话，从零搭建起一个记录 AI 使用方法的 Playbook 仓库，包含 4 个可复用技能、双语文档体系和 GitHub Pages 发布能力。

## 背景

在 GitHub 上克隆了一个空仓库 `ai-playbook`，打算用来沉淀日常使用 AI 的全部可复用资产——技能、工具、脚本、规则、角色、提示词、命令，以及围绕 AI 使用写下的思考和文章。目标是让这个仓库既是自己的 AI 操作手册，也能通过 GitHub Pages 对外分享。

## 过程

### 仓库骨架搭建

在空仓库中创建了八个功能目录：`commands/`、`docs/`、`prompts/`、`roles/`、`rules/`、`scripts/`、`skills/`、`tools/`，以及后来的 `articles/`。每个目录都用 `INDEX.md` 作为索引文件，保持结构可维护。

随后撰写了中英文两份 README，对整个仓库的定位、目录结构、使用方式做了清晰说明。

### MD to HTML 技能

创建了第一个技能：将 Markdown 文件转化为有格调的单文件 HTML 页面。核心设计是零外部依赖——样式和脚本全部内联，本地浏览器直接可访问。工作流分四步：分析文档内容 → 推理匹配风格 → 确认明暗主题 → 生成 HTML。

用这个技能将两份 README 分别转成了 `docs/index.html` 和 `docs/index_en.html`，风格选了「清单卡片」+「跟随系统」主题。生成过程中修复了两个布局问题：sidebar 与内容区重叠（改用 flex 并排布局）、浮动按钮重叠（移除独立 fixed 定位）。

### Skills Audit 技能

第二个技能用于审计 SKILL.md 文件质量。按六个维度（触发器、步骤 I/O、分支路径、退出条件、边界情况、输出格式）逐条评分，输出通过/警告/缺失报告，并给出可操作的修复建议。额外支持三个角色专属检查维度（冲突升级路径、角色漂移防护、目标措辞平衡性）。

### Git Commit 技能

第三个技能用于一键完成 Git 提交流程，省去手动敲命令。六步流程：环境校验（检测 Git 仓库、分支状态、远程配置）→ 变更展示（文件和统计摘要）→ 获取提交信息 → 执行 add/commit → 执行 push（含各种失败处理）→ 结果输出。特别强调了安全边界：禁止自动 force push，pull --rebase 冲突不自动解决。

### Session Summary 技能

第四个技能将当前对话上下文总结为一篇结构化文章，保存到 `articles/` 目录。面向读者而非归档，用话题板块而非流水账组织内容，控制在 500-1500 字。

### 双语体系与细节完善

在两份 README 和 HTML 中加入了语言切换链接（中文 ↔ English），GitHub 上浏览 README 和 Pages 上浏览 HTML 都能一键切换。过程中修正了目录名大小写问题（`articles/` 而非 `Articles/`）。

所有四个技能都安装到了 Pi（`~/.pi/agent/skills/`），在 Pi 对话中可通过触发词直接使用。

## 关键决策

| 决策 | 原因 |
|------|------|
| HTML 页面零外部依赖（无 CDN） | 确保离线可用，不被第三方服务可用性影响 |
| Skills 索引用 INDEX.md 而非目录自描述 | 统一索引格式，方便检索和维护 |
| README 使用卡片的 HTML 风格（风格 C） | 清单卡片适合索引型文档，八个目录清晰可辨 |
| 文件命名语义化优先，时间戳兜底 | 语义化命名可读性强，时间戳保证不冲突 |
| 所有技能安装到 Pi | 在 Pi 对话中直接触发，无需手动复制提示词 |

## 产出清单

| 文件/操作 | 说明 |
|-----------|------|
| `README.md` | 中文版仓库说明（含语言切换链接） |
| `README_EN.md` | 英文版仓库说明（含语言切换链接） |
| `docs/index.html` | 中文版 GitHub Pages 页面 |
| `docs/index_en.html` | 英文版 GitHub Pages 页面 |
| `skills/md-to-html/SKILL.md` | MD to HTML 技能定义 |
| `skills/skills-audit/SKILL.md` | Skills Audit 技能定义 |
| `skills/git-commit/SKILL.md` | Git Commit 技能定义 |
| `skills/session-summary/SKILL.md` | Session Summary 技能定义 |
| `skills/INDEX.md` | Skills 目录索引 |
| `articles/INDEX.md` | Articles 目录索引 |
| `commands/`, `prompts/`, `roles/`, `rules/`, `scripts/`, `tools/` 各目录 `INDEX.md` | 占位索引文件 |
| 四个技能安装到 `~/.pi/agent/skills/` | Pi 集成 |

## 思考与备注

整个搭建过程基本是一条直线：先定骨架，再填充内容，最后打磨细节。值得记住的是 MD to HTML 技能的定位——它不是简单的「Markdown 套个壳」，而是对同一内容表达力的升级。风格服务于内容，这在后续生成 HTML 时是一个反复被验证的原则。

另外，先有技能（Skills）再安装到 Pi 的设计模式很好：技能文件本身是平台无关的规范，存放在仓库里可版本管理、可被审计；安装到 Pi 只是复制，不改变技能定义。这样即使换一个 AI 工具，技能依然可以复用。
