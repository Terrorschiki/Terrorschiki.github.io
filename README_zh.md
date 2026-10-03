# Terrorschiki 个人博客

[English](README.md) | [中文](README_zh.md)

一个纯静态的个人主页 / 博客模板：只有 HTML、CSS 和原生 JavaScript，**不需要 Node.js、不需要构建、不需要后端**，推送到 GitHub Pages 就能直接访问。

- 支持中文 / English 一键切换
- 支持亮色 / 暗色主题
- 响应式布局，适配手机与桌面
- 六个并列栏目：**项目合集 / 文章 / 自媒体视频 / 经历时间轴 / 技术栈 / 联系方式**
- 轻量的活力化动效（背景光斑、头像光环、Logo 打字机、卡片悬浮），并自动尊重系统「减少动态效果」设置
- 所有内容都在两个文件里维护：`assets/js/main.js` 和 `lang/*.json`

> **当前状态：所有示例内容已清空，等待填入你自己的内容。**
> 页面上的 `your-email@example.com` 等占位符，请替换成你自己的信息。
> 详细步骤见下面的「[如何添加你自己的内容](#三如何添加你自己的内容)」。

---

## 目录

- [一、先说结论：仓库该怎么命名](#一先说结论仓库该怎么命名)
- [二、本地预览](#二本地预览)
- [三、如何添加你自己的内容](#三如何添加你自己的内容)
  - [1. 修改站点标题与浏览器标签](#1-修改站点标题与浏览器标签)
  - [2. 替换头像](#2-替换头像)
  - [3. 写第一篇文章](#3-写第一篇文章)
  - [4. 添加自媒体账号视频](#4-添加自媒体账号视频)
  - [5. 添加项目](#5-添加项目)
  - [6. 添加经历时间轴](#6-添加经历时间轴)
  - [7. 添加技术栈](#7-添加技术栈)
  - [8. 修改联系方式](#8-修改联系方式)
  - [9. 改配色](#9-改配色)
- [四、部署到 GitHub Pages](#四部署到-github-pages)
- [五、绑定自己的域名（可选）](#五绑定自己的域名可选)
- [六、目录结构](#六目录结构)
- [七、推送前的自检脚本](#七推送前的自检脚本)
- [八、多套风格分支：内容同步](#八多套风格分支内容同步)
- [八、常见问题](#八常见问题)

---

## 一、先说结论：仓库该怎么命名

你已经有了一个 GitHub 组织（organization），那么命名规则只有一条：

> **想要地址是 `https://<你的组织名>.github.io/`，仓库就必须叫 `<你的组织名>.github.io`。**

这是 GitHub 官方的硬性规则：用户/组织站点的源文件必须放在名为 `<owner>.github.io` 的仓库里，而且**每个账号最多只能有一个这样的站点**（见 [GitHub 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)）。

假设你的组织叫 `myblog-org`：

| 仓库名 | 访问地址 | 建议 |
| --- | --- | --- |
| `myblog-org.github.io` | `https://myblog-org.github.io/` | ✅ **推荐**，个人博客用这个 |
| `blog` | `https://myblog-org.github.io/blog/` | ⚠️ 属于项目站点，地址多一层，日后易踩坑 |
| `homepage` | `https://myblog-org.github.io/homepage/` | ⚠️ 同上 |

**为什么推荐第一种？** 本模板内部全部使用**相对路径**（例如 `assets/css/style.css`、`lang/zh.json`）。放在根域名下相对路径天然正确；如果部署在子目录，将来一旦加入任何以 `/` 开头的绝对路径（或改用自定义域名）就容易出现资源 404。放在根域名最省心。

> 补充说明：若你的组织名同时也是用户名，仓库名用 `<用户名>.github.io` 同样可以。既然你打算用组织托管，直接用**组织名 + `.github.io`** 最直观。

---

## 二、本地预览

语言包是通过 `fetch` 加载的，**直接双击 `index.html` 会看不到内容**，必须用本地静态服务器打开。

在本目录下任选一条命令：

```bash
# Python 3（最省事）
python -m http.server 8080

# Node.js
npx serve .

# 或者用 VS Code 的 Live Server 插件：右键 index.html → Open with Live Server
```

然后浏览器打开 <http://localhost:8080>。

---

## 三、如何添加你自己的内容

内容分两个地方存放，记住这个对应关系就不会乱：

| 你要改的东西 | 文件 | 说明 |
| --- | --- | --- |
| **有哪些内容、顺序、图片、链接** | `assets/js/main.js` | 顶部的 6 个数组 |
| **每张卡片上显示的文字** | `lang/zh.json`、`lang/en.json` | 用 `.` 分层的文案键 |

> `main.js` 里的 `titleKey` / `descKey` 就是语言包里的键名。**两边必须同时改，键名必须完全一致**，否则页面上会显示键名本身（例如 `documents.item0.title`）。

### 1. 修改站点标题与浏览器标签

打开 `index.html`，修改这几行：

```html
<meta name="description" content="我的个人主页：项目、文章与经历。">
<link rel="icon" href="assets/images/avatar.svg" type="image/svg+xml">
<title>My Homepage</title>
```

`<title>` 是浏览器标签页上显示的文字，建议改成「你的名字 | 个人博客」。

顶部导航栏 Logo 是终端风格的文字，在 `index.html` 里找到 `terminal-user` 修改（当前是 `me@blog`）：

```html
<span class="terminal-user">me@blog</span>
```

再修改自我介绍和页脚，分别位于 `lang/zh.json` 与 `lang/en.json`：

```json
"intro": {
  "title": "你好，我是 XXX",
  "desc": "一句话介绍你自己……"
},
"footer": {
  "copyright": "© 2026 XXX | 个人主页"
}
```

### 2. 替换头像

把你自己的头像图片放进 `assets/images/`（例如 `avatar.jpg`），然后修改 `index.html`：

```html
<img src="assets/images/avatar.jpg" alt="Avatar" class="avatar" data-i18n="intro.avatarAlt">
```

同时把上面 `<link rel="icon">` 的 `href` 也改成同一张图（用 `.jpg` 时请把 `type` 改为 `image/jpeg`）。

> 当前使用的 `assets/images/avatar.svg` 是一个中性的占位头像，替换后可以直接删除它。

### 3. 写第一篇文章

这是你最关心的部分。文章卡片配置在 `assets/js/main.js` 的 `DOCUMENTS` 数组里。

**做法 A：文章放在知乎 / 掘金 / CSDN 等平台，这里只放卡片和跳转链接（推荐，最省事）**

第 1 步，编辑 `assets/js/main.js` 的 `DOCUMENTS`：

```js
const DOCUMENTS = [
  {
    titleKey: 'documents.item0.title',
    descKey: 'documents.item0.desc',
    links: [
      { href: 'https://zhuanlan.zhihu.com/p/123456789', labelKey: 'projects.links.zhihu', icon: 'fab fa-zhihu' },
    ],
  },
];
```

第 2 步，编辑 `lang/zh.json` 的 `documents` 段：

```json
"documents": {
  "title": "文章",
  "empty": "文章整理中，敬请期待。",
  "item0": {
    "title": "我的第一篇文章",
    "desc": "这篇文章讲的是……"
  }
}
```

第 3 步，编辑 `lang/en.json` 的 `documents` 段（英文版）：

```json
"documents": {
  "title": "Articles",
  "empty": "Articles are being organized. Stay tuned.",
  "item0": {
    "title": "My First Post",
    "desc": "This post is about ..."
  }
}
```

保存后刷新页面，「文章」区域就会出现一张卡片。

> `"empty"` 那一行可以保留：**只要 `DOCUMENTS` 数组里有内容，「文章整理中，敬请期待」就会自动消失**，不会重复显示。

**做法 B：文章就是本站的一个页面（想完全自己写文章时）**

1. 新建 HTML 文件，例如 `posts/hello-world.html`，复制 `index.html` 的 `<head>` 部分以保持样式一致，正文自己写；
2. 在 `DOCUMENTS` 中把链接改成站内相对路径：

```js
links: [{ href: 'posts/hello-world.html', label: '阅读全文', icon: 'fas fa-book-open' }],
```

> 站内链接用相对路径（`posts/hello-world.html`），外链用完整地址（`https://...`）。

### 4. 添加自媒体账号视频

「自媒体视频」栏目用来展示你在 B 站 / 抖音 / YouTube / 小红书 等平台发布的内容。**静态站点不存放视频文件本身**，卡片点击后跳转到对应平台观看，所以和文章一样只维护一个数组。

第 1 步，编辑 `assets/js/main.js` 的 `VIDEOS`：

```js
const VIDEOS = [
  {
    titleKey: 'videos.item0.title',
    descKey: 'videos.item0.desc',
    platform: 'Bilibili',          // 可选，显示成卡片上的平台角标
    links: [
      { href: 'https://www.bilibili.com/video/BV1xxxxxxxxx', labelKey: 'projects.links.demo', icon: 'fab fa-bilibili' },
    ],
  },
];
```

第 2 步，在 `lang/zh.json` 与 `lang/en.json` 里补上文案：

```json
"videos": {
  "title": "自媒体视频",
  "hint": "B 站 / 抖音 / YouTube 等平台的内容更新",
  "empty": "视频正在路上～",
  "item0": {
    "title": "我的第一个视频",
    "desc": "这期视频讲了什么内容。"
  }
}
```

- `platform` 字段可以省略，省略后卡片上就不显示角标。
- 一个视频有多个平台版本时，在 `links` 里写多项即可（例如同时给 B 站和 YouTube 两个按钮）。
- 常用图标：`fab fa-bilibili`、`fab fa-youtube`、`fab fa-tiktok`、`fab fa-xiaohongshu`（小红书若无图标可用 `fas fa-book-heart`）。
- 空数组时栏目显示「视频正在路上～」提示，加入第一个视频后自动消失。
- 视频卡片在宽屏下**自动排成两列**，窄屏自动变成单列，不需要手动调整。

### 5. 添加项目

同样是两步。先编辑 `PROJECTS`：

```js
const PROJECTS = [
  {
    img: 'assets/images/my-project.png',   // 封面图；不需要图片可以删掉这一行
    titleKey: 'projects.item0.title',
    descKey: 'projects.item0.desc',
    tags: ['Python', 'Open Source'],       // 标签直接写文字，会渲染成小色块
    links: [
      { href: 'https://github.com/your-name/your-repo', labelKey: 'projects.links.code', icon: 'fab fa-github' },
    ],
  },
];
```

再到 `lang/zh.json` / `lang/en.json` 里补上对应的键：

```json
"projects": {
  "title": "项目合集",
  "imgAlt": "项目图片",
  "empty": "这里还没有内容。",
  "links": { "...": "保持不变" },
  "item0": {
    "title": "我的项目",
    "desc": "这个项目做了什么，用了什么技术，达到了什么效果。"
  }
}
```

- 封面图放进 `assets/images/`；**不加 `img` 字段就是纯文字卡片**，会自动切换成紧凑布局，效果同样好看。
- `links` 里的 `labelKey` 可复用模板自带标签（`projects.links.code` / `docs` / `demo` / `website` / `zhihu` 等）；想显示别的文字就直接写 `label: '自定义文字'`。
- 图标名到 [Font Awesome 6](https://fontawesome.com/search?o=r&m=free) 搜索，复制形如 `fab fa-github` 的名字即可。

### 6. 添加经历时间轴

`TIMELINE_EVENTS` 是一个字符串数组，**数组顺序就是页面显示顺序**（建议新的在上面）：

```js
const TIMELINE_EVENTS = [
  'timeline.event0',
  'timeline.event1',
];
```

再在语言包里写出对应内容：

```json
"timeline": {
  "title": "经历时间轴",
  "empty": "这里还没有内容。",
  "event0": {
    "date": "2026.03 - 至今",
    "title": "在某公司实习",
    "desc": "负责了什么，取得了什么结果。"
  }
}
```

### 7. 添加技术栈

`TECH_STACK` 按分类组织，每个技能项包含名称和图标：

```js
const TECH_STACK = [
  {
    category: 'skills.software',        // 分类标题取语言包里的键
    items: [
      { name: 'Python', icon: 'fab fa-python' },
      { name: 'Git', icon: 'fab fa-git-alt' },
    ],
  },
];
```

模板自带 5 个分类标题，都写在语言包里：`skills.embedded`、`skills.robotics`、`skills.simulation`、`skills.software`、`skills.hardware`。想加新分类，就在 `lang/*.json` 的 `skills` 里加一个键，并在 `TECH_STACK` 中引用它。

### 8. 修改联系方式

`CONTACT_LINKS` 决定头像下方那一排入口按钮，**现在只保留了邮箱和 GitHub**，其余的都写成了注释，取消注释并改成你自己的地址即可：

```js
const CONTACT_LINKS = [
  { icon: 'fas fa-envelope', key: 'contact.email', link: 'mailto:you@example.com' },
  { icon: 'fab fa-github', key: 'contact.github', link: 'https://github.com/你的用户名' },
  // { icon: 'fab fa-bilibili', key: 'contact.bilibili', link: 'https://space.bilibili.com/xxxxx' },
  // { icon: 'fab fa-zhihu', key: 'contact.zhihu', link: 'https://www.zhihu.com/people/xxxxx' },
];
```

按钮文字来自语言包的 `contact.*`，已有：`email`、`github`、`bilibili`、`twitter`、`zhihu`。

### 9. 改配色

打开 `assets/css/style.css`，最上方的 `:root`（亮色）与 `[data-theme="dark"]`（暗色）集中定义了所有颜色：

```css
:root {
  --primary: #0078d4;      /* 主色：按钮、日期、标签、链接 */
  --bg-body: #f3f3f3;      /* 页面背景 */
  --bg-card: #ffffff;      /* 卡片背景 */
  --text-main: #1f1f1f;    /* 正文颜色 */
  --text-muted: #616161;   /* 次要文字 */
}
```

改这几个变量就能整站换肤。**改了亮色记得同步改暗色那一组**，否则暗色模式下会不协调。

---

## 四、部署到 GitHub Pages

### 1. 在 GitHub 上创建仓库

在你的组织下新建仓库（New repository）：

- **Repository name**：`<你的组织名>.github.io`（例如组织是 `myblog-org`，就填 `myblog-org.github.io`）
- **Visibility**：选 **Public**
  - 免费账号的 Pages 只支持公开仓库；私有仓库需要 GitHub Pro / Team 及以上。
- **Initialize this repository** 那一栏**什么都不要勾**（不要 README、不要 .gitignore、不要 license），因为我们要推送上本地已有的文件。

### 2. 在本地把文件推上去

先确认 `index.html` 就在你准备提交的那个目录的**最外层**（仓库根目录必须是 `index.html`，不能是 `我的博客/index.html` 这种多一层）。

```bash
# 进入站点目录（就是包含 index.html 的这一层）
git init
git add .
git commit -m "初始化个人博客"
git branch -M main
git remote add origin https://github.com/<你的组织名>/<你的组织名>.github.io.git
git push -u origin main
```

### 3. 打开 Pages

仓库页面 → **Settings** → 左侧 **Pages** → **Build and deployment**：

- **Source**：选 `Deploy from a branch`
- **Branch**：选 `main`，目录选 `/ (root)`，点 **Save**

等 1–3 分钟（第一次可能更久），访问：

```text
https://<你的组织名>.github.io/
```

> 如果访问返回 404，先刷新等待，再检查：仓库名是否严格等于 `<组织名>.github.io`、`index.html` 是否在根目录、Pages 页面是否显示「Your site is live at ...」。

### 4. 以后更新文章

每次改完内容，三条命令即可上线：

```bash
git add .
git commit -m "新增一篇文章"
git push
```

Pages 会自动重新构建，通常一两分钟后生效。

> **如果线上内容没变，多半是浏览器缓存。** 按 `Ctrl + F5`（Mac 是 `Cmd + Shift + R`）强制刷新。

---

## 五、绑定自己的域名（可选）

1. 在域名服务商处添加解析：`CNAME` 记录指向 `<你的组织名>.github.io`；
2. 仓库 **Settings → Pages → Custom domain** 填入你的域名并保存；
3. 勾选 **Enforce HTTPS**（证书签发可能需要几分钟到几小时）；
4. 建议同时在仓库根目录放一个 `CNAME` 文件，内容只有一行你的域名，避免后续部署丢失配置。

---

## 六、目录结构

```text
.
├── index.html                  # 单页入口（页面骨架）
├── assets/
│   ├── css/
│   │   └── style.css           # 全部样式：配色变量、布局、组件、响应式
│   ├── js/
│   │   ├── i18n.js             # 读取 lang/*.json，负责中英文切换
│   │   └── main.js             # ★ 内容配置区：6 个数组都在这里
│   └── images/
│       └── avatar.svg          # 占位头像，替换成你自己的照片后可删除
├── lang/
│   ├── zh.json                 # ★ 中文文案
│   └── en.json                 # ★ 英文文案
├── tools/                      # 本地自检脚本（不影响网站，见下一节）
│   ├── check_site.js           # 检查语言包键、图片路径、占位符
│   └── verify_render.js        # 模拟浏览器渲染，确认页面能正常出内容
└── README.md
```

**你日常只会改这三个地方：** `assets/js/main.js`、`lang/zh.json`、`lang/en.json`。

---

## 七、推送前的自检脚本

改完内容后，**在站点根目录**运行一次（需要电脑上装有 Node.js）：

```bash
node tools/check_site.js
```

它会帮你检查：

- `lang/*.json` 是否为合法 JSON（专治「多了一个逗号」）；
- **中英文语言包的键是否一致**（一边漏写是最常见的错误）；
- `main.js` 里引用的 `titleKey` / `descKey` / `category` / 联系方式键是否都存在于两个语言包中；
- 项目封面图、`index.html` 里引用的图片和脚本是否真实存在；
- 是否还残留模板作者的个人信息；
- 还有哪些 `XXX` 占位符没替换（只是提醒，不算错误）。

输出示例：

```text
==========================================================
提醒（5 项，发布前记得替换）：
  ! lang/zh.json 仍是占位内容：XXX
----------------------------------------------------------
检查通过：语言包键一致、引用路径有效、无模板作者残留信息。
==========================================================
```

发现问题时脚本会以退出码 1 结束并逐条列出，修好再推送即可。

想更彻底地确认页面真的能渲染出内容，还可以运行：

```bash
node tools/verify_render.js
```

它会模拟浏览器的 DOM 环境执行真实的 `i18n.js` 与 `main.js`，验证空板块提示、卡片渲染、中英文切换是否都正常。

---

## 八、多套风格分支：内容同步

仓库里同时存在多套视觉风格，分别放在不同分支。**每套风格都自带亮色与暗色两套完整配色**，右上角的主题按钮在三个分支上都可用。

| 分支 | 风格 | 亮色 | 暗色 |
| --- | --- | --- | --- |
| `main` | 终端编辑器（**线上生效**） | 浅色代码编辑器：`#f6f8fa` 底 / 深蓝主色 | 深夜编辑器：`#0b0e14` 底 / 亮蓝主色 |
| `variant-b` | 温润刊物 | 暖白纸张：`#f7f3ec` / 赭石主色 | 暖黑：`#1a1714` / 浅赭主色 |
| `variant-c` | 霓虹潮玩 | 奶油海报：`#fdf6e8` / 亮粉主色 | 夜店霓虹：`#131313` / 荧光粉 + 浅色描边 |

> 暗色并非简单反色。粗野主义方案在暗色下把**描边与硬阴影改用浅色**（否则黑描边会糊进背景）；
> 刊物方案保留纸质气质、改用暖黑；编辑器方案的浅色模式则是完整的 VS Code Light+ 配色。

### 核心约定：内容归 main，样式归各分支

这是整套机制能成立的关键：

- **内容**（`index.html`、`lang/*.json`、`assets/js/*`、`assets/images/*`、`tools/*`、README）
  以 **main 为唯一真源**；
- **样式**只有 `assets/css/style.css` 一个文件，是**各分支自己的**，永远不会被覆盖。

因此各分支的 `index.html` 与 main **逐字一致**，同步时直接整文件覆盖即可，**不会产生任何合并冲突**。
主题也不再写死在 HTML 里，而是由各分支的样式表决定（`variant-b`/`variant-c` 的样式表把主题按钮隐藏并锁定观感）。

### 改内容的标准流程

**只改 main，不要直接改风格分支。** 改完推送后运行同步脚本：

```bash
# 1. 在 main 上改内容并推送
git checkout main
#   ... 编辑 lang/zh.json、assets/js/main.js 等 ...
git add . && git commit -m "新增一篇文章" && git push

# 2. 同步到各风格分支
python tools/sync_content.py                 # 先预览会改哪些文件（dry-run）
python tools/sync_content.py --apply         # 实际写入并提交
python tools/sync_content.py --apply --push  # 写入、提交并推送
```

脚本会：只覆盖内容文件 → 提交 → 校验 `style.css` 确实没被动过 → （可选）推送。
`--branches variant-b` 可只同步指定分支。

### 校验：内容是否真的一致

```bash
python tools/verify_branches.py
```

输出会逐项列出：各分支 12 个内容文件是否与 main 逐字一致、各分支样式是否各自独立、
以及**差异文件清单是否只剩 `assets/css/style.css`**。

### 新增内容文件时

如果你新增了一个需要各分支共享的文件，把它加进 `tools/sync_content.py` 的
`CONTENT_FILES`（单文件）或 `CONTENT_DIRS`（整个目录，`assets/images`、`tools` 已在其中）。
**千万不要把 `assets/css/style.css` 加进去**，它是各分支的样式本体。

### 切换线上风格

GitHub Pages 只服务 `main`。想把某套风格上线：

```bash
git checkout main
git merge variant-b     # 或 variant-c
git push
```

合并只会带来 `style.css` 的变化，不会碰内容。

---

## 九、常见问题

**Q：页面空白，或者标题显示成 `documents.item0.title` 这样的键名？**
语言包里缺少这个键，或者键名拼错了。检查 `lang/zh.json` 与 `lang/en.json` 是否都有对应的键，注意大小写与层级完全一致。

**Q：语言切换、内容都不显示？**
你可能直接双击打开了 `index.html`。`fetch` 加载 JSON 需要 HTTP 环境，请用第 [二](#二本地预览) 节的本地服务器方式打开。

**Q：「文章整理中，敬请期待」怎么去掉？**
往 `DOCUMENTS` 数组里加第一篇文章就会自动消失。如果想连整个板块一起隐藏：删掉 `index.html` 中 `id="documents"` 的整个 `<section>`，并删掉导航栏里 `href="#documents"` 的那个 `<a>`。

**Q：自媒体视频栏目可以直接放视频文件吗？**
不建议。静态站点托管视频会很快超出 GitHub Pages 的流量与仓库体积限制。把视频发到 B 站 / 抖音 / YouTube，然后用 `VIDEOS` 数组做卡片跳转即可（这也是模板的默认做法）。

**Q：视频栏目的卡片为什么有时是两列、有时是一列？**
这是自适应网格（`auto-fit` + `minmax(320px, 1fr)`）：容器够宽就两列，窄屏自动变单列，不需要手动配置。

**Q：改了文件但页面没变化？**
本地是浏览器缓存，按 `Ctrl + F5` 强制刷新；线上则等 Pages 构建完成（仓库 **Actions** 页面能看到进度）。

**Q：中文、Emoji 会不会出问题？**
不会。所有文件都是 UTF-8 编码，JSON 里的中文正常写即可。

**Q：JSON 写错了怎么发现？**
最常见的错误是**多了一个逗号**：每项之间用逗号，但**最后一项后面不能有逗号**。可以用在线 JSON 校验工具粘贴检查，或打开浏览器 F12 控制台，会看到 `[i18n] Load failed` 之类的报错。

**Q：这个模板可以商用吗？**
模板本身是通用前端代码。但你替换进去的图片、字体、图标等第三方资源需自行确认授权，Font Awesome 免费版有其自己的许可条款。

---

祝你写作愉快 🎉 有内容之后再逐步把 `XXX` 换成你自己的名字就好。
