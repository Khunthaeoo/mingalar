/**
 * MingalarMate — Shared Vanilla JavaScript
 * Version 2.0 (Mobile Navigation, Sidebar Drawer, Accessibility)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initSidebarDrawer();
  initCurrentYear();
});

/**
 * Mobile Navigation Toggle (Header)
 */
function initMobileNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (!navToggle || !siteNav) return;

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    setNavState(!isExpanded);
  });

  const navLinks = siteNav.querySelectorAll('.nav-link');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        setNavState(false);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavState(false);
      navToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navToggle.getAttribute('aria-expanded') === 'true') {
      setNavState(false);
    }
  });

  function setNavState(isOpen) {
    navToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      siteNav.classList.add('is-open');
    } else {
      siteNav.classList.remove('is-open');
    }
  }
}

/**
 * Unified Sidebar Navigation Drawer
 * Dynamically builds and injects the sidebar with all platform tabs.
 */
function initSidebarDrawer() {
  if (document.getElementById('site-sidebar-drawer')) return;

  // Robust nested page detection for both file:/// and http(s):// protocols
  const currentHref = (window.location.href || '').toLowerCase();
  const currentPath = (window.location.pathname || '').toLowerCase();
  const isNestedPage = currentHref.includes('/pages/') || 
                       currentHref.includes('\\pages\\') || 
                       currentHref.includes('%2fpages%2f') ||
                       currentPath.includes('/pages/') || 
                       currentPath.includes('\\pages\\');

  // Proper relative link helpers
  const homeLink = isNestedPage ? '../index.html' : 'index.html';
  const pageLink = (filename) => isNestedPage ? filename : `pages/${filename}`;
  const logoSrc = isNestedPage ? '../assets/images/logo.svg' : 'assets/images/logo.svg';

  const sidebarHTML = `
    <!-- Sidebar Overlay Backing -->
    <div id="site-sidebar-overlay" class="sidebar-overlay"></div>

    <!-- Sidebar Drawer Window -->
    <aside id="site-sidebar-drawer" class="site-sidebar" aria-label="Sidebar navigation drawer">
      <div class="sidebar-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${logoSrc}" alt="" width="28" height="28">
          <span style="font-weight: 800; font-size: 1.05rem; color: var(--color-primary-dark);">MingalarMate</span>
        </div>
        <button id="sidebar-close-btn" class="sidebar-close-btn" aria-label="Close sidebar navigation">&times;</button>
      </div>

      <nav class="sidebar-nav-group">
        <div class="sidebar-group-label" data-i18n="sidebar_student_portal">Student Guides</div>
        <a href="${homeLink}" class="sidebar-link ${currentPath.endsWith('index.html') || currentPath.endsWith('/') ? 'active' : ''}">
          <span class="sidebar-link-icon">🏠</span>
          <span data-i18n="nav_home">Home</span>
        </a>
        <a href="${pageLink('information-center.html')}" class="sidebar-link ${currentPath.includes('information-center.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">📚</span>
          <span data-i18n="nav_info_center">Information Center</span>
        </a>
        <a href="${pageLink('study-in-taiwan.html')}" class="sidebar-link ${currentPath.includes('study-in-taiwan.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">🎓</span>
          <span data-i18n="nav_study">Study in Taiwan</span>
        </a>
        <a href="${pageLink('living-in-taiwan.html')}" class="sidebar-link ${currentPath.includes('living-in-taiwan.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">🍜</span>
          <span data-i18n="nav_living">Living in Taiwan</span>
        </a>
        <a href="${pageLink('part-time-jobs.html')}" class="sidebar-link ${currentPath.includes('part-time-jobs.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">💼</span>
          <span data-i18n="nav_jobs">Part-time Jobs</span>
        </a>

        <div class="sidebar-group-label">Community & Campus</div>
        <a href="${pageLink('community-forum.html')}" class="sidebar-link ${currentPath.includes('community-forum.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">💬</span>
          <span data-i18n="nav_forum">Community Forum</span>
        </a>
        <a href="${pageLink('events.html')}" class="sidebar-link ${currentPath.includes('events.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">📅</span>
          <span data-i18n="nav_events">Campus Events</span>
        </a>
        <a href="${pageLink('about.html')}" class="sidebar-link ${currentPath.includes('about.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">ℹ️</span>
          <span data-i18n="nav_about">About Us</span>
        </a>

        <div class="sidebar-group-label">Management</div>
        <a href="${pageLink('admin.html')}" class="sidebar-link ${currentPath.includes('admin.html') ? 'active' : ''}">
          <span class="sidebar-link-icon">⚙️</span>
          <span data-i18n="nav_admin">Admin Console</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div style="font-weight: 700; margin-bottom: 6px; font-size: 0.78rem;">Language / ဘာသာစကား / 語言</div>
        <div style="display: flex; gap: 4px;">
          <button class="sidebar-lang-btn" data-lang="en" style="padding: 3px 8px; border-radius: 4px; border: 1px solid var(--color-border); font-size: 0.75rem; cursor: pointer; background: #FFF;">🇬🇧 EN</button>
          <button class="sidebar-lang-btn" data-lang="my" style="padding: 3px 8px; border-radius: 4px; border: 1px solid var(--color-border); font-size: 0.75rem; cursor: pointer; background: #FFF;">🇲🇲 မြန်မာ</button>
          <button class="sidebar-lang-btn" data-lang="zh" style="padding: 3px 8px; border-radius: 4px; border: 1px solid var(--color-border); font-size: 0.75rem; cursor: pointer; background: #FFF;">🇹🇼 繁中</button>
        </div>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // Inject Sidebar Toggle Button into Header
  const headerContainer = document.querySelector('.header-container');
  if (headerContainer && !document.getElementById('btn-open-sidebar')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'btn-open-sidebar';
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.setAttribute('aria-label', 'Open navigation sidebar');
    toggleBtn.innerHTML = `
      <span style="font-size: 1.15rem; line-height: 1;">☰</span>
      <span>Menu</span>
    `;

    // Insert before brand or after brand
    headerContainer.insertBefore(toggleBtn, headerContainer.firstChild);

    const drawer = document.getElementById('site-sidebar-drawer');
    const overlay = document.getElementById('site-sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close-btn');

    const openDrawer = () => {
      drawer.classList.add('active');
      overlay.classList.add('active');
    };

    const closeDrawer = () => {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
    };

    toggleBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('active')) {
        closeDrawer();
      }
    });

    // Language switcher buttons in sidebar
    document.querySelectorAll('.sidebar-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        if (window.i18n) {
          window.i18n.setLanguage(lang);
        }
      });
    });
  }
}

/**
 * Current Year for Footer
 */
function initCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
