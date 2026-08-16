let currentFormType = 'default';

/**
 * 1. 向 GAS 請求 UI Config 結構
 */
async function loadFormSchema() {
  UI.showLoading(true, '載入中...');

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

function handleShowDetails() {
  UI.showModal({
    title: '勤務詳細補充說明',
    position: 'bottom', // 'bottom' (BottomSheet) 或 'center' (Modal)
    items: [
      { type: 'text', text: '本次 HKR 勤務由 DC2/HB 主責應對，全體急救合格人員已抵達指定地點。' },
      {
        type: 'mediaPreview',
        src: 'https://picsum.photos/500/250',
        caption: '現場裝備與車輛巡檢照片'
      },
      {
        type: 'button',
        text: '確認知悉並關閉',
        variant: 'primary',
        onClick: 'UI.closeModal'
      }
    ]
  });
}

function handleSendAlert() {
  UI.showToast('已成功發送緊急通知給 Team B 成員！', 'success', 3000);
}

// 網頁載入完成後觸發
document.addEventListener('DOMContentLoaded', loadFormSchema);
