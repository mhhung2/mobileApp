/**
 * BottomBarNav - 固定底部導覽列類別
 */
class BottomBarNav {
  constructor(config = {}) {
    this.items = config.items || [];
    this.maxVisible = config.maxVisible || 5;
    this.activeId = config.activeId || '';
    this.containerId = config.containerId || null;
    this.overlayEl = null;
    this.barEl = null;

    this.init();
  }

  static MORE_ICON = `<svg viewBox="0 0 24 24"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm6 6h4v-4h-4v4z"/></svg>`;

init() {
    const existing = document.getElementById('bottom-bar-nav-root');
    if (existing) existing.remove();

    const rootContainer = document.createElement('div');
    rootContainer.id = 'bottom-bar-nav-root';

    let visibleItems = [];
    let overflowItems = [];

    if (this.items.length <= this.maxVisible) {
      visibleItems = this.items;
    } else {
      visibleItems = this.items.slice(0, this.maxVisible - 1);
      overflowItems = this.items.slice(this.maxVisible - 1);
    }

    // 1. 建立主導覽列 (只放頭幾個)
    this.barEl = document.createElement('nav');
    this.barEl.className = 'bottom-bar-nav';

    visibleItems.forEach(item => {
      this.barEl.appendChild(this.createItemBtn(item));
    });

    // 2. 當有項目溢出時，加入「更多」按鈕
    if (overflowItems.length > 0) {
      const moreBtn = this.createItemBtn({
        id: '_more',
        label: '更多',
        icon: BottomBarNav.MORE_ICON,
        onClick: () => this.toggleMoreMenu(true)
      });
      this.barEl.appendChild(moreBtn);

      // 💡 關鍵修改：傳入完整的 this.items，讓「更多」彈出面板顯示所有選擇項目
      this.createMoreOverlay(this.items, rootContainer);
    }

    rootContainer.appendChild(this.barEl);

    const target = this.containerId ? document.getElementById(this.containerId) : document.body;
    if (target) target.appendChild(rootContainer);
  }

  createItemBtn(item) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `bottom-bar-item ${this.activeId === item.id ? 'active' : ''}`;
    btn.dataset.id = item.id;

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'bottom-bar-icon-wrapper';
	// 💡 自動解析：如果是常用圖標名稱則從 UI_ICONS 抓，否則當作原始 SVG 字串
	let iconContent = item.icon || '';
    if (typeof UI_ICONS !== 'undefined' && UI_ICONS[item.icon]) {
      iconContent = UI_ICONS[item.icon];
    }
    iconWrapper.innerHTML = iconContent;

    if (item.badge !== undefined && item.badge !== null && item.badge !== '') {
      const badgeEl = document.createElement('span');
      badgeEl.className = 'bottom-bar-badge';
      if (item.badge === true) {
        badgeEl.classList.add('dot-only');
      } else {
        badgeEl.textContent = String(item.badge);
      }
      iconWrapper.appendChild(badgeEl);
    }

    const labelEl = document.createElement('span');
    labelEl.className = 'bottom-bar-label';
    labelEl.textContent = item.label;

    btn.appendChild(iconWrapper);
    btn.appendChild(labelEl);

    btn.addEventListener('click', (e) => {
      if (item.id !== '_more') {
        this.setActive(item.id);
        this.toggleMoreMenu(false);
      }
      if (typeof item.onClick === 'function') {
        // 如果 onClick傳入的是字串（例如全域函式名稱），自動幫忙執行
        if (typeof item.onClick === 'string' && typeof window[item.onClick] === 'function') {
          window[item.onClick](item, e);
        } else {
          item.onClick(item, e);
        }
      }
    });

    return btn;
  }

  createMoreOverlay(overflowItems, parentEl) {
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'bottom-bar-more-overlay';

    const menuEl = document.createElement('div');
    menuEl.className = 'bottom-bar-more-menu';

    overflowItems.forEach(item => {
      menuEl.appendChild(this.createItemBtn(item));
    });

    this.overlayEl.appendChild(menuEl);

    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.toggleMoreMenu(false);
      }
    });

    parentEl.appendChild(this.overlayEl);
  }

  toggleMoreMenu(show) {
    if (this.overlayEl) {
      if (show) {
        this.overlayEl.classList.add('show');
      } else {
        this.overlayEl.classList.remove('show');
      }
    }
  }

  setActive(id) {
    this.activeId = id;
    const allBtns = document.querySelectorAll('#bottom-bar-nav-root .bottom-bar-item');
    allBtns.forEach(btn => {
      if (btn.dataset.id === id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateBadge(id, badgeValue) {
    const itemObj = this.items.find(i => i.id === id);
    if (itemObj) itemObj.badge = badgeValue;
    
    const btn = document.querySelector(`#bottom-bar-nav-root .bottom-bar-item[data-id="${id}"]`);
    if (btn) {
      const wrapper = btn.querySelector('.bottom-bar-icon-wrapper');
      let badgeEl = wrapper.querySelector('.bottom-bar-badge');
      
      if (badgeValue === undefined || badgeValue === null || badgeValue === '') {
        if (badgeEl) badgeEl.remove();
      } else {
        if (!badgeEl) {
          badgeEl = document.createElement('span');
          badgeEl.className = 'bottom-bar-badge';
          wrapper.appendChild(badgeEl);
        }
        if (badgeValue === true) {
          badgeEl.className = 'bottom-bar-badge dot-only';
          badgeEl.textContent = '';
        } else {
          badgeEl.className = 'bottom-bar-badge';
          badgeEl.textContent = String(badgeValue);
        }
      }
    }
  }
}

const UI_ICONS = {
  // === 1. 系統與基礎導覽 (Core Navigation) ===
  // 1. 主頁 / 首頁
  home: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  // 2. 搜尋
  search: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  // 3. 訊息 / 對話
  message: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`,
  // 4. 通知 / 鈴鐺
  bell: `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`,
  // 5. 購物車
  cart: `<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
  // 6. 收藏 / 追蹤
  star: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  // 7. 個人 / 用戶
  user: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  // 8. 登入 (Login)
  login: `<svg viewBox="0 0 24 24"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg>`,
  // 9. 登出 (Logout)
  logout: `<svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>`,
  // 10. 設定
  settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`,

  // === 2. 勤務、通訊與管理 (Duty, Comms & Management) ===
  // 11. 對講機 (Walkie Talkie)
  walkieTalkie: `<svg viewBox="0 0 24 24"><path d="M10 2h2v3h-2V2zm-3 4h10c1.1 0 2 .9 2 2v13c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2zm2 3v2h6V9H9zm0 4v2h6v-2H9zm0 4v2h4v-2H9z"/></svg>`,
  // 12. 對講機 - 風格B (Walkie Talkie Style B)
  walkieTalkieB: `<svg viewBox="0 0 24 24"><path d="M8.5 6.13V2H7v4.13C5.8 6.57 5 7.68 5 9v11c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V9c0-1.32-.8-2.43-2-2.87V2h-1.5v4.13C14.6 6.05 13.82 6 13 6h-3c-.82 0-1.6.05-2.5.13zM12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm-3 8h6v2H9v-2z"/></svg>`,
  // 13. 人群管理 (Crowd Management)
  crowdControl: `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  // 14. 步操 (Drill / Marching)
  marching: `<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/></svg>`,
  // 15. 訓練 (Training / Cap)
  training: `<svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`,
  // 16. 考場狀況 (Exam Center / Assignment)
  examStatus: `<svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`,
  // 17. USER ROLE 頁面權限設定 (User Role / Permission Shield)
  rolePermission: `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>`,
  // 18. 日曆 / 派更 (Calendar)
  calendar: `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>`,
  // 19. 日曆B
  calendarB: `<svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,
  // 20. 服務 (Service / Hands Heart)
  service: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,

  // === 3. 急救、醫療與安全 (First Aid, Health & Safety) ===
  // 21. 急救包 (First Aid / Red Cross Kit)
  firstAidBag: `<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm6 9h-3v3h-2v-3H8v-2h3V9h2v2h3v2z"/></svg>`,
  // 22. 急救
  firstAid: `<svg viewBox="0 0 24 24"><path d="M10 2h4v7h7v4h-7v9h-4v-9H3V9h7V2z"/></svg>`,
  // 23. 醫院 (Hospital)
  hospital: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>`,
  // 24. 警報 / 緊急 (Alert / Warning Triangle)
  alert: `<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
  // 25. 鎖頭 / 密碼安全 (Security / Lock)
  lock: `<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
  
  

  // === 4. 地點、交通與設施 (Location, Transport & Facilities) ===
  // 26. 地圖 / 鄰近
  location: `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  // 27. 地圖導航 (Navigation / Compass)
  navigation: `<svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>`,
  // 28. 交通 (Traffic / Bus)
  traffic: `<svg viewBox="0 0 24 24"><path d="M12 2c-4.42 0-8 .5-8 4v10c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4zm-4.5 13c-.83 0-1.5-.67-1.5-1.5S6.67 12 7.5 12s1.5 6.7 1.5 1.5S8.33 15 7.5 15zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v3z"/></svg>`,
  // 29. 交通燈 (Traffic Light)
  trafficLight: `<svg viewBox="0 0 24 24"><path d="M12 2c-2.76 0-5 2.24-5 5v10c0 2.76 2.24 5 5 5s5-2.24 5-5V7c0-2.76-2.24-5-5-5zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>`,
  // 30. 火車 (Train)
  train: `<svg viewBox="0 0 24 24"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zm0 2c3.51 0 4.96.48 5.5 1H6.5c.54-.52 1.99-1 5.5-1zm-6 8V7h12v5H6zm2 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
  // 31. 飛機 (Aircraft / Flight)
  airplane: `<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,

  // === 5. 數據、檔案與媒體 (Data, Files & Media) ===
  // 33. 檔案庫 / 文件 (Document / File)
  file: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  // 34. CHECK LIST (Checklist / Tasks)
  checklist: `<svg viewBox="0 0 24 24"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM4 11l2 2 4-4-1.41-1.41L6 9.17l-.59-.59L4 11zm0 8l2 2 4-4-1.41-1.41L6 17.17l-.59-.59L4 19z"/></svg>`,
  // 35. 統計圖表 (Analytics / Chart)
  chart: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>`,
  // 36. 歷史紀錄 / 日誌 (History / Logs)
  history: `<svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>`,
  // 37. 相機 / 拍照備份 (Camera)
  camera: `<svg viewBox="0 0 24 24"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>`,
  // 38. 掃瞄 QR Code (Scan QR)
  qrScan: `<svg viewBox="0 0 24 24"><path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-14h-4V3h4c1.1 0 2 .9 2 2v4h-2V5zM7 7h4v4H7zm0 6h4v4H7zm6-6h4v4h-4zm0 6h4v4h-4z"/></svg>`,
  // 39. 上傳 / 匯入 (Upload)
  upload: `<svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>`,
  // 40. 下載 / 匯出 (Download)
  download: `<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`,

  // === 6. 通訊與社交 (Communication & Social) ===
  // 41. 電話 / 聯絡 (Phone)
  phone: `<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
  // 42. 手提電話 (Mobile Phone)
  mobilePhone: `<svg viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>`,
  // 43. 電子郵件 (Email)
  email: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  // 44. WhatsApp (Social Chat Logo)
  whatsapp: `<svg viewBox="0 0 24 24"><path d="M16.75 13.96c-.25-.13-1.47-.72-1.7-.81-.22-.09-.39-.13-.56.12-.17.25-.66.81-.81.98-.15.17-.31.19-.56.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.36-.77-1.85-.21-.48-.42-.42-.58-.43h-.5c-.17 0-.44.06-.67.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.74 2.66 4.22 3.73.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29zM12 2a10 10 0 0 0-8.48 15.31L2 22l4.81-1.26A10 10 0 1 0 12 2z"/></svg>`,
  // 46. 語言設定 (Language / Translate)
  language: `<svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2.1l1.1-3h4.6l1.1 3H23l-4.5-12zm-2.62 7l1.62-4.41L19.12 17h-3.24z"/></svg>`,
  // 47. 連結 / 網址 (Link)
  link: `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
  // 48. 使用條款 / 服務協議 (Terms of Service / Contract)
  terms: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,

  // === 7. 通用工具與狀態操作 (Tools & Actions) ===
  // 49. 電腦 (Desktop Computer)
  computer: `<svg viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>`,
  // 50. 士巴拿 / 扳手 (Wrench)
  wrench: `<svg viewBox="0 0 24 24"><path d="M13.78 15.3l5.9 5.9c.78.78 2.05.78 2.83 0l.71-.71c.78-.78.78-2.05 0-2.83l-5.9-5.9c.38-.75.6-1.59.6-2.48 0-3.13-2.54-5.67-5.67-5.67-1.12 0-2.16.33-3.04.89l3.3 3.3-2.83 2.83-3.3-3.3c-.56.88-.89 1.92-.89 3.04 0 3.13 2.54 5.67 5.67 5.67.89 0 1.73-.22 2.48-.6z"/></svg>`,
  // 51. 剪刀 (Scissors)
  scissors: `<svg viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm7-7l-2-2 9-9h3v1l-10 10z"/></svg>`,
  // 52. 鎖匙 (Key)
  key: `<svg viewBox="0 0 24 24"><path d="M12.65 10C11.7 7.31 9.08 5.5 6 5.5c-3.58 0-6.5 2.92-6.5 6.5s2.92 6.5 6.5 6.5c3.08 0 5.7-1.81 6.65-4.5H17v3h3v-3h2v-4H12.65zM6 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
  // 53. 錶 (Watch)
  watch: `<svg viewBox="0 0 24 24"><path d="M20 12c0-2.54-1.19-4.81-3.04-6.27L16 2H8l-.96 3.73C5.19 7.19 4 9.46 4 12s1.19 4.81 3.04 6.27L8 22h8l.96-3.73C18.81 16.81 20 14.54 20 12zM6 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z"/></svg>`,
  // 54. 時鐘 (Clock)
  clock: `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  // 55. 重新整理 / 更新 (Sync / Refresh)
  sync: `<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>`,
  // 56. 編輯 / 筆 (Edit / Pencil)
  edit: `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
  // 57. 眼睛 / 檢視 (View / Eye)
  eye: `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
  // 58. TICK號 / 打勾 (Check Mark)
  tick: `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
  // 59. 禁止 (Prohibited / Forbidden)
  prohibited: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/></svg>`,
  // 60. 垃圾桶 / 刪除 (Trash / Delete)
  trash: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,

  // === 8. 自然、氣象與動物 (Nature, Weather & Animals) ===
  // 61. 閃電 (Lightning)
  lightning: `<svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`,
  // 64. 兔 (Rabbit)
  rabbit: `<svg viewBox="0 0 24 24"><path d="M9 2c-.83 0-1.5.67-1.5 1.5V8c0 .55.45 1 1 1s1-.45 1-1V3.5C9.5 2.67 8.83 2 8 2zm8 0c-.83 0-1.5.67-1.5 1.5V8c0 .55.45 1 1 1s1-.45 1-1V3.5C17.5 2.67 16.83 2 16 2zm-4 7c-4.42 0-8 2.69-8 6 0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4 0-3.31-3.58-6-8-6zm-2.5 3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>`,

  // === 9. 娛樂、休閒與表情 (Lifestyle & Expressions) ===
  // 65. 笑臉 (Smiley)
  smiley: `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>`,
  // 66. smiley2
  smiley2: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3zm-2.5-6c-.83 0-1.5-.67-1.5-1.5S8.67 8 9.5 8s1.5.67 1.5 1.5S10.33 11 9.5 11zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 8 14.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
  // 67. face1
  face1: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.16.68 4.15 1.83 5.8L3 21l3.2-.83C7.85 21.32 9.84 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-3 7c.83 0 1.5.67 1.5 1.5S9.83 12 9 12s-1.5-.67-1.5-1.5S8.17 9 9 9zm6 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3 8c-1.93 0-3.5-1.12-3.5-2.5h7c0 1.38-1.57 2.5-3.5 2.5z"/></svg>`,
  // 68. face2
  face2: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-4 7c.83 0 1.5.67 1.5 1.5S8.83 12 8 12s-1.5-.67-1.5-1.5S7.17 9 8 9zm8 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-4 8c-1.66 0-3-1 3-2.5 0 1.5-1.34 2.5-3 2.5z"/></svg>`,
  // 69. 錢 (Money / Dollar)
  money: `<svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>`,
  // 70. 酒 (Wine Glass)
  wine: `<svg viewBox="0 0 24 24"><path d="M6 3l0 6c0 2.97 2.16 5.43 5 5.91V19H8v2h8v-2h-3v-4.09c2.84-.48 5-2.94 5-5.91V3H6zm10 5H8V5h8v3z"/></svg>`,

  // === 10. 流程與控制 (Workflow & Process Nodes) ===
  // 71. 開始 / 播放 (Start / Play)
  flowStart: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
  // 72. 暫停 (Pause)
  flowPause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  // 73. 停止 (Stop)
  flowStop: `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>`,
  // 74. 上一步 (Previous / Step Back)
  flowPrev: `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`,
  // 75. 下一步 / 推進 (Next / Step Forward)
  flowNext: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
  // 76. 審批通過 (Approve / Stamp)
  flowApprove: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  // 77. 駁回 / 退回 (Reject / Cross Circle)
  flowReject: `<svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>`,
  // 79. 時間計時 (Timer Node)
  flowTimer: `<svg viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`,
  // 80. 分支判斷 (Decision Node / Branch)
  flowBranch: `<svg viewBox="0 0 24 24"><path d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4h-6zm-4 0H4v6l2.29-2.29 4.71 4.71V20h2v-8.41L7.71 6.29 10 4z"/></svg>`,
  // 81. 循環 / 輪替 (Loop / Cycle)
  flowLoop: `<svg viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>`,
  // 82. 分派任務 (Assign / Send Person)
  flowAssign: `<svg viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  // 83. 移交 / 轉交 (Transfer / Forward)
  flowTransfer: `<svg viewBox="0 0 24 24"><path d="M12 8V4l8 8-8 8v-4H4V8h8z"/></svg>`,
  // 84. 存檔 / 歸檔 (Archive)
  flowArchive: `<svg viewBox="0 0 24 24"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.2 3 17.5 3h-11c-.7 0-1.38.21-1.65.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.41l.83-1zM12 18l-5-5h3V10h4v3h3l-5 5z"/></svg>`,
  // 85. 流程圖 / 步驟庫 (Workflow Chart)
  flowChart: `<svg viewBox="0 0 24 24"><path d="M22 11V3h-7v3H9V3H2v8h7V8h6v3h7zM8 9H4V5h4v4zm12 0h-4V5h4v4zm-7 4v3H9v-3H2v8h7v-3h6v3h7v-8h-7zm-8 7H4v-4h4v4zm12 0h-4v-4h4v4z"/></svg>`,
  // 86. 子程序 / 模組 (Sub-Process / Block)
  flowSubprocess: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h2v10H7zm8 0h2v10h-2z"/></svg>`,
  // 87. 標籤 / 階段分類 (Tag / Phase)
  flowTag: `<svg viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>`,
  // 88. 旗幟 / 關鍵節點 (Milestone Flag)
  flowFlag: `<svg viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>`,
  // 89. 釘選 / 關注 (Pin)
  flowPin: `<svg viewBox="0 0 24 24"><path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/></svg>`,
  // 90. 複製步驟 (Duplicate Step)
  flowDuplicate: `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
  // 91. 排序上移 (Order Up)
  flowMoveUp: `<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>`,
  // 92. 排序下移 (Order Down)
  flowMoveDown: `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`,
  // 93. 擴展 / 開啟細節 (Expand)
  flowExpand: `<svg viewBox="0 0 24 24"><path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"/></svg>`,
  // 94. 收合 (Collapse)
  flowCollapse: `<svg viewBox="0 0 24 24"><path d="M7.41 18.59L12 14l4.59 4.59L18 17.17l-6-6-6 6zM16.59 5.41L12 10 7.41 5.41 6 6.83l6 6 6-6z"/></svg>`,
  // 95. 檢視細節 (Detail / Info Circle)
  flowInfo: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
// 98. API 觸發點 (Webhook / Trigger)
  flowTrigger: `<svg viewBox="0 0 24 24"><path d="M11 15H6L13 1v9h5l-7 14v-9z"/></svg>`,
  // 99. 結束 (End Terminate)
  flowEnd: `<svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-12h8v8H8z"/></svg>`,


  // === 1. 日用與個人物品 (1-25) ===
  shirt: `<svg viewBox="0 0 24 24"><path d="M16 2l-4 3-4-3-6 4 3 4v11h14V10l3-4-6-4z"/></svg>`,
  hat: `<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0-6 6v3H2v2h20v-2h-4V9a6 6 0 0 0-6-6z"/></svg>`,
  crown: `<svg viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z"/></svg>`,
  lipstick: `<svg viewBox="0 0 24 24"><path d="M10 2l4 2v5h-4V2zm-1 8h6v3H9v-3zm-2 4h10v8H7v-8z"/></svg>`,
 
  // === 3. 交通與工具 (51-75) ===
  car: `<svg viewBox="0 0 24 24"><path d="M18.9 6c-.2-.6-.8-1-1.4-1H6.5c-.6 0-1.2.4-1.4 1L3 12v8c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-1h12v1c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-8l-2.1-6zM6.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
  bus: `<svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
  truck: `<svg viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3s3-1.3 3-3h2v-5l-3-4zM6 18.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm11.5 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM17 12V9.5h2.5l1.5 2.5H17z"/></svg>`,
  parking: `<svg viewBox="0 0 24 24"><path d="M5 3h6a5 5 0 0 1 0 10H9v8H5V3zm4 4v2h2a1 1 0 0 0 0-2H9z"/></svg>`,

  // === 4. 運動與戶外休閒 (76-100) ===
  trophyStar: `<svg viewBox="0 0 24 24"><path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L12 2zm-3 16h6v2H9v-2zm-2 3h10v2H7v-2z"/></svg>`,
  bowling: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`,
  camping: `<svg viewBox="0 0 24 24"><path d="M12 3L2 21h20L12 3zm0 5l5.5 10h-11L12 8z"/></svg>`,
 
  // === 5. 建築與場所 (101-125) ===
  bank: `<svg viewBox="0 0 24 24"><path d="M11.5 1L2 6v2h19V6l-9.5-5zM4 10v7h3v-7H4zm6 0v7h3v-7h-3zm6 0v7h3v-7h-3zM2 19v2h19v-2H2z"/></svg>`,
 
  // === 6. 表情與情緒狀況 (126-150) ===
  smile: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-3 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 10a5 5 0 0 1-4.5-3h9a5 5 0 0 1-4.5 3z"/></svg>`,
  sad: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-3 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 5a5 5 0 0 0-4.5 3h9a5 5 0 0 0-4.5-3z"/></svg>`,
  angry: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-4 5l3 2-3 1V7zm8 0v3l-3-1 3-2zm-4 10a5 5 0 0 1-4-2h8a5 5 0 0 1-4 2z"/></svg>`,
  surprised: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-3 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/></svg>`,

  // === 7. 辦公、娛樂與科技 (151-175) ===
  piano: `<svg viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5v-6h14v6zm-11-6v4H7v-4h1zm3 0v4h-1v-4h1zm3 0v4h-1v-4h1z"/></svg>`,
  gamepad: `<svg viewBox="0 0 24 24"><path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-12 7H7v2H5v-2H3v-2h2V9h2v2h2v2zm7-2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`,
  headphone: `<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h3v-8H5v-1a7 7 0 0 1 14 0v1h-3v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/></svg>`,

  // === 8. 符號、狀態與其他 (176-200) ===
  wifi: `<svg viewBox="0 0 24 24"><path d="M12 3C7.3 3 3.1 4.9 0 8l2.1 2.1C4.6 7.6 8.1 6 12 6s7.4 1.6 9.9 4.1L24 8C20.9 4.9 16.7 3 12 3zm0 6c-3.3 0-6.3 1.3-8.5 3.5L5.6 14.6C7.3 12.9 9.5 12 12 12s4.7.9 6.4 2.6l2.1-2.1C18.3 10.3 15.3 9 12 9zm0 6c-1.7 0-3.2.7-4.2 1.8L12 21l4.2-4.2C15.2 15.7 13.7 15 12 15z"/></svg>`,
  bluetooth: `<svg viewBox="0 0 24 24"><path d="M17.7 7.7L12 2h-1v7.6L6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l4.6-4.6V22h1l5.7-5.7-4.3-4.3 4.3-4.3zM13 5.8l2.3 2.3L13 10.4V5.8zm0 12.4v-4.6l2.3 2.3-2.3 2.3z"/></svg>`,


  // === 1. 導覽與系統控制 (1-20) ===
  unlock: `<svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2.71 3.16L1.39 4.47l2.43 2.43c-1.16 1.25-2.07 2.73-2.62 4.35 1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l2.55 2.55 1.41-1.41L2.71 3.16zM12 17c-2.76 0-5-2.24-5-5 0-.65.13-1.26.36-1.83l6.47 6.47c-.57.23-1.18.36-1.83.36z"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  minus: `<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>`,
  megaphone: `<svg viewBox="0 0 24 24"><path d="M18 11c0-1.6-.9-3.1-2.3-3.8l1.4-1.4C18.9 6.9 20 8.8 20 11s-1.1 4.1-2.9 5.2l-1.4-1.4c1.4-.7 2.3-2.2 2.3-3.8zM3 9v6h4l5 5V4L7 9H3zm7 7.17L7.83 14H5v-4h2.83L10 7.83v8.34z"/></svg>`,
  shield: `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4z"/></svg>`,
  badge: `<svg viewBox="0 0 24 24"><path d="M12 2L4 5v6c0 5.25 3.4 10.12 8 11.5 4.6-1.38 8-6.25 8-11.5V5l-8-3zm0 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"/></svg>`,



  // === 1. 商業、金融與交易 (1-35) ===
  creditCard: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
  receipt: `<svg viewBox="0 0 24 24"><path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2l-1.5 1.5L6 2l-1.5 1.5L3 2v20z"/></svg>`,
  coins: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 4.24 2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7c0-2.76-4.48-5-10-5zm0 3c4.41 0 7 1.5 7 2s-2.59 2-7 2-7-1.5-7-2 2.59-2 7-2zm0 14c-4.41 0-7-1.5-7-2v-2.17c1.76 1.12 4.28 1.67 7 1.67s5.24-.55 7-1.67V17c0 .5-2.59 2-7 2zm0-5c-4.41 0-7-1.5-7-2V9.83c1.76 1.12 4.28 1.67 7 1.67s5.24-.55 7-1.67V12c0 .5-2.59 2-7 2z"/></svg>`,
  piggyBank: `<svg viewBox="0 0 24 24"><path d="M19 14c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1h-1a7.002 7.002 0 0 0-4.06-6.26L15 2h-3l-1.22 2.44A6.98 6.98 0 0 0 8 4C4.14 4 1 7.14 1 11c0 2.22 1.03 4.2 2.64 5.47L3 20h3l1.33-2c1.07.43 2.25.67 3.67.67 1.42 0 2.6-.24 3.67-.67L16 20h3l-.64-3.53C19.97 15.2 21 13.22 21 11h-2v3zM13 7h-2V5h2v2z"/></svg>`,
  safe: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
  calculator: `<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 4H7V5h10v2zm-7 6H7v-2h3v2zm0 4H7v-2h3v2zm4-4h-3v-2h3v2zm0 4h-3v-2h3v2zm3 0h-2v-6h2v6z"/></svg>`,
  trendingUp: `<svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>`,
  trendingDown: `<svg viewBox="0 0 24 24"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>`,
  store: `<svg viewBox="0 0 24 24"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>`,
  shoppingBag: `<svg viewBox="0 0 24 24"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>`,
  percent: `<svg viewBox="0 0 24 24"><path d="M7.5 11C9.43 11 11 9.43 11 7.5S9.43 4 7.5 4 4 5.57 4 7.5 5.57 11 7.5 11zm0-5C8.33 6 9 6.67 9 7.5S8.33 9 7.5 9 6 8.33 6 7.5 6.67 6 7.5 6zm9 7c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.09-14.09l-14 14L4.18 19.5l14-14 1.41-1.41z"/></svg>`,
  deal: `<svg viewBox="0 0 24 24"><path d="M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V9.83c0-.53-.21-1.04-.59-1.41l-9.82-9.83zM10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>`,
  coinHand: `<svg viewBox="0 0 24 24"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-1 10c-3.31 0-6 2.69-6 6v2h14v-2c0-3.31-2.69-6-6-6h-2z"/></svg>`,
  investment: `<svg viewBox="0 0 24 24"><path d="M4 19h16v2H4v-2zm3-4h2v2H7v-2zm4-4h2v6h-2v-6zm4-4h2v10h-2V7zm4-4h2v14h-2V3z"/></svg>`,
  pieChart: `<svg viewBox="0 0 24 24"><path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2 0v8h8c-.47-4.69-4.31-8.53-9-8.03zm0 10v10c4.69-.5 8.53-4.31 8.03-9H13z"/></svg>`,
  barChart: `<svg viewBox="0 0 24 24"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13H19v6h-2.8z"/></svg>`,
  stamp: `<svg viewBox="0 0 24 24"><path d="M19 16c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-2h14v2zM12 2C9.79 2 8 3.79 8 6c0 1.3.62 2.46 1.58 3.19C8.61 10.15 8 11.5 8 13h8c0-1.5-.61-2.85-1.58-3.81C15.38 8.46 16 7.3 16 6c0-2.21-1.79-4-4-4zm0 18H4v2h16v-2h-8z"/></svg>`,
  folder: `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
  folderOpen: `<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>`,
  signature: `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM2 22h20v-2H2v2z"/></svg>`,
  briefcaseCheck: `<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2zm-3 11l-3-3 1.41-1.41L11 14.17l4.59-4.59L17 11l-6 6z"/></svg>`,

  // === 2. 科技、數位與網絡 (36-70) ===
  cpu: `<svg viewBox="0 0 24 24"><path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/></svg>`,
  database: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 3.79 2 6v12c0 2.21 4.48 4 10 4s10-1.79 10-4V6c0-2.21-4.48-4-10-4zm0 3c4.41 0 7 1.12 7 2s-2.59 2-7 2-7-1.12-7-2 2.59-2 7-2zm0 14c-4.41 0-7-1.12-7-2v-2.17c1.76.74 4.23 1.17 7 1.17s5.24-.43 7-1.17V17c0 .88-2.59 2-7 2zm0-5c-4.41 0-7-1.12-7-2V9.83c1.76.74 4.23 1.17 7 1.17s5.24-.43 7-1.17V12c0 .88-2.59 2-7 2z"/></svg>`,
  server: `<svg viewBox="0 0 24 24"><path d="M4 3h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm0 10h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2zm3-6h2v2H7V7zm0 10h2v2H7v-2zm10-3.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>`,
  cloudUpload: `<svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>`,
  cloudDownload: `<svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>`,
  code: `<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-12-3l1.41 1.41L12.83 12l-3.42-3.41L8 10l2 2-2 2zm4 0h6v2h-6v-2z"/></svg>`,
  robot: `<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 0-2 2v1H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-5V4a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 15h8v2H8v-2z"/></svg>`,
  aiSpark: `<svg viewBox="0 0 24 24"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>`,
  signal: `<svg viewBox="0 0 24 24"><path d="M2 22h20V2L2 22zm18-2H6.83L20 6.83V20z"/></svg>`,
  router: `<svg viewBox="0 0 24 24"><path d="M19 13H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm-3 5h-2v-2h2v2zm3 0h-2v-2h2v2zM6 6h2v5H6V6zm5-3h2v8h-2V3zm5 3h2v5h-2V6z"/></svg>`,
  usbDrive: `<svg viewBox="0 0 24 24"><path d="M15 7v-4h-6v4h-2v10c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-10h-2zm-4-2h2v2h-2v-2z"/></svg>`,
  hardDrive: `<svg viewBox="0 0 24 24"><path d="M20 6H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 8h-2v-2h2v2zm0-4h-2V8h2v2z"/></svg>`,
  mouse: `<svg viewBox="0 0 24 24"><path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93zM4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4zm7-13.93C7.05 1.56 4 4.92 4 9h7V1.07z"/></svg>`,
  keyboard: `<svg viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zM5 8h2v2H5V8zm0 3h2v2H5v-2zm14 6H5v-2h14v2zm0-3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>`,
  projector: `<svg viewBox="0 0 24 24"><path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-3 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
  printer: `<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>`,
  scanner: `<svg viewBox="0 0 24 24"><path d="M19.8 10.7L4.2 5 3 8.3l14.8 5.4 2-3zm.2 5.3H4c-1.1 0-2 .9-2 2v2h20v-2c0-1.1-.9-2-2-2z"/></svg>`,
  sdCard: `<svg viewBox="0 0 24 24"><path d="M18 2h-8L4 8v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 7H7V4h2v3zm3 0h-2V4h2v3zm3 0h-2V4h2v3z"/></svg>`,
  webcam: `<svg viewBox="0 0 24 24"><path d="M12 2c-3.87 0-7 3.13-7 7 0 3.09 2.01 5.7 4.8 6.63L9 18H6v2h12v-2h-3l-.8-2.37C16.99 14.7 19 12.09 19 9c0-3.87-3.13-7-7-7zm0 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
  screenShare: `<svg viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6zm9 5l-3 3h2v3h2v-3h2l-3-3z"/></svg>`,
  cloudSync: `<svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM12 18c-2.21 0-4-1.79-4-4h2l-3-3-3 3h2c0 3.31 2.69 6 6 6s6-2.69 6-6h-2c0 2.21-1.79 4-4 4z"/></svg>`,
  firewall: `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>`,

  // === 3. 自然、地理與天氣 (71-105) ===
  mountain: `<svg viewBox="0 0 24 24"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/></svg>`,
  waterDrop: `<svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  oceanWave: `<svg viewBox="0 0 24 24"><path d="M2 12c2.5 0 4-1.5 6-1.5s3.5 1.5 6 1.5 3.5-1.5 6-1.5v3c-2.5 0-4 1.5-6 1.5s-3.5-1.5-6-1.5-3.5 1.5-6 1.5V12zm0 6c2.5 0 4-1.5 6-1.5s3.5 1.5 6 1.5 3.5-1.5 6-1.5v3c-2.5 0-4 1.5-6 1.5s-3.5-1.5-6-1.5-3.5 1.5-6 1.5V18z"/></svg>`,
  pineTree: `<svg viewBox="0 0 24 24"><path d="M12 2L4 12h3l-4 8h18l-4-8h3L12 2zm-1 18h2v2h-2v-2z"/></svg>`,

  // === 4. 飲食、休閒與娛樂 (106-140) ===
  teaCup: `<svg viewBox="0 0 24 24"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4v-2z"/></svg>`,
  puzzlePiece: `<svg viewBox="0 0 24 24"><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z"/></svg>`,
  magicWand: `<svg viewBox="0 0 24 24"><path d="M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8l-2.5 1.4 1.4 2.5-2.5-1.4L13 20l1.4-2.5L13 15l2.5 1.4 2.5-1.4-1.4-2.5 2.5 1.4zM20 2l-2.5 1.4L15 2l1.4 2.5L15 7l2.5-1.4L20 7l-1.4-2.5L20 2zM2.5 21.5l14-14 1 1-14 14z"/></svg>`,
 
  // === 5. 抽象意念、心理與哲學 (141-180) ===
  heartLove: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  yinYang: `<svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1 0-16 4 4 0 0 1 0 8 4 4 0 0 0 0 8zm0-13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>`,
  infinity: `<svg viewBox="0 0 24 24"><path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.96 9.17 8.15C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53L12 13.04l2.83 2.81c.97.97 2.33 1.53 3.77 1.53 2.98 0 5.4-2.42 5.4-5.38s-2.42-5.38-5.4-5.38zM5.4 15.4c-1.87 0-3.4-1.53-3.4-3.4s1.53-3.4 3.4-3.4c.91 0 1.77.36 2.38.97l2.03 2.03-2.03 2.03c-.61.61-1.47.97-2.38.97zm13.2 0c-.91 0-1.77-.36-2.38-.97l-2.03-2.03 2.03-2.03c.61-.61 1.47-.97 2.38-.97 1.87 0 3.4 1.53 3.4 3.4s-1.53 3.4-3.4 3.4z"/></svg>`,
  hourGlassTime: `<svg viewBox="0 0 24 24"><path d="M6 2v6l4 4-4 4v6h12v-6l-4-4 4-4V2H6zm10 14.5V18H8v-1.5l4-4 4 4zM12 9.5L8 5.5V4h8v1.5l-4 4z"/></svg>`,

  // === 6. 教育、學術與文具 (181-220) ===
  bookOpen: `<svg viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.1-1.3 4.8-1.3 1.7 0 3.35.3 4.7 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>`,
  flaskChemistry: `<svg viewBox="0 0 24 24"><path d="M6 22h12a2 2 0 0 0 2-2c0-.36-.1-.7-.27-1L15 11.2V5h1V3H8v2h1v6.2L4.27 19c-.17.3-.27.64-.27 1a2 2 0 0 0 2 2zm3-17h6v2H9V5zm-2.8 14l4.8-8h2l4.8 8H6.2z"/></svg>`,
  paperclipNote: `<svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4s-4 1.79-4 4v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-1.5z"/></svg>`,
  electricPlugPower: `<svg viewBox="0 0 24 24"><path d="M16 7V3h-2v4h-4V3H8v4H6c-1.1 0-2 .9-2 2v6c0 3.31 2.69 6 6 6v3h4v-3c3.31 0 6-2.69 6-6V9c0-1.1-.9-2-2-2h-2z"/></svg>`,

  elevator: `<svg width="24px" height="24px" viewBox="0 0 15.36 15.36"><path d="M 5.236 6.378 C 4.571 6.378 4.157 7.124 4.49 7.719 C 4.643 7.996 4.928 8.167 5.236 8.167 C 5.899 8.167 6.315 7.422 5.981 6.827 C 5.828 6.551 5.543 6.378 5.236 6.378"/><path d="M 10.231 6.307 C 9.739 6.309 9.338 6.734 9.338 7.258 C 9.364 7.992 10.127 8.419 10.709 8.027 C 10.959 7.86 11.114 7.572 11.127 7.258 C 11.127 6.734 10.726 6.307 10.234 6.307"/><path d="M 13.151 4.681 L 2.422 4.681 C 1.597 4.681 0.926 5.176 0.926 5.784 L 0.926 14.257 C 0.926 14.866 1.597 15.36 2.422 15.36 L 13.151 15.36 C 13.977 15.36 14.647 14.866 14.647 14.257 L 14.647 5.784 C 14.647 5.176 13.977 4.681 13.151 4.681 M 5.113 14.664 C 5.115 14.649 5.124 14.637 5.124 14.623 L 5.289 11.857 L 5.454 14.623 C 5.454 14.637 5.463 14.649 5.465 14.664 L 5.113 14.664 Z M 10.109 14.664 C 10.111 14.649 10.119 14.637 10.119 14.623 L 10.285 11.857 L 10.45 14.623 C 10.45 14.637 10.459 14.649 10.461 14.664 L 10.109 14.664 Z M 13.703 14.257 C 13.702 14.482 13.455 14.663 13.151 14.664 L 11.27 14.664 C 11.273 14.649 11.282 14.637 11.282 14.623 L 11.445 10.124 L 11.597 11.333 C 11.605 11.463 11.754 11.563 11.93 11.556 C 12.107 11.551 12.243 11.44 12.234 11.31 L 12.234 9.321 C 12.234 8.489 10.867 8.447 10.285 8.447 C 9.703 8.447 8.338 8.488 8.338 9.321 L 8.338 11.31 C 8.33 11.44 8.464 11.551 8.641 11.556 C 8.816 11.563 8.967 11.463 8.976 11.333 L 9.126 10.124 L 9.29 14.623 C 9.29 14.637 9.299 14.649 9.301 14.664 L 6.276 14.664 C 6.278 14.649 6.286 14.637 6.286 14.623 L 6.452 10.124 L 6.6 11.333 C 6.609 11.463 6.758 11.563 6.934 11.556 C 7.11 11.551 7.246 11.44 7.238 11.31 L 7.238 9.321 C 7.238 8.489 5.87 8.447 5.29 8.447 C 4.71 8.447 3.342 8.488 3.342 9.321 L 3.342 11.31 C 3.333 11.44 3.47 11.551 3.645 11.556 C 3.821 11.563 3.971 11.463 3.978 11.333 L 4.129 10.124 L 4.294 14.623 C 4.294 14.637 4.304 14.649 4.306 14.664 L 2.422 14.664 C 2.116 14.663 1.871 14.482 1.871 14.257 L 1.871 5.784 C 1.871 5.56 2.116 5.379 2.422 5.378 L 13.151 5.378 C 13.455 5.379 13.702 5.56 13.703 5.784 L 13.703 14.257 Z" /><path d="M 8.793 2.547 L 9.881 1.496 L 9.881 3.86 C 9.881 4.162 10.218 4.348 10.488 4.198 C 10.613 4.129 10.69 3.999 10.69 3.86 L 10.69 1.496 L 11.778 2.547 C 11.855 2.62 11.958 2.661 12.065 2.661 C 12.375 2.663 12.571 2.338 12.417 2.078 C 12.399 2.047 12.376 2.019 12.35 1.994 L 10.571 0.276 L 10.285 0 L 8.221 1.995 C 8.063 2.147 8.063 2.395 8.221 2.547 C 8.378 2.699 8.634 2.699 8.792 2.547" /><path d="M 4.615 4.044 L 4.919 4.317 L 7.119 2.353 C 7.288 2.202 7.288 1.96 7.119 1.809 C 6.951 1.66 6.679 1.66 6.511 1.809 L 5.35 2.845 L 5.35 0.517 C 5.35 0.221 4.991 0.036 4.703 0.185 C 4.57 0.252 4.489 0.381 4.489 0.517 L 4.489 2.845 L 3.329 1.809 C 3.079 1.614 2.686 1.734 2.622 2.024 C 2.596 2.141 2.632 2.262 2.719 2.353 L 4.615 4.044 Z"/></svg>`,
  food:`<svg width="24px" height="24px" viewBox="0 0 1.5 1.5"><path d="M1.467 0.455 1.349 1.38H0.95l-0.118 -0.93h0.487l0.096 -0.332L1.47 0.134l-0.092 0.32zM0.776 0.99s0.015 -0.12 -0.192 -0.12H0.255c-0.206 0 -0.192 0.12 -0.192 0.12zM0.063 1.26s-0.015 0.12 0.192 0.12h0.329c0.207 0 0.192 -0.12 0.192 -0.12zm0.682 -0.06c0.034 0 0.061 -0.033 0.061 -0.075 0 -0.042 -0.027 -0.075 -0.061 -0.075H0.091C0.058 1.05 0.03 1.083 0.03 1.125 0.03 1.167 0.058 1.2 0.091 1.2z"/></svg>`,

};
