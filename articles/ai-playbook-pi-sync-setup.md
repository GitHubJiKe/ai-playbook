# AI Playbook 资产分类梳理与 Pi 双向同步

> 厘清了八种 AI Playbook 资产类型的区别与边界，并用软链接打通了仓库与 Pi 之间的双向同步，让仓库成为技能和提示词的唯一真相来源。

## 背景

AI Playbook 仓库里建了 Commands、Prompts、Rules、Roles、Tools、Skills、Scripts、Articles 八个目录，但对它们各自的使用场景和边界一直有些模糊。同时，之前是把 Skills 从仓库复制到 `~/.pi/agent/skills/` 的方式来让 Pi 加载，每次改完仓库里的技能文件还要再复制一遍，很繁琐。

这次对话的核心目标就是：搞清楚每类资产是干什么的，然后建立一个优雅的同步机制。

## 过程

### 八类资产的定义与区分

从 idea-classifier 技能中找到了八种资产类型的明确定义。关键区分维度有二：**运行环境**（聊天内 vs 聊天外）和**复杂度**（一句话 vs 多步骤流程）。

最容易混淆的几组边界：

| 边界 | 判定方向 |
|------|----------|
| Command vs Prompt | 有占位变量或格式化输出 → Prompt；纯指令 → Command |
| Prompt vs Role | 要求 AI 以特定身份系统性思考 → Role；仅控制输出格式 → Prompt |
| Role vs Rule | 定义完整 AI 人格 → Role；只是一条行为约束 → Rule |
| Skill vs Command | 需要分步 + 分支 + 边界处理 → Skill；单轮即可 → Command |

### Pi 能直接加载哪些资产

对照 Pi 的原生机制做了梳理：Pi 原生支持四种资产——Skills、Prompt Templates、Extensions、Themes。AI Playbook 的八种里，只有两种能直接映射：

- **Skills** → Pi Skills：完全对应，复制到 `~/.pi/agent/skills/` 即可
- **Prompts** → Pi Prompt Templates：格式略有差异（Playbook 用 `{{占位符}}`，Pi 用 `$1` 位置参数），但基本可复用

其余六种（Commands、Rules、Roles、Tools、Scripts、Articles）Pi 没有直接对应的加载机制，需要间接转化或保持独立。

### 用软链替代复制

之前的同步方式是手动复制，烦且容易忘。改用软链的方案：

- Skills 和 Prompts 目录下的文件/目录可以软链接到 `~/.pi/agent/` 对应的位置
- Pi 用标准文件系统 API 发现资产，天然跟随软链接
- 随后将仓库中已有的 6 个 Skill（git-commit、idea-classifier、md-to-html、session-summary、skill-creator、skills-audit）从副本替换为指向 `ai-playbook/skills/` 的软链接
- `~/.pi/agent/prompts/` 目录也一并创建，等仓库 prompts/ 有内容后直接用软链接入

### Rules 的处理策略

最初考虑将 Rules 同步到 `~/.pi/agent/AGENTS.md` 作为全局约束，但最终决定不做这一步。理由是 Rules 通常会耦合到具体的 Skill 中，当 Skill 被加载时规则自然生效，没有必要单独注入全局上下文。这个判断避免了过度设计。

### Prompt 梳理专家 Role

对话末尾，用户分享了一个在 Gemini 上创建的 GEM，核心是设定 AI 为"Prompt 梳理专家"，系统性地引导用户澄清模糊需求并转化为结构化 Prompt。按照分类标准判定为 Role（定义了"谁在说话"和"怎么思考"），写入 `roles/prompt-sorting-expert.md`，成为仓库中第一个角色资产。

## 关键决策

| 决策 | 原因 |
|------|------|
| 用软链而非复制同步 Skills | Pi 文件系统 API 天然跟随软链接，改仓库即生效，无需手动同步 |
| 只替换仓库自有的 6 个 Skill | `~/.pi/agent/skills/` 下 19 个技能中有 13 个来自其他来源，不应改动 |
| Rules 不同步到 AGENTS.md | Rules 通常耦合在 Skill 内部，加载 Skill 时自然生效，无需额外全局注入 |
| GEM 判定为 Role 而非 Skill | 核心是定义身份和行为边界，尚未包含多步分支流程 |

## 产出清单

| 文件/操作 | 说明 |
|-----------|------|
| `~/.pi/agent/skills/` 下 6 个软链接 | git-commit、idea-classifier 等指向 `ai-playbook/skills/` |
| `~/.pi/agent/prompts/` | 新建目录，预留后续 Prompt 软链接接入 |
| `roles/prompt-sorting-expert.md` | 首个 Role 资产：Prompt 梳理专家 |
| `roles/INDEX.md` | 更新，新增 Prompt 梳理专家条目 |

## 思考与备注

**唯一真相来源**：软链方案让仓库成为资产的唯一真相来源，这意味着版本管理、审计、协作都只需关注仓库一个地方。之前复制两处容易产生不一致，现在彻底消除了。

**不过度设计**：Rules 不同步到 AGENTS.md 的决定体现了"够用就好"——只有一条规则且已被 Skill 覆盖的情况下，额外建全局约束就是过度工程。资产体系的价值在于被使用，而不是被填满。
