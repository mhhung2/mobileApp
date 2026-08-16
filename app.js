let currentFormType = 'default';

/**
 * 1. 向 GAS 請求 UI Config 結構
 */
async function loadFormSchema() {
  UI.showLoading(true, '載入介面模組中...');

  // 讀取網址列參數（例如 ?type=leave）
  const urlParams = new URLSearchParams(window.location.search);
  const queryParamsString = urlParams.toString();
  const requestUrl = queryParamsString ? `${GAS_WEB_APP_URL}?${queryParamsString}` : GAS_WEB_APP_URL;

  try {
    const response = await fetch(requestUrl);
    const result = await response.json();
    UI.showLoading(false);

    if (result.success && result.schema) {
      currentFormType = result.formType || 'default';
      UI.render('app', result.schema);
    } else {
      alert('無法載入表單架構');
    }
  } catch (error) {
    UI.showLoading(false);
    alert('載入失敗：' + error);
  }
}

/**
 * 2. 處理表單提交，將資料送回 GAS
 */
async function handleFormSubmit(formData) {
  UI.showLoading(true, '提交中，請稍候...');

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        formType: currentFormType,
        data: formData
      })
    });

    const result = await response.json();
    UI.showLoading(false);

    if (result.success) {
      alert(result.message);
    } else {
      alert('提交失敗：' + result.message);
    }
  } catch (error) {
    UI.showLoading(false);
    alert('連線失敗：' + error);
  }
}

// 網頁載入完成後觸發
document.addEventListener('DOMContentLoaded', loadFormSchema);
