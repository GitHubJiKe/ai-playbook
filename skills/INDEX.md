# Skills 索引

本文件作为 `skills/` 目录的总索引，记录所有已创建的技能。

---

## 技能列表

| 序号 | 技能名称 | 路径 | 状态 | 简介 | 安装到 Pi |
|------|----------|------|------|------|-----------|
| 1 | **MD to HTML** | [`md-to-html/SKILL.md`](md-to-html/SKILL.md) | ✅ 可用 | 将 Markdown 文件转化为有格调的单文件 HTML 页面，样式和脚本全部内联，本地浏览器直接可访问。四步流程：内容分析 → 风格推理 → 主题确认 → HTML 生成。 | ✅ 已安装 |
| 2 | **Skills Audit** | [`skills-audit/SKILL.md`](skills-audit/SKILL.md) | ✅ 可用 | 对 SKILL.md 文件进行结构化质量审计，按 D1-D6 六个维度（触发器、步骤 I/O、分支路径、退出条件、边界情况、输出格式）逐条评分，输出通过/警告/缺失报告和可操作的修复建议。 | ✅ 已安装 |
| 3 | **Git Commit** | [`git-commit/SKILL.md`](git-commit/SKILL.md) | ✅ 可用 | 一键 Git 提交流程：自动检测仓库状态 → 展示变更摘要 → 获取确认提交信息 → 执行 add/commit/push → 输出结果。覆盖无仓库、无远程、Detached HEAD、push 被拒、大文件、pre-commit hook 失败等边界情况。 | ✅ 已安装 |
| 4 | **Session Summary** | [`session-summary/SKILL.md`](session-summary/SKILL.md) | ✅ 可用 | 将当前对话上下文总结为一篇结构化文章，保存到 articles/ 目录。四步流程：扫描对话 → 确定标题 → 按模板撰写（背景/过程/决策/产出） → 写入文件并更新索引。面向读者，高度概括，不是流水账。 | ✅ 已安装 |
| 5 | **Idea Classifier** | [`idea-classifier/SKILL.md`](idea-classifier/SKILL.md) | ✅ 可用 | 帮用户判断一个想法/需求应该沉淀为哪种 AI Playbook 资产类型（命令/提示词/角色/规则/脚本/技能/工具/文章），并按对应格式生成内容写入仓库。五步流程：收集想法 → 分类分析 → 展示结果 → 生成资产 → 写入仓库。 | ✅ 已安装 |
| 6 | **Skill Creator** | [`skill-creator/SKILL.md`](skill-creator/SKILL.md) | ✅ 可用 | 按八种资产类型模板创建高质量 AI Playbook 资产。内置七条硬性质量规则（R1-R7），在生成阶段自动执行六维度检查，杜绝循环缺退出条件、触发词不足等常见缺陷。四步流程：明确目标 → 设计结构 → 生成+质检 → 写入。 | ✅ 已安装 |
| 7 | **Message Filter** | [`message-filter/SKILL.md`](message-filter/SKILL.md) | ✅ 可用 | 帮内容创作者过滤粉丝私信/留言，六维价值评估 + 追问机制 + 分流策略，判断留言是否值得投入时间深入交流。五步工作流：接收留言 → 六维打分 → 追问/简短回复/丢弃。附带三层组合过滤链（渠道/评估/付费门槛）。 | ✅ 已安装 |

---

## 使用方式

1. **在 Pi 中使用**：安装到 `~/.pi/agent/skills/` 后，Pi 自动识别并触发
2. **在其他 AI 工具中使用**：复制 `SKILL.md` 文件内容作为系统提示词
3. **在 web 项目中使用**：部分技能（如 md-to-html）可独立运行

---

## 添加新技能

1. 在 `skills/` 下创建以技能名命名的文件夹（kebab-case 格式，如 `md-to-html`）
2. 在文件夹内创建 `SKILL.md`，包含技能定义、工作流程、边界情况等
3. 在本 INDEX.md 中添加对应条目
4. （可选）安装到 Pi：将整个技能文件夹复制到 `~/.pi/agent/skills/`

---

## 更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-06-13 | 初始化索引，收录第一个技能：MD to HTML |
| 2026-06-13 | 新增技能：Skills Audit（SKILL.md 质量审计工具） |
| 2026-06-13 | 新增技能：Git Commit（一键 Git 提交，add → commit → push） |
| 2026-06-13 | 新增技能：Session Summary（对话总结为文章，保存到 articles/） |
| 2026-06-13 | 新增技能：Idea Classifier（想法分类与沉淀，判断资产类型并按格式写入仓库） |
| 2026-06-13 | 新增技能：Skill Creator（资产创建器，内置七条质量规则，覆盖八种类型模板） |
| 2026-06-14 | 新增技能：Message Filter（私信留言价值过滤器，六维评估 + 追问分流，三层过滤链） |
