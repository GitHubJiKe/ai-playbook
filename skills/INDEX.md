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
