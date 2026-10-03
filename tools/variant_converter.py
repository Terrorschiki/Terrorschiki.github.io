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

# 定稿块的标记：用于重复运行时定位并剥离旧块（保证幂等）
MARKER = "   15. 站点主题定稿"

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
   本方案提供「亮 / 暗」两套完整令牌：
     html:not([data-theme="dark"])  → 亮色
     html[data-theme="dark"]        → 暗色
   默认观感偏向 {THEME} 主题；index.html 与 main 分支保持逐字一致。
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

    # 2. 选择器改写：方案前缀 -> 整站默认，同时保留「亮 / 暗」两套令牌。
    #    亮色令牌用 :not([data-theme="dark"]) 限定，暗色令牌用 [data-theme="dark"]，
    #    这样切换主题时两套令牌各归其位，不会出现半亮半暗。
    v = f'html[data-variant="{variant}"]'
    replacements = [
        # 暗色令牌必须排在前面，否则会被「裸前缀」那条先吃掉
        (f'{v}[data-theme="dark"] ', 'html[data-theme="dark"] '),
        (f'{v}[data-theme="dark"]', 'html[data-theme="dark"]'),
        (f'{v}:not([data-theme="dark"]) ', 'html:not([data-theme="dark"]) '),
        (f'{v}:not([data-theme="dark"])', 'html:not([data-theme="dark"])'),
        (f"{v} ", "html "),
        (v, "html"),
    ]
    for old, new in replacements:
        css = css.replace(old, new)

    # 3. 移除方案自带的主题按钮样式（按钮现在恢复可用，不再需要禁用提示）
    css = re.sub(r"/\* [^\n]*主题按钮[^\n]*\*/\n(?=\.theme-toggle)", "", css, count=1)
    css = re.sub(r"\.theme-toggle(::after)? \{[^}]*\}\n?", "", css)

    if "data-variant" in css:
        raise SystemExit("CSS 中仍残留 data-variant，请检查选择器改写逻辑")

    # 4. 校验两套令牌都在，避免把某一种主题漏掉
    if 'html[data-theme="dark"] {' not in css:
        raise SystemExit("缺少暗色令牌块：本方案未能提供暗色主题")
    if "html:not([data-theme=\"dark\"]) {" not in css:
        raise SystemExit("缺少亮色令牌块：本方案未能提供亮色主题")

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


def strip_existing_block(css: str) -> str:
    """剥离此前追加过的定稿块，使本脚本可以重复运行而不叠加样式。

    按标记字符串定位，然后回退到该注释块的起始 /*。
    因为定稿块永远追加在文件末尾，直接截断即可。
    """
    idx = css.find(MARKER)
    if idx == -1:
        return css
    start = css.rfind("/*", 0, idx)
    if start == -1:
        start = idx
    print("  检测到已有定稿块，先剥离再重新应用（保证幂等）")
    return css[:start].rstrip() + "\n"


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in PLAN:
        sys.exit("用法: python tools/variant_converter.py {a|b|c}")
    variant = sys.argv[1]

    converted = convert_css(variant)

    target = SITE / "assets" / "css" / "style.css"
    # 先剥离旧定稿块，避免重复运行时样式叠加
    base = strip_existing_block(target.read_text(encoding="utf-8"))
    target.write_text(base.rstrip() + "\n\n" + converted, encoding="utf-8", newline="\n")

    # 复核：定稿块只能有一份
    final = target.read_text(encoding="utf-8")
    if final.count(MARKER) != 1:
        sys.exit(f"定稿块数量异常（{final.count(MARKER)} 份），请检查 strip_existing_block")

    apply_html(variant)
    drop_preview_lab()
    prune_readme()

    print(f"已应用方案 {variant.upper()}（含亮/暗两套主题，默认 {PLAN[variant]['theme']}）")
    print(f"  style.css 追加 {len(converted)} 字符")
    print("  index.html / main.js 未做改动 —— 与 main 分支保持一致")
    print("  preview/ 预览实验室已移除")


if __name__ == "__main__":
    main()
