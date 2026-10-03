"""验证「内容一致、样式独立」这一核心目标。

用法（站点根目录）：python tools/verify_branches.py
"""

import re
import subprocess
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

SITE = Path(__file__).resolve().parent.parent

CONTENT_FILES = [
    "index.html",
    "lang/zh.json",
    "lang/en.json",
    "assets/js/main.js",
    "assets/js/i18n.js",
    "assets/images/avatar.svg",
    "tools/check_site.js",
    "tools/sync_content.py",
    "tools/variant_converter.py",
    ".gitattributes",
    "README.md",
    "README_zh.md",
]

BRANCHES = ["variant-b", "variant-c"]


def git(*args):
    r = subprocess.run(args, cwd=SITE, capture_output=True, text=True, encoding="utf-8")
    return r.stdout if r.returncode == 0 else ""


def blob(branch, path):
    return git("git", "show", f"{branch}:{path}")


def main():
    print("=" * 62)
    print("内容一致性检查（各分支 vs main）")
    print("=" * 62)

    ok = True
    for b in BRANCHES:
        diffs = [f for f in CONTENT_FILES if blob("main", f) != blob(b, f)]
        if diffs:
            ok = False
            print(f"  ✗ {b}: {len(diffs)} 个内容文件与 main 不一致")
            for f in diffs:
                print(f"        - {f}")
        else:
            print(f"  ✓ {b}: {len(CONTENT_FILES)} 个内容文件与 main 逐字一致")

    print()
    print("=" * 62)
    print("样式独立性检查")
    print("=" * 62)
    for b in ["main"] + BRANCHES:
        css = blob(b, "assets/css/style.css")
        # 定稿块追加在文件末尾，因此要取「最后一次」出现，而不是第一次
        # （第一次属于 :root 基础令牌块）
        bgs = re.findall(r"--bg-body:\s*([^;]+);", css)
        bg = bgs[-1].strip() if bgs else "（无）"
        scoped = len(re.findall(r':not\(\[data-theme="dark"\]\)', css))
        hidden = bool(re.search(r"(?s)\.theme-toggle \{\s*display: none", css))
        lines = len(css.splitlines())
        print(f"  {b:<10} 末次底色={bg:<12} 限定作用域={scoped:<4} 按钮隐藏={'是' if hidden else '否':<3} 行数={lines}")

    print()
    print("=" * 62)
    print("差异文件清单（应只含 style.css）")
    print("=" * 62)
    for b in BRANCHES:
        out = git("git", "diff", "--name-only", "main", b).strip()
        files = [f for f in out.splitlines() if f.strip()]
        expected = files == ["assets/css/style.css"]
        if not expected:
            ok = False
        print(f"  {'✓' if expected else '✗'} {b}: {files if files else '（无差异）'}")
    print()
    print("=" * 62)
    print("结论：" + ("内容已完全一致，仅样式不同 ✓" if ok else "存在问题，见上 ✗"))
    print("=" * 62)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
