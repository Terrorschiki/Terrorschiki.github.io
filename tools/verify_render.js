/*
 * 渲染自检：在 Node 中搭建最小 DOM 环境，直接执行真实的
 * assets/js/i18n.js 与 assets/js/main.js，验证：
 *   1. 语言包能被正确解析与查键；
 *   2. 空数据时不报错，并正常显示 empty-state 提示；
 *   3. 填入示例数据后，项目/时间轴/技术栈能正常渲染成卡片。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE = path.resolve(__dirname, '..');
const LANGS = {};
for (const lang of ['zh', 'en']) {
  LANGS[lang] = JSON.parse(fs.readFileSync(path.join(SITE, 'lang', `${lang}.json`), 'utf8'));
}

class El {
  constructor(tag = 'div') {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.attributes = {};
    this.style = { setProperty() {}, };
    this.dataset = {};
    this._html = '';
    this._text = '';
    this.classList = { add() {}, remove() {}, contains: () => false };
  }
  set textContent(v) { this._text = String(v); }
  get textContent() { return this._text; }
  set innerHTML(v) { this._html = String(v); this.children = []; }
  get innerHTML() {
    return this._html + this._text + this.children.map((c) => c.outerHTML).join('');
  }
  get outerHTML() {
    const cls = this.className ? ` class="${this.className}"` : '';
    return `<${this.tagName.toLowerCase()}${cls}>${this.innerHTML}</${this.tagName.toLowerCase()}>`;
  }
  appendChild(c) { this.children.push(c); return c; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
  addEventListener() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const containers = {
  '.projects-grid': new El('div'),
  '.documents-grid': new El('div'),
  '.videos-grid': new El('div'),
  '.timeline-container': new El('div'),
  '.skills-wrapper': new El('div'),
  '.intro-contact-links': new El('div'),
  '.theme-toggle': new El('button'),
  '.lang-toggle': new El('button'),
};
const htmlEl = new El('html');
htmlEl.setAttribute('data-theme', 'light');

const document = {
  documentElement: htmlEl,
  querySelector: (sel) => containers[sel] || null,
  querySelectorAll: () => [],
  createElement: (tag) => new El(tag),
  addEventListener: () => {},
  getElementsByTagName: () => [],
};

const fetchStub = async (url) => {
  const m = String(url).match(/lang\/([a-z]{2})\.json/);
  const data = m ? LANGS[m[1]] : null;
  return { ok: Boolean(data), status: data ? 200 : 404, json: async () => data };
};

let i18nLoadedHandler = null;
let langChangedHandler = null;
const windowObj = {
  addEventListener: (type, fn) => {
    if (type === 'i18nLoaded') i18nLoadedHandler = fn;
    if (type === 'langChanged') langChangedHandler = fn;
  },
  matchMedia: () => ({ matches: false }),
  scrollTo: () => {},
  dispatchEvent: () => {},
};

const sandbox = {
  window: windowObj,
  document,
  localStorage: { store: {}, getItem(k) { return this.store[k] ?? null; }, setItem(k, v) { this.store[k] = String(v); } },
  fetch: fetchStub,
  console,
  setTimeout,
  Date,
  Event: class { constructor(t) { this.type = t; } },
  IntersectionObserver: undefined,
};
sandbox.window.i18n = undefined;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// i18n.js 会把 window.i18n 挂上（它引用的是 sandbox 内的 window）
vm.runInContext(fs.readFileSync(path.join(SITE, 'assets', 'js', 'i18n.js'), 'utf8'), sandbox, { filename: 'i18n.js' });

const results = [];
function check(name, cond, extra = '') {
  results.push({ name, pass: Boolean(cond), extra });
}

(async () => {
  await new Promise((r) => setTimeout(r, 120));

  // ---- 场景 A：使用仓库中真实的数据渲染（作品集内容已填入）----
  vm.runInContext(fs.readFileSync(path.join(SITE, 'assets', 'js', 'main.js'), 'utf8'), sandbox, { filename: 'main.js' });
  check('main.js 执行未抛错', true);
  check('window.i18n.get 可用', typeof sandbox.window.i18n?.get === 'function');
  check('i18nLoaded 回调已注册', typeof i18nLoadedHandler === 'function');

  sandbox.window.i18n.changeLang('zh');
  await new Promise((r) => setTimeout(r, 120));
  if (i18nLoadedHandler) i18nLoadedHandler();

  const docsHtml = containers['.documents-grid'].innerHTML;
  const videoHtml = containers['.videos-grid'].innerHTML;
  const projHtml = containers['.projects-grid'].innerHTML;
  const tlHtml = containers['.timeline-container'].innerHTML;
  const contactHtml = containers['.intro-contact-links'].innerHTML;

  // ---- 场景 A：使用仓库中真实的数据渲染（作品集内容已填入）----
  check('文章板块显示空提示', docsHtml.includes('文章整理中'), docsHtml.trim().slice(0, 80));
  check('文章板块没有残留卡片', !docsHtml.includes('project-card'));
  const videoCardCount = (videoHtml.match(/class="card project-card/g) || []).length;
  check('视频板块渲染 4 个视频卡片', videoCardCount === 4, `count=${videoCardCount}`);
  check('视频卡片带平台角标（中文语言包 → 哔哩哔哩）', videoHtml.includes('video-platform') && videoHtml.includes('哔哩哔哩'), videoHtml.trim().slice(0, 90));
  check('视频卡片带分类角标（设备评测 / 算法演示）', videoHtml.includes('video-category') && videoHtml.includes('设备评测') && videoHtml.includes('算法演示'));
  const watchBtnCount = (videoHtml.match(/class="project-action"/g) || []).length;
  check('未填链接的视频不渲染观看按钮', watchBtnCount === 2, `buttons=${watchBtnCount}`);
  check('小红书演示视频带跳转链接', videoHtml.includes('xiaohongshu.com/discovery/item/6a1d2262000000000803ec94'));
  const projCardCount = (projHtml.match(/class="card project-card/g) || []).length;
  check('项目板块渲染作品集项目（6 个）', projCardCount === 6, `count=${projCardCount}`);
  const tlItemCount = (tlHtml.match(/class="timeline-item"/g) || []).length;
  check('时间轴渲染经历条目（12 条）', tlItemCount === 12, `count=${tlItemCount}`);
  check('时间轴含日期与标题键值', tlHtml.includes('timeline-date') && tlHtml.includes('华南理工大学'), tlHtml.trim().slice(0, 80));
  check('时间轴已移除动漫社条目', !tlHtml.includes('动漫社') && !tlHtml.includes('Anime Club'));
  check('技术栈渲染正常', containers['.skills-wrapper'].innerHTML.includes('skill-badge'), containers['.skills-wrapper'].innerHTML.trim().slice(0, 60));
  check('联系方式保留邮箱+GitHub', contactHtml.includes('邮箱') && contactHtml.includes('代码仓库'), contactHtml.trim().slice(0, 120));
  check('联系方式已移除 playground', !contactHtml.includes('在线策略体验'));
  check('渲染结果包含外骨骼开源仓库链接', JSON.stringify(containers).includes('Lain-Ego0/G-Exo'));
  check('渲染结果不含项目残留图片', !JSON.stringify(containers).includes('assets/images/qxzn'));


  // ---- 场景 A2：英文模式下项目标签、技术栈分类名必须是纯英文 ----
  sandbox.window.i18n.changeLang('en');
  await new Promise((r) => setTimeout(r, 120));
  if (langChangedHandler) langChangedHandler();

  const projEn = containers['.projects-grid'].innerHTML;
  const skillsEn = containers['.skills-wrapper'].innerHTML;
  const tlEn = containers['.timeline-container'].innerHTML;

  check('英文项目标签已翻译（Navigation）', projEn.includes('Navigation'), projEn.trim().slice(0, 120));
  check('英文项目标签含 Reinforcement Learning', projEn.includes('Reinforcement Learning'));
  check('英文项目标签不再含中文', !/(强化学习|导航|驱动开发|IMU 标定|外骨骼|重定位|版本管理)/.test(projEn));
  check('英文技术栈分类为 Host Computer', skillsEn.includes('Host Computer'));
  check('技术栈含 X86 / RISC-V / ARM64', skillsEn.includes('X86') && skillsEn.includes('RISC-V') && skillsEn.includes('ARM64'));
  check('英文时间轴随语言切换', tlEn.includes('Physical AI Hackathon 2026') || tlEn.includes('South China University'), tlEn.trim().slice(0, 90));

  sandbox.window.i18n.changeLang('zh');
  await new Promise((r) => setTimeout(r, 120));
  if (langChangedHandler) langChangedHandler();
  const projZh = containers['.projects-grid'].innerHTML;
  check('切回中文后标签恢复中文（导航）', projZh.includes('导航'), projZh.trim().slice(0, 100));

  // ---- 场景 B：填入示例数据，确认卡片渲染路径正常 ----
  const patched = fs
    .readFileSync(path.join(SITE, 'assets', 'js', 'main.js'), 'utf8')
    .replace(
      'const PROJECTS = [',
      `const PROJECTS = [{ img: '', titleKey: 'documents.title', descKey: 'documents.empty', tags: ['TagA'], links: [{ href: 'https://example.com', labelKey: 'projects.links.code', icon: 'fab fa-github' }] },`,
    )
    .replace('const TIMELINE_EVENTS = [', `const TIMELINE_EVENTS = ['timeline.zzz',`)
    .replace(
      'const VIDEOS = [',
      `const VIDEOS = [{ titleKey: 'documents.title', descKey: 'documents.fixtureDesc', platform: 'Bilibili', links: [{ href: 'https://example.com', labelKey: 'projects.links.demo', icon: 'fab fa-bilibili' }] },`,
    )
    .replace(
      'const DOCUMENTS = [',
      `const DOCUMENTS = [{ titleKey: 'documents.title', descKey: 'documents.fixtureDesc', links: [{ href: 'https://example.com', labelKey: 'projects.links.zhihu', icon: 'fab fa-zhihu' }] },`,
    )
    .replace('const TECH_STACK = [', `const TECH_STACK = [{ category: 'skills.software', items: [{ nameKey: 'techStack.Python', icon: 'fab fa-python' }] },`);
  LANGS.zh.documents.fixtureDesc = '这是一段示例文章描述。';
  LANGS.en.documents.fixtureDesc = 'Sample article description.';
  LANGS.zh.techStack.Python = 'Python';
  LANGS.en.techStack.Python = 'Python';
  LANGS.zh.timeline.zzz = { date: '2026.01', title: '示例经历', desc: '示例描述' };
  LANGS.en.timeline.zzz = { date: '2026.01', title: 'Sample', desc: 'Sample desc' };

  for (const key of Object.keys(containers)) { containers[key].innerHTML = ''; containers[key].textContent = ''; }
  let handler2 = null;
  let langChanged2 = null;
  const sandbox2 = {
    document,
    localStorage: { store: {}, getItem(k) { return this.store[k] ?? null; }, setItem(k, v) { this.store[k] = String(v); } },
    fetch: fetchStub,
    console,
    setTimeout,
    Date,
    Event: class { constructor(t) { this.type = t; } },
    IntersectionObserver: undefined,
  };
  sandbox2.window = {
    addEventListener: (type, fn) => {
      if (type === 'i18nLoaded') handler2 = fn;
      if (type === 'langChanged') langChanged2 = fn;
    },
    matchMedia: () => ({ matches: false }),
    scrollTo: () => {},
    dispatchEvent: () => {},
  };
  sandbox2.globalThis = sandbox2;
  vm.createContext(sandbox2);
  vm.runInContext(fs.readFileSync(path.join(SITE, 'assets', 'js', 'i18n.js'), 'utf8'), sandbox2, { filename: 'i18n.js' });
  vm.runInContext(patched, sandbox2, { filename: 'main.patched.js' });
  await new Promise((r) => setTimeout(r, 120));
  sandbox2.window.i18n.changeLang('zh');
  await new Promise((r) => setTimeout(r, 120));
  if (handler2) handler2();

  const d2 = containers['.documents-grid'].innerHTML;
  const v2 = containers['.videos-grid'].innerHTML;
  const p2 = containers['.projects-grid'].innerHTML;
  const t2 = containers['.timeline-container'].innerHTML;
  const s2 = containers['.skills-wrapper'].innerHTML;

  if (process.env.DEBUG_SCENARIO_B) {
    console.log('--- DEBUG handler2 registered:', typeof handler2);
    console.log('--- DOCUMENTS grid ---\n' + d2);
    console.log('--- PROJECTS grid ---\n' + p2);
    console.log('--- TIMELINE ---\n' + t2);
  }

  check('[示例数据] 文章卡片渲染成功', d2.includes('project-card') && d2.includes('知乎文章'), d2.trim().slice(0, 100));
  check('[示例数据] 文章卡片不再显示空提示', !d2.includes('文章整理中'));
  check('[示例数据] 视频卡片渲染成功', v2.includes('project-card') && v2.includes('video-platform') && v2.includes('Bilibili') && v2.includes('演示视频'), v2.trim().slice(0, 110));
  check('[示例数据] 视频卡片不再显示空提示', !v2.includes('VIDEOS'));
  check('[示例数据] 项目卡片渲染成功', p2.includes('project-card') && p2.includes('TagA') && p2.includes('代码仓库'));
  check('[示例数据] 时间轴事件渲染成功', t2.includes('timeline-item') && t2.includes('示例经历') && t2.includes('2026.01'));
  check('[示例数据] 技术栈渲染成功', s2.includes('skill-badge') && s2.includes('Python') && s2.includes('开发工具链'));

  let failed = 0;
  for (const r of results) {
    if (!r.pass) failed += 1;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.extra ? `   <- ${r.extra}` : ''}`);
  }
  console.log('-'.repeat(60));
  console.log(failed === 0 ? `全部通过 (${results.length} 项)` : `失败 ${failed} / ${results.length} 项`);
  process.exit(failed === 0 ? 0 : 1);
})();
