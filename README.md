# AI Playbook — 我的 AI 使用手册

> 一个记录和沉淀我日常使用 AI 的 Playbook 仓库。

[English](README_EN.md) | 中文

## 关于本仓库

这里是我与 AI 协作的全部可复用资产——技能、工具、脚本、规则、角色、提示词、命令，以及围绕 AI 使用写下的思考和文章（存放在 `articles/` 目录）。

所有内容按功能分类存放，方便检索、复用和持续迭代。部分文章会转化为 HTML 并通过 **GitHub Pages** 对外发布。

## 目录结构

```
ai-playbook/
├── articles/         # 关于 AI 使用的感想、思考、感悟
├── commands/         # 常用 AI 命令（快捷指令集合）
├── docs/             # 文章 & GitHub Pages 发布内容
├── prompts/          # 提示词模板（可复用的 prompt）
├── roles/            # AI 角色设定（人设和系统 prompt）
├── rules/            # 规则文件（约束和规范 AI 行为）
├── scripts/          # 脚本（自动化、批处理等）
├── skills/           # 技能（特定场景下的完整工作流）
├── tools/            # 工具（AI 辅助工具链）
└── README.md         # 本文件
```

| 目录        | 说明                                                                      |
| ----------- | ------------------------------------------------------------------------- |
| `articles/` | 关于 AI 使用和本仓库的感想、思考、感悟，可手动撰写或 AI 辅助记录          |
| `commands/` | 沉淀常用的 AI 指令，如"帮我润色这段文字"、"生成单元测试"等，即拿即用      |
| `docs/`     | AI 使用心得、技术文章，以及转换为 HTML 的网页内容，通过 GitHub Pages 发布 |
| `prompts/`  | 经过验证的高质量提示词模板，可直接复用或二次定制                          |
| `roles/`    | AI 角色定义，为不同场景预设系统级人设和对话规则                           |
| `rules/`    | AI 行为约束规则，确保输出质量、风格、范围符合预期                         |
| `scripts/`  | 自动化脚本，将 AI 集成到日常工作流中                                      |
| `skills/`   | 面向特定任务的完整技能包，包含 prompt + 规则 + 工作流                     |
| `tools/`    | 与 AI 搭配使用的工具清单、配置和使用指南                                  |

## 使用方式

1. **浏览**：按目录分类找到需要的技能、提示词或规则
2. **复用**：直接复制 prompt 或规则到你的 AI 对话中
3. **参考**：阅读 `docs/` 中的文章了解使用思路
4. **共建**：欢迎提 Issue 或 PR 分享你的 AI 使用技巧

## GitHub Pages

本仓库的 `docs/` 目录已配置 GitHub Pages，你可以直接访问：

👉 **[https://GitHubJiKe.github.io/ai-playbook](https://GitHubJiKe.github.io/ai-playbook)**

## 许可

MIT License © 2026
