"""把 main 分支的「内容」同步到各风格分支，保持各分支只有样式不同。

设计原则
--------
  * 内容（页面结构、文案、数据、图片、工具脚本）以 main 为唯一真源；
  * 样式（assets/css/style.css）是各分支自己的，永不被覆盖；
  * 因此各分支的 index.html / lang / js 与 main 逐字一致，
    同步时直接整文件覆盖即可，不会产生任何合并冲突。

用法（站点根目录）：
    python tools/sync_content.py                 # 同步所有风格分支（dry-run）
    python tools/sync_content.py --apply         # 实际写入
    python tools/sync_content.py --apply --push  # 写入并推送
    python tools/sync_content.py --branches variant-b   # 只同步指定分支

新增内容文件时，把它加进 CONTENT_FILES（或 CONTENT_DIRS）。
"""

import argparse
import subprocess
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent

MAIN = "main"
DEFAULT_BRANCHES = ["variant-b", "variant-c"]

# 相对站点根目录、需要在各分支间保持一致的「内容」文件。
# 注意：assets/css/style.css 是样式，刻意不在列表中。
CONTENT_FILES = [
    "index.html",
    "lang/zh.json",
    "lang/en.json",
    "assets/js/main.js",
    "assets/js/i18n.js",
    "tools/check_site.js",
    "tools/verify_render.js",
    "tools/variant_converter.py",
    "tools/sync_content.py",
    ".gitattributes",
    "README.md",
    "README_zh.md",
]

# 这些目录下的文件全部同步（新增图片、新增工具会自动带上）
CONTENT_DIRS = ["assets/images", "tools"]

# 永不同步（各分支自己的样式）
STYLE_FILES = {"assets/css/style.css"}


def run(args, check=True):
    r = subprocess.run(args, cwd=SITE, capture_output=True, text=True, encoding="utf-8")
    if check and r.returncode != 0:
        sys.exit(f"命令失败: {' '.join(args)}\n{r.stdout}\n{r.stderr}")
    return r.stdout.strip()


def list_remote_files(branch):
    out = run(["git", "ls-tree", "-r", "--name-only", branch])
    return [line.strip() for line in out.splitlines() if line.strip()]


def sync_branch(branch, apply_changes, push):
    print(f"\n=== {branch} ===")

    targets = set(CONTENT_FILES)
    # 目录下的所有文件（以 main 上的清单为准）
    main_files = list_remote_files(MAIN)
    for f in main_files:
        if f in STYLE_FILES:
            continue
        if any(f.startswith(d + "/") for d in CONTENT_DIRS):
            targets.add(f)

    # 排序保证输出稳定；index.html 放最前便于阅读
    ordered = sorted(targets, key=lambda p: (p != "index.html", p))

    # 哪些文件在分支上确实不同。
    # 用 blob 哈希比较而不是比较文件内容：图片等二进制文件无法按 UTF-8 解码，
    # 直接 diff 内容会抛 UnicodeDecodeError（对比哈希更安全也更快）。
    differing = []
    for f in ordered:
        a = run(["git", "rev-parse", f"{MAIN}:{f}"], check=False)
        b = run(["git", "rev-parse", f"{branch}:{f}"], check=False)
        if a != b:
            differing.append(f)

    if not differing:
        print("  已是最新，无需同步")
        return False

    print(f"  需要更新 {len(differing)} 个文件：")
    for f in differing:
        print(f"    - {f}")

    if not apply_changes:
        return False

    current = run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    if current != branch:
        run(["git", "checkout", branch])
    try:
        for f in differing:
            run(["git", "checkout", f"{MAIN}", "--", f])
        run(["git", "add", "-A"])
        msg = f"同步 main 的内容更新（{len(differing)} 个文件，样式保持不变）"
        r = subprocess.run(
            ["git", "commit", "-q", "-m", msg],
            cwd=SITE,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        if r.returncode != 0:
            print(f"  没有需要提交的改动（{r.stdout.strip()}）")
        else:
            print(f"  已提交：{msg}")

        # 确认样式文件确实没被动过
        changed = run(["git", "show", "--name-only", "--format=", "HEAD"])
        if "assets/css/style.css" in changed.split():
            sys.exit("错误：style.css 被同步覆盖了，请检查 CONTENT_FILES/CONTENT_DIRS")

        if push:
            run(["git", "push", "origin", branch])
            print(f"  已推送 origin/{branch}")
    finally:
        if current != branch:
            run(["git", "checkout", current])
    return True


def main():
    ap = argparse.ArgumentParser(description="把 main 的内容同步到各风格分支")
    ap.add_argument("--branches", nargs="*", default=None, help="要同步的分支，默认 variant-b variant-c")
    ap.add_argument("--apply", action="store_true", help="实际写入（默认只预览）")
    ap.add_argument("--push", action="store_true", help="同步后推送到 origin")
    args = ap.parse_args()

    branches = args.branches if args.branches else DEFAULT_BRANCHES

    # 必须在干净的工作区上操作，避免把未提交的改动搅进来
    status = run(["git", "status", "--porcelain"])
    if status:
        sys.exit("工作区有未提交改动，请先提交或 stash 后再运行同步脚本。")

    print(f"内容真源：{MAIN}")
    print(f"目标分支：{', '.join(branches)}")
    print(f"模式：{'实际写入' if args.apply else '预览（dry-run）'}")

    changed = []
    for b in branches:
        if sync_branch(b, args.apply, args.push):
            changed.append(b)

    print("\n" + "=" * 56)
    if not args.apply:
        print("以上为预览。加 --apply 实际写入，加 --push 同步后推送。")
    elif changed:
        print(f"已同步并提交：{', '.join(changed)}")
        if not args.push:
            print("尚未推送。加 --push 或在各分支手动 git push。")
    else:
        print("所有分支都已是最新。")


if __name__ == "__main__":
    main()
