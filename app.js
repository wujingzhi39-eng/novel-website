/**
 * 《重生闪婚：驯服年下盟友》小说阅读网页
 * 前端交互逻辑
 */

// NOTE: 全局状态管理
const state = {
  currentChapter: 1,
  sidebarOpen: false,
  theme: localStorage.getItem('novel-theme') || 'light',
  fontSize: localStorage.getItem('novel-font-size') || 'normal',
  settingsOpen: false,
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFontSize();
  initParticles();
  initScrollObserver();
  initFadeInObserver();

  // 页面加载完成后移除加载动画
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 800);
    }
  }, 800);
});

// ========== 主题切换 ==========
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeBtn();
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('novel-theme', state.theme);
  updateThemeBtn();
}

function updateThemeBtn() {
  const btn = document.getElementById('themeBtn');
  if (btn) {
    btn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }
}

// ========== 字体大小 ==========
const FONT_SIZES = ['normal', 'font-size-large', 'font-size-xlarge', 'font-size-small'];
const FONT_SIZE_LABELS = ['标准', '大', '特大', '小'];

function initFontSize() {
  const area = document.getElementById('readingArea');
  if (area && state.fontSize !== 'normal') {
    area.classList.add(state.fontSize);
  }
}

function changeFontSize() {
  const area = document.getElementById('readingArea');
  if (!area) return;

  const currentIdx = FONT_SIZES.indexOf(state.fontSize);
  const nextIdx = (currentIdx + 1) % FONT_SIZES.length;

  // 移除当前字体类
  if (state.fontSize !== 'normal') {
    area.classList.remove(state.fontSize);
  }

  state.fontSize = FONT_SIZES[nextIdx];

  // 添加新字体类
  if (state.fontSize !== 'normal') {
    area.classList.add(state.fontSize);
  }

  localStorage.setItem('novel-font-size', state.fontSize);

  const btn = document.getElementById('fontSizeBtn');
  if (btn) {
    btn.textContent = FONT_SIZE_LABELS[nextIdx];
    btn.title = `字体: ${FONT_SIZE_LABELS[nextIdx]}`;
  }
}

// ========== 侧边栏目录 ==========
function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  document.getElementById('sidebar').classList.toggle('active', state.sidebarOpen);
  document.getElementById('sidebarOverlay').classList.toggle('active', state.sidebarOpen);
  document.body.style.overflow = state.sidebarOpen ? 'hidden' : '';
}

function navigateToChapter(num) {
  const el = document.getElementById(`chapter-${num}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // 关闭侧边栏
    if (state.sidebarOpen) {
      toggleSidebar();
    }
  }
}

// ========== 封面"开始阅读"按钮 ==========
function startReading() {
  const topNav = document.getElementById('topNav');
  if (topNav) topNav.classList.add('visible');
}

// ========== 滚动相关 ==========
function initScrollObserver() {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateReadingProgress();
        updateNavVisibility();
        updateCurrentChapter();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  });
}

function updateReadingProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  const bar = document.getElementById('reading-progress');
  if (bar) bar.style.width = `${progress}%`;
}

function updateNavVisibility() {
  const coverPage = document.getElementById('coverPage');
  const topNav = document.getElementById('topNav');
  if (!coverPage || !topNav) return;

  const coverBottom = coverPage.offsetTop + coverPage.offsetHeight;
  topNav.classList.toggle('visible', window.scrollY > coverBottom - 100);
}

/** 根据滚动位置更新当前章节高亮 */
function updateCurrentChapter() {
  const sections = document.querySelectorAll('.chapter-section');
  let current = 1;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 150) {
      current = parseInt(section.dataset.chapter, 10);
    }
  });

  if (current !== state.currentChapter) {
    state.currentChapter = current;

    // 更新导航栏章节显示
    const navChapter = document.getElementById('navChapter');
    if (navChapter) navChapter.textContent = `第${current}章`;

    // 更新侧边栏高亮
    document.querySelectorAll('.chapter-item').forEach(item => {
      item.classList.toggle('active', item.dataset.target === `chapter-${current}`);
    });
  }
}

function updateBackToTop() {
  const btn = document.getElementById('backToTop');
  if (btn) btn.classList.toggle('visible', window.scrollY > 600);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 淡入动画观察器 ==========
function initFadeInObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ========== 封面粒子效果 ==========
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const particleCount = 40;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${6 + Math.random() * 10}s`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.width = `${1 + Math.random() * 3}px`;
    particle.style.height = particle.style.width;

    // 随机金色/玫瑰色粒子
    const colors = ['#c9a96e', '#e8d5a8', '#e74c6f', '#ff6b8a', '#fff'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(particle);
  }
}

// ========== 键盘快捷键 ==========
document.addEventListener('keydown', (e) => {
  // Escape 关闭侧边栏
  if (e.key === 'Escape' && state.sidebarOpen) {
    toggleSidebar();
  }
  // T 切换主题
  if (e.key === 't' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    toggleTheme();
  }
});
