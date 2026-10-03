(function () {
  // ===========================================================
  //  个人内容配置区 —— 你只需要修改下面这几个数组
  // ===========================================================
  //
  //  数据来源说明：
  //    1. 这里的数组决定「有哪些卡片 / 事件」以及「顺序、图片、标签、链接」；
  //    2. 卡片上的文字（标题、描述）放在 lang/zh.json 与 lang/en.json 里；
  //    3. 数组里的 titleKey / descKey 就是语言包中的键名，两边必须一一对应。
  //
  //  字段速查：
  //    PROJECTS      img(封面图,可省略) / titleKey / descKey / tags[] / links[]
  //    DOCUMENTS     titleKey / descKey / links[]
  //    TIMELINE_EVENTS  ['timeline.eventX', ...]  顺序即展示顺序（新→旧）
  //    TECH_STACK    category(语言包键) / items[{ name, icon }]
  //    CONTACT_LINKS icon / key(语言包键) / link
  //
  //  links[] 中的每一项：
  //    { href: 'https://...', labelKey: 'projects.links.code', icon: 'fab fa-github' }
  //    也可以用固定文字：{ href: 'https://...', label: 'README', icon: 'fas fa-book' }
  //
  //  图标名称请到 Font Awesome 6 图标库查询：
  //    https://fontawesome.com/search?o=r&m=free
  // ===========================================================

  // ---------- 1. 项目卡片 ----------
  const PROJECTS = [
    // 示例（复制后修改，并记得在语言包补上 projects.itemN.title / .desc）：
    // {
    //   img: 'assets/images/my-project-cover.png',
    //   titleKey: 'projects.item0.title',
    //   descKey: 'projects.item0.desc',
    //   tags: ['Python', 'Open Source'],
    //   links: [
    //     { href: 'https://github.com/your-name/your-repo', labelKey: 'projects.links.code', icon: 'fab fa-github' },
    //   ],
    // },
  ];

  // ---------- 2. 文章 / 文档卡片 ----------
  const DOCUMENTS = [
    // 示例：
    // {
    //   titleKey: 'documents.item0.title',
    //   descKey: 'documents.item0.desc',
    //   links: [
    //     { href: 'https://zhuanlan.zhihu.com/p/xxxxxxx', labelKey: 'projects.links.zhihu', icon: 'fab fa-zhihu' },
    //   ],
    // },
  ];

  // ---------- 3. 时间轴（数组顺序 = 页面展示顺序）----------
  const TIMELINE_EVENTS = [
    // 示例（语言包中需存在 timeline.event0.date / .title / .desc）：
    // 'timeline.event0',
    // 'timeline.event1',
  ];

  // ---------- 4. 技术栈 ----------
  const TECH_STACK = [
    // 示例：
    // {
    //   category: 'skills.software',
    //   items: [
    //     { name: 'Python', icon: 'fab fa-python' },
    //     { name: 'Git', icon: 'fab fa-git-alt' },
    //   ],
    // },
  ];

  // ---------- 5. 联系方式（Hero 区域下方的入口）----------
  const CONTACT_LINKS = [
    { icon: 'fas fa-envelope', key: 'contact.email', link: 'mailto:your-email@example.com' },
    { icon: 'fab fa-github', key: 'contact.github', link: 'https://github.com/your-name' },
    // { icon: 'fab fa-bilibili', key: 'contact.bilibili', link: 'https://space.bilibili.com/xxxxx' },
    // { icon: 'fab fa-zhihu', key: 'contact.zhihu', link: 'https://www.zhihu.com/people/xxxxx' },
    // { icon: 'fab fa-twitter', key: 'contact.twitter', link: 'https://x.com/xxxxx' },
  ];

  // ===========================================================
  //  以下为渲染逻辑，通常不需要改动
  // ===========================================================

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function clear(el) {
    if (!el) return;
    el.innerHTML = '';
  }

  function t(key) {
    return window.i18n?.get ? window.i18n.get(key) : key;
  }

  function renderSpanTags(tags, className) {
    if (!Array.isArray(tags)) return '';
    return tags.map((tag) => `<span class="${className}">${tag}</span>`).join('');
  }

  function renderProjectTags(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return '';
    return `<div class="project-tags">${renderSpanTags(tags, 'project-tag')}</div>`;
  }

  function renderProjectActions(links) {
    if (!Array.isArray(links) || links.length === 0) return '';

    const items = links
      .filter((link) => link.href)
      .map((link) => {
        const label = link.labelKey ? t(link.labelKey) : link.label;
        const icon = link.icon || 'fas fa-arrow-up-right-from-square';

        return `
          <a href="${link.href}" target="_blank" rel="noopener noreferrer" class="project-action" aria-label="${label}">
            <i class="${icon}"></i>
            <span>${label}</span>
          </a>
        `;
      })
      .join('');

    return items ? `<div class="project-actions">${items}</div>` : '';
  }

  /**
   * 板块为空时显示友好提示，填入内容后自动消失。
   */
  function renderEmptyState(container, messageKey) {
    const message = t(messageKey);
    if (!message || message === messageKey) return;

    const hint = document.createElement('p');
    hint.className = 'empty-state';
    hint.textContent = message;
    container.appendChild(hint);
  }

  function initThemeToggle() {
    const toggleBtn = qs('.theme-toggle');
    const htmlEl = document.documentElement;
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem('theme') || htmlEl.getAttribute('data-theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);

    toggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      console.log(`[Theme] Switched to ${newTheme}`);
    });
  }

  function initLangToggle() {
    const toggleBtn = qs('.lang-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const current = window.i18n.currentLang();
      const next = current === 'en' ? 'zh' : 'en';
      console.log(`[Lang] Switching to ${next}...`);
      window.i18n.changeLang(next);
    });
  }

  function initProjects() {
    const grid = qs('.projects-grid');
    if (!grid) return;
    clear(grid);

    if (PROJECTS.length === 0) {
      renderEmptyState(grid, 'projects.empty');
      return;
    }

    PROJECTS.forEach((project) => {
      const tagsHtml = renderProjectTags(project.tags);
      const actionsHtml = renderProjectActions(project.links);
      const hasThumbnail = Boolean(project.img);
      const thumbnailHtml = project.img
        ? `
        <div class="project-thumbnail-wrapper">
          <img src="${project.img}" alt="${t('projects.imgAlt')}" class="project-thumbnail${project.imageFit === 'cover' ? ' project-thumbnail--cover' : ''}">
        </div>
      `
        : '';
      const metaHtml = hasThumbnail
        ? `${tagsHtml}${actionsHtml}`
        : `<div class="project-meta-row">${tagsHtml}${actionsHtml}</div>`;

      const card = document.createElement('div');
      card.className = hasThumbnail ? 'card project-card' : 'card project-card project-card--text-only';
      card.innerHTML = `
        ${thumbnailHtml}
        <div class="project-info">
          <h3>${t(project.titleKey)}</h3>
          <p>${t(project.descKey)}</p>
          ${metaHtml}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function initDocuments() {
    const grid = qs('.documents-grid');
    if (!grid) return;
    clear(grid);

    if (DOCUMENTS.length === 0) {
      renderEmptyState(grid, 'documents.empty');
      return;
    }

    DOCUMENTS.forEach((doc) => {
      const actionsHtml = renderProjectActions(doc.links);

      const card = document.createElement('div');
      card.className = 'card project-card project-card--text-only';
      card.innerHTML = `
        <div class="project-info">
          <h3>${t(doc.titleKey)}</h3>
          <p>${t(doc.descKey)}</p>
          <div class="project-meta-row">
            ${actionsHtml}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function initTimeline() {
    const container = qs('.timeline-container');
    if (!container) return;
    clear(container);

    if (TIMELINE_EVENTS.length === 0) {
      renderEmptyState(container, 'timeline.empty');
      return;
    }

    TIMELINE_EVENTS.forEach((key) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <span class="timeline-date">${t(`${key}.date`)}</span>
        <div class="timeline-content">
          <h3>${t(`${key}.title`)}</h3>
          <p>${t(`${key}.desc`)}</p>
        </div>
      `;
      container.appendChild(item);
    });
  }

  function initTechStack() {
    const container = qs('.skills-wrapper');
    if (!container) return;
    clear(container);

    TECH_STACK.forEach((group) => {
      const itemsHtml = group.items
        .map((s) => `<div class="skill-badge"><i class="${s.icon}"></i> ${s.name}</div>`)
        .join('');

      const col = document.createElement('div');
      col.className = 'skill-category';
      col.innerHTML = `<h3>${t(group.category)}</h3><div class="skill-list">${itemsHtml}</div>`;
      container.appendChild(col);
    });
  }

  function initContactLinks() {
    const container = qs('.intro-contact-links');
    if (!container) return;
    clear(container);

    CONTACT_LINKS.forEach((contact) => {
      const label = t(contact.key);
      const item = document.createElement('a');
      item.className = 'intro-contact-link';
      item.href = contact.link;
      if (!contact.link.startsWith('mailto:')) {
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }
      item.title = label;
      item.setAttribute('aria-label', label);
      item.innerHTML = `<span>${label}</span><i class="${contact.icon}"></i>`;
      container.appendChild(item);
    });
  }

  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        let target;
        try {
          target = qs(href);
        } catch {
          return;
        }

        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  function initRevealMotion() {
    const targets = [
      ...qsa('.projects-grid .card'),
      ...qsa('.documents-grid .card'),
      ...qsa('.timeline-container .timeline-item'),
      ...qsa('.skills-wrapper .skill-category'),
    ];

    if (!targets.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    targets.forEach((el, index) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${(index % 6) * 60}ms`);
    });

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    targets.forEach((el) => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initLangToggle();
    initSmoothScroll();
  });

  window.addEventListener('i18nLoaded', () => {
    console.log('[main] i18n loaded, rendering content...');
    initProjects();
    initDocuments();
    initTimeline();
    initTechStack();
    initContactLinks();
    initRevealMotion();
  });
})();
