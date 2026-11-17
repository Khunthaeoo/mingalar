/**
 * MingalarMate — Supabase Direct Auth & Profile Client (Phase 2)
 * Zero external libraries: uses native fetch() against Supabase Auth & REST API.
 * Supports Trilingual Preferences: English (en), Burmese (my), Traditional Chinese (zh).
 */

const SUPABASE_CONFIG = {
  url: 'https://ostgjholyutdafvgwivp.supabase.co',
  anonKey: 'sb_publishable_GgulANKDw-y60IecudKB5A__T-jVw1m',
  storageKey: 'mingalarmate_auth_session'
};

class AuthManager {
  constructor() {
    this.session = this.loadSession();
    this.userProfile = null;
    this.init();
  }

  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_CONFIG.anonKey
    };
    if (includeAuth && this.session && this.session.access_token) {
      headers['Authorization'] = `Bearer ${this.session.access_token}`;
    }
    return headers;
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(SUPABASE_CONFIG.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Failed to parse auth session from localStorage', e);
      return null;
    }
  }

  saveSession(sessionData) {
    this.session = sessionData;
    if (sessionData) {
      localStorage.setItem(SUPABASE_CONFIG.storageKey, JSON.stringify(sessionData));
    } else {
      localStorage.removeItem(SUPABASE_CONFIG.storageKey);
      this.userProfile = null;
    }
    this.updateHeaderUI();
  }

  isAuthenticated() {
    return !!(this.session && this.session.access_token);
  }

  getUser() {
    return this.session ? this.session.user : null;
  }

  /**
   * Register a new student account
   */
  async register(email, password, fullName, preferredLanguage = 'en') {
    const url = `${SUPABASE_CONFIG.url}/auth/v1/signup`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: fullName,
          preferred_language: preferredLanguage,
          role: 'student',
          university: 'National Chi Nan University (NCNU)'
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || data.error_description || data.message || 'Registration failed');
    }

    if (data.access_token) {
      this.saveSession(data);
    }
    return data;
  }

  /**
   * Log in with Email & Password
   */
  async login(email, password) {
    const url = `${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error_description || data.msg || 'Invalid email or password');
    }

    this.saveSession(data);
    await this.fetchProfile();
    return data;
  }

  /**
   * Log out and clear session
   */
  async logout() {
    try {
      if (this.isAuthenticated()) {
        await fetch(`${SUPABASE_CONFIG.url}/auth/v1/logout`, {
          method: 'POST',
          headers: this.getHeaders(true)
        });
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      this.saveSession(null);
    }
  }

  /**
   * Fetch user profile from public.profiles
   */
  async fetchProfile() {
    if (!this.isAuthenticated()) return null;
    try {
      const user = this.getUser();
      const url = `${SUPABASE_CONFIG.url}/rest/v1/profiles?id=eq.${user.id}&select=*`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true)
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          this.userProfile = rows[0];
          this.updateHeaderUI();
          return this.userProfile;
        }
      }
    } catch (e) {
      console.warn('Error fetching profile:', e);
    }
    return null;
  }

  /**
   * Update language preference in database
   */
  async updateLanguage(langCode) {
    if (!this.isAuthenticated()) return;
    try {
      const user = this.getUser();
      const url = `${SUPABASE_CONFIG.url}/rest/v1/profiles?id=eq.${user.id}`;
      await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(true),
        body: JSON.stringify({
          preferred_language: langCode,
          updated_at: new Date().toISOString()
        })
      });
      if (this.userProfile) {
        this.userProfile.preferred_language = langCode;
      }
      this.updateHeaderUI();
    } catch (e) {
      console.error('Failed to update language preference:', e);
    }
  }

  init() {
    document.addEventListener('DOMContentLoaded', async () => {
      this.injectAuthModal();
      this.updateHeaderUI();
      if (this.isAuthenticated()) {
        await this.fetchProfile();
      }
    });
  }

  updateHeaderUI() {
    const navList = document.querySelector('.nav-list');
    if (!navList) return;

    let authItem = document.getElementById('nav-auth-item');
    if (!authItem) {
      authItem = document.createElement('li');
      authItem.id = 'nav-auth-item';
      authItem.style.marginLeft = '0.5rem';
      navList.appendChild(authItem);
    }

    if (this.isAuthenticated()) {
      const user = this.getUser();
      const name = (this.userProfile && this.userProfile.full_name) ||
                   (user && user.user_metadata && user.user_metadata.full_name) ||
                   (user && user.email) || 'Student';
      const lang = (this.userProfile && this.userProfile.preferred_language) ||
                   (user && user.user_metadata && user.user_metadata.preferred_language) || 'en';

      const firstName = name.split(' ')[0];

      authItem.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <select id="header-lang-select" style="padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.8rem; background: var(--color-surface); cursor: pointer; color: var(--color-text);">
            <option value="en" ${lang === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
            <option value="my" ${lang === 'my' ? 'selected' : ''}>🇲🇲 မြန်မာ</option>
            <option value="zh" ${lang === 'zh' ? 'selected' : ''}>🇹🇼 中文</option>
          </select>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary-dark);">👋 ${firstName}</span>
          <button id="btn-logout" class="btn btn-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;">Sign Out</button>
        </div>
      `;

      const select = document.getElementById('header-lang-select');
      if (select) {
        select.addEventListener('change', (e) => {
          this.updateLanguage(e.target.value);
        });
      }

      const logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.logout());
      }
    } else {
      authItem.innerHTML = `
        <button id="btn-open-auth" class="btn btn-primary" style="padding: 0.35rem 0.9rem; font-size: 0.85rem;">
          Sign In
        </button>
      `;

      const btnOpen = document.getElementById('btn-open-auth');
      if (btnOpen) {
        btnOpen.addEventListener('click', () => this.openModal());
      }
    }
  }

  injectAuthModal() {
    if (document.getElementById('auth-modal-overlay')) return;

    const modalHTML = `
      <div id="auth-modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div class="card" style="width: 90%; max-width: 440px; background: #FFF; position: relative; padding: 2rem; box-shadow: var(--shadow-hover); border-radius: var(--radius-lg);">
          <button id="btn-close-auth-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted);">&times;</button>

          <div style="text-align: center; margin-bottom: 1.25rem;">
            <h3 style="margin-bottom: 0.25rem; color: var(--color-primary-dark);">MingalarMate Portal</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0;">Connect to your student account & AI Assistant</p>
          </div>

          <div style="display: flex; gap: 1rem; border-bottom: 2px solid var(--color-border); margin-bottom: 1.5rem;">
            <button id="tab-login" style="background: none; border: none; padding: 0.5rem 0.25rem; font-weight: 700; cursor: pointer; color: var(--color-primary); border-bottom: 2px solid var(--color-primary); margin-bottom: -2px;">Sign In</button>
            <button id="tab-register" style="background: none; border: none; padding: 0.5rem 0.25rem; font-weight: 600; cursor: pointer; color: var(--color-text-muted);">Create Account</button>
          </div>

          <!-- Alert message box -->
          <div id="auth-alert" style="display: none; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem; margin-bottom: 1rem;"></div>

          <!-- Login Form -->
          <form id="form-login">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Email Address</label>
              <input type="email" id="login-email" required placeholder="student@ncnu.edu.tw" style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit;">
            </div>
            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Password</label>
              <input type="password" id="login-password" required placeholder="••••••••" style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit;">
            </div>
            <button type="submit" id="btn-submit-login" class="btn btn-primary" style="width: 100%;">Sign In</button>
          </form>

          <!-- Register Form -->
          <form id="form-register" style="display: none;">
            <div style="margin-bottom: 0.75rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Full Name</label>
              <input type="text" id="reg-name" required placeholder="Aung San" style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit;">
            </div>
            <div style="margin-bottom: 0.75rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Email Address</label>
              <input type="email" id="reg-email" required placeholder="student@ncnu.edu.tw" style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit;">
            </div>
            <div style="margin-bottom: 0.75rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Password</label>
              <input type="password" id="reg-password" required minlength="6" placeholder="At least 6 characters" style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit;">
            </div>
            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Preferred Language</label>
              <select id="reg-language" style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-family: inherit; background: #FFF;">
                <option value="en">English (default)</option>
                <option value="my">Burmese (မြန်မာဘာသာ)</option>
                <option value="zh">Traditional Chinese (繁體中文)</option>
              </select>
            </div>
            <button type="submit" id="btn-submit-register" class="btn btn-primary" style="width: 100%;">Create Student Account</button>
          </form>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const overlay = document.getElementById('auth-modal-overlay');
    const btnClose = document.getElementById('btn-close-auth-modal');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const alertBox = document.getElementById('auth-alert');

    const showAlert = (msg, isError = true) => {
      alertBox.textContent = msg;
      alertBox.style.display = 'block';
      alertBox.style.background = isError ? 'var(--color-warning-bg)' : 'var(--color-info-bg)';
      alertBox.style.color = isError ? 'var(--color-warning-text)' : 'var(--color-info-text)';
      alertBox.style.border = `1px solid ${isError ? 'var(--color-warning-border)' : 'var(--color-info-border)'}`;
    };

    btnClose.addEventListener('click', () => {
      overlay.style.display = 'none';
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });

    tabLogin.addEventListener('click', () => {
      tabLogin.style.color = 'var(--color-primary)';
      tabLogin.style.borderBottom = '2px solid var(--color-primary)';
      tabRegister.style.color = 'var(--color-text-muted)';
      tabRegister.style.borderBottom = 'none';
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
      alertBox.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.style.color = 'var(--color-primary)';
      tabRegister.style.borderBottom = '2px solid var(--color-primary)';
      tabLogin.style.color = 'var(--color-text-muted)';
      tabLogin.style.borderBottom = 'none';
      formRegister.style.display = 'block';
      formLogin.style.display = 'none';
      alertBox.style.display = 'none';
    });

    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-login');
      btn.disabled = true;
      btn.textContent = 'Signing in...';
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      try {
        await this.login(email, password);
        overlay.style.display = 'none';
      } catch (err) {
        showAlert(err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });

    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-register');
      btn.disabled = true;
      btn.textContent = 'Creating account...';
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const lang = document.getElementById('reg-language').value;
      try {
        await this.register(email, password, name, lang);
        showAlert('Registration successful! Check your confirmation email if required, or sign in now.', false);
        setTimeout(() => {
          tabLogin.click();
        }, 1800);
      } catch (err) {
        showAlert(err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Student Account';
      }
    });
  }

  openModal() {
    const overlay = document.getElementById('auth-modal-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
    }
  }
}

// Global initialization
window.authManager = new AuthManager();
