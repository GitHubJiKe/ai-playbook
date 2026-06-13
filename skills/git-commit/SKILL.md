---
name: git-commit
description: 自动执行 Git 提交流程（add → commit → push），省去手动敲命令。AI 根据 diff 自动归纳生成 commit message，用户确认后执行。当用户说"提交"、"commit"、"提交代码"、"提交一下"、"push 代码"、"帮我 commit"、"git 提交"、"把代码推上去"时触发。
---

# Git Commit

一键完成 Git 提交全流程：自动检测仓库状态、展示变更摘要、获取确认提交信息、执行 `git add -A` → `git commit -m` → `git push`，并在每个环节遇到卡点时主动向用户确认处理。

> ⚠️ **核心原则**：安全第一，不跳过确认。每个有风险的操作（强制推送、覆盖冲突、清空暂存区）必须经过用户明确同意才执行。Commit message 由 AI 根据 diff 自动归纳生成，用户确认后执行，无需手动编写。

---

## Step 1：环境校验

用 `bash` 工具依次执行以下检测，任一步失败即终止并告知用户原因：

### 1.1 检测是否为 Git 仓库

```bash
git rev-parse --git-dir
```

- ✅ 返回 `.git` 路径 → 通过，继续
- ❌ 失败 → 告知：「当前目录不是一个 Git 仓库。请切换到 Git 项目目录后重试。」流程终止

### 1.2 检测当前分支

```bash
git branch --show-current
```

- ✅ 返回分支名 → 记录分支名，继续
- ❌ 处于 Detached HEAD 状态 → 告知：「当前处于 Detached HEAD 状态，提交不会被任何分支引用。建议先创建或切换到分支：`git checkout -b <分支名>`。你希望：A. 继续在当前状态提交 / B. 终止，先去创建分支？」

### 1.3 检测远程仓库

```bash
git remote -v
```

- ✅ 有远程仓库（含 push URL）→ 记录远程名，继续
- ⚠️ 无远程仓库 → 告知：「当前仓库没有配置远程仓库，`git push` 将不可用。提交后代码只保存在本地。是否继续？（Y / N）」
  - Y → 继续，后续 Step 5 跳过 push
  - N → 流程终止

---

## Step 2：检测变更并展示摘要

### 2.1 获取变更状态

```bash
git status --porcelain
```

### 2.2 根据结果处理

**情况 A：有变更**

展示变更摘要（用表格格式）：

```
📋 待提交变更摘要：

| 状态 | 文件 |
|------|------|
| M (修改) | src/main.js |
| A (新增) | src/utils.ts |
| D (删除) | old/deprecated.js |
| ?? (未跟踪) | new-folder/ |

共 [N] 个文件变更，其中 [M] 个未跟踪文件。
```

同时执行：

```bash
git diff --stat
```

追加展示：

```
变更统计：
 [X] files changed, [Y] insertions(+), [Z] deletions(-)
```

然后进入 Step 3。

**情况 B：无任何变更**

```bash
git status --porcelain  # 返回空
```

告知：「✅ 工作区干净，没有需要提交的变更。」流程终止。

### 2.3 检测暂存区 vs 工作区差异

如果用户之前已手动 `git add` 了部分文件，`git status --porcelain` 可能显示暂存区和工作区状态不一致。此时额外展示：

```
⚠️ 暂存区已有部分文件（先前已被 git add）：
| 索引状态 | 文件 |
|----------|------|
| M  | 已暂存的修改 |
| A  | 已暂存的新增 |

本技能将统一执行 git add -A（添加所有变更），会覆盖你之前的选择性暂存。
```

---

## Step 3：AI 生成提交信息

> ⚠️ **核心变更**：本步骤不再要求用户手动编写 commit message。AI 根据变更内容自动归纳生成，用户只需确认或微调。

### 3.1 收集生成素材

依次执行以下命令，收集归纳 commit message 所需的信息：

```bash
git diff --staged --stat        # 已暂存文件的变更统计
git diff --staged --name-only   # 已暂存文件列表
git diff --stat                 # 全部变更统计（含未暂存）
git log --oneline -5            # 最近 5 次提交（了解历史命名风格）
```

若为首次提交（无历史），直接使用 `git status --porcelain` 的结果。

### 3.2 AI 归纳生成 message

根据收集到的信息，AI 按以下规范生成 commit message：

**生成规范：**

- 遵循 Conventional Commits 格式：`<type>: <简短描述>`
- type 取值：`init`（首次提交）、`feat`（新功能）、`fix`（修复）、`docs`（文档）、`refactor`（重构）、`style`（样式）、`chore`（杂项）
- 描述用中文（若仓库上下文为中文）或英文，不超过 50 字符
- 描述要概括本轮变更的核心内容，而非逐个文件罗列

**归纳逻辑：**

1. 分析变更文件的目录分布，识别变更范围（如：集中在 `skills/` → 技能相关；横跨多个目录 → 综合变更）
2. 分析是否有明显的主题（新增文件 vs 修改文件 vs 删除文件）
3. 用一句话概括：做了什么事 + 为什么/效果

**生成示例：**

| 变更特征 | 生成的 message |
|----------|---------------|
| 首次提交，全部为新文件 | `init: 初始化 ai-playbook 仓库，搭建四技能体系与双语文档` |
| 在 skills/ 下新增一个技能 | `feat: 新增 git-commit 一键提交流程技能` |
| 修复 HTML 布局问题 | `fix: 修复 index.html 侧边栏遮挡与按钮重叠问题` |
| 更新多处文档 | `docs: 补充 Articles 目录说明，添加语言切换链接` |
| 新增多文件 + 修改已有 | `feat: 新增 session-summary 技能，更新 skills 索引` |

### 3.3 展示确认

将生成的 message 展示给用户：

```
📝 提交信息：「[生成的 message]」

确认？（Y：确认提交 / E：编辑修改 / N：取消）
```

**等待用户回复：**

- Y → 进入 Step 4
- E / 用户提供修改 → 按用户指示修改 message，再次展示确认（最多重复 3 轮编辑，第 3 轮后仅提供 Y/N 选择）
- N → 流程终止

> 用户说「直接提交/不用确认」→ 跳过确认，直接进入 Step 4

---

## Step 4：执行提交

### 4.1 执行 git add

```bash
git add -A
```

- ✅ 成功 → 继续
- ❌ 失败 → 输出错误信息，告知用户原因并终止

### 4.2 执行 git commit

```bash
git commit -m "[用户提供的 message]"
```

- ✅ 成功 → 记录 commit hash（`git rev-parse --short HEAD`），继续 Step 5
- ❌ 失败 → 根据错误类型处理：

| 错误场景 | 处理方式 |
|----------|----------|
| Pre-commit hook 失败 | 输出 hook 错误信息，告知：「Pre-commit hook 检测失败。请修复以上问题后重新提交。」流程终止 |
| 无变更可提交 | 正常（`nothing to commit`），告知用户，跳过 push |
| 签名/验证失败 | 输出错误信息，告知用户原因，流程终止 |
| 其他错误 | 输出完整错误信息，告知用户，流程终止 |

---

## Step 5：执行 Push

### 5.1 检测当前分支的上游

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
```

- ❌ 无上游（首次 push）→ 使用 `git push -u origin [当前分支名]` 推送并设置上游
- ✅ 有上游 → 使用 `git push` 推送

### 5.2 执行 push

```bash
git push [参数]
```

- ✅ 成功 → 进入 Step 6
- ❌ 失败 → 根据错误类型处理：

| 错误场景 | 处理方式 |
|----------|----------|
| 远程有新提交（non-fast-forward） | 告知：「远程仓库有新的提交，需要先拉取。是否执行 `git pull --rebase`？⚠️ 这可能会产生冲突。」→ 用户确认后执行 pull，然后重试 push。若 pull 产生冲突，告知冲突文件列表并终止，让用户手动解决 |
| 认证失败（403/401） | 告知：「Git 认证失败。请检查 SSH Key 或 Personal Access Token 配置，重试。」流程终止 |
| 网络错误 | 告知：「网络连接失败，无法访问远程仓库。请检查网络后重试。」流程终止 |
| 分支受保护 | 告知：「当前分支被保护，无法直接推送。请通过 Pull Request / Merge Request 提交。」流程终止 |
| 大文件被拒绝 | 告知：「推送包含超过限制的大文件。建议使用 Git LFS 或移除大文件后重试。」流程终止 |

> ⚠️ **禁止自动执行 `git push --force` 或 `git push --force-with-lease`**，除非用户明确说「强制推送」。用户说强制推送时，再次确认：「确认要强制推送？⚠️ 这将覆盖远程分支历史，团队其他成员的本地分支可能受影响。」两次确认后才执行。

---

## Step 6：输出结果

```
✅ 提交完成！

| 步骤 | 结果 |
|------|------|
| 分支 | [当前分支名] |
| 暂存 | git add -A ✅ |
| 提交 | [commit hash] — "[message]" |
| 推送 | git push ✅ → origin/[分支名] |

如需撤销，可使用：
  git reset HEAD~1            # 撤销提交（保留更改）
  git reset --hard HEAD~1     # 撤销提交（丢弃更改）
```

流程结束。

---

## 边界情况

| 情况 | 处理 |
|------|------|
| 不在 Git 仓库中 | 终止，提示切换到 Git 目录 |
| 工作区干净，无变更 | 告知无变更，终止 |
| 无远程仓库 | 确认后仅执行 add + commit，跳过 push |
| Detached HEAD | 提示创建分支或确认继续 |
| Push 被拒绝（non-fast-forward） | 询问是否 pull --rebase，经确认后执行 |
| 用户想终止流程 | 任何等待用户输入环节，用户说「取消/算了/不提交了」→ 立即终止，不执行任何操作 |
| commit message 含特殊字符 | 自动转义，确保 shell 安全 |
| 大量文件变更（>100 文件） | 摘要展示只列前 20 条 + 统计行数，不逐条列出 |
| 用户反复修改 commit message | 最多允许 3 轮编辑，之后仅提供 Y/N 选择 |
| 用户已部分暂存 | 警告后统一 `git add -A` |

---

## 禁止清单

- ❌ 禁止在未展示变更摘要的情况下直接执行 add/commit
- ❌ 禁止在用户未确认 commit message 的情况下执行 commit
- ❌ 禁止自动执行 `git push --force` 或 `git push --force-with-lease`（除非用户明确要求且经过二次确认）
- ❌ 禁止在 pull --rebase 产生冲突时自动解决冲突
- ❌ 禁止跳过任何 Step 中的确认步骤

---

## 版本记录

| 日期 | 变更内容 |
|------|----------|
| 2026-06-13 | v1.0 初始版本：六步提交流程（环境校验 → 变更展示 → 获取信息 → 提交 → 推送 → 结果输出） |
| 2026-06-13 | v1.1 Step 3 重构：从"等待用户手动输入 message"改为"AI 根据 diff 自动归纳生成 + 用户确认"，遵循 Conventional Commits 格式 |
