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

    this.barEl = document.createElement('nav');
    this.barEl.className = 'bottom-bar-nav';

    visibleItems.forEach(item => {
      this.barEl.appendChild(this.createItemBtn(item));
    });

    if (overflowItems.length > 0) {
      const moreBtn = this.createItemBtn({
        id: '_more',
        label: '更多',
        icon: BottomBarNav.MORE_ICON,
        onClick: () => this.toggleMoreMenu(true)
      });
      this.barEl.appendChild(moreBtn);

      this.createMoreOverlay(overflowItems, rootContainer);
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
  // 1. 主頁 / 首頁
  home: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,

  // 2. 搜尋
  search: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,

  // 3. 訊息 / 對話
  message: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`,

  // 4. 購物車
  cart: `<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`,

  // 5. 個人 / 用戶
  user: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,

  // 6. 收藏 / 追蹤
  star: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,

  // 7. 地圖 / 鄰近
  location: `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,

  // 8. 設定
  settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`,

  // 9. 通知 / 鈴鐺
  bell: `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`
};
