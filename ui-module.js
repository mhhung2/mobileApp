/**
 * UI 動態生成器模組 (UI Engine - 支援 Tab 與 CardGroup)
 */
const UI = {
  // 紀錄當前 Tab 篩選狀態
  activeTab: 'all',

// 渲染頁面主入口
  render(containerId, schema) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // 1. 先將 schema 拆分為「頂端元素 (如 header)」與「內容元素 (如 card, cardGroup)」
    const topElements = schema.filter(item => item.type === 'header');
    const bodyElements = schema.filter(item => item.type !== 'header');

    // 2. 渲染 Header 頂端資訊
    topElements.forEach(item => {
      const el = this.createComponent(item);
      if (el) container.appendChild(el);
    });

    // 3. 在 Header 下方、Group 正上方，插入 Tab 分頁導覽列
    const groupItems = schema.filter(item => item.type === 'cardGroup');
    if (groupItems.length > 0) {
      const tabsHeader = this.createTabsHeader(groupItems);
      container.appendChild(tabsHeader);
    }

    // 4. 最後渲染所有的 Group 與卡片內容
    bodyElements.forEach(item => {
      const el = this.createComponent(item);
      if (el) container.appendChild(el);
    });

    // 初始觸發一次 Tab 篩選
    this.filterGroups(this.activeTab);
  },

  // 建立頂端 Tab 分頁導覽列
  createTabsHeader(groupItems) {
    const tabContainer = document.createElement('div');
    tabContainer.className = 'tab-container';

    // 1. 「全部」Tab
    const allTab = document.createElement('button');
    allTab.className = 'tab-btn active';
    allTab.innerText = '全部';
    allTab.onclick = (e) => this.switchTab('all', e.target);
    tabContainer.appendChild(allTab);

    // 2. 根據 Group ID / Title 產生獨立 Tab
    groupItems.forEach(group => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.innerText = group.title;
      btn.onclick = (e) => this.switchTab(group.groupId, e.target);
      tabContainer.appendChild(btn);
    });

    return tabContainer;
  },

  // 切換 Tab 點擊事件
  switchTab(groupId, targetBtn) {
    this.activeTab = groupId;

    // 更新 Tab 按鈕高亮狀態
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    targetBtn.classList.add('active');

    // 執行 Group 顯示/隱藏控制
    this.filterGroups(groupId);
  },

  // 控制特定的 Group 顯示或隱藏
  filterGroups(groupId) {
    const allGroups = document.querySelectorAll('.card-group');
    allGroups.forEach(group => {
      if (groupId === 'all' || group.dataset.groupId === groupId) {
        group.style.display = 'block';
      } else {
        group.style.display = 'none';
      }
    });
  },

  // 元件工廠
  createComponent(item) {
    if (item.type === 'header') {
      const div = document.createElement('div');
      div.className = 'app-header';
      div.innerHTML = `<h1>${item.title}</h1>${item.subtitle ? `<p>${item.subtitle}</p>` : ''}`;
      return div;
    }

    if (item.type === 'card') {
      const div = document.createElement('div');
      div.className = 'app-card';
      div.innerHTML = `<h3>${item.title}</h3><div class="app-text">${item.content}</div>`;
      return div;
    }

    // ==========================================
    // 新增：Card Group (多組 Card 組合)
    // ==========================================
    if (item.type === 'cardGroup') {
      const groupDiv = document.createElement('div');
      groupDiv.className = `card-group ${item.collapsed ? 'collapsed' : ''}`;
      groupDiv.dataset.groupId = item.groupId; // 用於 Tab 篩選的比對 Key

      // 1. Group 標題區塊（含展開/收起點擊）
      const headerDiv = document.createElement('div');
      headerDiv.className = 'card-group-header';
      headerDiv.innerHTML = `
        <span>${item.title}</span>
        <span class="toggle-icon">▲</span>
      `;
      headerDiv.onclick = () => {
        groupDiv.classList.toggle('collapsed');
      };

      // 2. Group 內容容器（存放內部 multiple cards）
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'card-group-body';

      if (Array.isArray(item.cards)) {
        item.cards.forEach(cardData => {
          const cardEl = this.createComponent({ type: 'card', ...cardData });
          if (cardEl) bodyDiv.appendChild(cardEl);
        });
      }

      groupDiv.appendChild(headerDiv);
      groupDiv.appendChild(bodyDiv);
      return groupDiv;
    }

    if (item.type === 'form') {
      const card = document.createElement('div');
      card.className = 'app-card';
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

      card.appendChild(form);
      return card;
    }

    return null;
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
