/**
 * article-sync extension
 * ======================
 * 自动监控 articles/ 目录下的 Markdown 文件变化，
 * 当检测到新文章或文章更新时，自动触发转化。
 *
 * 功能：
 *   1. 启动时自动扫描 articles/ 并转化所有待处理文章
 *   2. 实时监控 articles/ 目录（fs.watch），文件变化 2 秒后自动触发转化
 *   3. /sync-articles 命令：手动触发全量扫描和转化
 *   4. INDEX.md → list.html 增量更新（只追加新条目，不动整体风格）
 *      支持两种 list.html 格式：卡片式（.article-card）和表格式（<tbody>）
 *   5. 其他文章 → 通过 md-to-html skill 全流程生成
 *
 * 依赖：
 *   - scripts/sync-articles.sh（项目内已有）
 *   - md-to-html skill（~/.pi/agent/skills/md-to-html/SKILL.md）
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { watch, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ============================================================
// 类型定义
// ============================================================

interface PendingArticle {
  md: string;
  html: string;
  title: string;
  summary: string;
}

interface SyncResult {
  total: number;
  new: number;
  stale: number;
  synced: number;
  new_files: PendingArticle[];
  stale_files: PendingArticle[];
}

// ============================================================
// 工具函数
// ============================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 零宽格式化：两位数字 */
function padNum(n: number): string {
  return String(n).padStart(2, "0");
}

// ============================================================
// 扩展主入口
// ============================================================

export default function (pi: ExtensionAPI) {
  const rootDir = process.cwd();
  const articlesDir = resolve(rootDir, "articles");
  const htmlDir = resolve(rootDir, "docs/articles");
  const syncScript = resolve(rootDir, "scripts/sync-articles.sh");
  const listHtmlPath = resolve(htmlDir, "list.html");

  // 状态管理
  let watcher: ReturnType<typeof watch> | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isChecking = false;
  const processedFiles = new Set<string>();

  // ============================================================
  // 核心逻辑
  // ============================================================

  async function getPendingArticles(): Promise<PendingArticle[]> {
    try {
      const result = await pi.exec("bash", [syncScript, "--json"]);
      if (result.code !== 0) {
        console.error("[article-sync] 脚本执行失败:", result.stderr);
        return [];
      }
      const data: SyncResult = JSON.parse(result.stdout);
      return [...data.new_files, ...data.stale_files];
    } catch (err) {
      console.error("[article-sync] 获取文章列表异常:", err);
      return [];
    }
  }

  /**
   * 增量更新 list.html —— 根据现有格式追加新文章条目。
   *
   * 检测两种格式：
   *   - 卡片式（.article-card）：在封底 <section> 之前插入新卡片
   *   - 表格式（<tbody>）：在第一个 <tbody> 的 </tbody> 前插入新行，
   *     并替换第二个 <tbody> 内容为最新条目
   */
  function updateListHtmlIncremental(newArticles: PendingArticle[]): boolean {
    try {
      let html = readFileSync(listHtmlPath, "utf-8");

      if (html.includes("article-card")) {
        return updateCardFormat(html, newArticles);
      }

      if (html.includes("<tbody>")) {
        return updateTableFormat(html, newArticles);
      }

      console.error("[article-sync] list.html 格式无法识别");
      return false;
    } catch (err) {
      console.error("[article-sync] 更新 list.html 失败:", err);
      return false;
    }
  }

  // ---------- 卡片式（.article-card）----------

  function updateCardFormat(html: string, newArticles: PendingArticle[]): boolean {
    // 找到最后一个 .article-card 之后的封底 <section>
    const footerMarker = '<section class="section" style="margin-top:24px">';
    const footerIdx = html.indexOf(footerMarker);
    if (footerIdx === -1) {
      console.error("[article-sync] 卡片格式中未找到封底 section");
      return false;
    }

    // 统计已有卡片数
    const existingCards = (html.match(/class="article-card"/g) || []).length;

    // 生成新卡片 HTML
    let cardsHtml = "";
    for (let i = 0; i < newArticles.length; i++) {
      const article = newArticles[i];
      const seq = existingCards + i + 1;
      const htmlName = article.md.replace(/\.md$/, ".html");

      cardsHtml += `
<a class="article-card" href="${escapeHtml(htmlName)}">
  <div class="card-num">ARTICLE ${padNum(seq)}</div>
  <div class="card-title">${escapeHtml(article.title)}</div>
  <div class="card-desc">${escapeHtml(article.summary)}</div>
  <span class="card-badge">\u2705 \u5df2\u5b8c\u6210</span>
</a>
`;
    }

    // 在封底 section 之前插入
    html = html.substring(0, footerIdx) + cardsHtml + html.substring(footerIdx);

    writeFileSync(listHtmlPath, html, "utf-8");
    console.log(
      `[article-sync] list.html 卡片式增量更新：追加 ${newArticles.length} 张卡片`,
    );
    return true;
  }

  // ---------- 表格式（<tbody>）----------

  function updateTableFormat(html: string, newArticles: PendingArticle[]): boolean {
    // 定位两个 </tbody> 的位置
    const tbodyCloses: number[] = [];
    let idx = html.indexOf("</tbody>");
    while (idx !== -1) {
      tbodyCloses.push(idx);
      idx = html.indexOf("</tbody>", idx + 8);
    }

    if (tbodyCloses.length < 2) {
      console.error("[article-sync] 表格格式中未找到两个 tbody");
      return false;
    }

    const firstClose = tbodyCloses[0];

    // 统计第一个 tbody 中已有行数
    const beforeFirstClose = html.substring(0, firstClose);
    const lastTbodyOpen = beforeFirstClose.lastIndexOf("<tbody>");
    const existingRows =
      (beforeFirstClose.substring(lastTbodyOpen).match(/<tr>/g) || []).length;

    // 生成新行
    let insertHtml = "";
    for (let i = 0; i < newArticles.length; i++) {
      const article = newArticles[i];
      const seq = existingRows + i + 1;
      const htmlName = article.md.replace(/\.md$/, ".html");
      insertHtml += `
        <tr>
          <td>${seq}</td>
          <td>${escapeHtml(article.title)}</td>
          <td><a href="${escapeHtml(htmlName)}">${escapeHtml(article.md)}</a></td>
          <td><span class="status-badge">\u2705 \u5df2\u5b8c\u6210</span></td>
          <td>${escapeHtml(article.summary)}</td>
        </tr>`;
    }

    // 插入到第一个 tbody
    html = html.substring(0, firstClose) + insertHtml + html.substring(firstClose);

    // 更新第二个 tbody（最新文章）
    const shift = insertHtml.length;
    const secondClose = tbodyCloses[1] + shift;
    const secondTbodyStart = html.lastIndexOf("<tbody>", secondClose);

    const lastArticle = newArticles[newArticles.length - 1];
    const lastHtmlName = lastArticle.md.replace(/\.md$/, ".html");
    const lastSeq = existingRows + newArticles.length;

    const newLatestRow = `
        <tr>
          <td>${lastSeq}</td>
          <td>${escapeHtml(lastArticle.title)}</td>
          <td><a href="${escapeHtml(lastHtmlName)}">${escapeHtml(lastArticle.md)}</a></td>
          <td><span class="status-badge">\u2705 \u5df2\u5b8c\u6210</span></td>
          <td>${escapeHtml(lastArticle.summary)}</td>
        </tr>
`;

    html =
      html.substring(0, secondTbodyStart + "<tbody>".length) +
      newLatestRow +
      html.substring(secondClose);

    writeFileSync(listHtmlPath, html, "utf-8");
    console.log(`[article-sync] list.html 表格式增量更新：追加 ${newArticles.length} 行`);
    return true;
  }

  // ---------- 发送转化请求 ----------

  function sendConversionRequests(
    articles: PendingArticle[],
    fromWatcher = false,
  ) {
    if (articles.length === 0) return;

    const names = articles.map((a) => a.md).join(", ");

    for (const article of articles) {
      try {
        pi.sendUserMessage(
          `/skill:md-to-html 请帮我把 articles/${article.md} 转化为 HTML 文件`,
          fromWatcher ? { deliverAs: "followUp" } : undefined,
        );
      } catch (err) {
        console.error(`[article-sync] 发送请求失败 (${article.md}):`, err);
      }
    }

    console.log(`[article-sync] 触发 ${articles.length} 篇 md-to-html: ${names}`);
  }

  // ---------- 分类处理 ----------

  async function checkAndSync(fromWatcher = false) {
    if (isChecking) return;
    isChecking = true;

    try {
      const pending = await getPendingArticles();
      const newArticles = pending.filter((a) => !processedFiles.has(a.md));
      if (newArticles.length === 0) return;

      for (const a of newArticles) processedFiles.add(a.md);

      const indexEntries = newArticles.filter((a) => a.md === "INDEX.md");
      const normalArticles = newArticles.filter((a) => a.md !== "INDEX.md");

      // INDEX.md → list.html 增量更新（如果 list.html 已存在）
      if (indexEntries.length > 0) {
        if (listHtmlFileExists()) {
          // INDEX.md 变了 + 有普通新文章 → 把普通文章插入 list.html
          if (normalArticles.length > 0) updateListHtmlIncremental(normalArticles);
        } else {
          // list.html 还不存在 → 首次全量生成
          sendConversionRequests(indexEntries, fromWatcher);
        }
      } else if (normalArticles.length > 0 && listHtmlFileExists()) {
        // 只有普通新文章，INDEX.md 没变 → 也要更新 list.html
        updateListHtmlIncremental(normalArticles);
      }

      // 普通文章 → md-to-html
      if (normalArticles.length > 0) {
        sendConversionRequests(normalArticles, fromWatcher);
      }
    } catch (err) {
      console.error("[article-sync] 同步异常:", err);
    } finally {
      isChecking = false;
    }
  }

  function listHtmlFileExists(): boolean {
    try { readFileSync(listHtmlPath, "utf-8"); return true; } catch { return false; }
  }

  // ============================================================
  // 文件监控
  // ============================================================

  function startWatching() {
    if (watcher) return;
    try {
      watcher = watch(articlesDir, { persistent: false, recursive: false }, (_e, filename) => {
        if (!filename || !filename.endsWith(".md")) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`[article-sync] 检测到文件变化: ${filename}`);
          checkAndSync(true);
        }, 2000);
      });
      watcher.on("error", (err) => console.error("[article-sync] 监控出错:", err));
      console.log("[article-sync] 文件监控已启动:", articlesDir);
    } catch (err) {
      console.error("[article-sync] 无法启动监控:", err);
    }
  }

  function stopWatching() {
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    if (watcher) { watcher.close(); watcher = null; console.log("[article-sync] 监控已停止"); }
  }

  // ============================================================
  // 事件
  // ============================================================

  pi.on("session_start", async (_event, ctx) => {
    const pending = await getPendingArticles();

    if (pending.length > 0) {
      ctx.ui.notify(
        `📄 检测到 ${pending.length} 篇待转化文章，正在自动转化...`,
        "info",
      );
      for (const a of pending) processedFiles.add(a.md);

      const indexEntries = pending.filter((a) => a.md === "INDEX.md");
      const normalArticles = pending.filter((a) => a.md !== "INDEX.md");

      if (normalArticles.length > 0 && listHtmlFileExists()) {
        updateListHtmlIncremental(normalArticles);
      } else if (indexEntries.length > 0 && !listHtmlFileExists()) {
        sendConversionRequests(indexEntries, false);
      }

      if (normalArticles.length > 0) {
        sendConversionRequests(normalArticles, false);
      }
    }

    startWatching();
  });

  pi.on("session_shutdown", () => stopWatching());

  // ============================================================
  // 命令
  // ============================================================

  pi.registerCommand("sync-articles", {
    description: "扫描 articles/ 并自动处理：新文章 → HTML，list.html 增量更新",
    handler: async (_args, ctx) => {
      ctx.ui.notify("🔍 正在扫描 articles/ ...", "info");
      const pending = await getPendingArticles();

      if (pending.length === 0) {
        ctx.ui.notify("✅ 所有文章已同步", "info");
        return;
      }

      ctx.ui.notify(`📄 发现 ${pending.length} 篇待处理，开始转化...`, "info");
      for (const a of pending) processedFiles.add(a.md);

      const normalArticles = pending.filter((a) => a.md !== "INDEX.md");
      const indexEntries = pending.filter((a) => a.md === "INDEX.md");

      if (normalArticles.length > 0 && listHtmlFileExists()) {
        const ok = updateListHtmlIncremental(normalArticles);
        if (!ok) ctx.ui.notify("⚠️ list.html 增量更新失败", "warning");
      }

      if (normalArticles.length > 0) sendConversionRequests(normalArticles, false);
      if (indexEntries.length > 0 && !listHtmlFileExists() && normalArticles.length === 0) {
        sendConversionRequests(indexEntries, false);
      }
    },
  });
}
