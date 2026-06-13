#!/usr/bin/env bash
# ============================================================
# sync-articles.sh — 检测 articles/ 下的 Markdown 文件是否已同步为 HTML
#
# 用法:
#   bash scripts/sync-articles.sh           # 人类可读报告
#   bash scripts/sync-articles.sh --json    # JSON 格式（供 AI 解析）
#   bash scripts/sync-articles.sh --watch   # 持续监听模式
#
# 映射规则:
#   articles/INDEX.md              → docs/articles/list.html
#   articles/<name>.md             → docs/articles/<name>.html
# ============================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARTICLES_DIR="$ROOT_DIR/articles"
HTML_DIR="$ROOT_DIR/docs/articles"
MAPPING_FILE="$ROOT_DIR/.articles-sync-mapping"

MODE="${1:---report}"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ============================================================
# 工具函数
# ============================================================

md_to_html_name() {
    local md_file="$1"
    local basename
    basename="$(basename "$md_file" .md)"

    # INDEX.md 特殊映射 → list.html
    if [ "$basename" = "INDEX" ]; then
        echo "list.html"
    else
        echo "${basename}.html"
    fi
}

get_title_from_md() {
    local md_file="$1"
    # 提取第一个 # 标题行
    grep -m1 '^# ' "$md_file" 2>/dev/null | sed 's/^# //' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo "(无标题)"
}

get_summary_from_md() {
    local md_file="$1"
    # 提取 > 开头的摘要行
    grep -m1 '^> ' "$md_file" 2>/dev/null | sed 's/^> //' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || echo ""
}

# ============================================================
# 扫描逻辑
# ============================================================

NEW_FILES=()
STALE_FILES=()
SYNCED_FILES=()

scan_articles() {
    NEW_FILES=()
    STALE_FILES=()
    SYNCED_FILES=()

    if [ ! -d "$ARTICLES_DIR" ]; then
        echo "❌ articles/ 目录不存在" >&2
        return 1
    fi

    for md_file in "$ARTICLES_DIR"/*.md; do
        [ -f "$md_file" ] || continue

        local md_basename
        md_basename="$(basename "$md_file")"

        local html_name
        html_name="$(md_to_html_name "$md_basename")"
        local html_file="$HTML_DIR/$html_name"

        local title
        title="$(get_title_from_md "$md_file")"
        local summary
        summary="$(get_summary_from_md "$md_file")"

        if [ ! -f "$html_file" ]; then
            # HTML 文件不存在 → NEW
            NEW_FILES+=("$md_file|$html_file|$title|$summary")
        elif [ "$md_file" -nt "$html_file" ]; then
            # MD 比 HTML 新 → STALE
            STALE_FILES+=("$md_file|$html_file|$title|$summary")
        else
            SYNCED_FILES+=("$md_file|$html_file|$title|$summary")
        fi
    done
}

# ============================================================
# JSON 输出（给 AI 解析）
# ============================================================

output_json() {
    scan_articles

    echo "{"
    echo "  \"total\": $(( ${#NEW_FILES[@]} + ${#STALE_FILES[@]} + ${#SYNCED_FILES[@]} )),"
    echo "  \"new\": ${#NEW_FILES[@]},"
    echo "  \"stale\": ${#STALE_FILES[@]},"
    echo "  \"synced\": ${#SYNCED_FILES[@]},"

    echo "  \"new_files\": ["
    for i in "${!NEW_FILES[@]}"; do
        IFS='|' read -r md html title summary <<< "${NEW_FILES[$i]}"
        local comma=","
        [ "$i" -eq $((${#NEW_FILES[@]} - 1)) ] && comma=""
        printf '    {"md":"%s","html":"%s","title":"%s","summary":"%s"}%s\n' \
            "$(basename "$md")" "$(basename "$html")" "$title" "$summary" "$comma"
    done
    echo "  ],"

    echo "  \"stale_files\": ["
    for i in "${!STALE_FILES[@]}"; do
        IFS='|' read -r md html title summary <<< "${STALE_FILES[$i]}"
        local comma=","
        [ "$i" -eq $((${#STALE_FILES[@]} - 1)) ] && comma=""
        printf '    {"md":"%s","html":"%s","title":"%s","summary":"%s"}%s\n' \
            "$(basename "$md")" "$(basename "$html")" "$title" "$summary" "$comma"
    done
    echo "  ]"

    echo "}"
}

# ============================================================
# 人类可读报告
# ============================================================

output_report() {
    scan_articles

    echo ""
    echo -e "${BOLD}══════════════════════════════════════════════${NC}"
    echo -e "${BOLD}  📄 Articles → HTML 同步状态报告${NC}"
    echo -e "${BOLD}══════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Markdown 源:   ${CYAN}articles/${NC}"
    echo -e "  HTML 目标:     ${CYAN}docs/articles/${NC}"
    echo ""

    # 统计
    local new_count=${#NEW_FILES[@]}
    local stale_count=${#STALE_FILES[@]}
    local synced_count=${#SYNCED_FILES[@]}

    if [ "$new_count" -gt 0 ]; then
        echo -e "  ${RED}● ${new_count} 篇待转化${NC}"
    fi
    if [ "$stale_count" -gt 0 ]; then
        echo -e "  ${YELLOW}● ${stale_count} 篇已过期（MD 有更新）${NC}"
    fi
    echo -e "  ${GREEN}● ${synced_count} 篇已同步${NC}"
    echo ""

    # 待转化列表
    if [ "$new_count" -gt 0 ]; then
        echo -e "${RED}${BOLD}  ▸ 待转化（NEW）：${NC}"
        for entry in "${NEW_FILES[@]}"; do
            IFS='|' read -r md html title summary <<< "$entry"
            echo -e "    ${RED}✗${NC} $(basename "$md") ${CYAN}→${NC} $(basename "$html")"
            echo -e "      ${title}"
        done
        echo ""
    fi

    # 过期列表
    if [ "$stale_count" -gt 0 ]; then
        echo -e "${YELLOW}${BOLD}  ▸ 已过期（STALE）：${NC}"
        for entry in "${STALE_FILES[@]}"; do
            IFS='|' read -r md html title summary <<< "$entry"
            echo -e "    ${YELLOW}⚠${NC}  $(basename "$md") ${CYAN}→${NC} $(basename "$html")"
            echo -e "      ${title}"
        done
        echo ""
    fi

    # 已同步列表
    if [ "$synced_count" -gt 0 ]; then
        echo -e "${GREEN}${BOLD}  ▸ 已同步（OK）：${NC}"
        for entry in "${SYNCED_FILES[@]}"; do
            IFS='|' read -r md html title summary <<< "$entry"
            echo -e "    ${GREEN}✓${NC} $(basename "$md")"
        done
        echo ""
    fi

    # 操作提示
    if [ "$new_count" -gt 0 ] || [ "$stale_count" -gt 0 ]; then
        echo -e "${BOLD}  💡 下一步：${NC}"
        echo -e "     在 Pi 中输入 ${CYAN}\"sync articles\"${NC} 即可自动转化所有待处理文章"
        echo ""
    else
        echo -e "  ${GREEN}${BOLD}✨ 全部已同步，无需操作${NC}"
        echo ""
    fi
}

# ============================================================
# Watch 模式
# ============================================================

output_watch() {
    echo "👀 监听 articles/ 变更中... (Ctrl+C 退出)"
    local last_hash=""
    while true; do
        local current_hash
        current_hash=$(find "$ARTICLES_DIR" -name '*.md' -exec md5 -q {} \; | sort | md5 -q)
        if [ "$current_hash" != "$last_hash" ] && [ -n "$last_hash" ]; then
            echo ""
            echo "🔄 检测到变更 — $(date '+%H:%M:%S')"
            output_report
            echo "👀 继续监听中..."
        fi
        last_hash="$current_hash"
        sleep 3
    done
}

# ============================================================
# 主入口
# ============================================================

mkdir -p "$HTML_DIR"

case "$MODE" in
    --json)
        output_json
        ;;
    --watch)
        output_watch
        ;;
    --report|*)
        output_report
        ;;
esac
