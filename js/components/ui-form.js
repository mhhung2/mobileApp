/**
 * Form 表單生成器與動態提交邏輯
 */
Object.assign(UI, {
  createForm(item) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'app-card';
    const form = document.createElement('form');

    const fields = item.items
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        const nonInputTypes = [
          'title', 'subtitle', 'text', 'quote', 'label', 'badge', 'badgeGroup', 
          'button', 'buttonGroup', 'kpiGroup', 'timeline', 'mediaPreview', 
          'spacer', 'divider', 'accordion', 'carousel','gridRow'
        ];

        if (nonInputTypes.includes(field.type)) {
          const nonInputEl = this.createComponent(field);
          if (nonInputEl) form.appendChild(nonInputEl);
          return;
        }
		if(!field.type) return;

        if (field.type === 'hidden') {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
		  if(field.id) hiddenInput.id = field.id;
          hiddenInput.name = field.name;
          hiddenInput.value = field.defaultValue !== undefined ? field.defaultValue : (field.value || '');
          form.appendChild(hiddenInput);
          return;
        }

        const group = document.createElement('div');
        group.className = 'form-group';

		if(field.label){
			const labelEl = document.createElement('label');
			labelEl.innerText = field.label;
			if (field.required) {
			  const reqSpan = document.createElement('span');
			  reqSpan.style.color = '#ff3b30';
			  reqSpan.innerText = ' *';
			  labelEl.appendChild(reqSpan);
		    }
			group.appendChild(labelEl);
		}
        
        if (field.type === 'select') {
          const select = document.createElement('select');
		  if (field.id) select.id = field.id;
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
		  if (field.id) textarea.id = field.id;
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
		  if (field.id) input.id = field.id;
          input.className = 'form-control';
          input.name = field.name;
          input.placeholder = field.placeholder || '';
          if (field.type === 'inputText') {
            input.type = 'text';
          }
		  else if (field.type === 'password' || field.type === 'inputPassword') {
            input.type = 'password';
          }
          else if (field.type === 'inputNumberText') {
            input.type = 'text';
            input.inputMode = 'numeric';
            //input.pattern = '[0-9]*';
          } else {
            input.type = field.type || 'text';
          }
          if (field.defaultValue !== undefined) input.value = field.defaultValue;
          if (field.maxLength) input.maxLength = field.maxLength;
          if (field.minLength) input.minLength = field.minLength;
          if (field.min) input.min = field.min;
          if (field.max) input.max = field.max;
          if (field.required) input.required = true;
		  if (field.pattern) input.pattern = field.pattern;
		  
          const validateInput = (target) => {
            const rawVal = target.value;
            const val = rawVal.trim();

            // 1. 必填檢查 (required)
            if (field.required && val === '') {target.setCustomValidity('請填寫此欄位');return;}
            if (val !== '') {
              const len = rawVal.length; // 文字欄位保留空格計算長度
              const isNumberType = field.type === 'inputNumberText';

              // 2. 長度檢查 (minLength) - 不受 pattern 影響，優先攔截
              if (field.minLength && len < Number(field.minLength)) {
                if (field.minLength === field.maxLength) {
                  target.setCustomValidity(`請輸入恰好 ${field.minLength} 個${isNumberType ? '位數字' : '字元'}`);
                } else {
                  target.setCustomValidity(`請輸入至少 ${field.minLength} 個${isNumberType ? '位數字' : '字元'} (目前 ${len} 個)`);
                }
                return;
              }

              // 3. 數值範圍檢查 (僅對數字欄位生效)
              if (isNumberType) {
                const valNum = Number(val);
                if (field.min !== undefined && valNum < Number(field.min)) {
                  target.setCustomValidity(`數值不能小於 ${field.min}`);
                  return;
                }
                if (field.max !== undefined && valNum > Number(field.max)) {
                  target.setCustomValidity(`數值不能大於 ${field.max}`);
                  return;
                }
              }

              // 4. 正則表達式檢查 (field.pattern)
              if (field.pattern) {
                const reg = new RegExp(field.pattern);
                if (!reg.test(rawVal)) {
                  target.setCustomValidity(field.patternError || '輸入格式不正確');
                  return;
                }
              }
            }
            target.setCustomValidity('');
          };

          input.oninput = (e) => {
            const target = e.target;
            if (field.type === 'inputNumberText') {target.value = target.value.replace(/[^0-9]/g, '');}
            validateInput(target);
          };
          input.oninvalid = (e) => {validateInput(e.target);};
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
	  if (!form.reportValidity()) return;
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
          await window[item.onSubmit](data,e);
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

const formTypes = [
	'select', 'inputText', 'inputNumberText', 'inputPassword', 
	'password', 'textarea', 'radio', 'checkbox', 'switch', 'file'
];
  
// 暫存原有的 createComponent
const originalCreateComponent = UI.createComponent;
  
UI.createComponent = function(item) {
  if (!item || !item.type) return null;

  // 如果遇到表單欄位型別，利用微型 Form 容器來複用 ui-form 的渲染邏輯
  if (formTypes.includes(item.type)) {
	const dummyForm = UI.createForm({ items: [item] });
	// 提取 Form 內部產生的 form-group 節點
	const formGroup = dummyForm.querySelector('.form-group');
	if (formGroup) {
	  if (item.category) formGroup.dataset.category = item.category;
	  if (item.groupId) formGroup.dataset.groupId = item.groupId;
	  if (item.id) formGroup.id = item.id;
	  return formGroup;
	}
  }

  // 其他型別交回原本的 createComponent 處理
  return originalCreateComponent.call(this, item);
};
