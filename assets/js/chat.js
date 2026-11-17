/**
 * MingalarMate — Multilingual AI Student Assistant (Phase 5)
 * Powered by Groq API + Supabase pgvector RAG.
 * Supports Burmese (my), English (en), and Traditional Chinese (zh).
 */

const CHAT_CONFIG = {
  apiBaseUrl: window.MINGALARMATE_API_URL || 'http://localhost:8000/api'
};

class AIChatWidget {
  constructor() {
    this.isOpen = false;
    this.sessionId = null;
    this.currentLanguage = 'en';
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.injectChatWidget();
      this.bindEvents();
    });
  }

  injectChatWidget() {
    if (document.getElementById('ai-chat-launcher')) return;

    const chatHTML = `
      <!-- Floating AI Launcher Button -->
      <button id="ai-chat-launcher" aria-label="Open MingalarMate AI Assistant" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9990;
        background: var(--color-primary, #C85A32);
        color: #FFFFFF;
        border: none;
        border-radius: 9999px;
        padding: 12px 20px;
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 16px rgba(200, 90, 50, 0.35);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      ">
        <span style="font-size: 1.25rem;">✨</span>
        <span>Ask AI Mate</span>
      </button>

      <!-- Chat Drawer Window -->
      <div id="ai-chat-drawer" style="
        display: none;
        position: fixed;
        bottom: 84px;
        right: 24px;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 540px;
        max-height: calc(100vh - 110px);
        background: #FFFFFF;
        border: 1px solid var(--color-border, #E5DFD7);
        border-radius: 16px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
        z-index: 9995;
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, var(--color-primary, #C85A32) 0%, #A44422 100%);
          color: #FFFFFF;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="background: rgba(255,255,255,0.2); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
              🤖
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem; line-height: 1.2;">MingalarMate AI</div>
              <div style="font-size: 0.72rem; opacity: 0.85;">Multilingual Verified RAG Assistant</div>
            </div>
          </div>
          <button id="ai-chat-close" style="background: none; border: none; color: #FFF; font-size: 1.35rem; cursor: pointer; padding: 0 4px;">&times;</button>
        </div>

        <!-- Language Selector Bar -->
        <div style="background: var(--color-surface-subtle, #F3EFEA); padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--color-border, #E5DFD7); font-size: 0.8rem;">
          <span style="color: var(--color-text-muted, #5C554F);">Language:</span>
          <div style="display: flex; gap: 4px;">
            <button class="ai-lang-btn active" data-lang="en" style="border: 1px solid var(--color-border); background: #FFF; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer; font-weight: 600;">🇬🇧 EN</button>
            <button class="ai-lang-btn" data-lang="my" style="border: 1px solid var(--color-border); background: #FFF; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer;">🇲🇲 မြန်မာ</button>
            <button class="ai-lang-btn" data-lang="zh" style="border: 1px solid var(--color-border); background: #FFF; border-radius: 4px; padding: 2px 8px; font-size: 0.75rem; cursor: pointer;">🇹🇼 中文</button>
          </div>
        </div>

        <!-- Messages Container -->
        <div id="ai-chat-messages" style="
          flex: 1;
          padding: 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #FAF8F5;
        ">
          <!-- Welcome Message -->
          <div class="ai-msg ai-bot-msg" style="align-self: flex-start; max-width: 88%; background: #FFFFFF; border: 1px solid var(--color-border, #E5DFD7); border-radius: 12px; padding: 10px 14px; font-size: 0.88rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <p style="margin: 0 0 6px 0;"><strong>Mingalarba! မင်္ဂလာပါ!</strong> I am your AI student assistant for Taiwan. How can I assist you today?</p>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--color-border);">
              💡 <em>Answers are verified with official student regulations & source citations.</em>
            </div>
          </div>

          <!-- Suggested Starter Chips -->
          <div id="ai-chips" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
            <button class="ai-chip" style="text-align: left; background: #FFFFFF; border: 1px solid #D6D0C7; border-radius: 8px; padding: 6px 10px; font-size: 0.78rem; cursor: pointer; color: var(--color-primary-dark); transition: all 0.15s;">
              💼 How do I apply for a student Work Permit?
            </button>
            <button class="ai-chip" style="text-align: left; background: #FFFFFF; border: 1px solid #D6D0C7; border-radius: 8px; padding: 6px 10px; font-size: 0.78rem; cursor: pointer; color: var(--color-primary-dark); transition: all 0.15s;">
              🪪 What documents are needed for Alien Resident Certificate (ARC)?
            </button>
            <button class="ai-chip" style="text-align: left; background: #FFFFFF; border: 1px solid #D6D0C7; border-radius: 8px; padding: 6px 10px; font-size: 0.78rem; cursor: pointer; color: var(--color-primary-dark); transition: all 0.15s;">
              🏥 How does National Health Insurance (NHI) work?
            </button>
          </div>
        </div>

        <!-- Chat Input Form -->
        <form id="ai-chat-form" style="
          padding: 10px 12px;
          border-top: 1px solid var(--color-border, #E5DFD7);
          display: flex;
          gap: 8px;
          background: #FFFFFF;
        ">
          <input type="text" id="ai-chat-input" placeholder="Ask in English, မြန်မာ, or 中文..." required style="
            flex: 1;
            padding: 9px 12px;
            border: 1px solid var(--color-border, #E5DFD7);
            border-radius: 8px;
            font-size: 0.88rem;
            font-family: inherit;
            outline: none;
          ">
          <button type="submit" id="ai-chat-send" style="
            background: var(--color-primary, #C85A32);
            color: #FFFFFF;
            border: none;
            border-radius: 8px;
            padding: 0 14px;
            font-weight: 700;
            cursor: pointer;
            font-size: 0.9rem;
          ">➤</button>
        </form>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);
  }

  bindEvents() {
    const launcher = document.getElementById('ai-chat-launcher');
    const drawer = document.getElementById('ai-chat-drawer');
    const closeBtn = document.getElementById('ai-chat-close');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const langBtns = document.querySelectorAll('.ai-lang-btn');
    const chips = document.querySelectorAll('.ai-chip');

    launcher.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      drawer.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen) {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      this.isOpen = false;
      drawer.style.display = 'none';
    });

    langBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        langBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLanguage = btn.getAttribute('data-lang');
        const langPlaceholders = {
          en: 'Ask in English, မြန်မာ, or 中文...',
          my: 'မေးခွန်းကို မြန်မာလို မေးမြန်းပါ...',
          zh: '以繁體中文、英文或緬文提問...'
        };
        input.placeholder = langPlaceholders[this.currentLanguage] || input.placeholder;
      });
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const text = chip.textContent.replace(/^[^\w\u1000-\u109F]+/, '').trim();
        input.value = text;
        form.dispatchEvent(new Event('submit'));
        const chipsContainer = document.getElementById('ai-chips');
        if (chipsContainer) chipsContainer.style.display = 'none';
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      this.appendMessage('user', text);
      const loadingMsg = this.appendLoadingMessage();

      try {
        const response = await this.sendMessageToAPI(text);
        loadingMsg.remove();
        this.appendMessage('assistant', response.answer, response.sources, response.message_id);
      } catch (err) {
        loadingMsg.remove();
        this.appendMessage('assistant', `⚠️ ${err.message || 'Unable to connect to AI Assistant. Please ensure backend service is running.'}`);
      }
    });
  }

  appendMessage(role, text, sources = [], messageId = null) {
    const container = document.getElementById('ai-chat-messages');
    const isUser = role === 'user';

    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
      align-self: ${isUser ? 'flex-end' : 'flex-start'};
      max-width: 86%;
      background: ${isUser ? 'var(--color-primary, #C85A32)' : '#FFFFFF'};
      color: ${isUser ? '#FFFFFF' : 'var(--color-text, #262320)'};
      border: 1px solid ${isUser ? 'transparent' : 'var(--color-border, #E5DFD7)'};
      border-radius: 12px;
      padding: 9px 13px;
      font-size: 0.88rem;
      line-height: 1.45;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      word-break: break-word;
    `;

    // Process basic formatting (linebreaks and bold)
    let formattedText = text.replace(/\n/g, '<br>');
    msgEl.innerHTML = `<div>${formattedText}</div>`;

    // Append source citations if available
    if (sources && sources.length > 0) {
      const sourcesBox = document.createElement('div');
      sourcesBox.style.cssText = `
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px solid var(--color-border-subtle, #EEE9E2);
        font-size: 0.72rem;
        color: var(--color-text-muted, #5C554F);
      `;
      let sourcesHtml = '<strong>📚 Verified Sources:</strong><ul style="margin: 3px 0 0 0; padding-left: 14px;">';
      sources.forEach((s) => {
        sourcesHtml += `<li>${s.title} ${s.page ? `(Page ${s.page})` : ''}</li>`;
      });
      sourcesHtml += '</ul>';
      sourcesBox.innerHTML = sourcesHtml;
      msgEl.appendChild(sourcesBox);
    }

    // Feedback rating buttons for AI answers
    if (!isUser && messageId) {
      const feedbackBox = document.createElement('div');
      feedbackBox.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        font-size: 0.7rem;
        color: var(--color-text-light, #7A726A);
      `;
      feedbackBox.innerHTML = `
        <span>Was this helpful?</span>
        <button class="ai-rate-btn" data-rating="5" style="background:none; border:none; cursor:pointer;">👍</button>
        <button class="ai-rate-btn" data-rating="1" style="background:none; border:none; cursor:pointer;">👎</button>
      `;

      feedbackBox.querySelectorAll('.ai-rate-btn').forEach((b) => {
        b.addEventListener('click', async () => {
          const rating = parseInt(b.getAttribute('data-rating'), 10);
          feedbackBox.innerHTML = '<em>Thanks for your feedback!</em>';
          await this.submitFeedback(messageId, rating);
        });
      });
      msgEl.appendChild(feedbackBox);
    }

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
    return msgEl;
  }

  appendLoadingMessage() {
    const container = document.getElementById('ai-chat-messages');
    const loadingEl = document.createElement('div');
    loadingEl.style.cssText = `
      align-self: flex-start;
      background: #FFFFFF;
      border: 1px solid var(--color-border, #E5DFD7);
      border-radius: 12px;
      padding: 8px 14px;
      font-size: 0.8rem;
      color: var(--color-text-muted, #5C554F);
      font-style: italic;
    `;
    loadingEl.innerHTML = `✨ Searching knowledge base & citing sources...`;
    container.appendChild(loadingEl);
    container.scrollTop = container.scrollHeight;
    return loadingEl;
  }

  async sendMessageToAPI(message) {
    const authSession = window.authManager ? window.authManager.loadSession() : null;
    const token = authSession ? authSession.access_token : null;

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${CHAT_CONFIG.apiBaseUrl}/chat/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        session_id: this.sessionId,
        language: this.currentLanguage
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to get answer from AI Assistant');
    }

    const data = await res.json();
    if (data.session_id) {
      this.sessionId = data.session_id;
    }
    return data;
  }

  async submitFeedback(messageId, rating) {
    try {
      await fetch(`${CHAT_CONFIG.apiBaseUrl}/chat/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, rating })
      });
    } catch (e) {
      console.warn('Feedback submit error:', e);
    }
  }
}

// Global initialization
window.aiChatWidget = new AIChatWidget();
