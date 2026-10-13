# Terrorschiki 的个人博客

[English](README.md) | [中文](README_zh.md)

**线上地址：<https://terrorschiki.github.io/>**

一个纯静态的个人主页：只有 HTML、CSS 和原生 JavaScript。没有框架、不需要构建、不需要后端，GitHub Pages 直接把仓库当作站点提供服务。

- 中文 / English 一键切换，亮色 / 暗色主题，响应式适配手机与桌面
- 六个并列栏目：**项目合集 · 文章 · 自媒体视频 · 经历时间轴 · 技术栈 · 联系方式**
- 轻量动效（背景光斑、头像光环、Logo 打字机、卡片进场），并自动尊重系统的 `prefers-reduced-motion` 设置

---

## 仓库信息

| | |
| --- | --- |
| 远程仓库 | [`Terrorschiki/Terrorschiki.github.io`](https://github.com/Terrorschiki/Terrorschiki.github.io) |
| 线上地址 | <https://terrorschiki.github.io/> |
| 部署来源 | `main` 分支，`/ (root)` —— *Deploy from a branch* |
| 其他分支 | `variant-b`、`variant-c` —— 另外两套视觉风格，不会被部署 |

> 仓库名必须保持 `Terrorschiki.github.io` 不变。GitHub 只在仓库名恰好等于 `<用户名>.github.io` 时，才把站点放在根域名 `https://<用户名>.github.io/`。改名后站点会被挪到 `/仓库名/` 子路径下，项目里所有相对路径资源都会失效。

## 当前站点内容

| 栏目 | 数量 | 说明 |
| --- | --- | --- |
| 项目合集 | 7 张卡片 | 6 张有封面图，1 张纯文字；3 张卡片带外链（共 4 个链接） |
| 文章 | 2 篇 | DJI RC AWARD 2026（技术 / 管理）申报书全文；正文为 `articles/*.md`，由 `articles/article.html?md=xxx.md` 前端渲染（marked + KaTeX） |
| 自媒体视频 | 4 张卡片 | 3 条哔哩哔哩 + 1 条小红书；其中 2 条 `href` 仍为空，因此不渲染「去观看」按钮 |
| 经历时间轴 | 12 条 | 由近及远排序；2023.09–2027.06 的本科教育经历作为长期主线置顶 |
| 技术栈 | 4 组 / 18 项 | 机器人技术 5、仿真与训练 4、上位机开发 5、开发工具链 4 |
| 联系方式 | 5 个入口 | 邮箱、GitHub、哔哩哔哩、小红书、知乎 |

全站中英双语：每张卡片在语言包里都有成对的 `zh` / `en` 文案，项目标签也会跟着语言切换（用 `PROJECTS` 里的 `{ zh: [...], en: [...] }` 写法）。

## 目录结构

```text
.
├── index.html                       # 单页骨架，各栏目由 JS 填充
├── articles/                        # 长文（文章栏目正文）
│   ├── article.html                 # 通用 Markdown 阅读器：?md= 参数选择文章
│   ├── dji-rc-award-2026-tech.md    # DJI RC AWARD 2026（技术）申报书全文
│   ├── dji-rc-award-2026-mgmt.md    # DJI RC AWARD 2026（管理）申报书全文
│   └── images/                      # 文章配图（从申报书 PDF 中提取）
├── assets/
│   ├── css/
│   │   └── style.css                # 全部样式：设计变量、布局、组件、响应式
│   ├── js/
│   │   ├── i18n.js                  # 加载 lang/*.json，负责中英文切换
│   │   └── main.js                  # ★ 内容配置区：顶部 6 个数组
│   └── images/                      # 头像、小红书图标、项目封面图
├── lang/
│   ├── zh.json                      # ★ 中文文案
│   └── en.json                      # ★ 英文文案
├── tools/                           # 本地脚本，不参与线上站点
│   ├── serve.js                     # 本地预览服务器，禁用缓存
│   ├── check_site.js                # 推送前自检：语言包键、引用路径、残留信息
│   ├── verify_render.js             # 在最小 DOM 中执行真实脚本，验证渲染
│   ├── sync_content.py              # 把 main 的内容同步到各风格分支
│   ├── verify_branches.py           # 校验各分支内容是否与 main 一致
│   └── variant_converter.py         # 把某套风格固化为站点默认样式
├── README.md                        # 英文说明
└── README_zh.md                     # 本文件
```

日常只需要改三个文件：[`assets/js/main.js`](assets/js/main.js)、[`lang/zh.json`](lang/zh.json)、[`lang/en.json`](lang/en.json)。

## 本地预览

语言包是用 `fetch` 加载的，所以**直接双击 `index.html` 打开会是一片空白**，必须用 HTTP 服务器：

```bash
node tools/serve.js          # http://127.0.0.1:8080，响应头禁用缓存
node tools/serve.js 9000     # 也可以指定其他端口
```

`python -m http.server 8080` 或 VS Code 的 *Live Server* 插件同样可用；`tools/serve.js` 只是帮你省掉改文件后清缓存的麻烦。

## 修改内容

两边必须同时改，这是唯一需要牢记的规则：

| 你要改的东西 | 文件位置 |
| --- | --- |
| 有哪些内容、顺序、图片、标签、链接 | [`assets/js/main.js`](assets/js/main.js) 顶部的数组 |
| 每张卡片上显示的文字 | [`lang/zh.json`](lang/zh.json) + [`lang/en.json`](lang/en.json) |

卡片里的 `titleKey` / `descKey` 就是语言包中的键路径本身。只改一边，页面上就会直接显示键名（例如 `documents.item0.title`）。

六个数组的字段：

| 数组 | 字段 |
| --- | --- |
| `PROJECTS` | `img?` · `titleKey` · `descKey` · `tags`（纯数组或 `{ zh, en }`）· `links[]` |
| `DOCUMENTS` | `titleKey` · `descKey` · `links[]` |
| `VIDEOS` | `titleKey` · `descKey` · `platformKey` · `categoryKey?` · `links[]` |
| `TIMELINE_EVENTS` | 键前缀数组——`'timeline.event0'` 需要两个语言包里都有 `.date` / `.title` / `.desc` |
| `TECH_STACK` | `category`（语言包键）· `items[{ name \| nameKey, icon }]` |
| `CONTACT_LINKS` | `icon` 或 `img` · `key` · `link` |

几个有用的细节：

- `links[]` 里 `href` 为空字符串的项会被跳过，所以链接还没拿到时可以先把卡片放上去。
- `{ href, labelKey }` 复用公共文案（如 `projects.links.code`）；`{ href, label }` 直接写固定文字。
- 图标名到 [Font Awesome 6](https://fontawesome.com/search?o=r&m=free) 搜索（形如 `fab fa-github`）。FA 没有的品牌图标改用 `img:` 指向一个 SVG——小红书图标就是这么做的。
- 把数组清空，该栏目的 `empty` 提示会自动回来。
- `skills.hardware` 在两个语言包里都已存在，但 `TECH_STACK` 还没有用到它，需要加硬件分类时可以直接引用。

## 推送前自检

```bash
node tools/check_site.js       # 有问题时以退出码 1 结束
node tools/verify_render.js    # 33 项断言，失败时以退出码 1 结束
```

`check_site.js` 会检查：两个语言包是否为合法 JSON、键集合是否完全一致、`main.js` 引用的键是否都存在、封面图与 `index.html` 引用的资源是否有效、六个内容数组是否还在、以及是否残留模板作者信息。

`verify_render.js` 会在 Node 里搭一个最小 DOM，直接执行真实的 `i18n.js` 与 `main.js`，验证空状态提示、卡片渲染与中英文切换是否都正常。

## 风格分支

同一个站点有三套视觉风格，各自放在一个分支上。每个分支都自带 `assets/css/style.css`，并各自拥有完整的亮色与暗色配色。

| 分支 | 风格 | 亮色 | 暗色 |
| --- | --- | --- | --- |
| `main` | 终端 / 代码编辑器（**线上生效**） | `#f6f8fa` 底 / `#0969da` 主色 | `#0b0e14` 底 / `#58a6ff` 主色 |
| `variant-b` | 温润刊物 | `#f7f3ec` 暖白纸张 / `#9a5b33` 赭石 | `#1a1714` 暖黑 / `#d39a67` 浅赭 |
| `variant-c` | 霓虹潮玩 | `#fdf6e8` 奶油海报 / `#e0114b` 亮粉 | `#131313` 夜店霓虹 / `#ff4d7e` 荧光粉 |

让三个分支始终能顺利合并的约定是：**内容归 main，样式归各分支。** 除 `assets/css/style.css` 外，各分支的所有文件都与 main 逐字一致，因此同步时可以直接整文件覆盖，不会产生任何冲突。

```bash
# 在 main 上提交内容改动之后
python tools/sync_content.py                  # 先预览会改哪些文件（dry-run）
python tools/sync_content.py --apply          # 实际写入并提交
python tools/sync_content.py --apply --push   # 写入、提交并推送
python tools/verify_branches.py               # 确认差异只剩 style.css
```

想把另一套风格上线，把对应分支合并进 `main` 即可——合并只会带来 `style.css` 的变化。

## 部署

```bash
git add .
git commit -m "更新视频"
git push
```

GitHub Pages 会自动重建 `main`，通常一两分钟内生效，进度见仓库的 **Actions** 标签页。如果改动没出现，先按 <kbd>Ctrl</kbd>+<kbd>F5</kbd> 强制刷新，再怀疑是构建失败。

## 待办事项

- `videos.item1`、`videos.item2` 的 `href` 仍为空，B 站链接在 [`assets/js/main.js`](assets/js/main.js) 里标了 `TODO`。
- `projects.item1`（SkylandX C01 驱动）尚未公开，计划 10 月稳定性测试通过后开源。
- 头像已替换为真实照片（[`assets/images/avatar.jpg`](assets/images/avatar.jpg)），同时用作浏览器标签图标；旧的 `assets/images/avatar.svg` 占位图保留但已不再被引用。

## 鸣谢

感谢 [**Lain-Ego**](https://github.com/Lain-Ego0)：本站所基于的博客模板源自 Lain-Ego 的个人主页项目，
上文提到的几套视觉风格重写与内容配置方式，都是在它的基础上完成的。

