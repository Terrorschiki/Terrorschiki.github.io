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

# 每个方案固定的主题；suffix 是令牌块选择器里 :not(...) 部分
PLAN = {
    "a": {"theme": "dark", "suffix": ""},
    "b": {"theme": "light", "suffix": ':not([data-theme="dark"])'},
    "c": {"theme": "light", "suffix": ""},
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
   本分支为单主题设计：data-theme 固定为 {THEME}，主题切换按钮已移除。
   =========================================================================== */
"""


def convert_css(variant: str) -> str:
    src = SITE / "preview" / f"v{variant}.css"
    if not src.is_file():
        sys.exit(f"找不到方案样式表: {src}")

    css = src.read_text(encoding="utf-8")
    theme = PLAN[variant]["theme"]
    suffix = PLAN[variant]["suffix"]

    # 1. 去掉文件头的方案说明注释，避免和下面的定稿横幅重复
    css = re.sub(r"^/\* =+\n[\s\S]*?\n   =+ \*/\n", "", css, count=1)

    # 2. 选择器改写：方案前缀 -> 整站默认
    if suffix:
        css = css.replace(f'html[data-variant="{variant}"]{suffix}', "html")
        # 另一主题的令牌块已不成立，整块移除
        css = re.sub(
            rf'html\[data-variant="{variant}"\]\[data-theme="dark"\]\s*\{{[\s\S]*?\n\}}\n',
            "",
            css,
            count=1,
        )
    else:
        # 必须把「带尾随空格」的形式放在前面替换，否则会先命中不含空格的形式，
        # 留下一个孤立的 " nav {...}" 而丢掉 html 选择器
        css = css.replace(f'html[data-variant="{variant}"] ', "html ")
        css = css.replace(f'html[data-variant="{variant}"]', "html")

    # 3. 主题按钮已移除，本块内它的两条规则（固定主题提示）整块删除。
    #    注意：基础 style.css 里也有含「主题按钮」字样的注释，
    #    因此这里按「注释 + 紧随其后的 .theme-toggle 规则块」精确匹配，不做跨段吞并。
    css = re.sub(
        r"/\* [^\n]*主题按钮[^\n]*\*/\n(?=\.theme-toggle)",
        "",
        css,
        count=1,
    )
    css = re.sub(r"\.theme-toggle(::after)? \{[^}]*\}\n?", "", css)

    if "theme-toggle" in css:
        raise SystemExit("主题按钮样式未能完全移除，请检查 apply_variant.py 的正则")
    if "data-variant" in css:
        raise SystemExit("CSS 中仍残留 data-variant，请检查选择器改写逻辑")

    banner = BANNER.format(X=variant.upper(), x=variant, NAME=NAMES[variant], THEME=theme)
    return banner + "\n" + css.strip() + "\n"


def apply_html(variant: str) -> None:
    p = SITE / "index.html"
    html = p.read_text(encoding="utf-8")
    theme = PLAN[variant]["theme"]

    html = html.replace(
        '<html lang="en" data-theme="light">',
        f'<html lang="en" data-theme="{theme}">',
        1,
    )
    html = re.sub(r"\n  <script>\n    const savedTheme[\s\S]*?\n  </script>\n", "\n", html, count=1)
    html = re.sub(
        r'\s*<button class="control-btn theme-toggle"[\s\S]*?</button>', "", html, count=1
    )

    if "theme-toggle" in html or "savedTheme" in html:
        raise SystemExit("index.html 中的主题切换相关内容未清理干净")

    p.write_text(html, encoding="utf-8", newline="\n")


def apply_js() -> None:
    p = SITE / "assets" / "js" / "main.js"
    js = p.read_text(encoding="utf-8")

    js = js.replace("    initThemeToggle();\n", "", 1)
    js = re.sub(r"  function initThemeToggle\(\) \{[\s\S]*?\n  \}\n\n", "", js, count=1)

    if "initThemeToggle" in js:
        raise SystemExit("main.js 中仍残留 initThemeToggle")

    p.write_text(js, encoding="utf-8", newline="\n")


def drop_preview_lab() -> None:
    shutil.rmtree(SITE / "preview", ignore_errors=True)
    for extra in ("tools/build_preview.py", "tools/apply_variant.py"):
        f = SITE / extra
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
    apply_js()
    drop_preview_lab()
    prune_readme()

    print(f"已应用方案 {variant.upper()}（主题固定为 {PLAN[variant]['theme']}）")
    print(f"  style.css 追加 {len(converted)} 字符")
    print("  index.html / main.js 已固定主题并移除主题按钮")
    print("  preview/ 预览实验室与转换脚本自身已移除")


if __name__ == "__main__":
    main()
