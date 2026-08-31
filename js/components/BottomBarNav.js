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
    iconWrapper.innerHTML = item.icon || '';

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
