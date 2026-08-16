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

function handleDeleteItem() {
  UI.showModal({
    isConfirm: true,
    title: '確認刪除任務？',
    message: '此動作將無法復原，請確認是否要刪除該筆 HKR 排班紀錄。',
    confirmText: '確認刪除',
    confirmVariant: 'danger',  // 紅色警告按鈕
    cancelText: '再想想',
    onConfirm: function() {
      // 點擊確認後執行的動作
      UI.showToast('項目已成功刪除！', 'success');
      // 可在此呼叫 google.script.run.deleteData(...) 進行後端刪除
    },
    onCancel: function() {
      UI.showToast('已取消操作', 'info');
    }
  });
}

function handleApproveShift() {
  UI.showModal({
    isConfirm: true,
    title: '審核勤務支援申請',
    items: [
      {
        type: 'badgeGroup',
        badges: [
          { text: '大埔更支援', variant: 'caution' },
          { text: '待審核', variant: 'warning' }
        ]
      },
      { type: 'text', text: '申請人：Team B (急救合格人員 1 名)' },
      {
        type: 'mediaPreview',
        src: 'https://picsum.photos/400/180',
        caption: '支援地點巡檢參考圖'
      }
    ],
    confirmText: '同意派員',
    confirmVariant: 'primary',
    cancelText: '駁回申請',
    cancelVariant: 'danger',
    onConfirm: () => UI.showToast('已核准派員請求！', 'success'),
    onCancel: () => UI.showToast('已駁回申請', 'warning')
  });
}

// 網頁載入完成後觸發
document.addEventListener('DOMContentLoaded', loadFormSchema);
