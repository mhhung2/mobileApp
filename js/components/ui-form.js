/**
 * Form 表單生成器與動態提交邏輯
 */
Object.assign(UI, {
  createForm(item) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'app-card';
    const form = document.createElement('form');

    if (Array.isArray(item.items)) {
      item.items.forEach(field => {
        const nonInputTypes = [
          'title', 'subtitle', 'text', 'quote', 'badge', 'badgeGroup', 
          'button', 'buttonGroup', 'kpiGroup', 'timeline', 'mediaPreview', 
          'spacer', 'divider', 'accordion', 'carousel'
        ];

        if (nonInputTypes.includes(field.type)) {
          const nonInputEl = this.createComponent(field);
          if (nonInputEl) form.appendChild(nonInputEl);
          return;
        }

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

        // 若 field.isHtml 為 true，則使用 HTML 組合 label，否則將純文字轉義或插入
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
        group.appendChild(labelEl);
        
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
        else {
          const input = document.createElement('input');
          input.className = 'form-control';
          input.name = field.name;
          input.placeholder = field.placeholder || '';
          if (field.type === 'inputNumberText') {
            input.type = 'text';
            input.inputMode = 'numeric';
            input.pattern = '[0-9]*';
            input.oninput = (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); };
          } else if (field.type === 'inputText' || field.type === 'text') {
            input.type = 'text'; // 強制轉回標準 HTML 的 'text'
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
    }

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

    form.onsubmit = async (e) => {
      e.preventDefault();
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

      form.dataset.submitting = 'true';
      const originalBtnText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = '處理中...';

      try {
        if (window[item.onSubmit] && typeof window[item.onSubmit] === 'function') {
          await window[item.onSubmit](data);
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
