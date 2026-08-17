/**
 * UI 動態生成器模組 (支援多組獨立 Tab & CardGroup)
 */
const UI = {
  // 記錄每個 category 當前選中的 Tab (例如 { team: 'all', device: 'all' })
  activeTabs: {},
  refreshIntervalId: null,
  remainingSeconds: 0,
  totalIntervalSeconds: 60, // 預設週期
  lastFetchTimestamp: 0,    // 記錄上次成功取得 Server 資料的時間戳 (ms)
  lastUpdatedStr: '',       // 記錄格式化時間字串
  onRefreshCallbackName: null,
  visibilityListenersBound: false, // 避免重複綁定全域監聽器

  // 渲染頁面主入口
  render(containerId, schema) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 清除舊計時器
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
    container.innerHTML = '';

    // 按順序渲染元件
    schema.forEach(item => {
      // 1. 如果遇到 tabBlock，產生該分類的 Tab 導覽列
      if (item.type === 'tabBlock') {
        const tabsHeader = this.createTabsHeader(item.category, item.tabs);
        if (tabsHeader) container.appendChild(tabsHeader);
      } else {
        // 2. 一般元件（header, card, cardGroup, form...）
        const el = this.createComponent(item);
        if (el) container.appendChild(el);
      }
    });

    // 初始觸發各分類的 Tab 篩選
    Object.keys(this.activeTabs).forEach(category => {
      this.filterGroups(category, this.activeTabs[category]);
    });
  },

  // 建立指定的 Tab 分頁導覽列
  createTabsHeader(category, tabs) {
    if (!category || !tabs || tabs.length === 0) return null;

    // 紀錄初始 activeTab
    if (!this.activeTabs[category]) {
      this.activeTabs[category] = tabs[0].id || 'all';
    }

    const tabContainer = document.createElement('div');
    tabContainer.className = 'tab-container';
    tabContainer.dataset.tabCategory = category;

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      const isActive = (tab.id === this.activeTabs[category]);
      btn.className = `tab-btn ${isActive ? 'active' : ''}`;
      btn.innerText = tab.label;
      btn.onclick = (e) => this.switchTab(category, tab.id, e.target);
      tabContainer.appendChild(btn);
    });

    return tabContainer;
  },

  // 切換 Tab 點擊事件 (只影響同 category)
  switchTab(category, groupId, targetBtn) {
    this.activeTabs[category] = groupId;

    // 1. 只更新同 category 的 Tab 按鈕高亮狀態
    const parentContainer = targetBtn.closest('.tab-container');
    if (parentContainer) {
      const buttons = parentContainer.querySelectorAll('.tab-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      targetBtn.classList.add('active');
    }

    // 2. 執行同 category 的 Group 顯示/隱藏控制
    this.filterGroups(category, groupId);
  },

  // 控制同 category 下的 Group 顯示或隱藏 (支援多 SearchBar 精準連動)
  filterGroups(category, groupId) {
    const categoryElements = document.querySelectorAll(`[data-category="${category}"]`);
    categoryElements.forEach(el => {
      if (groupId === 'all' || el.dataset.groupId === groupId) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // 切換 Tab 後，精準喚醒當前 Active 區域內的 searchBar 進行過濾
    const targetCategoryContainers = document.querySelectorAll(`[data-category="${category}"]`);
    targetCategoryContainers.forEach(container => {
      if (container.style.display !== 'none') {
        const searchInputs = container.querySelectorAll('.search-input');
        searchInputs.forEach(input => input.dispatchEvent(new Event('input')));
      }
    });

    // 喚醒全局 searchBar (無指定 category 者)
    const globalSearchInputs = document.querySelectorAll('.search-bar-container:not([data-category]) .search-input');
    globalSearchInputs.forEach(input => input.dispatchEvent(new Event('input')));
  },
  
  createKPIGroup(item) {
    const groupEl = document.createElement('div');
    const colsClass = item.cols ? `cols-${item.cols}` : 'cols-2'; // 預設 2 欄
    groupEl.className = `kpi-group ${colsClass}`;

    if (Array.isArray(item.items)) {
      item.items.forEach(kpi => {
        const cardEl = document.createElement('div');
        cardEl.className = 'kpi-card';

        let footerHTML = '';
        if (kpi.statusText || kpi.change) {
          const statusClass = kpi.status ? `status ${kpi.status}` : '';
          footerHTML = `
            <div class="kpi-footer">
              ${kpi.statusText ? `<span class="kpi-status ${statusClass}">${kpi.statusText}</span>` : ''}
              ${kpi.change ? `<span class="kpi-change">${kpi.change}</span>` : ''}
            </div>
          `;
        }

        cardEl.innerHTML = `
          <div class="kpi-label">${kpi.label || ''}</div>
          <div class="kpi-value" ${kpi.color ? `style="color:${kpi.color}"` : ''}>${kpi.value || '0'}</div>
          ${footerHTML}
        `;

        groupEl.appendChild(cardEl);
      });
    }

    return groupEl;
  },

createSearchBar(item) {
    const container = document.createElement('div');
    container.className = 'search-bar-container';

    if (item.category) container.dataset.category = item.category;
    if (item.groupId) container.dataset.groupId = item.groupId;

    const wrapper = document.createElement('div');
    wrapper.className = 'search-input-wrapper';

    wrapper.innerHTML = `
      <svg class="search-icon" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'search-input';
    input.placeholder = item.placeholder || '搜尋卡片與內文...';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'search-clear-btn';
    clearBtn.innerText = '✕';

    wrapper.appendChild(input);
    wrapper.appendChild(clearBtn);
    container.appendChild(wrapper);

    // 防抖定時器 (Debounce Timer)
    let debounceTimer = null;

    // 核心過濾邏輯
    const filterCards = () => {
      const rawQuery = input.value.trim().toLowerCase();
      clearBtn.style.display = rawQuery ? 'block' : 'none';

      let scopeContainer = null;
      if (item.targetGroup) {
        scopeContainer = document.querySelector(`[data-group-id="${item.targetGroup}"]`);
      } else {
        scopeContainer = container.closest('[data-category]') || document;
      }

      if (!scopeContainer) return;

      const cards = scopeContainer.querySelectorAll('.app-card, .kpi-card');

      cards.forEach(card => {
        const categoryGroup = card.closest('[data-category]');
        if (categoryGroup && categoryGroup.style.display === 'none') {
          card.classList.add('search-hidden');
          return;
        }

        if (!rawQuery) {
          card.classList.remove('search-hidden');
          return;
        }

        const textContent = (card.innerText || card.textContent || '').replace(/\s+/g, ' ').toLowerCase();
        if (textContent.includes(rawQuery)) {
          card.classList.remove('search-hidden');
        } else {
          card.classList.add('search-hidden');
        }
      });

      const cardGroups = scopeContainer.querySelectorAll('.card-group');
      cardGroups.forEach(group => {
        const categoryGroup = group.closest('[data-category]');
        if (categoryGroup && categoryGroup.style.display === 'none') {
          group.classList.add('search-hidden');
          return;
        }

        if (!rawQuery) {
          group.classList.remove('search-hidden');
        } else {
          const visibleChildren = group.querySelectorAll('.app-card:not(.search-hidden), .kpi-card:not(.search-hidden)');
          if (visibleChildren.length > 0) {
            group.classList.remove('search-hidden');
          } else {
            group.classList.add('search-hidden');
          }
        }
      });
    };

    // Debounce 包裹器：延遲 300ms 執行
    const debouncedFilter = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        filterCards();
      }, 300);
    };

    // 事件雙重綁定：打字防抖，選字完成防抖
    input.addEventListener('input', debouncedFilter);
    input.addEventListener('compositionend', filterCards); // 注音/中文選字完立刻觸發一次

    // 點擊清空按鈕：立即執行，不延遲
    clearBtn.addEventListener('click', () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      input.value = '';
      filterCards();
      input.focus();
    });

    return container;
  },

  // Timeline 時間軸模組 (支援混搭 items 子元件)
  createTimeline(item) {
    const container = document.createElement('div');
    container.className = 'app-timeline';

    if (Array.isArray(item.events)) {
      item.events.forEach(evt => {
        const eventEl = document.createElement('div');
        const statusClass = evt.status ? `status-${evt.status}` : '';
        eventEl.className = `timeline-event ${statusClass}`;

        // 1. 時間標籤
        if (evt.time) {
          const timeEl = document.createElement('div');
          timeEl.className = 'timeline-time';
          timeEl.innerText = evt.time;
          eventEl.appendChild(timeEl);
        }

        // 2. 高級模式：如果傳入 items 陣列，動態繪製包含 mediaPreview 在內的所有 UI 元件
        if (Array.isArray(evt.items)) {
          evt.items.forEach(child => {
            const childEl = this.createComponent(child);
            if (childEl) eventEl.appendChild(childEl);
          });
        } 
        // 3. 簡易模式：向下相容 direct 傳入 media (圖片 URL) 與文字屬性
        else {
          if (evt.media) {
            const mediaEl = this.createMediaPreview({
              type: 'mediaPreview',
              src: evt.media,
              caption: evt.mediaCaption
            });
            if (mediaEl) eventEl.appendChild(mediaEl);
          }
          if (evt.badge) {
            const badgeEl = document.createElement('span');
            badgeEl.className = `item-badge badge-${evt.badgeVariant || 'info'}`;
            badgeEl.innerText = evt.badge;
            eventEl.appendChild(badgeEl);
          }
          if (evt.title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'timeline-title';
            titleEl.innerText = evt.title;
            eventEl.appendChild(titleEl);
          }
          if (evt.subtitle) {
            const subEl = document.createElement('div');
            subEl.className = 'item-subtitle';
            subEl.innerText = evt.subtitle;
            eventEl.appendChild(subEl);
          }
          if (evt.text) {
            const textEl = document.createElement('div');
            textEl.className = 'timeline-text';
            textEl.innerText = evt.text;
            eventEl.appendChild(textEl);
          }
        }

        container.appendChild(eventEl);
      });
    }

    return container;
  },
  
  // 建立媒體預覽元件
  createMediaPreview(item) {
    const container = document.createElement('div');
    container.className = 'media-preview-container';

    const img = document.createElement('img');
    img.className = 'media-preview-image';
    img.src = item.src || '';
    img.alt = item.caption || 'Media';
    container.appendChild(img);

    if (item.caption) {
      const caption = document.createElement('div');
      caption.className = 'media-preview-caption';
      caption.innerText = item.caption;
      container.appendChild(caption);
    }

    return container;
  },

  // 升級版 Modal / BottomSheet / Confirm Box API
  showModal(config = {}) {
    let overlay = document.getElementById('app-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'app-modal-overlay';
      document.body.appendChild(overlay);
    }

    // 預設 Confirm Box 或 center 模式使用中央對齊
    const isConfirm = config.isConfirm || false;
    const position = config.position || (isConfirm ? 'center' : 'bottom');
    const isCenter = position === 'center';

    overlay.className = `modal-overlay ${isCenter ? 'center' : ''}`;

    const container = document.createElement('div');
    container.className = 'modal-container';

    let handleHTML = !isCenter ? `<div class="modal-handle"></div>` : '';
    let showCloseBtn = config.showClose !== false;

    // 1. 建立外殼結構
    container.innerHTML = `
      ${handleHTML}
      <div class="modal-header">
        <div class="modal-title">${config.title || (isConfirm ? '確認提示' : '')}</div>
        ${showCloseBtn ? `<button class="modal-close-btn" id="modal-close-x">✕</button>` : ''}
      </div>
      <div class="modal-body" id="modal-body-content">
        ${config.message ? `<div class="item-text" style="margin-bottom:12px;">${config.message}</div>` : ''}
      </div>
      <div class="modal-footer" id="modal-footer-content"></div>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(container);

    // 2. 渲染 body 內的 items UI 元件
    const bodyContent = container.querySelector('#modal-body-content');
    if (Array.isArray(config.items)) {
      config.items.forEach(item => {
        const el = this.createComponent(item);
        if (el) bodyContent.appendChild(el);
      });
    }

    // 3. 處理 Confirm Box 按鈕列 (若有設定 confirmText 或 isConfirm)
    const footerContent = container.querySelector('#modal-footer-content');
    if (isConfirm || config.confirmText || config.cancelText) {
      const btnGroup = document.createElement('div');
      const alignClass = config.btnAlign || (isCenter ? 'center' : 'right');
      btnGroup.className = `btn-group align-${alignClass}`;
      btnGroup.style.marginTop = '16px';

      // 取消按鈕
      if (config.cancelText !== false) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = `btn btn-inline btn-${config.cancelVariant || 'secondary'}`;
        cancelBtn.innerText = config.cancelText || '取消';
        cancelBtn.onclick = () => {
          this.closeModal();
          if (typeof config.onCancel === 'function') config.onCancel();
          if (typeof window[config.onCancel] === 'function') window[config.onCancel]();
        };
        btnGroup.appendChild(cancelBtn);
      }

      // 確認按鈕
      const confirmBtn = document.createElement('button');
      confirmBtn.className = `btn btn-inline btn-${config.confirmVariant || 'primary'}`;
      confirmBtn.innerText = config.confirmText || '確認';
      confirmBtn.onclick = () => {
        this.closeModal();
        if (typeof config.onConfirm === 'function') config.onConfirm();
        if (typeof window[config.onConfirm] === 'function') window[config.onConfirm]();
      };
      btnGroup.appendChild(confirmBtn);

      footerContent.appendChild(btnGroup);
    }

    // 4. 事件綁定
    const xBtn = container.querySelector('#modal-close-x');
    if (xBtn) {
      xBtn.onclick = () => {
        this.closeModal();
        if (typeof config.onCancel === 'function') config.onCancel();
      };
    }

    // 點擊背景遮罩關閉 (Confirm 模式可設定 allowBackdropClose: false)
    overlay.onclick = (e) => {
      if (e.target === overlay && config.allowBackdropClose !== false) {
        this.closeModal();
        if (typeof config.onCancel === 'function') config.onCancel();
      }
    };

    // 顯示 Modal
    requestAnimationFrame(() => overlay.classList.add('active'));
  },

  closeModal() {
    const overlay = document.getElementById('app-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  },
  // 頂部 Toast 即時通知橫幅 API
  showToast(message, variant = 'info', duration = 3000) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      document.body.appendChild(toast);
    }

    toast.className = `toast-container toast-${variant} active`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
      </div>
    `;

    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  },

  // 建立倒數更新元件
  createRefreshTimer(item) {
    this.totalIntervalSeconds = item.intervalSeconds || 60;
    this.remainingSeconds = this.totalIntervalSeconds;
    this.onRefreshCallbackName = item.onRefresh;

    if (!this.lastFetchTimestamp) {
      this.lastFetchTimestamp = Date.now();
      const now = new Date();
      this.lastUpdatedStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    const container = document.createElement('div');
    container.className = 'refresh-timer-container';

    // 統一格式：最左側上次更新時間，右側包覆「X 秒後自動更新」與「立即更新按鈕」
    container.innerHTML = `
      <span class="refresh-last-updated" id="timer-last-updated">上次更新：${this.lastUpdatedStr}</span>
      <div class="refresh-timer-right">
        <span class="refresh-seconds-text" id="timer-seconds-display">${this.remainingSeconds} 秒後自動更新</span>
        <button type="button" class="refresh-action-btn" id="timer-refresh-btn">
          <svg class="refresh-icon" viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          <span>${item.buttonText || '立即更新'}</span>
        </button>
      </div>
    `;

    const secondsDisplay = container.querySelector('#timer-seconds-display');
    const refreshBtn = container.querySelector('#timer-refresh-btn');
    const refreshIcon = container.querySelector('.refresh-icon');

    // 啟動倒數與前後台/視窗焦點監聽
    this.startCountdownTimer(secondsDisplay, refreshIcon);
    this.bindVisibilityAndFocusEvents(secondsDisplay, refreshIcon);

    refreshBtn.onclick = () => {
      if (this.refreshIntervalId) {
        clearInterval(this.refreshIntervalId);
        this.refreshIntervalId = null;
      }
      this.triggerRefresh(refreshIcon);
    };

    return container;
  },

  // 1 秒計時器 (確保每秒都寫入完整的 "X 秒後自動更新")
  startCountdownTimer(secondsDisplay, refreshIcon) {
    if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);

    this.refreshIntervalId = setInterval(() => {
      this.remainingSeconds--;
      
      // 動態抓取畫面上最新的 DOM 元素
      const currentSecondsEl = document.getElementById('timer-seconds-display');
      if (currentSecondsEl) {
        currentSecondsEl.innerText = `${this.remainingSeconds} 秒後自動更新`;
      }

      if (this.remainingSeconds <= 0) {
        clearInterval(this.refreshIntervalId);
        this.refreshIntervalId = null;
        this.triggerRefresh(refreshIcon);
      }
    }, 1000);
  },

  // 視窗切換與 App 獲得焦點監聽 (動態獲取最新 DOM，避免舊 DOM 閉包干擾)
  bindVisibilityAndFocusEvents(secondsDisplay, refreshIcon) {
    if (this.visibilityListenersBound) return;
    this.visibilityListenersBound = true;

    const handleAppResume = () => {
      if (document.hidden) return;

      const now = Date.now();
      const elapsedSeconds = Math.floor((now - this.lastFetchTimestamp) / 1000);

      if (elapsedSeconds >= this.totalIntervalSeconds) {
        if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);
        this.triggerRefresh(refreshIcon);
      } else {
        this.remainingSeconds = this.totalIntervalSeconds - elapsedSeconds;
        
        // 切換回來時，動態抓取最新 DOM 更新文字
        const currentSecondsEl = document.getElementById('timer-seconds-display');
        if (currentSecondsEl) {
          currentSecondsEl.innerText = `${this.remainingSeconds} 秒後自動更新`;
        }
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handleAppResume();
    });

    window.addEventListener('focus', handleAppResume);
  },
  
  // 發起對 Server 端 loadDashboardConfig 的呼叫
  triggerRefresh(iconEl) {
    if (iconEl) iconEl.classList.add('spinning');

    // 1. 重置倒數秒數為初始總秒數 (例如 60 秒)
    this.remainingSeconds = this.totalIntervalSeconds;

    // 2. 記錄成功發起請求的時間與格式化時間字串 (HH:mm:ss)
    this.lastFetchTimestamp = Date.now();
    const now = new Date();
    this.lastUpdatedStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // 3. 即時更新畫面上的「上次更新時間」與「倒數秒數」DOM 顯示
    const lastUpdatedEl = document.getElementById('timer-last-updated');
    if (lastUpdatedEl) {
      lastUpdatedEl.innerText = `上次更新：${this.lastUpdatedStr}`;
    }

    const currentSecondsEl = document.getElementById('timer-seconds-display');
    if (currentSecondsEl) {
      currentSecondsEl.innerText = `${this.remainingSeconds} 秒後自動更新`;
    }

    // 4. 重啟 1 秒倒數計時器 (確保舊計時器被銷毀，並從滿秒數重新倒數)
    this.startCountdownTimer(currentSecondsEl, iconEl);

    // 5. 調用 loadFormSchema(true) 發起背景靜默更新
    loadFormSchema(true);
  },

  createSpacer(item) {
    const spacer = document.createElement('div');
    spacer.className = `app-spacer ${item.inline ? 'inline' : ''}`;
    
    // 支援直接指定 height (例如 8, 16, 24 或 '20px')
    if (item.height !== undefined) {
      const h = typeof item.height === 'number' ? `${item.height}px` : item.height;
      spacer.style.height = h;
    }
    // 支援 inline 時指定 width
    if (item.width !== undefined) {
      const w = typeof item.width === 'number' ? `${item.width}px` : item.width;
      spacer.style.width = w;
    }

    return spacer;
  },

  // 建立分隔線元件 (Divider)
  createDivider(item) {
    const divider = document.createElement('hr');
    const variant = item.variant || 'solid'; // solid, dashed, dotted
    divider.className = `app-divider ${variant}`;

    if (item.color) divider.style.borderColor = item.color;
    if (item.margin !== undefined) {
      const m = typeof item.margin === 'number' ? `${item.margin}px` : item.margin;
      divider.style.marginTop = m;
      divider.style.marginBottom = m;
    }

    return divider;
  },
// 建立萬用行動引導卡片 (Icon + Title + Text + Button)
  createActionCard(item) {
    const container = document.createElement('div');
    container.className = 'action-card-container';

    let iconHTML = '';
    if (item.icon) {
      iconHTML = `<div class="action-card-icon">${item.icon}</div>`;
    }

    container.innerHTML = `
      ${iconHTML}
      <div class="action-card-title">${item.title || ''}</div>
      ${item.text ? `<div class="action-card-text">${item.text}</div>` : ''}
    `;

    // 支援行動按鈕 (Action Button)
    if (item.buttonText) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-inline btn-${item.buttonVariant || 'primary'}`;
      btn.innerText = item.buttonText;
      if (item.onClick && typeof window[item.onClick] === 'function') {
        btn.onclick = window[item.onClick];
      }
      container.appendChild(btn);
    }

    return container;
  },

  // 建立摺疊手風琴模組 (Accordion)
  createAccordion(item) {
    const container = document.createElement('div');
    container.className = 'app-accordion';

    if (Array.isArray(item.items)) {
      item.items.forEach((acc, index) => {
        const itemEl = document.createElement('div');
        const isOpen = acc.open || (item.openFirst && index === 0);
        itemEl.className = `accordion-item ${isOpen ? 'active' : ''}`;

        const headerEl = document.createElement('div');
        headerEl.className = 'accordion-header';
        headerEl.innerHTML = `
          <span>${acc.title || ''}</span>
          <span class="accordion-icon">▼</span>
        `;

        const bodyEl = document.createElement('div');
        bodyEl.className = 'accordion-body';

        // 支援手風琴內嵌入子元件陣列 (items) 或純文字 (content)
        if (Array.isArray(acc.items)) {
          acc.items.forEach(child => {
            const childEl = this.createComponent(child);
            if (childEl) bodyEl.appendChild(childEl);
          });
        } else if (acc.content) {
          bodyEl.innerHTML = `<div class="item-text">${acc.content}</div>`;
        }

        // 點擊切換展開/收合
        headerEl.onclick = () => {
          // 若設定 singleExpand = true，點擊時收合其他同層項目
          if (item.singleExpand && !itemEl.classList.contains('active')) {
            const siblings = container.querySelectorAll('.accordion-item');
            siblings.forEach(sib => sib.classList.remove('active'));
          }
          itemEl.classList.toggle('active');
        };

        itemEl.appendChild(headerEl);
        itemEl.appendChild(bodyEl);
        container.appendChild(itemEl);
      });
    }

    return container;
  },

  // 建立手勢滑動輪播模組 (Carousel)
// 建立手勢滑動輪播模組 (自動為文字/卡片加上舒適 Padding)
  createCarousel(item) {
    const container = document.createElement('div');
    const peekClass = item.peek ? 'peek' : '';
    container.className = `app-carousel-container ${peekClass}`;

    const track = document.createElement('div');
    track.className = 'carousel-track';

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';

    const slidesData = item.slides || item.items || [];

    if (Array.isArray(slidesData) && slidesData.length > 0) {
      slidesData.forEach((slideData, idx) => {
        const slideEl = document.createElement('div');
        slideEl.className = 'carousel-slide';

        const contentEl = document.createElement('div');
        contentEl.className = 'carousel-slide-content';

        // A. 如果是純圖片/媒體輪播：滿版貼邊，不加 Padding
        if (slideData.image || slideData.src) {
          const mediaEl = this.createMediaPreview({
            type: 'mediaPreview',
            src: slideData.image || slideData.src,
            caption: slideData.caption || slideData.title
          });
          if (mediaEl) contentEl.appendChild(mediaEl);
        } 
        // B. 如果包含 items 文字/UI 元件：包覆 .carousel-text-body 加上 16px Padding
        else if (Array.isArray(slideData.items)) {
          const textBody = document.createElement('div');
          textBody.className = 'carousel-text-body';

          slideData.items.forEach(child => {
            const childEl = this.createComponent(child);
            if (childEl) textBody.appendChild(childEl);
          });
          contentEl.appendChild(textBody);
        } 
        // C. 如果是標準卡片資料：預設使用 .carousel-text-body
        else {
          const textBody = document.createElement('div');
          textBody.className = 'carousel-text-body';

          if (slideData.title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'item-title';
            titleEl.innerText = slideData.title;
            textBody.appendChild(titleEl);
          }
          if (slideData.text || slideData.content) {
            const textEl = document.createElement('div');
            textEl.className = 'item-text';
            textEl.innerText = slideData.text || slideData.content;
            textBody.appendChild(textEl);
          }
          contentEl.appendChild(textBody);
        }

        slideEl.appendChild(contentEl);
        track.appendChild(slideEl);

        // 指示圓點 (Dot)
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.onclick = () => {
          slideEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        };
        dotsContainer.appendChild(dot);
      });

      // 監聽滾動，自動高亮當前圓點
      track.addEventListener('scroll', () => {
        const slideWidth = track.firstElementChild ? track.firstElementChild.clientWidth : track.clientWidth;
        const activeIndex = Math.round(track.scrollLeft / slideWidth);
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === activeIndex);
        });
      }, { passive: true });
    }

    container.appendChild(track);
    if (item.showDots !== false && slidesData.length > 1) {
      container.appendChild(dotsContainer);
    }

    return container;
  },
  
  // 通用綁定函數：幫任何產生的 DOM 元素加上 category 與 groupId 屬性
  bindTabCategory(element, item) {
    if (item.category) element.dataset.category = item.category;
    if (item.groupId) element.dataset.groupId = item.groupId;
    return element;
  },

  // 核心元件繪製工廠
  createComponent(item) {
    let element = null;

    // 1. Header (支援傳統 title/subtitle 或 items 無限子項目)
    if (item.type === 'header') {
      element = document.createElement('div');
      const alignClass = `align-${item.align || 'left'}`; // 預設靠左 left
      element.className = `app-header ${alignClass}`;

      // 支援兩種寫法：傳入 items 陣列 或 直接傳入 title / subtitle / badge
      const headerItems = Array.isArray(item.items) ? item.items : [
        item.badge ? { type: 'badge', text: item.badge, variant: item.badgeVariant || 'info' } : null,
        item.title ? { type: 'title', text: item.title } : null,
        item.subtitle ? { type: 'subtitle', text: item.subtitle } : null
      ].filter(Boolean);

      headerItems.forEach(child => {
        if (child.type === 'title') {
          const titleEl = document.createElement('h1');
          titleEl.className = 'header-title';
          titleEl.innerText = child.text || '';
          element.appendChild(titleEl);
        } else if (child.type === 'subtitle') {
          const subEl = document.createElement('p');
          subEl.className = 'header-subtitle';
          subEl.innerText = child.text || '';
          element.appendChild(subEl);
        } else if (child.type === 'badge') {
          const badgeEl = document.createElement('span');
          badgeEl.className = `item-badge badge-${child.variant || 'info'}`;
          badgeEl.innerText = child.text || '';
          element.appendChild(badgeEl);
        } else if (child.type === 'badgeGroup') {
          const badgeGroupEl = document.createElement('div');
          badgeGroupEl.className = `badge-group ${alignClass}`;
          if (Array.isArray(child.badges)) {
            child.badges.forEach(b => {
              const bEl = document.createElement('span');
              bEl.className = `item-badge badge-${b.variant || 'primary'}`;
              bEl.innerText = b.text || '';
              badgeGroupEl.appendChild(bEl);
            });
          }
          element.appendChild(badgeGroupEl);
        }
      });
    }

    // 2. Card (支援傳統 title/content 或 items 無限子項目)
    else if (item.type === 'card') {
      element = document.createElement('div');
      element.className = 'app-card';

      if (Array.isArray(item.items)) {
        item.items.forEach(child => {
          const childEl = this.createComponent(child);
          if (childEl) element.appendChild(childEl);
        });
      } else {
        if (item.title) element.innerHTML += `<h3>${item.title}</h3>`;
        if (item.content) element.innerHTML += `<div class="app-text">${item.content}</div>`;
      }
    }

    // 3. Card Group (內部可存放複數 Card)
    else if (item.type === 'cardGroup') {
      element = document.createElement('div');
      element.className = `card-group ${item.collapsed ? 'collapsed' : ''}`;

      const headerDiv = document.createElement('div');
      headerDiv.className = 'card-group-header';
      headerDiv.innerHTML = `<span>${item.title}</span><span class="toggle-icon">▲</span>`;
      headerDiv.onclick = () => element.classList.toggle('collapsed');

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'card-group-body';

      if (Array.isArray(item.cards)) {
        item.cards.forEach(cardData => {
          const cardEl = this.createComponent({ type: 'card', ...cardData });
          if (cardEl) bodyDiv.appendChild(cardEl);
        });
      }

      element.appendChild(headerDiv);
      element.appendChild(bodyDiv);
    }

    else if (item.type === 'searchBar') {
      element = this.createSearchBar(item);
    }

    // 4. 基礎內容元件：各式樣式文字與引言
    else if (item.type === 'title') {
      element = document.createElement('div');
      element.className = 'item-title';
      element.innerText = item.text || '';
    }
    else if (item.type === 'subtitle') {
      element = document.createElement('div');
      element.className = 'item-subtitle';
      element.innerText = item.text || '';
    }
    else if (item.type === 'text') {
      element = document.createElement('div');
      element.className = 'item-text';
      element.innerText = item.text || '';
    }
    else if (item.type === 'quote') {
      element = document.createElement('div');
      element.className = `item-quote ${item.variant ? `quote-${item.variant}` : ''}`;
      element.innerText = item.text || '';
    }
    else if (item.type === 'badgeGroup') {
      element = document.createElement('div');
      const alignClass = `align-${item.align || 'left'}`;
      element.className = `badge-group ${alignClass}`;

      if (Array.isArray(item.badges)) {
        item.badges.forEach(badgeData => {
          const badgeEl = document.createElement('span');
          badgeEl.className = `item-badge badge-${badgeData.variant || 'primary'}`;
          badgeEl.innerText = badgeData.text || '';
          element.appendChild(badgeEl);
        });
      }
    }
    else if (item.type === 'badge') {
      element = document.createElement('span');
      element.className = `item-badge badge-${item.variant || 'info'}`;
      element.innerText = item.text || '';
    }

    // 5. 獨立按鈕元件 (button)
    else if (item.type === 'button') {
      element = document.createElement('button');
      element.className = `btn btn-${item.variant || 'primary'}`;
      element.innerText = item.text || '按鈕';

      // 支援 disabled 設定
      if (item.disabled) {
        element.disabled = true;
      } else if (item.onClick && typeof window[item.onClick] === 'function') {
        element.onclick = window[item.onClick];
      }
    }

    //6. 按鈕群組元件 (buttonGroup)
    else if (item.type === 'buttonGroup') {
      element = document.createElement('div');
      const alignClass = `align-${item.align || 'left'}`;
      element.className = `btn-group ${alignClass}`;

      if (Array.isArray(item.buttons)) {
        item.buttons.forEach(btnData => {
          const btnEl = document.createElement('button');
          btnEl.className = `btn btn-inline btn-${btnData.variant || 'primary'}`;
          btnEl.innerText = btnData.text || '按鈕';

          // 支援 disabled 設定
          if (btnData.disabled) {
            btnEl.disabled = true;
          } else if (btnData.onClick && typeof window[btnData.onClick] === 'function') {
            btnEl.onclick = window[btnData.onClick];
          }

          element.appendChild(btnEl);
        });
      }
    }

    else if (item.type === 'kpiGroup') {
      element = this.createKPIGroup(item);
    }
    else if (item.type === 'timeline') {
      element = this.createTimeline(item);
    }
    else if (item.type === 'mediaPreview') {
      element = this.createMediaPreview(item);
    }
    else if (item.type === 'refreshTimer') {
      element = this.createRefreshTimer(item);
    }
    else if (item.type === 'spacer') {
      element = this.createSpacer(item);
    }
    else if (item.type === 'divider') {
      element = this.createDivider(item);
    }
    else if (item.type === 'actionCard') {
      element = this.createActionCard(item);
    }
    else if (item.type === 'accordion') {
      element = this.createAccordion(item);
    }
    else if (item.type === 'carousel') {
      element = this.createCarousel(item);
    }
    // 7. Form 表單模組
    else if (item.type === 'form') {
      element = document.createElement('div');
      element.className = 'app-card';
      const form = document.createElement('form');

      item.fields.forEach(field => {
        // ------------------------------------------
        // 1. 靜態裝飾與內文元件 (可在欄位之間自由插隊)
        // ------------------------------------------
        if (field.type === 'title') {
          const titleEl = document.createElement('div');
          titleEl.className = 'item-title';
          titleEl.innerText = field.text || '';
          form.appendChild(titleEl);
          return;
        }
        else if (field.type === 'subtitle') {
          const subEl = document.createElement('div');
          subEl.className = 'item-subtitle';
          subEl.innerText = field.text || '';
          form.appendChild(subEl);
          return;
        }
        else if (field.type === 'text') {
          const textEl = document.createElement('div');
          textEl.className = 'item-text';
          textEl.innerText = field.text || '';
          form.appendChild(textEl);
          return;
        }
        else if (field.type === 'quote') {
          const quoteEl = document.createElement('div');
          quoteEl.className = `item-quote ${field.variant ? `quote-${field.variant}` : ''}`;
          quoteEl.innerText = field.text || '';
          form.appendChild(quoteEl);
          return;
        }
        else if (field.type === 'badge') {
          const badgeEl = document.createElement('span');
          badgeEl.className = `item-badge badge-${field.variant || 'info'}`;
          badgeEl.innerText = field.text || '';
          form.appendChild(badgeEl);
          return;
        }
        else if (field.type === 'badgeGroup') {
          const badgeGroupEl = document.createElement('div');
          const alignClass = `align-${field.align || 'left'}`;
          badgeGroupEl.className = `badge-group ${alignClass}`;

          if (Array.isArray(field.badges)) {
            field.badges.forEach(badgeData => {
              const badgeEl = document.createElement('span');
              badgeEl.className = `item-badge badge-${badgeData.variant || 'primary'}`;
              badgeEl.innerText = badgeData.text || '';
              badgeGroupEl.appendChild(badgeEl);
            });
          }
          form.appendChild(badgeGroupEl);
          return;
        }
        else if (field.type === 'button') {
          const btnEl = document.createElement('button');
          btnEl.type = 'button'; // 避免觸發 form submit
          btnEl.className = `btn btn-${field.variant || 'primary'}`;
          btnEl.innerText = field.text || '按鈕';
          if (field.disabled) btnEl.disabled = true;
          if (field.onClick && typeof window[field.onClick] === 'function') {
            btnEl.onclick = window[field.onClick];
          }
          form.appendChild(btnEl);
          return;
        }
        else if (field.type === 'buttonGroup') {
          const btnGroupEl = document.createElement('div');
          const alignClass = `align-${field.align || 'left'}`;
          btnGroupEl.className = `btn-group ${alignClass}`;

          if (Array.isArray(field.buttons)) {
            field.buttons.forEach(btnData => {
              const btnEl = document.createElement('button');
              btnEl.type = 'button'; // 強制為普通按鈕，避免觸發 form 提交
              btnEl.className = `btn btn-inline btn-${btnData.variant || 'primary'}`;
              btnEl.innerText = btnData.text || '按鈕';

              if (btnData.disabled) btnEl.disabled = true;
              if (btnData.onClick && typeof window[btnData.onClick] === 'function') {
                btnEl.onclick = window[btnData.onClick];
              }

              btnGroupEl.appendChild(btnEl);
            });
          }
          form.appendChild(btnGroupEl);
          return;
        }
        else if (field.type === 'kpiGroup') {
          const kpiEl = this.createKPIGroup(field);
          if (kpiEl) form.appendChild(kpiEl);
          return;
        }
        else if (field.type === 'timeline') {
          const timelineEl = this.createTimeline(field);
          if (timelineEl) form.appendChild(timelineEl);
          return;
        }
        else if (field.type === 'mediaPreview') {
          const mediaEl = this.createMediaPreview(field);
          if (mediaEl) form.appendChild(mediaEl);
          return;
        }
        else if (field.type === 'spacer') {
          const spacerEl = this.createSpacer(field);
          if (spacerEl) form.appendChild(spacerEl);
          return;
        }
        else if (field.type === 'divider') {
          const dividerEl = this.createDivider(field);
          if (dividerEl) form.appendChild(dividerEl);
          return;
        }
        else if (field.type === 'accordion') {
          const accEl = this.createAccordion(field);
          if (accEl) form.appendChild(accEl);
          return;
        }
        else if (field.type === 'carousel') {
          const carEl = this.createCarousel(field);
          if (carEl) form.appendChild(carEl);
          return;
        }
        else if (field.type === 'hidden') {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = field.name;
          hiddenInput.value = field.defaultValue !== undefined ? field.defaultValue : (field.value || '');
          form.appendChild(hiddenInput);
          return;
        }

        // ------------------------------------------
        // 2. 表單輸入欄位容器 (.form-group)
        // ------------------------------------------
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `<label>${field.label || ''}${field.required ? ' <span style="color:#ff3b30">*</span>' : ''}</label>`;

        // Select 下拉選單
        if (field.type === 'select') {
          const select = document.createElement('select');
          select.className = 'form-control';
          select.name = field.name;
          if (field.required) select.required = true;
          field.options.forEach(opt => {
            const val = opt.value !== undefined ? opt.value : opt;
            const text = opt.label !== undefined ? opt.label : opt;
            const optionEl = new Option(text, val);
            if (field.defaultValue !== undefined && String(val) === String(field.defaultValue)) {
              optionEl.selected = true;
            }
            select.add(optionEl);
          });
          group.appendChild(select);
        }

        // Textarea 多行文字框
        else if (field.type === 'textarea') {
          const textarea = document.createElement('textarea');
          textarea.className = 'form-control';
          textarea.name = field.name;
          textarea.rows = field.rows || 3;
          textarea.placeholder = field.placeholder || '';
          if (field.defaultValue !== undefined) textarea.value = field.defaultValue;
          if (field.maxLength) textarea.maxLength = field.maxLength;
          if (field.minLength) textarea.minLength = field.minLength;
          if (field.required) textarea.required = true;
          group.appendChild(textarea);
        }

        // Radio & Checkbox
        else if (field.type === 'radio' || field.type === 'checkbox') {
          const optGroup = document.createElement('div');
          optGroup.className = `option-group ${field.inline ? 'inline' : ''}`;

          if (Array.isArray(field.options)) {
            field.options.forEach((opt, idx) => {
              const val = opt.value !== undefined ? opt.value : opt;
              const labelText = opt.label !== undefined ? opt.label : opt;
              const labelEl = document.createElement('label');
              labelEl.className = 'option-label';

              const inputEl = document.createElement('input');
              inputEl.type = field.type;
              inputEl.name = field.name;
              inputEl.value = val;

              if (field.defaultValue !== undefined) {
                if (Array.isArray(field.defaultValue)) {
                  if (field.defaultValue.map(String).includes(String(val))) inputEl.checked = true;
                } else if (String(val) === String(field.defaultValue)) {
                  inputEl.checked = true;
                }
              }

              if (field.required && field.type === 'radio' && idx === 0) inputEl.required = true;

              labelEl.appendChild(inputEl);
              labelEl.appendChild(document.createTextNode(labelText));
              optGroup.appendChild(labelEl);
            });
          }
          group.appendChild(optGroup);
        }

        // Switch 開關
        else if (field.type === 'switch') {
          const switchContainer = document.createElement('div');
          switchContainer.className = 'switch-group';

          const textSpan = document.createElement('span');
          textSpan.className = 'switch-label-text';
          textSpan.innerText = field.label || '';

          const switchLabel = document.createElement('label');
          switchLabel.className = 'switch-toggle';

          const inputEl = document.createElement('input');
          inputEl.type = 'checkbox';
          inputEl.name = field.name;
          inputEl.value = field.value || 'true';

          if (field.defaultValue === true || field.defaultValue === 'true' || field.defaultValue === 'ON') {
            inputEl.checked = true;
          }

          const sliderSpan = document.createElement('span');
          sliderSpan.className = 'switch-slider';

          switchLabel.appendChild(inputEl);
          switchLabel.appendChild(sliderSpan);

          switchContainer.appendChild(textSpan);
          switchContainer.appendChild(switchLabel);

          group.innerHTML = '';
          group.appendChild(switchContainer);
        }

        // File 上傳
        else if (field.type === 'file') {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.className = 'form-control';
          fileInput.name = field.name;
          if (field.accept) fileInput.accept = field.accept;
          if (field.multiple) fileInput.multiple = true;
          if (field.required) fileInput.required = true;
          group.appendChild(fileInput);
        }

        // 一般輸入框 (text, number_text, date, time, datetime-local 等)
        else {
          const input = document.createElement('input');
          input.className = 'form-control';
          input.name = field.name;
          input.placeholder = field.placeholder || '';

          if (field.type === 'number_text') {
            input.type = 'text';
            input.inputMode = 'numeric';
            input.pattern = '[0-9]*';
            input.oninput = (e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, '');
            };
          } else {
            input.type = field.type || 'text';
          }

          if (field.defaultValue !== undefined) input.value = field.defaultValue;
          if (field.maxLength) input.maxLength = field.maxLength;
          if (field.minLength) input.minLength = field.minLength;
          if (field.min) input.min = field.min;
          if (field.max) input.max = field.max;
          if (field.required) input.required = true;

          group.appendChild(input);
        }

        form.appendChild(group);
      });

      // ------------------------------------------
      // 3. 表單底部按鈕列 (提交 + 清除/重置)
      // ------------------------------------------
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group align-left';

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'btn btn-inline btn-primary';
      submitBtn.innerText = item.submitText || '提交';
      btnGroup.appendChild(submitBtn);

      if (item.showReset || item.resetText) {
        const resetBtn = document.createElement('button');
        resetBtn.type = 'reset';
        resetBtn.className = 'btn btn-inline btn-secondary';
        resetBtn.innerText = item.resetText || '清除重置';
        if (item.onReset && typeof window[item.onReset] === 'function') {
          resetBtn.onclick = () => window[item.onReset](form);
        }
        btnGroup.appendChild(resetBtn);
      }

      form.appendChild(btnGroup);

      // 表單提交處理
// 表單提交處理 (含防重複點擊與 Async 狀態還原)
      form.onsubmit = async (e) => {
        e.preventDefault();

        // 防重複觸發：如果正在提交中則直接擋下
        if (form.dataset.submitting === 'true') return;

        const formData = new FormData(form);
        const data = {};

        for (let [key, val] of formData.entries()) {
          if (data[key]) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(val);
          } else {
            data[key] = val;
          }
        }

        // 鎖定表單狀態與按鈕
        form.dataset.submitting = 'true';
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = '處理中...';

        try {
          if (window[item.onSubmit] && typeof window[item.onSubmit] === 'function') {
            // 支援非同步 (Promise) 或同步 onSubmit 處理
            await window[item.onSubmit](data);
          }
        } catch (err) {
          console.error('表單提交錯誤:', err);
        } finally {
          // 提交完成或失敗後還原按鈕狀態
          form.dataset.submitting = 'false';
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      };

      element.appendChild(form);
    }
    if (element) {
      this.bindTabCategory(element, item);
    }

    return element;
  },

  showLoading(show, message = '載入中...') {
    let loader = document.getElementById('app-loader');
    if (show) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.className = 'loading-overlay';
        document.body.appendChild(loader);
      }
      loader.innerText = message;
    } else if (loader) {
      loader.remove();
    }
  }
};
