/**
 * UI 動態生成器模組 (UI Engine)
 */
const UI = {
  // 渲染頁面主入口
  render(containerId, schema) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    schema.forEach(item => {
      const el = this.createComponent(item);
      if (el) container.appendChild(el);
    });
  },

  // 元件工廠 (Component Factory)
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

  // 顯示或隱藏 Loading 動畫
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
