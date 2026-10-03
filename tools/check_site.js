/*
 * 站点自检脚本：在推送到 GitHub 之前跑一遍，能提前发现绝大多数低级错误。
 *
 * 用法（在站点根目录下执行）：
 *     node tools/check_site.js
 *
 * 检查内容：
 *   1. lang/*.json 是否为合法 JSON；
 *   2. 中英文语言包的键是否完全一致（一边漏写就会显示成键名）；
 *   3. main.js 里引用的 titleKey / descKey / category / contact key
 *      是否在两个语言包里都存在；
 *   4. PROJECTS 里引用的封面图是否真实存在；
 *   5. index.html 里的图片与脚本路径是否存在；
 *   6. 五个内容数组（PROJECTS / DOCUMENTS / VIDEOS / TIMELINE_EVENTS /
 *      TECH_STACK）是否仍然存在，避免误改结构；
 *   7. 是否还残留模板作者的个人信息。
 */
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..');
const problems = [];
const warnings = [];

function read(p) {
  return fs.readFileSync(path.join(SITE, p), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(SITE, rel));
}

// ---------- 1. 语言包 ----------
const LANGS = {};
for (const lang of ['zh', 'en']) {
  const rel = `lang/${lang}.json`;
  if (!exists(rel)) {
    problems.push(`缺少语言包：${rel}`);
    continue;
  }
  try {
    LANGS[lang] = JSON.parse(read(rel));
  } catch (err) {
    problems.push(`${rel} 不是合法 JSON：${err.message}`);
  }
}
if (!LANGS.zh || !LANGS.en) {
  console.error(problems.join('\n'));
  process.exit(1);
}

// ---------- 2. 两个语言包键是否一致 ----------
function flatten(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v, key));
    else out.push(key);
  }
  return out;
}
const zhKeys = new Set(flatten(LANGS.zh));
const enKeys = new Set(flatten(LANGS.en));
for (const k of zhKeys) if (!enKeys.has(k)) problems.push(`en.json 缺少键：${k}（zh.json 中有）`);
for (const k of enKeys) if (!zhKeys.has(k)) problems.push(`zh.json 缺少键：${k}（en.json 中有）`);

function hasKey(key) {
  return zhKeys.has(key) && enKeys.has(key);
}

// ---------- 3. main.js 中引用的键 ----------
const MAIN = 'assets/js/main.js';

/**
 * 去掉注释后再做静态分析，避免把注释里的示例（如 projects.item0.title）
 * 误报成“缺失的键”。会跳过字符串字面量，因此 // 和 /* 出现在字符串里不受影响。
 */
function stripComments(src) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') { out += next ?? ''; i += 2; continue; }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i += 1; continue; }
    if (c === '/' && next === '/') { while (i < src.length && src[i] !== '\n') i += 1; continue; }
    if (c === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

const mainSrc = stripComments(read(MAIN));

const keyLiterals = new Set();
for (const m of mainSrc.matchAll(/\b(titleKey|descKey|category|platform)\s*:\s*'([^']+)'/g)) {
  const [, field, value] = m;
  // platform 的值是平台名（Bilibili 等），不指向语言包，跳过
  if (field === 'platform') continue;
  keyLiterals.add(value);
}
for (const m of mainSrc.matchAll(/\{\s*icon:\s*'[^']*',\s*key:\s*'([^']+)'/g)) keyLiterals.add(m[1]);
for (const m of mainSrc.matchAll(/labelKey:\s*'([^']+)'/g)) keyLiterals.add(m[1]);
// TIMELINE_EVENTS 这类以字符串形式列出的键
for (const m of mainSrc.matchAll(/'(timeline\.[A-Za-z0-9_]+)'/g)) keyLiterals.add(m[1]);

// 结构校验：五个内容数组必须都还在，避免后续维护时误删
for (const name of ['PROJECTS', 'DOCUMENTS', 'VIDEOS', 'TIMELINE_EVENTS', 'TECH_STACK']) {
  if (!new RegExp(`const\\s+${name}\\s*=\\s*\\[`).test(mainSrc)) {
    problems.push(`${MAIN} 中找不到内容数组 ${name}，结构可能被误改`);
  }
}

for (const key of keyLiterals) {
  if (!hasKey(key)) {
    problems.push(`${MAIN} 引用了语言包中不存在的键：${key}`);
    continue;
  }
  // 时间轴事件必须同时具备 date / title / desc
  if (key.startsWith('timeline.') && !key.endsWith('.empty')) {
    for (const sub of ['date', 'title', 'desc']) {
      if (!hasKey(`${key}.${sub}`)) problems.push(`${MAIN} 的时间轴事件 ${key} 缺少 .${sub}`);
    }
  }
}

// ---------- 4. 项目封面图 ----------
for (const m of mainSrc.matchAll(/img:\s*'([^']+)'/g)) {
  if (!exists(m[1])) problems.push(`${MAIN} 引用的封面图不存在：${m[1]}`);
}

// ---------- 5. index.html 中的本地资源 ----------
const HTML = 'index.html';
const htmlSrc = read(HTML);
const localRefs = new Set();
for (const m of htmlSrc.matchAll(/(?:src|href)="((?!https?:|mailto:|#)[^"]+)"/g)) localRefs.add(m[1]);
for (const rel of localRefs) {
  if (!exists(rel)) problems.push(`${HTML} 引用的文件不存在：${rel}`);
}

// ---------- 6. 残留个人信息 / 占位符提醒 ----------
const PERSONAL = ['Lain-Ego', 'lain-ego', 'Ego0', 'lain@db', 'KKR'];
const filesToScan = ['index.html', MAIN, 'assets/js/i18n.js', 'lang/zh.json', 'lang/en.json', 'assets/css/style.css'];
for (const rel of filesToScan) {
  const src = read(rel);
  for (const token of PERSONAL) {
    if (src.includes(token)) problems.push(`${rel} 仍包含模板作者信息：${token}`);
  }
}

const PLACEHOLDERS = ['XXX', 'your-email@example.com', 'your-name'];
for (const rel of ['index.html', MAIN, 'lang/zh.json', 'lang/en.json']) {
  const src = read(rel);
  for (const token of PLACEHOLDERS) {
    if (src.includes(token)) warnings.push(`${rel} 仍是占位内容：${token}`);
  }
}

// ---------- 输出 ----------
console.log('='.repeat(58));
if (warnings.length) {
  console.log(`提醒（${warnings.length} 项，发布前记得替换）：`);
  for (const w of warnings) console.log('  ! ' + w);
  console.log('-'.repeat(58));
}
if (problems.length) {
  console.log(`发现 ${problems.length} 个问题：`);
  for (const p of problems) console.log('  x ' + p);
  console.log('='.repeat(58));
  process.exit(1);
}
console.log('检查通过：语言包键一致、引用路径有效、无模板作者残留信息。');
console.log('='.repeat(58));
