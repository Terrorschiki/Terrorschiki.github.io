"""把某个改版方案「定稿」为站点默认样式（各分支复用同一套转换逻辑）。

转换内容：
  1. preview/v{X}.css 的选择器前缀 html[data-variant="X"] 改写为 html，使其成为整站默认样式；
  2. 按方案固定主题（A=dark，B/C=light），并丢弃另一主题的令牌块；
  3. index.html：写死 data-theme、移除主题切换按钮与读取 localStorage 的脚本；
  4. main.js：移除主题切换的初始化调用与函数；
  5. 删除 preview/ 预览实验室与 README 中的相关章节。

用法（站点根目录）：python tools/apply_variant.py {a|b|c}
"""

import re
import shutil
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent

# 每个方案对应的主题（决定令牌块是否用 :not([data-theme="dark"]) 限定）
PLAN = {
    "a": {"theme": "dark"},
    "b": {"theme": "light"},
    "c": {"theme": "light"},
}

NAMES = {
    "a": "终端编辑器 / Terminal",
    "b": "温润刊物 / Editorial",
    "c": "霓虹潮玩 / Neo-brutalism",
}

BANNER = """
/* ===========================================================================
   15. 站点主题定稿（方案 {X}：{NAME}）
   ---------------------------------------------------------------------------
   以下规则来自改版方案 preview/v{X}.css，已改写为整站默认样式。
   本分支通过样式表锁定观感（面向 {THEME} 主题），
   index.html 与 main 分支保持逐字一致，因此内容可以整文件同步。
   =========================================================================== */
"""


def drop_rule_block(css: str, selector: str) -> str:
    """删除「选择器 + 花括号块」整段。

    用花括号配对定位结束位置，而不是正则懒匹配 —— 后者在遇到 :not()、
    嵌套函数或注释里的花括号时容易配错，把后面的规则一起吞掉。
    """
    idx = css.find(selector)
    if idx == -1:
        return css

    brace = css.find("{", idx)
    if brace == -1:
        return css

    depth = 0
    end = -1
    for i in range(brace, len(css)):
        if css[i] == "{":
            depth += 1
        elif css[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end == -1:
        sys.exit(f"选择器 {selector} 的规则块花括号不配对")

    while end < len(css) and css[end] in "\r\n":
        end += 1
    return css[:idx] + css[end:]


def convert_css(variant: str) -> str:
    src = SITE / "preview" / f"v{variant}.css"
    if not src.is_file():
        sys.exit(f"找不到方案样式表: {src}")

    css = src.read_text(encoding="utf-8")
    theme = PLAN[variant]["theme"]

    # 1. 去掉文件头的方案说明注释，避免和下面的定稿横幅重复
    css = re.sub(r"^/\* =+\n[\s\S]*?\n   =+ \*/\n", "", css, count=1)

    # 2. 丢弃「另一主题」的令牌块（按花括号配对精确定位，避免正则配错吞掉后续规则）
    css = drop_rule_block(css, f'html[data-variant="{variant}"][data-theme="dark"]')

    # 3. 选择器改写：方案前缀 -> 整站默认。
    #    亮色方案改用 :not([data-theme="dark"]) 限定，
    #    这样即使访客切到暗色，也会落回基础样式的暗色令牌，不会出现半亮半暗。
    scoped = f'html:not([data-theme="dark"])' if theme == "light" else "html"

    css = css.replace(f'html[data-variant="{variant}"]:not([data-theme="dark"])', scoped)
    css = css.replace(f'html[data-variant="{variant}"][data-theme="dark"]', scoped)
    # 「带尾随空格」的形式必须放在裸形式前面替换，否则会先命中裸形式而丢掉选择器
    css = css.replace(f'html[data-variant="{variant}"] ', f"{scoped} ")
    css = css.replace(f'html[data-variant="{variant}"]', scoped)

    # 4. 移除方案自带的主题按钮样式（各分支的主题按钮显隐统一由下面统一注入的规则控制）
    css = re.sub(r"/\* [^\n]*主题按钮[^\n]*\*/\n(?=\.theme-toggle)", "", css, count=1)
    css = re.sub(r"\.theme-toggle(::after)? \{[^}]*\}\n?", "", css)

    # 5. 统一注入：本方案锁定单一主题，隐藏主题按钮，保证 index.html 可与 main 完全一致
    css += (
        "\n/* 本方案锁定单一主题，隐藏主题切换按钮\n"
        "   （按钮保留在 HTML 中，以便 index.html 与 main 分支保持逐字一致）*/\n"
        ".theme-toggle {\n  display: none !important;\n}\n"
    )

    if "data-variant" in css:
        raise SystemExit("CSS 中仍残留 data-variant，请检查选择器改写逻辑")

    banner = BANNER.format(X=variant.upper(), x=variant, NAME=NAMES[variant], THEME=theme)
    return banner + "\n" + css.strip() + "\n"


def apply_html(variant: str) -> None:
    """index.html 不做任何改动。

    主题由各分支的样式表决定，因此各分支的 index.html 与 main 逐字一致，
    内容同步时只需整文件覆盖，不会产生任何冲突。
    """
    p = SITE / "index.html"
    html = p.read_text(encoding="utf-8")

    if "theme-toggle" not in html:
        raise SystemExit("index.html 缺少主题按钮，结构可能与预期不符")
    if "savedTheme" not in html:
        raise SystemExit("index.html 缺少主题初始化脚本，结构可能与预期不符")

    theme = PLAN[variant]["theme"]
    # 主题按钮仍保留在 DOM 中（只是被样式表隐藏），index.html 因此可以逐字同步
    print(f"  index.html 保持与 main 一致（主题由样式表决定：{theme}）")


def drop_preview_lab() -> None:
    """移除预览实验室。

    不删除本脚本自身 —— 它留在 tools/ 下，方便日后把站点切到别的方案：
        git checkout -b variant-x
        python tools/variant_converter.py <a|b|c>
    """
    shutil.rmtree(SITE / "preview", ignore_errors=True)
    f = SITE / "tools" / "build_preview.py"
    if f.is_file():
        f.unlink()


def prune_readme() -> None:
    for name in ("README.md", "README_zh.md"):
        p = SITE / name
        if not p.is_file():
            continue
        text = p.read_text(encoding="utf-8")
        text = re.sub(
            r"## 八、改版方案预览实验室[\s\S]*?\n---\n\n## 九、常见问题", "## 八、常见问题", text
        )
        text = text.replace("- [八、改版方案预览实验室](#八改版方案预览实验室)\n", "")
        text = text.replace("- [九、常见问题](#九常见问题)", "- [八、常见问题](#八常见问题)")
        text = re.sub(r"├── preview/[^\n]*\n", "", text)
        text = re.sub(r"│   ├── build_preview\.py[^\n]*\n", "", text)
        p.write_text(text, encoding="utf-8", newline="\n")


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in PLAN:
        sys.exit("用法: python tools/apply_variant.py {a|b|c}")
    variant = sys.argv[1]

    converted = convert_css(variant)

    target = SITE / "assets" / "css" / "style.css"
    base = target.read_text(encoding="utf-8")
    target.write_text(base.rstrip() + "\n\n" + converted, encoding="utf-8", newline="\n")

    apply_html(variant)
    drop_preview_lab()
    prune_readme()

    print(f"已应用方案 {variant.upper()}（主题由样式表决定：{PLAN[variant]['theme']}）")
    print(f"  style.css 追加 {len(converted)} 字符")
    print("  index.html / main.js 未做改动 —— 与 main 分支保持一致")
    print("  preview/ 预览实验室已移除")


if __name__ == "__main__":
    main()
