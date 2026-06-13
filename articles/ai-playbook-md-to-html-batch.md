# AI Playbook 全站 Markdown HTML 化：批量转化与导航链接体系搭建

> 一次对话，将仓库中 6 个 Markdown 文件全部转化为极简科技感风格的 HTML 页面，构建了从首页到文章索引再到单篇文章的完整导航体系，并修复了一个在 macOS 上潜伏的文件名冲突问题。

## 背景

AI Playbook 仓库此前已有 `docs/index.html` 和 `docs/index_en.html` 两个 GitHub Pages 页面，但 `docs/articles/` 目录一直为空。根目录有中英文两份 README（`README.md`、`README_EN.md`），`articles/` 目录下有 4 篇记录仓库建设过程的 Markdown 文章。

目标是：把所有 Markdown 内容转化为 HTML，让访问 GitHub Pages 的用户能看到完整的文档和文章体系，而不仅仅是仓库首页。

## 过程

### 第一轮：根目录 README 转化

首先将根目录的 `README.md` 和 `README_EN.md` 转为 HTML。分析结果显示两篇文档均为「操作手册/工具指南」类型，实用工程基调，包含代码块、表格、列表等结构。

在三种风格候选中选择了「极简科技感」（深色 `#0a0e1a` 背景 + 霓虹蓝 `#63b3ed` 强调色 + 终端感目录树展示），主题跟随系统。输出为 `docs/articles/index.html` 和 `docs/articles/index_en.html`，两个页面通过顶部导航栏的语言切换按钮互相跳转。

同时在 `docs/index.html` 和 `docs/index_en.html` 中新增了「文章阅读」卡片区块，用户从首页即可一键跳转到 articles 子页面。

### 第二轮：Articles 目录文章转化

接下来处理 `articles/` 下的 4 篇 Markdown：索引页 `INDEX.md`、仓库初始化纪实、资产创建流水线、Pi 双向同步。三篇叙事文章气质相近——都是「记录一次对话做了什么 + 关键决策 + 思考感悟」的工程回顾体。

用户选择全系列沿用极简科技感风格，保持视觉统一。生成了 3 篇单篇文章 HTML 和一个文章索引页。每篇文章顶部有面包屑导航（← 文章列表），索引页上有三张可点击的文章卡片，点击后进入对应文章。

### 问题修复：macOS 大小写冲突

文章索引用 `INDEX.html` 命名，在 macOS 的大小写不敏感 APFS 文件系统上，`INDEX.html` 与已存在的 `index.html`（中文 README）被视为同一文件，导致覆盖。

修复方案：文章索引页改为 `list.html`，恢复 `index.html` 为中文 README 内容，同步更新三篇文章中的「← 文章列表」返回链接。同时在 `index.html` 中新增「📄 更多文章 → list.html」入口区块，确保用户无论从哪个路径进入都能找到文章。

## 关键决策

| 决策 | 原因 |
|------|------|
| 全系列统一极简科技感风格（B） | 保持 `docs/articles/` 下所有页面视觉一致，与首页卡片风格形成区分 |
| 主题跟随系统 + 手动切换 | 兼顾偏好暗色/亮色的用户，同时保留 localStorage 记忆 |
| 文章索引命名为 `list.html` 而非 `INDEX.html` | 避免 macOS APFS 大小写不敏感导致覆盖 `index.html` |
| 每篇文章顶部加面包屑导航 | 用户无需返回浏览器即可在文章列表和单篇文章间穿梭 |
| `index.html` 同时承担 README 展示 + 文章入口双重职能 | 作为目录默认页，既是仓库手册也是文章门户 |

## 产出清单

| 文件 | 说明 |
|------|------|
| `docs/articles/index.html` | 中文仓库手册（极简科技感风格） |
| `docs/articles/index_en.html` | 英文仓库手册（极简科技感风格） |
| `docs/articles/list.html` | 文章索引列表页 |
| `docs/articles/ai-playbook-init.html` | 仓库初始化纪实文章 |
| `docs/articles/asset-creation-pipeline.html` | 资产创建流水线文章 |
| `docs/articles/ai-playbook-pi-sync-setup.html` | Pi 双向同步文章 |
| `docs/index.html` | 修改：新增「文章阅读」入口卡片 |
| `docs/index_en.html` | 修改：新增「Articles」入口卡片 |

## 思考与备注

1. **文件命名要考虑平台差异**。macOS 的 APFS 默认大小写不敏感，`INDEX.html` 和 `index.html` 会互相覆盖。在跨平台发布的内容中，避免仅靠大小写区分文件名，用语义化不同名称（如 `list.html`）更安全。

2. **批量转化时保持风格一致有价值**。6 个页面共用一套 CSS 变量体系，后续如果调整主题色或间距，只需同步修改一处逻辑即可全部生效。

3. **导航体验需要从用户视角设计**。每个页面都提供了「返回上级」和「前往同级」的路径：首页 → articles 首页 → 文章列表 → 单篇文章，逐层递进，不迷路。
