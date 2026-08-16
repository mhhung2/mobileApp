/**
 * UI 動態生成器模組 (支援多組獨立 Tab & CardGroup)
 */
const UI = {
  // 記錄每個 category 當前選中的 Tab (例如 { team: 'all', device: 'all' })
  activeTabs: {},

  // 渲染頁面主入口
  render(containerId, schema) {
    const container = document.getElementById(containerId);
    if (!container) return;
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

  // 控制同 category 下的 Group 顯示或隱藏
  filterGroups(category, groupId) {
    const categoryElements = document.querySelectorAll(`[data-category="${category}"]`);
    categoryElements.forEach(el => {
      // 若元素設定為 groupId === 'all' 或與當前 Tab 吻合則顯示，否則隱藏
      if (groupId === 'all' || el.dataset.groupId === groupId) {
        el.style.display = ''; // 恢復原本的 CSS display 樣式
      } else {
        el.style.display = 'none';
      }
    });
  },

  // 通用綁定函數：幫任何產生的 DOM 元素加上 category 與 groupId 屬性
  bindTabCategory(element, item) {
    if (item.category) element.dataset.category = item.category;
    if (item.groupId) element.dataset.groupId = item.groupId;
    return element;
  },

  // 元件工廠
  createComponent(item) {
    let element = null;
    
    if (item.type === 'header') {
      element = document.createElement('div');
      element.className = 'app-header';
      element.innerHTML = `<h1>${item.title}</h1>${item.subtitle ? `<p>${item.subtitle}</p>` : ''}`;
    }

    else if (item.type === 'card') {
      element = document.createElement('div');
      element.className = 'app-card';
      element.innerHTML = `<h3>${item.title}</h3><div class="app-text">${item.content}</div>`;
    }

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

    else if (item.type === 'form') {
      element = document.createElement('div');
      element.className = 'app-card';
      const form = document.createElement('form');

      item.fields.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `<label>${field.label}</label>`;

        if (field.type === 'select') {
          const select = document.createElement('select');
          select.className = 'form-control';
          select.name = field.name;
          field.options.forEach(opt => select.add(new Option(opt, opt)));
          group.appendChild(select);
        } else {
          const input = document.createElement('input');
          input.type = field.type || 'text';
          input.className = 'form-control';
          input.name = field.name;
          input.placeholder = field.placeholder || '';
          group.appendChild(input);
        }
        form.appendChild(group);
      });

      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.className = 'btn btn-primary';
      btn.innerText = item.submitText || '提交';
      form.appendChild(btn);

      form.onsubmit = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        if (window[item.onSubmit] && typeof window[item.onSubmit] === 'function') {
          window[item.onSubmit](data);
        }
      };

      element.appendChild(form);
    }

    // 統一為所有元件綁定 Tab 分類屬性
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
