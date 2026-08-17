let currentFormType = 'default';

/**
 * 1. 向 GAS 請求 UI Config 結構
 */
// 預設 silent = false (首次載入顯示 Loading，Timer 觸發時傳入 true 不顯示)
async function loadForm(silent = false) {
  // 僅非靜默更新時才顯示全螢幕 Loading
  if (!silent) {
    UI.showLoading(true, '載入中...');
  }

  // 讀取網址列參數（例如 ?type=leave）
  const urlParams = new URLSearchParams(window.location.search);
  const queryParamsString = urlParams.toString();
  const requestUrl = queryParamsString ? `${GAS_WEB_APP_URL}?${queryParamsString}` : GAS_WEB_APP_URL;

  try {
    const response = await fetch(requestUrl);
    const result = await response.json();

    if (!silent) {
      UI.showLoading(false);
    }

    if (result.success && result.schema) {
      currentFormType = result.formType || 'default';

      // 儲存後端傳回的全域變數與動態函數
      if (result.variables || result.functions) {
        AppState.init(result.variables, result.functions);
      }
      
      // 即時重新渲染頁面 (UI.render 內部會更新上次更新時間)
      UI.render('app', result.schema);
    } else {
      if (!silent) alert('無法載入表單架構');
    }
  } catch (error) {
    if (!silent) {
      UI.showLoading(false);
      alert('載入失敗：' + error);
    } else {
      UI.showToast('背景自動更新失敗'  + error, 'danger');
    }
  }
}

/**
 * 2. 處理表單提交，將資料送回 GAS
 */
async function handleFormSubmit(formData) {
  UI.showLoading(true, '提交中，請稍候...');

  // 夾帶先前儲存的全域變數
  const payload = {
    formType: currentFormType,
    userContext: AppState.variables, // 帶入儲存的變數
    data: formData
  };

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
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

function loadDashboardConfig() {
    UI.showLoading(true, '更新最新資料中...');
    
    google.script.run
      .withSuccessHandler(function(schema) {
        UI.showLoading(false);
        UI.render('app', schema);
        UI.showToast('最新勤務與資安資料已載入', 'success');
      })
      .withFailureHandler(function(err) {
        UI.showLoading(false);
        UI.showToast('載入失敗：' + err.message, 'danger');
      })
      .getDashboardConfig(); // 呼叫 Server.gs 函數
  }

// 網頁載入完成後觸發
document.addEventListener('DOMContentLoaded', loadForm);
