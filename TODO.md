# TODO — ai-playbook 扩展开发计划

> 基于当前仓库结构分析，梳理可实现的 pi Extension 候选清单，待 review 后决定优先级和开发顺序。

---

## 库存现状

| 资产类型 | 目录 | 当前数量 | INDEX.md |
|----------|------|:--:|:--:|
| Skills | `skills/` | 6 | ✅ |
| Roles | `roles/` | 1 | ✅ |
| Rules | `rules/` | 1 | ✅ |
| Commands | `commands/` | 0 | ✅（空） |
| Prompts | `prompts/` | 0 | ✅（空） |
| Scripts | `scripts/` | 1 | ✅ |
| Tools | `tools/` | 0 | ✅（空） |
| Articles | `articles/` | 6 | ✅ |
| Extensions | `.pi/extensions/` | 1 | — |

已有 1 个 Extension：`article-sync`（监控 articles/ → 自动转化 HTML + list.html 增量更新）。

---

## 候选 Extension 清单

### 🥇 优先级 P0：高价值 + 高可行性

#### 1. INDEX auto-updater

**一句话**：往 `skills/`、`roles/`、`rules/`、`commands/`、`prompts/`、`scripts/`、`tools/` 任一目录新增文件时，自动更新对应 `INDEX.md` 的表格行。

**痛点**：当前每新增一个 skill 或 role，都要手动打开 INDEX.md 加一行表格。流程断开、容易遗漏。

**核心逻辑**：
- 监听以上 7 个目录（fs.watch）
- 检测到新 `.md` 文件 → 解析一级标题作为名称
- 在对应 INDEX.md 表格中追加一行（序号自动递增）
- 支持手动命令 `/update-index <目录>` 做批量修复

**复杂度**：中（~200 行）。复用 article-sync 的增量追加模式。

---

#### 2. `/stats` 资产仪表盘命令

**一句话**：一键显示仓库全部资产统计 + 文章同步状态。

**痛点**：想了解仓库全貌需要手动翻多个 INDEX.md，没有统一视图。

**展示内容**：
```
📊 ai-playbook 资产统计
├─ Skills:     6  (git-commit, idea-classifier, md-to-html, ...)
├─ Roles:      1  (prompt-sorting-expert)
├─ Rules:      1  (skill-loop-exit-condition)
├─ Commands:   0
├─ Prompts:    0
├─ Scripts:    1  (sync-articles.sh)
├─ Tools:      0
├─ Articles:   6  (5 HTML 已同步, 0 待转化)
└─ Extensions: 1  (article-sync v2)
```

**复杂度**：低（~50 行）。纯读取 + 格式化输出。

---

#### 3. Broken link checker

**一句话**：`/check-links` 扫描所有 INDEX.md 和 `docs/*.html` 中的内部链接，报告 404。

**痛点**：文件被删除或重命名后，INDEX.md 中的链接变成死链，HTML 中互相引用的链接也会断裂。

**核心逻辑**：
- 解析所有 INDEX.md 中的表格链接列
- 解析所有 `docs/*.html` 中的 `<a href>` 内链
- 检查目标文件是否存在
- 输出报告：✅ 有效链接数 / ❌ 断裂链接数 + 明细

**复杂度**：中（~120 行）。文件系统遍历 + HTML/Markdown 解析。

---

### 🥈 优先级 P1：中等价值

#### 4. `/new-asset` 创建向导

**一句话**：交互式创建新 skill/role/rule/command，自动生成模板文件 + 更新 INDEX.md。

**痛点**：每种资产类型的模板结构不同，手动创建容易格式不一致。

**交互流程**：
```
/new-asset
→ 选择类型：[skill / role / rule / command / prompt / tool]
→ 输入名称
→ （可选）输入简介
→ 自动生成文件 + INDEX.md 追加
```

**复杂度**：中（~150 行）。需要 ctx.ui.select + 模板生成 + INDEX.md 更新。

---

#### 5. Cross-reference validator

**一句话**：检查每个 INDEX.md 表格行数和实际文件数是否一致，找出「孤儿文件」（有文件无索引）和「幽灵引用」（有索引无文件）。

**痛点**：手动维护 INDEX.md 时，容易漏加新文件或不记得删旧条目。

**输出示例**：
```
🔍 INDEX 完整性检查

skills/INDEX.md: 6 条索引 ↔ 6 个文件 ✅
roles/INDEX.md:  1 条索引 ↔ 1 个文件 ✅
articles/INDEX.md: 5 条索引 ↔ 6 个文件 ⚠️（INDEX.md 自身不计入）

⚠️ 孤儿文件（有文件无索引）：
  （无）

⚠️ 幽灵引用（有索引无文件）：
  （无）
```

**复杂度**：中（~100 行）。目录遍历 + INDEX.md 表格解析。

---

#### 6. Git auto-tag on session

**一句话**：每次 session-summary 产出新文章后，自动打轻量 tag 标记快照点。

**痛点**：想回溯「那篇文章是哪个对话产出的」时，只能靠 commit message 猜测。

**核心逻辑**：
- 监听 `tool_result` 事件，检测 session-summary 的 write 操作
- 文章写入后自动执行 `git tag article/<filename-base>`
- 可选：在 commit message 中附带 tag 信息

**复杂度**：低（~60 行）。

---

### 🥉 优先级 P2：锦上添花

#### 7. Global ↔ project skill sync checker

**一句话**：检测项目本地 skill（`skills/`）与全局 pi skill（`~/.pi/agent/skills/`）之间的版本差异。

**场景**：你通过软链接把项目 skill 同步到了全局 pi，但后来修改了项目版本，全局的还是旧的。

**复杂度**：低（~70 行）。文件 diff + notify 提醒。

---

#### 8. Article freshness monitor

**一句话**：启动时提醒哪些文章超过 N 天（默认 30 天）未更新。

**场景**：技术文章容易过时，定期提醒 review。

**复杂度**：低（~40 行）。`stat` + 日期比较。

---

## Review 决策记录

| 日期 | 参与者 | 决策 |
|------|--------|------|
| — | — | 待 review |

---

## 开发记录

| # | Extension | 状态 | 开始日期 | 完成日期 |
|---|-----------|:--:|----------|----------|
| 1 | article-sync v2 | ✅ 已完成 | 2026-06-13 | 2026-06-13 |
| 2 | INDEX auto-updater | 🔲 待 review | — | — |
| 3 | /stats 命令 | 🔲 待 review | — | — |
| 4 | Broken link checker | 🔲 待 review | — | — |
| 5 | /new-asset 向导 | 🔲 待 review | — | — |
| 6 | Cross-reference validator | 🔲 待 review | — | — |
| 7 | Git auto-tag | 🔲 待 review | — | — |
| 8 | Skill sync checker | 🔲 待 review | — | — |
| 9 | Article freshness | 🔲 待 review | — | — |
