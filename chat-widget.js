(function () {
  'use strict';

  var WA_LINK = 'https://wa.me/914222364200';

  // ─── CSS ────────────────────────────────────────────────────────────────────
  var CSS = `
    /* Hide the original WhatsApp float — we handle it inside the Speed Dial */
    .whatsapp-float { display: none !important; }

    /* Respect reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      .vg-pulse, .vg-fab-option, .vg-chat-panel,
      .vg-fab-main, .vg-fab-mini, .vg-fab-options { animation: none !important; transition: none !important; }
      .vg-dot { animation: none !important; opacity: 0.6 !important; }
    }

    /* Skeleton loader for first message */
    .vg-skeleton {
      background: linear-gradient(90deg, #e8e0d5 25%, #f5f0ea 50%, #e8e0d5 75%);
      background-size: 200% 100%;
      animation: vg-shimmer 1.4s infinite;
      border-radius: 10px;
      height: 14px;
      margin-bottom: 6px;
    }
    @keyframes vg-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .vg-skeleton { animation: none; background: #e8e0d5; }
    }

    #vg-chat-widget * { box-sizing: border-box; margin: 0; padding: 0; }
    #vg-chat-widget p  { margin: 0; }

    /* ── Speed Dial wrapper ── */
    .vg-fab-wrap {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }
    @media (max-width: 1023px) {
      .vg-fab-wrap {
        bottom: calc(78px + env(safe-area-inset-bottom));
        right: 16px;
      }
    }

    /* ── Speed Dial options (slide up from main button) ── */
    .vg-fab-options {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      transition: opacity 0.22s ease;
      opacity: 0;
      pointer-events: none;
    }
    .vg-fab-options.vg-fab-open {
      opacity: 1;
      pointer-events: all;
    }

    /* Each option row: label + button */
    .vg-fab-option {
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(14px);
      transition: transform 0.25s ease, opacity 0.22s ease;
      opacity: 0;
    }
    .vg-fab-options.vg-fab-open .vg-fab-option {
      transform: translateY(0);
      opacity: 1;
    }
    /* Stagger each option */
    .vg-fab-options.vg-fab-open .vg-fab-option:nth-child(2) { transition-delay: 0.06s; }
    .vg-fab-options.vg-fab-open .vg-fab-option:nth-child(1) { transition-delay: 0.12s; }

    /* Label pill */
    .vg-fab-label {
      background: white;
      color: #1f1f1f;
      font-family: 'Montserrat', sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      padding: 7px 14px;
      border-radius: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.14);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
    }

    /* Mini icon button */
    .vg-fab-mini {
      width: 48px; height: 48px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 14px rgba(0,0,0,0.18);
      transition: transform 0.18s, box-shadow 0.18s;
      flex-shrink: 0;
      text-decoration: none;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .vg-fab-mini:hover  { transform: scale(1.1); }
    .vg-fab-mini:active { transform: scale(0.94); }

    .vg-fab-ai { background: #2D5016; }
    .vg-fab-wa { background: #25D366; }

    /* ── Main FAB button ── */
    .vg-fab-main {
      width: 58px; height: 58px;
      border-radius: 50%;
      background: #2D5016;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(45,80,22,0.45);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      position: relative;
    }
    .vg-fab-main:hover  { transform: scale(1.07); box-shadow: 0 6px 26px rgba(45,80,22,0.55); }
    .vg-fab-main:active { transform: scale(0.95); }

    /* Icon layers inside main button */
    .vg-fab-icon { position: absolute; transition: opacity 0.2s ease, transform 0.2s ease; }
    .vg-fab-icon--open  { opacity: 1;  transform: rotate(0deg); }
    .vg-fab-icon--close { opacity: 0;  transform: rotate(-90deg); }
    .vg-fab-open-state .vg-fab-icon--open  { opacity: 0;  transform: rotate(90deg); }
    .vg-fab-open-state .vg-fab-icon--close { opacity: 1;  transform: rotate(0deg); }

    /* Notification badge */
    .vg-badge {
      position: absolute; top: -3px; right: -3px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #D4841A;
      color: white;
      font-family: 'Montserrat', sans-serif;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white;
    }

    /* Pulse on load */
    .vg-pulse { animation: vg-pulse-anim 2.2s ease-in-out 3; }
    @keyframes vg-pulse-anim {
      0%,100% { box-shadow: 0 4px 20px rgba(45,80,22,0.45); }
      50%      { box-shadow: 0 4px 28px rgba(45,80,22,0.7), 0 0 0 10px rgba(45,80,22,0.11); }
    }

    /* Backdrop (closes dial on outside click) */
    .vg-backdrop {
      position: fixed; inset: 0;
      z-index: 998;
      display: none;
    }
    .vg-backdrop.vg-show { display: block; }

    /* ── Chat panel ── */
    .vg-chat-panel {
      position: fixed;
      bottom: 96px; right: 24px;
      width: 388px; height: 560px;
      background: white;
      border-radius: 18px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
      display: flex; flex-direction: column;
      z-index: 1000;
      overflow: hidden;
      transform: scale(0.88) translateY(24px);
      opacity: 0; pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
      transform-origin: bottom right;
    }
    .vg-chat-panel.vg-open {
      transform: scale(1) translateY(0);
      opacity: 1; pointer-events: all;
    }
    @media (max-width: 1023px) {
      .vg-chat-panel {
        bottom: calc(68px + env(safe-area-inset-bottom));
        right: 0; left: 0; width: 100%;
        height: calc(100vh - 68px - env(safe-area-inset-bottom) - 64px);
        border-radius: 18px 18px 0 0;
        transform: translateY(110%);
        transform-origin: bottom center;
      }
      .vg-chat-panel.vg-open { transform: translateY(0); opacity: 1; }
    }

    /* ── Chat header ── */
    .vg-chat-header {
      background: #2D5016;
      padding: 14px 16px;
      display: flex; align-items: center; gap: 11px;
      flex-shrink: 0;
    }
    .vg-chat-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.14);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .vg-chat-title { flex: 1; min-width: 0; }
    .vg-chat-title h4 {
      font-family: 'Montserrat', sans-serif;
      font-size: 14px; font-weight: 700; color: white; line-height: 1.2;
    }
    .vg-chat-title p {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px; color: rgba(255,255,255,0.72);
      margin-top: 2px; display: flex; align-items: center; gap: 5px;
    }
    .vg-online-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #4ade80; flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(74,222,128,0.3);
    }
    .vg-chat-close {
      background: rgba(255,255,255,0.14); border: none; color: white;
      width: 32px; height: 32px; border-radius: 50%;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    .vg-chat-close:hover { background: rgba(255,255,255,0.26); }

    /* ── Messages ── */
    .vg-chat-messages {
      flex: 1; overflow-y: auto;
      padding: 16px 14px;
      background: #FAF7F2;
      display: flex; flex-direction: column; gap: 12px;
      scroll-behavior: smooth;
    }
    .vg-chat-messages::-webkit-scrollbar { width: 4px; }
    .vg-chat-messages::-webkit-scrollbar-thumb { background: #C4956A; border-radius: 4px; }

    .vg-msg { display: flex; gap: 8px; align-items: flex-end; }
    .vg-msg--bot  { align-self: flex-start; }
    .vg-msg--user { align-self: flex-end; flex-direction: row-reverse; }

    .vg-msg-av {
      width: 30px; height: 30px; border-radius: 50%;
      background: #2D5016; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .vg-msg-bubble {
      max-width: calc(100% - 44px);
      padding: 10px 14px;
      font-family: 'Montserrat', sans-serif;
      font-size: 13.5px; line-height: 1.58;
      border-radius: 16px; word-wrap: break-word;
    }
    .vg-msg--bot  .vg-msg-bubble {
      background: white; color: #1f1f1f;
      border-bottom-left-radius: 4px;
      border: 1px solid #E8E0D5;
    }
    .vg-msg--user .vg-msg-bubble {
      background: #2D5016; color: white;
      border-bottom-right-radius: 4px;
    }
    .vg-msg-bubble strong { font-weight: 700; }
    .vg-msg-bubble ul { padding-left: 16px; margin: 6px 0; }
    .vg-msg-bubble li { margin-bottom: 3px; }
    .vg-msg-bubble h3 {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px; font-weight: 700;
      color: #2D5016; margin: 10px 0 4px;
    }
    .vg-msg--user .vg-msg-bubble h3 { color: rgba(255,255,255,0.85); }

    /* Quick replies */
    .vg-quick-replies { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; max-width: calc(100% - 44px); }
    .vg-qbtn {
      background: white; border: 1.5px solid #2D5016; color: #2D5016;
      font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600;
      padding: 6px 12px; border-radius: 20px; cursor: pointer;
      transition: background 0.15s, color 0.15s;
      -webkit-tap-highlight-color: transparent; touch-action: manipulation;
    }
    .vg-qbtn:hover { background: #2D5016; color: white; }

    /* Typing indicator */
    .vg-typing-wrap { display: flex; gap: 8px; align-items: flex-end; }
    .vg-typing {
      display: flex; gap: 5px; align-items: center;
      padding: 12px 16px; background: white;
      border: 1px solid #E8E0D5;
      border-radius: 16px; border-bottom-left-radius: 4px;
    }
    .vg-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #2D5016; opacity: 0.45;
      animation: vg-dot-bounce 1.3s infinite;
    }
    .vg-dot:nth-child(2) { animation-delay: 0.22s; }
    .vg-dot:nth-child(3) { animation-delay: 0.44s; }
    @keyframes vg-dot-bounce {
      0%,55%,100% { transform: translateY(0); opacity: 0.45; }
      28%          { transform: translateY(-6px); opacity: 1; }
    }

    /* Disclaimer */
    .vg-disclaimer {
      font-family: 'Montserrat', sans-serif; font-size: 10px; color: #9CA3AF;
      text-align: center; padding: 5px 12px 6px;
      background: #FAF7F2; border-top: 1px solid #EDE7DC; line-height: 1.45; flex-shrink: 0;
    }

    /* Input */
    .vg-input-area {
      padding: 10px 12px; background: white; border-top: 1px solid #E8E0D5;
      display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;
    }
    .vg-input {
      flex: 1; border: 1.5px solid #E8E0D5; border-radius: 22px;
      padding: 9px 14px; font-family: 'Montserrat', sans-serif;
      font-size: 13.5px !important; color: #1f1f1f; background: #FAF7F2;
      resize: none; outline: none; max-height: 90px; line-height: 1.45;
      transition: border-color 0.18s; -webkit-appearance: none;
    }
    .vg-input:focus { border-color: #2D5016; background: white; }
    .vg-input::placeholder { color: #B0A89A; }

    .vg-send {
      width: 40px; height: 40px; border-radius: 50%; background: #2D5016;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.15s, transform 0.12s;
      -webkit-tap-highlight-color: transparent; touch-action: manipulation;
    }
    .vg-send:hover:not(:disabled) { background: #3d6b1f; transform: scale(1.06); }
    .vg-send:disabled { background: #D1D5DB; cursor: default; }

    .vg-powered {
      font-family: 'Montserrat', sans-serif; font-size: 9.5px; color: #C4956A;
      text-align: center; padding: 4px 12px 8px; background: white; flex-shrink: 0;
    }
  `;

  // ─── HTML ───────────────────────────────────────────────────────────────────
  var HTML = `
    <!-- Click-away backdrop -->
    <div class="vg-backdrop" id="vgBackdrop"></div>

    <!-- Speed Dial FAB -->
    <div class="vg-fab-wrap">

      <!-- Options (slide up) -->
      <div class="vg-fab-options" id="vgFabOptions">

        <!-- Option 1: AI Advisor -->
        <div class="vg-fab-option">
          <span class="vg-fab-label" onclick="vgOpenAI()">Ayurvedic AI Advisor</span>
          <button class="vg-fab-mini vg-fab-ai" onclick="vgOpenAI()" aria-label="Open Ayurvedic AI Advisor">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5.5 5 9.5c0 3.2 1.8 6 4.5 7.5V20l2.5-1.2 2.5 1.2v-3c2.7-1.5 4.5-4.3 4.5-7.5C19 5.5 16 2 12 2z" fill="white"/>
              <line x1="9" y1="9.5" x2="15" y2="9.5" stroke="#2D5016" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="12" y1="7"   x2="12" y2="12"  stroke="#2D5016" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Option 2: WhatsApp -->
        <div class="vg-fab-option">
          <span class="vg-fab-label" onclick="window.open('${WA_LINK}','_blank')">Chat on WhatsApp</span>
          <a class="vg-fab-mini vg-fab-wa" href="${WA_LINK}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.93 14.07c-.2.56-1.18 1.07-1.63 1.13-.41.06-.93.08-1.5-.1-.34-.1-.79-.25-1.35-.5C10.3 15.6 8.9 13.6 8.8 13.46c-.1-.14-.84-1.12-.84-2.13 0-1.01.53-1.51.72-1.72.19-.21.41-.26.55-.26h.39c.12 0 .29-.05.45.34.17.4.57 1.39.62 1.49.05.1.08.22.02.35-.07.13-.1.21-.2.32-.1.11-.21.24-.3.32-.1.09-.2.19-.09.37.11.18.5.82 1.07 1.32.73.65 1.35.85 1.54.94.19.09.3.08.41-.05.11-.13.48-.56.6-.75.13-.19.26-.16.44-.1.18.06 1.16.55 1.36.65.2.1.33.15.38.23.05.09.05.51-.15 1.07z"/>
            </svg>
          </a>
        </div>

      </div>

      <!-- Main FAB button -->
      <button class="vg-fab-main vg-pulse" id="vgFabMain" aria-label="Contact options" aria-expanded="false">
        <div class="vg-badge" id="vgBadge">2</div>
        <!-- Default icon: chat bubbles -->
        <span class="vg-fab-icon vg-fab-icon--open">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white"/>
          </svg>
        </span>
        <!-- Close icon: X -->
        <span class="vg-fab-icon vg-fab-icon--close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </span>
      </button>

    </div><!-- /vg-fab-wrap -->

    <!-- Chat panel (separate from FAB) -->
    <div class="vg-chat-panel" id="vgPanel" role="dialog" aria-label="Ayurvedic Health Advisor chat">
      <div class="vg-chat-header">
        <div class="vg-chat-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8 2 5 5.5 5 9.5c0 3.2 1.8 6 4.5 7.5V20l2.5-1.2 2.5 1.2v-3c2.7-1.5 4.5-4.3 4.5-7.5C19 5.5 16 2 12 2z" fill="rgba(255,255,255,0.92)"/>
            <line x1="9" y1="9.5" x2="15" y2="9.5" stroke="#2D5016" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="12" y1="7"   x2="12" y2="12"  stroke="#2D5016" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="vg-chat-title">
          <h4>Ayurvedic Health Advisor</h4>
          <p><span class="vg-online-dot"></span>Vaidyagrama &nbsp;·&nbsp; Available now</p>
        </div>
        <button class="vg-chat-close" id="vgClose" aria-label="Close chat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="vg-chat-messages" id="vgMessages"></div>

      <div class="vg-disclaimer">
        Educational guidance only &bull; Not a substitute for medical advice<br>
        For prescriptions &amp; treatment plans, consult your Vaidyagrama physician
      </div>

      <div class="vg-input-area">
        <textarea class="vg-input" id="vgInput"
          placeholder="Ask me anything about Ayurveda…"
          rows="1" aria-label="Your message"></textarea>
        <button class="vg-send" id="vgSend" disabled aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="vg-powered">Powered by Vaidyagrama AI &bull; Grounded in Classical Ayurveda</div>
    </div>
  `;

  // ─── Mount ──────────────────────────────────────────────────────────────────
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  var root = document.createElement('div');
  root.id = 'vg-chat-widget';
  root.innerHTML = HTML;
  document.body.appendChild(root);

  // ─── Refs ────────────────────────────────────────────────────────────────────
  var fabMain    = document.getElementById('vgFabMain');
  var fabOptions = document.getElementById('vgFabOptions');
  var backdrop   = document.getElementById('vgBackdrop');
  var badge      = document.getElementById('vgBadge');
  var panel      = document.getElementById('vgPanel');
  var closeBtn   = document.getElementById('vgClose');
  var messagesEl = document.getElementById('vgMessages');
  var inputEl    = document.getElementById('vgInput');
  var sendBtn    = document.getElementById('vgSend');

  // ─── State ────────────────────────────────────────────────────────────────────
  var dialOpen    = false;
  var chatOpen    = false;
  var isLoading   = false;
  var history     = [];
  var welcomed    = false;

  // ─── Speed Dial ──────────────────────────────────────────────────────────────
  function openDial() {
    dialOpen = true;
    fabOptions.classList.add('vg-fab-open');
    fabMain.classList.add('vg-fab-open-state');
    fabMain.setAttribute('aria-expanded', 'true');
    backdrop.classList.add('vg-show');
    if (badge) badge.style.display = 'none';
  }

  function closeDial() {
    dialOpen = false;
    fabOptions.classList.remove('vg-fab-open');
    fabMain.classList.remove('vg-fab-open-state');
    fabMain.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('vg-show');
  }

  fabMain.addEventListener('click', function () {
    dialOpen ? closeDial() : openDial();
  });

  backdrop.addEventListener('click', function () {
    closeDial();
  });

  // ─── Open AI chat ─────────────────────────────────────────────────────────────
  window.vgOpenAI = function () {
    closeDial();
    openChat();
  };

  function openChat() {
    chatOpen = true;
    panel.classList.add('vg-open');

    if (!welcomed) {
      welcomed = true;
      setTimeout(function () {
        addMsg(
          'Namaste 🙏\n\nI\'m your **Ayurvedic Health Advisor** at Vaidyagrama. I can help you:\n\n' +
          '• Understand your body type (Dosha) and what it means\n' +
          '• Analyze symptoms through Ayurvedic and modern lens\n' +
          '• Suggest diet and lifestyle changes for natural healing\n' +
          '• Explain Panchakarma and which treatments may help you\n\n' +
          'How may I help you today?',
          'bot', true
        );
      }, 320);
    }
    setTimeout(function () { inputEl.focus(); }, 380);
  }

  function closeChat() {
    chatOpen = false;
    panel.classList.remove('vg-open');
  }

  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeChat(); closeDial(); }
  });

  // ─── Markdown renderer ────────────────────────────────────────────────────────
  function renderMd(text) {
    text = text.replace(/^(\d+)\.\s([A-Z &:\/]+)$/gm, '<h3>$1. $2</h3>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/^[-•]\s(.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/g, function (m) { return '<ul>' + m + '</ul>'; });
    text = text.replace(/\n\n/g, '<br><br>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }

  // ─── Add message ──────────────────────────────────────────────────────────────
  function addMsg(text, role, withQuick) {
    var row = document.createElement('div');
    row.className = 'vg-msg vg-msg--' + role;

    if (role === 'bot') {
      var quickHtml = '';
      if (withQuick) {
        quickHtml = '<div class="vg-quick-replies">' +
          '<button class="vg-qbtn" onclick="vgQuick(\'What is my Dosha type?\')">🌿 My Dosha</button>' +
          '<button class="vg-qbtn" onclick="vgQuick(\'I have symptoms to discuss\')">💬 Symptoms</button>' +
          '<button class="vg-qbtn" onclick="vgQuick(\'Tell me about Panchakarma\')">🏥 Panchakarma</button>' +
          '<button class="vg-qbtn" onclick="vgQuick(\'How can Ayurveda help chronic conditions?\')">✨ Chronic issues</button>' +
          '</div>';
      }
      row.innerHTML =
        '<div class="vg-msg-av">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none">' +
            '<path d="M12 2C8 2 5 5.5 5 9.5c0 3.2 1.8 6 4.5 7.5V20l2.5-1.2 2.5 1.2v-3c2.7-1.5 4.5-4.3 4.5-7.5C19 5.5 16 2 12 2z" fill="rgba(255,255,255,0.9)"/>' +
          '</svg>' +
        '</div>' +
        '<div><div class="vg-msg-bubble">' + renderMd(text) + '</div>' + quickHtml + '</div>';
    } else {
      row.innerHTML = '<div class="vg-msg-bubble">' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
    }

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ─── Typing indicator ─────────────────────────────────────────────────────────
  function showTyping() {
    var el = document.createElement('div');
    el.id = 'vgTyping';
    el.className = 'vg-typing-wrap';
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Static skeleton for reduced-motion users
      el.innerHTML =
        '<div class="vg-msg-av"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2C8 2 5 5.5 5 9.5c0 3.2 1.8 6 4.5 7.5V20l2.5-1.2 2.5 1.2v-3c2.7-1.5 4.5-4.3 4.5-7.5C19 5.5 16 2 12 2z" fill="rgba(255,255,255,0.9)"/></svg></div>' +
        '<div style="padding:10px 14px;background:white;border:1px solid #E8E0D5;border-radius:16px;border-bottom-left-radius:4px;width:160px">' +
        '<div class="vg-skeleton" style="width:80%"></div>' +
        '<div class="vg-skeleton" style="width:55%"></div>' +
        '<div style="font-family:Montserrat,sans-serif;font-size:11px;color:#9CA3AF;margin-top:4px">Analyzing…</div></div>';
    } else {
      el.innerHTML =
        '<div class="vg-msg-av"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2C8 2 5 5.5 5 9.5c0 3.2 1.8 6 4.5 7.5V20l2.5-1.2 2.5 1.2v-3c2.7-1.5 4.5-4.3 4.5-7.5C19 5.5 16 2 12 2z" fill="rgba(255,255,255,0.9)"/></svg></div>' +
        '<div class="vg-typing"><div class="vg-dot"></div><div class="vg-dot"></div><div class="vg-dot"></div></div>';
    }
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() { var el = document.getElementById('vgTyping'); if (el) el.remove(); }

  // ─── Send message ──────────────────────────────────────────────────────────────
  function sendMsg(text) {
    text = text.trim();
    if (!text || isLoading) return;

    addMsg(text, 'user');
    history.push({ role: 'user', content: text });
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    isLoading = true;
    showTyping();

    fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
    .then(function (res) {
      hideTyping();
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var reply = data.reply || 'I apologize, I could not generate a response. Please try again.';
      addMsg(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
    })
    .catch(function (err) {
      hideTyping();
      history.pop();
      addMsg('I\'m having trouble connecting right now. Please try again, or reach us on WhatsApp: **+91 94888 94888**', 'bot');
      console.warn('VG Chat error:', err.message);
    })
    .finally(function () {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    });
  }

  window.vgQuick = function (text) { if (!chatOpen) openChat(); inputEl.value = text; sendMsg(text); };

  // ─── Input events ─────────────────────────────────────────────────────────────
  inputEl.addEventListener('input', function () {
    sendBtn.disabled = !inputEl.value.trim();
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 90) + 'px';
  });
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(inputEl.value); }
  });
  sendBtn.addEventListener('click', function () { sendMsg(inputEl.value); });

})();
