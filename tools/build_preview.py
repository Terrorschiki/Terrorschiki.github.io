"""生成 preview/index.html（改版方案预览实验室）。

设计目标：
  * 预览页的页面结构、文案、渲染逻辑与真实站点**完全同源** —— 由本脚本从
    站点根目录的 index.html 自动派生，因此以后站点改了结构，重跑一次即可同步；
  * 只替换样式表路径：基础样式 ../assets/css/style.css + 方案样式 ./v{Y}.css；
  * 追加一个右下角悬浮切换器，用 JS 换 <link href> 实现实时换肤，无需刷新。

用法（在站点根目录）：
    python tools/build_preview.py
"""

import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
SRC = SITE / "index.html"
OUT = SITE / "preview" / "index.html"

VARIANTS = ["a", "b", "c", "d"]
DEFAULT = "a"

SWITCHER = """
  <!-- ===== 改版方案预览切换器（仅本地预览用，不影响线上站点）===== -->
  <div class="variant-switcher" role="group" aria-label="改版方案切换">
    <span class="variant-label">改版方案</span>
    <div class="variant-btns">
      <button type="button" class="variant-btn" data-variant="a">A 终端编辑器</button>
      <button type="button" class="variant-btn" data-variant="b">B 温润刊物</button>
      <button type="button" class="variant-btn" data-variant="c">C 霓虹潮玩</button>
      <button type="button" class="variant-btn" data-variant="d">D 极简留白</button>
    </div>
    <span class="variant-tip">← → 键切换 · 语言/主题按钮照常可用</span>
  </div>
"""


def build_shell() -> str:
    if not SRC.is_file():
        sys.exit(f"找不到站点入口: {SRC}")

    html = SRC.read_text(encoding="utf-8")

    # 1. 所有相对路径上移一层（基础样式、脚本、图片）
    html = html.replace('href="assets/', 'href="../assets/')
    html = html.replace('src="assets/', 'src="../assets/')

    # 2. 在基础样式之后追加当前方案的样式表
    base_link = '<link rel="stylesheet" href="../assets/css/style.css">'
    if base_link not in html:
        sys.exit("未找到基础样式表引用，站点结构可能已变化")
    html = html.replace(
        base_link,
        base_link
        + f'\n  <link rel="stylesheet" href="./v{DEFAULT}.css" id="variant-sheet">',
        1,
    )

    # 3. 预览专用样式（切换器 + 空状态提示的对比度提升）
    html = html.replace(
        'id="variant-sheet">',
        'id="variant-sheet">\n  <link rel="stylesheet" href="./preview-switcher.css">',
        1,
    )

    # 4. 注入切换器：放在 </body> 前，脚本之后
    if "</body>" not in html:
        sys.exit("未找到 </body>")
    html = html.replace("</body>", SWITCHER + "</body>", 1)

    # 5. 预览页标题便于区分标签页
    html = html.replace(
        "<title>Terrorschiki 的个人博客</title>",
        "<title>改版方案预览 · Terrorschiki 的个人博客</title>",
        1,
    )

    return html


SWITCHER_HEAD_SCRIPT = """
  <script>
    /* 换肤逻辑：只替换方案样式表的 href，页面结构与渲染逻辑完全不动。
       优先级：URL 参数 ?v=x > localStorage > 默认 A */
    (function () {
      var VARIANTS = ['a', 'b', 'c', 'd'];
      var KEY = 'previewVariant';

      function readParam() {
        var m = /[?&]v=([a-d])/i.exec(location.search);
        return m ? m[1].toLowerCase() : null;
      }

      var initial = readParam();
      if (!initial) {
        try { initial = localStorage.getItem(KEY); } catch (e) { initial = null; }
      }
      if (VARIANTS.indexOf(initial) === -1) initial = 'a';
      window.__INITIAL_VARIANT__ = initial;

      /* 每个方案都是「单主题」设计：A 固定深色（代码编辑器），B/C/D 固定亮色。
         站点自带的基础样式只有在一个合适的主题下才会与方案配色协调，
         因此这里跟随方案强制设置主题，避免出现「暖纸质方案落进通用暗色」这类破功。 */
      var VARIANT_THEME = { a: 'dark', b: 'light', c: 'light', d: 'light' };

      var sheet = document.getElementById('variant-sheet');
      if (sheet) sheet.setAttribute('href', './v' + initial + '.css');
      try { localStorage.setItem('theme', VARIANT_THEME[initial]); } catch (e) {}

      window.__applyVariant = function (v) {
        if (VARIANTS.indexOf(v) === -1) return;
        var link = document.getElementById('variant-sheet');
        if (link) link.setAttribute('href', './v' + v + '.css');

        // 这两行缺一不可：data-variant 决定方案样式表里 html[data-variant="x"] 是否命中，
        // data-theme 决定基础样式用亮色还是暗色令牌。
        document.documentElement.setAttribute('data-variant', v);
        var theme = VARIANT_THEME[v] || 'light';
        document.documentElement.setAttribute('data-theme', theme);

        try {
          localStorage.setItem('theme', theme);
          localStorage.setItem(KEY, v);
        } catch (e) {}
        document.querySelectorAll('.variant-btn').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-variant') === v);
        });
      };

      document.addEventListener('DOMContentLoaded', function () {
        window.__applyVariant(window.__INITIAL_VARIANT__);

        /* 各方案为单主题设计，锁住主题按钮，避免访客误触后画面破功 */
        var themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
          themeBtn.setAttribute('title', '预览中各方案为单主题设计，主题按钮已锁定');
          themeBtn.setAttribute('aria-disabled', 'true');
          themeBtn.style.pointerEvents = 'none';
          themeBtn.style.opacity = '0.45';
          var fresh = themeBtn.cloneNode(true);
          themeBtn.parentNode.replaceChild(fresh, themeBtn);
        }

        document.querySelectorAll('.variant-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            window.__applyVariant(btn.getAttribute('data-variant'));
          });
        });

        document.addEventListener('keydown', function (e) {
          if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
          var idx = VARIANTS.indexOf(document.documentElement.getAttribute('data-variant') || 'a');
          if (e.key === 'ArrowRight') window.__applyVariant(VARIANTS[(idx + 1) % VARIANTS.length]);
          if (e.key === 'ArrowLeft') window.__applyVariant(VARIANTS[(idx - 1 + VARIANTS.length) % VARIANTS.length]);
        });
      });
    })();
  </script>
"""


def main() -> None:
    html = build_shell()

    # 切换器脚本要尽早执行（在 <head> 内联），否则会看到样式闪烁
    html = html.replace("</head>", SWITCHER_HEAD_SCRIPT + "</head>", 1)

    # 预览页不应被搜索引擎收录
    html = html.replace(
        '<meta name="viewport"',
        '<meta name="robots" content="noindex, nofollow">\n  <meta name="viewport"',
        1,
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8", newline="\n")

    print(f"已生成 {OUT.relative_to(SITE)}  ({len(html)} 字符)")
    print(f"方案数: {len(VARIANTS)} -> {', '.join('v%s.css' % v for v in VARIANTS)}")
    for v in VARIANTS:
        f = OUT.parent / f"v{v}.css"
        print(f"  v{v}.css {'✓ 存在' if f.is_file() else '✗ 缺失'}")


if __name__ == "__main__":
    main()
