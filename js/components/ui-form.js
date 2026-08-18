/**
 * Form 表單生成器與動態提交邏輯 (強固修復版)
 */
Object.assign(UI, {
  createForm(item) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'app-card';
    const form = document.createElement('form');

    const fields = item.items || [];

    if (Array.isArray(fields)) {
      fields.forEach(field => {
        // 純文字/標籤等展示型元件（僅在「沒有 name 屬性」且屬於非輸入型時，才交給 UI 二級元件處理）
        const nonInputTypes = [
          'title', 'subtitle', 'text', 'quote', 'badge', 'badgeGroup', 
          'button', 'buttonGroup', 'kpiGroup', 'timeline', 'mediaPreview', 
          'spacer', 'divider', 'accordion', 'carousel'
        ];

        if ( nonInputTypes.includes(field.type)) {
          const nonInputEl = this.createComponent(field);
          if (nonInputEl) form.appendChild(nonInputEl);
          return;
        }

        // 隱藏欄位處理
        if (field.type === 'hidden') {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = field.name;
          hiddenInput.value = field.defaultValue !== undefined ? field.defaultValue : (field.value || '');
          form.appendChild(hiddenInput);
          return;
        }

        const group = document.createElement('div');
        group.className = 'form-group';
        group.style.marginBottom = '16px';

        const labelText = field.label || '';
        const requiredMark = field.required ? ' <span style="color:#ff3b30">*</span>' : '';
        const labelEl = document.createElement('label');

        if (field.isHtml === true) {
          labelEl.innerHTML = labelText + requiredMark;
        } else {
          labelEl.innerText = labelText;
          if (field.required) {
            const reqSpan = document.createElement('span');
            reqSpan.style.color = '#ff3b30';
            reqSpan.innerText = ' *';
            labelEl.appendChild(reqSpan);
          }
        }
        if (labelText) group.appendChild(labelEl);
        
        if (field.type === 'select') {
          const select = document.createElement('select');
          select.className = 'form-control';
          select.name = field.name;
          if (field.required) select.required = true;
          if (Array.isArray(field.options)) {
            field.options.forEach(opt => {
              const val = opt.value !== undefined ? opt.value : opt;
              const text = opt.label !== undefined ? opt.label : opt;
              const optionEl = new Option(text, val);
              if (field.defaultValue !== undefined && String(val) === String(field.defaultValue)) {
                optionEl.selected = true;
              }
              select.add(optionEl);
            });
          }
          group.appendChild(select);
        }
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
        else {
          // 處理所有 <input> 控制項 (包含 inputText, inputNumberText 及標準 HTML types)
          const input = document.createElement('input');
          input.className = 'form-control';
          input.name = field.name || '';
          input.placeholder = field.placeholder || '';

          if (field.type === 'inputNumberText') {
            input.type = 'text';
            input.inputMode = 'numeric';
            input.pattern = '[0-9]*';
            input.oninput = (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); };
          } else if (field.type === 'inputText') {
            input.type = 'text'; // 將自訂的 inputText 轉為標準 html input[type="text"]
          } else {
            input.type = field.type || 'text';
          }

          if (field.defaultValue !== undefined) input.value = field.defaultValue;
          if (field.maxLength) input.maxLength = field.maxLength;
          if (field.minLength) input.minLength = field.minLength;
          if (field.required) input.required = true;
          group.appendChild(input);
        }

        form.appendChild(group);
      });
    }

    // 提交按鈕組
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group align-left';
    btnGroup.style.marginTop = '16px';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-inline btn-primary';
    submitBtn.innerText = item.submitText || '提交';
    btnGroup.appendChild(submitBtn);

    form.appendChild(btnGroup);

    // 表單提交監聽事件
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (form.dataset.submitting === 'true') return;

      const formData = new FormData(form);
      const data = {};
      for (let [key, val] of formData.entries()) {
        data[key] = val;
      }

      form.dataset.submitting = 'true';
      const originalBtnText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = '處理中...';

      try {
        if (window[item.onSubmit] && typeof window[item.onSubmit] === 'function') {
          await window[item.onSubmit](data, e);
        }
      } catch (err) {
        console.error('表單提交錯誤:', err);
      } finally {
        form.dataset.submitting = 'false';
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
      }
    };

    cardContainer.appendChild(form);
    return cardContainer;
  }
});
