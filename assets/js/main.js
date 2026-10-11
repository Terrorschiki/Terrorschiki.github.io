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
  //    VIDEOS        titleKey / descKey / platform(平台角标) / links[]
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
  // tags 支持两种写法：
  //   tags: ['SLAM', 'ROS2']                      -> 中英文共用同一组标签
  //   tags: { zh: ['强化学习'], en: ['Reinforcement Learning'] }  -> 按语言分别翻译
  const PROJECTS = [
    {
      img: 'assets/images/project-quadruped.jpg',
      titleKey: 'projects.item0.title',
      descKey: 'projects.item0.desc',
      tags: {
        zh: ['SLAM', '导航', 'ROS2', '强化学习', 'RL'],
        en: ['SLAM', 'Navigation', 'ROS2', 'Reinforcement Learning', 'RL'],
      },
    },
    {
      img: 'assets/images/project-skylandx.png',
      titleKey: 'projects.item1.title',
      descKey: 'projects.item1.desc',
      tags: {
        zh: ['ROS2', '驱动开发', 'IMU 标定'],
        en: ['ROS2', 'Driver Development', 'IMU Calibration'],
      },
    },
    {
      img: 'assets/images/project-exoskeleton.jpg',
      titleKey: 'projects.item2.title',
      descKey: 'projects.item2.desc',
      tags: {
        zh: ['强化学习', '外骨骼', 'IMU'],
        en: ['Reinforcement Learning', 'Exoskeleton', 'IMU'],
      },
      links: [
        { href: 'https://github.com/GZ89mid/Epson_HotSwap_ws', labelKey: 'projects.links.imuDriver', icon: 'fab fa-github' },
        { href: 'https://github.com/Lain-Ego0/G-Exo', labelKey: 'projects.links.exoRepo', icon: 'fab fa-github' },
      ],
    },
    {
      img: 'assets/images/project-glim.jpg',
      titleKey: 'projects.item3.title',
      descKey: 'projects.item3.desc',
      tags: {
        zh: ['GLIM', 'SLAM', '重定位'],
        en: ['GLIM', 'SLAM', 'Relocalization'],
      },
      links: [
        { href: 'https://github.com/GZ89mid/GLIMinstall', labelKey: 'projects.links.installScript', icon: 'fab fa-github' },
      ],
    },
    {
      titleKey: 'projects.item4.title',
      descKey: 'projects.item4.desc',
      tags: {
        zh: ['Gitea', 'NAS', '版本管理'],
        en: ['Gitea', 'NAS', 'Version Control'],
      },
    },
    {
      img: 'assets/images/project-agv.jpg',
      titleKey: 'projects.item5.title',
      descKey: 'projects.item5.desc',
      tags: {
        zh: ['RK3588', 'YOLO', '导航'],
        en: ['RK3588', 'YOLO', 'Navigation'],
      },
    },
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

  // ---------- 3. 自媒体账号视频 ----------
  // 用卡片展示你在 B 站 / 抖音 / YouTube / 小红书 等平台发布的视频，
  // 点击卡片按钮跳转到对应平台观看（静态站点不存放视频文件本身）。
  //   platformKey    平台角标（走语言包，如 videos.platform.bilibili）
  //   categoryKey    分类角标，可选（如 videos.category.deviceReview）
  //   links[].href   留空字符串则该按钮不渲染 —— 用于「链接待补」的卡片
  const VIDEOS = [
    {
      titleKey: 'videos.item0.title',
      descKey: 'videos.item0.desc',
      platformKey: 'videos.platformName.bilibili',
      links: [
        { href: 'https://www.bilibili.com/video/BV1uuu36uEjx', labelKey: 'videos.watch', icon: 'fab fa-bilibili' },
      ],
    },
    {
      titleKey: 'videos.item1.title',
      descKey: 'videos.item1.desc',
      platformKey: 'videos.platformName.bilibili',
      categoryKey: 'videos.category.deviceReview',
      links: [
        { href: '', labelKey: 'videos.watch', icon: 'fab fa-bilibili' }, // TODO 待补 B 站链接
      ],
    },
    {
      titleKey: 'videos.item2.title',
      descKey: 'videos.item2.desc',
      platformKey: 'videos.platformName.bilibili',
      categoryKey: 'videos.category.deviceReview',
      links: [
        { href: '', labelKey: 'videos.watch', icon: 'fab fa-bilibili' }, // TODO 待补 B 站链接
      ],
    },
    {
      titleKey: 'videos.item3.title',
      descKey: 'videos.item3.desc',
      platformKey: 'videos.platformName.xiaohongshu',
      categoryKey: 'videos.category.algorithmDemo',
      links: [
        { href: 'https://www.xiaohongshu.com/discovery/item/6a1d2262000000000803ec94?source=webshare&xhsshare=pc_web&xsec_token=AB425erwa72L3LIUqDS35fc10WlaqtsL9ZO7w0bMuWJ58=&xsec_source=pc_share', labelKey: 'videos.watch', icon: 'fas fa-arrow-up-right-from-square' },
      ],
    },
  ];

  // ---------- 4. 时间轴（数组顺序 = 页面展示顺序，即由近及远）----------
  // 每一条都需要语言包中存在 timeline.eventN.date / .title / .desc（zh.json 与 en.json 各一份）
  const TIMELINE_EVENTS = [
    'timeline.event0', // 教育经历（长期主线，置顶）
    'timeline.event1', // 2026.07 - 2026.08 Physical AI 黑客松外骨骼
    'timeline.event2', // 2026.07 WAIC 2026 快闪
    'timeline.event3', // 2025.09 - 2026.08 ROBOCON2026 武林探秘 & 仿生足式
    'timeline.event4', // 2025.08 - 至今 实验室副队长
    'timeline.event5', // 2024.09 - 2025.08 作为嘉宾受邀参与 RC 年会
    'timeline.event6', // 2024.09 - 2025.08 ROBOCON2025 飞身上篮 & 仿生足式
    'timeline.event7', // 2025.09 发明专利
    'timeline.event8', // 2025.05 - 2025.08 嵌赛 RK3588 AGV
    'timeline.event9', // 2025 宏平长青奖学金
    'timeline.event10', // 2024.06 - 2024.08 睿抗 AIROBOT
    'timeline.event11', // 2024.05 - 2024.07 香港 YEPC
  ];

  // ---------- 5. 技术栈 ----------
  const TECH_STACK = [
    {
      category: 'skills.robotics',
      items: [
        { nameKey: 'techStack.ROS2', icon: 'fas fa-robot' },
        { nameKey: 'techStack.SLAM', icon: 'fas fa-map' },
        { nameKey: 'techStack.Navigation', icon: 'fas fa-route' },
        { nameKey: 'techStack.OpenCV', icon: 'fas fa-eye' },
        { nameKey: 'techStack.YOLO', icon: 'fas fa-bullseye' },
      ],
    },
    {
      category: 'skills.simulation',
      items: [
        { nameKey: 'techStack.RL', icon: 'fas fa-brain' },
        { nameKey: 'techStack.Robot_lab', icon: 'fas fa-flask' },
        { nameKey: 'techStack.RL_sar', icon: 'fas fa-dog' },
        { nameKey: 'techStack.Sim2Real', icon: 'fas fa-right-left' },
      ],
    },
    {
      category: 'skills.embedded',
      items: [
        { name: 'X86', icon: 'fas fa-microchip' },
        { name: 'RISC-V', icon: 'fas fa-microchip' },
        { name: 'ARM64', icon: 'fas fa-microchip' },
        { nameKey: 'techStack.OpenCV', icon: 'fas fa-camera' },
        { nameKey: 'techStack.ROS2Interface', icon: 'fas fa-plug' },
      ],
    },
    {
      category: 'skills.software',
      items: [
        { nameKey: 'techStack.Linux', icon: 'fab fa-linux' },
        { nameKey: 'techStack.Git', icon: 'fab fa-git-alt' },
        { nameKey: 'techStack.CMake', icon: 'fas fa-cube' },
        { nameKey: 'techStack.Docker', icon: 'fab fa-docker' },
      ],
    },
  ];

  // ---------- 6. 联系方式（Hero 区域下方的入口）----------
  const CONTACT_LINKS = [
    { icon: 'fas fa-envelope', key: 'contact.email', link: 'mailto:2455682411@qq.com' },
    { icon: 'fab fa-github', key: 'contact.github', link: 'https://github.com/GZ89mid' },
    { icon: 'fab fa-bilibili', key: 'contact.bilibili', link: 'https://space.bilibili.com/3494362002491801' },
    { img: 'assets/images/icon-xiaohongshu.svg', key: 'contact.xiaohongshu', link: 'https://www.xiaohongshu.com/user/profile/6511656e0000000023026002' },
    { icon: 'fab fa-zhihu', key: 'contact.zhihu', link: 'https://www.zhihu.com/people/terrorist-11-67' },
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

  /**
   * 取出当前语言下的标签数组。支持两种写法：
   *   tags: ['SLAM', 'ROS2']                                    -> 直接使用
   *   tags: { zh: ['强化学习'], en: ['Reinforcement Learning'] } -> 按当前语言取，缺该语言时回退
   */
  function resolveTags(tags) {
    if (Array.isArray(tags)) return tags;
    if (!tags || typeof tags !== 'object') return [];

    const lang = window.i18n?.currentLang ? window.i18n.currentLang() : 'en';
    const list = tags[lang] || tags.en || tags.zh || [];
    return Array.isArray(list) ? list : [];
  }

  function renderProjectTags(tags) {
    const list = resolveTags(tags);
    if (list.length === 0) return '';
    return `<div class="project-tags">${renderSpanTags(list, 'project-tag')}</div>`;
  }

  /**
   * 生成图标 HTML。支持两种写法：
   *   img: 'assets/images/icon-xiaohongshu.svg'  -> 用图片（适合 Font Awesome 没有的品牌图标）
   *   icon: 'fab fa-github'                      -> 用 Font Awesome 类名
   * 图片图标用 <img> 承载已内嵌 currentColor 的 SVG，因此会自动跟随主题文字颜色。
   */
  function renderIcon(entry) {
    if (entry.img) {
      return `<img class="icon-img" src="${entry.img}" alt="" aria-hidden="true" loading="lazy">`;
    }
    return `<i class="${entry.icon || 'fas fa-link'}"></i>`;
  }

  /**
   * 角标（平台 / 分类）。支持两种写法：
   *   icon: 'fab fa-bilibili'  -> Font Awesome 图标
   *   text: '中文'             -> 直接用文字（用于中英文一致的标签）
   */
  function renderBadge(entry, className) {
    if (!entry) return '';
    const label = entry.key ? t(entry.key) : entry.text;
    if (!label) return '';
    const iconHtml = entry.icon ? `<i class="${entry.icon}"></i> ` : '';
    return `<span class="${className}">${iconHtml}${label}</span>`;
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

    // 默认日间（亮色）模式，与 index.html 头部脚本保持一致
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

  function initVideos() {
    const grid = qs('.videos-grid');
    if (!grid) return;
    clear(grid);

    if (VIDEOS.length === 0) {
      renderEmptyState(grid, 'videos.empty');
      return;
    }

    VIDEOS.forEach((video) => {
      const actionsHtml = renderProjectActions(video.links);
      const platformHtml = renderBadge(
        {
          key: video.platformKey,
          text: video.platform,
          icon: video.platformIcon || 'fas fa-play',
        },
        'video-platform',
      );
      const categoryHtml = renderBadge({ key: video.categoryKey, text: video.category }, 'video-category');

      const card = document.createElement('div');
      card.className = 'card project-card project-card--text-only video-card';
      card.innerHTML = `
        <div class="project-info">
          <h3>${t(video.titleKey)}</h3>
          <p>${t(video.descKey)}</p>
          <div class="project-meta-row">
            ${platformHtml}
            ${categoryHtml}
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
        .map((s) => {
          // name 用于中英文一致的固定名称（如 X86 / RISC-V / ARM64），nameKey 走语言包
          const label = s.nameKey ? t(s.nameKey) : s.name;
          return `<div class="skill-badge"><i class="${s.icon}"></i> ${label}</div>`;
        })
        .join('');

      const col = document.createElement('div');
      col.className = 'skill-category';
      col.innerHTML = `<h3>${t(group.category)}</h3><div class="skill-list">${itemsHtml}</div>`;
      container.appendChild(col);
    });
  }

  function renderContactLinks() {
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
      item.innerHTML = `<span>${label}</span>${renderIcon(contact)}`;
      container.appendChild(item);
    });
  }

  /**
   * Logo 打字机效果（纯装饰，失败不影响任何内容）。
   * 先测量真实宽度写入 CSS 变量，再加类触发动画，
   * 因此即使脚本报错或用户禁用 JS，Logo 也始终完整显示。
   */
  function initLogoTypewriter() {
    const logo = qs('.logo-terminal');
    const target = qs('.terminal-typewriter');
    if (!logo || !target) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    try {
      const width = Math.ceil(target.getBoundingClientRect().width) || target.scrollWidth;
      if (!width) return;
      target.style.setProperty('--typewriter-width', `${width}px`);
      logo.classList.add('is-typing');
    } catch {
      /* 装饰性效果，任何异常都不影响页面 */
    }
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
      ...qsa('.videos-grid .card'),
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
    initLogoTypewriter();
  });

  window.addEventListener('i18nLoaded', () => {
    console.log('[main] i18n loaded, rendering content...');
    initProjects();
    initDocuments();
    initVideos();
    initTimeline();
    initTechStack();
    renderContactLinks();
    initRevealMotion();
  });

  // 切换语言时语言包会重新加载并触发 i18nLoaded；这里额外监听 langChanged，
  // 让项目标签这类「按语言分组」的数据也能立刻跟着切换。
  window.addEventListener('langChanged', () => {
    initProjects();
    initDocuments();
    initVideos();
    initTimeline();
    initTechStack();
    renderContactLinks();
  });
})();
