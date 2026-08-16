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

// 核心元件繪製工廠
  createComponent(item) {
    let element = null;

    // 1. Header (支援傳統 title/subtitle 或 items 無限子項目)
    if (item.type === 'header') {
      element = document.createElement('div');
      element.className = 'app-header';

      if (Array.isArray(item.items)) {
        item.items.forEach(child => {
          const childEl = this.createComponent(child);
          if (childEl) element.appendChild(childEl);
        });
      } else {
        element.innerHTML = `<h1>${item.title || ''}</h1>${item.subtitle ? `<p>${item.subtitle}</p>` : ''}`;
      }
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
      element.className = 'item-quote';
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
          quoteEl.className = 'item-quote';
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
      form.onsubmit = (e) => {
        e.preventDefault();
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

        if (window[item.onSubmit] && typeof window[item.onSubmit] === 'function') {
          window[item.onSubmit](data);
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
