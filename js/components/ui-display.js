/**
 * 基礎內容與數據展示元件（Header, Card, Text, KPI, Timeline...）
 */
Object.assign(UI, {
  createHeader(item) {
    const element = document.createElement('div');
    element.className = `app-header align-${item.align || 'left'}`;

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
      } else {
        const childEl = this.createComponent(child);
        if (childEl) element.appendChild(childEl);
      }
    });
    return element;
  },

  createGridRow(item) {
    const container = document.createElement('div');
    container.className = `ui-grid-row ${item.className || ''}`;

    // 1. 整行 (Row Level) 樣式設定
    const totalColumns = item.totalColumns || 4;
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${totalColumns}, 1fr)`;
    container.style.gap = item.gap || '8px';
    container.style.alignItems = item.alignItems || 'center';
    container.style.width = '100%';
    container.style.boxSizing = 'border-box';

    // 支援整行背景色、框線、圓角與內邊距
    if (item.bg || item.bgColor) container.style.backgroundColor = item.bg || item.bgColor;
    if (item.border) container.style.border = item.border;
    if (item.borderRadius) container.style.borderRadius = item.borderRadius;
    if (item.padding) container.style.padding = item.padding;

    // 2. 處理內部各格子 (Col Level)
    if (Array.isArray(item.cols)) {
      item.cols.forEach(colData => {
        const colEl = document.createElement('div');
        colEl.className = 'ui-grid-col';

        // 跨格/合併儲存格
        const span = colData.span || 1;
        colEl.style.gridColumn = `span ${span}`;
        colEl.style.minWidth = '0';
        colEl.style.boxSizing = 'border-box';
        colEl.style.display = 'flex';
        colEl.style.flexDirection = 'column';
        colEl.style.gap = colData.gap || '4px';

        // 個別格子 (Cell Level) 樣式設定
        if (colData.bg || colData.bgColor) colEl.style.backgroundColor = colData.bg || colData.bgColor;
        if (colData.border) colEl.style.border = colData.border;
        if (colData.borderRadius) colEl.style.borderRadius = colData.borderRadius;
        if (colData.padding) colEl.style.padding = colData.padding;

        // 對齊邏輯 (align: 'left' | 'center' | 'right')
        const alignMode = colData.align || 'left';
        if (alignMode === 'center') {
          colEl.style.alignItems = 'center';
          colEl.style.textAlign = 'center';
        } else if (alignMode === 'right') {
          colEl.style.alignItems = 'flex-end';
          colEl.style.textAlign = 'right';
        } else {
          colEl.style.alignItems = 'flex-start';
          colEl.style.textAlign = 'left';
        }

        // 遞迴渲染內部元件
        if (Array.isArray(colData.items)) {
          colData.items.forEach(child => {
            const childEl = this.createComponent(child);
            if (childEl) {
              childEl.style.boxSizing = 'border-box';
              childEl.style.margin = '0';
              childEl.style.textAlign = alignMode;
              colEl.appendChild(childEl);
            }
          });
        }

        container.appendChild(colEl);
      });
    }
    
    return container;
  },

  createCard(item) {
    const element = document.createElement('div');
    element.className = 'app-card';

    if (Array.isArray(item.items)) {
      item.items.forEach(child => {
        const childEl = this.createComponent(child);
        if (childEl) element.appendChild(childEl);
      });
    } else {
      if (item.title) {
        const titleEl = document.createElement('h3');
        titleEl.innerText = item.title;
        element.appendChild(titleEl);
      }
      if (item.content) {
        const textEl = document.createElement('div');
        textEl.className = 'app-text';
        if (item.isHtml === true) {
          textEl.innerHTML = item.content;
        } else {
          textEl.innerText = item.content;
        }
        element.appendChild(textEl);
      }
    }
    return element;
  },

  createCardGroup(item) {
    const element = document.createElement('div');
    element.className = `card-group ${item.collapsed ? 'collapsed' : ''}`;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-group-header';
    headerDiv.innerHTML = `<span>${item.title || ''}</span><span class="toggle-icon">▲</span>`;
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
    return element;
  },

  createTextItem(item) {
    const el = document.createElement('div');
    if (item.type === 'title') el.className = 'item-title';
    else if (item.type === 'subtitle') el.className = 'item-subtitle';
    else if (item.type === 'quote') el.className = `item-quote ${item.variant ? `quote-${item.variant}` : ''}`;
    else el.className = 'item-text';

    // 核心修改：判斷 item.isHtml 是否為 true
    if (item.isHtml === true) {
      el.innerHTML = item.text || '';
    } else {
      el.innerText = item.text || '';
    }
    return el;
  },

  createBadge(item) {
    const badgeEl = document.createElement('span');
    badgeEl.className = `item-badge badge-${item.variant || 'info'}`;
    badgeEl.innerText = item.text || '';
    return badgeEl;
  },

  createBadgeGroup(item) {
    const container = document.createElement('div');
    container.className = `badge-group align-${item.align || 'left'}`;
    if (Array.isArray(item.badges)) {
      item.badges.forEach(b => container.appendChild(this.createBadge(b)));
    }
    return container;
  },

  createButton(item) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn btn-${item.variant || 'primary'}`;
    btn.innerText = item.text || '按鈕';
    if (item.disabled) {
      btn.disabled = true;
    } else if (item.onClick && typeof window[item.onClick] === 'function') {
      btn.onclick = window[item.onClick];
    }
    return btn;
  },

  createButtonGroup(item) {
    const container = document.createElement('div');
    container.className = `btn-group align-${item.align || 'left'}`;
    if (Array.isArray(item.buttons)) {
      item.buttons.forEach(btnData => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn btn-inline btn-${btnData.variant || 'primary'}`;
        btn.innerText = btnData.text || '按鈕';
        if (btnData.disabled) btn.disabled = true;
        else if (btnData.onClick && typeof window[btnData.onClick] === 'function') btn.onclick = window[btnData.onClick];
        container.appendChild(btn);
      });
    }
    return container;
  },

  createSpacer(item) {
    const spacer = document.createElement('div');
    spacer.className = `app-spacer ${item.inline ? 'inline' : ''}`;
    if (item.height !== undefined) spacer.style.height = typeof item.height === 'number' ? `${item.height}px` : item.height;
    if (item.width !== undefined) spacer.style.width = typeof item.width === 'number' ? `${item.width}px` : item.width;
    return spacer;
  },

  createDivider(item) {
    const divider = document.createElement('hr');
    divider.className = `app-divider ${item.variant || 'solid'}`;
    if (item.color) divider.style.borderColor = item.color;
    if (item.margin !== undefined) {
      const m = typeof item.margin === 'number' ? `${item.margin}px` : item.margin;
      divider.style.marginTop = m;
      divider.style.marginBottom = m;
    }
    return divider;
  },

  createKPIGroup(item) {
    const groupEl = document.createElement('div');
    groupEl.className = `kpi-group cols-${item.cols || 2}`;
    if (Array.isArray(item.items)) {
      item.items.forEach(kpi => {
        const cardEl = document.createElement('div');
        cardEl.className = 'kpi-card';
        let footerHTML = '';
        if (kpi.statusText || kpi.change) {
          footerHTML = `
            <div class="kpi-footer">
              ${kpi.statusText ? `<span class="kpi-status ${kpi.status ? `status ${kpi.status}` : ''}">${kpi.statusText}</span>` : ''}
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

  createTimeline(item) {
    const container = document.createElement('div');
    container.className = 'app-timeline';
    if (Array.isArray(item.events)) {
      item.events.forEach(evt => {
        const eventEl = document.createElement('div');
        eventEl.className = `timeline-event ${evt.status ? `status-${evt.status}` : ''}`;
        if (evt.time) {
          const timeEl = document.createElement('div');
          timeEl.className = 'timeline-time';
          timeEl.innerText = evt.time;
          eventEl.appendChild(timeEl);
        }
        if (Array.isArray(evt.items)) {
          evt.items.forEach(child => {
            const childEl = this.createComponent(child);
            if (childEl) eventEl.appendChild(childEl);
          });
        } else {
          if (evt.media) eventEl.appendChild(this.createMediaPreview({ type: 'mediaPreview', src: evt.media, caption: evt.mediaCaption }));
          if (evt.badge) eventEl.appendChild(this.createBadge({ text: evt.badge, variant: evt.badgeVariant || 'info' }));
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
  }
});
