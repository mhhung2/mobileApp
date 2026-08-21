/**
 * 應用程式初始化進入點
 */
document.addEventListener('DOMContentLoaded', () => {
  AppState.initAuth();
  
  //初始化頂部 Header 狀態
  //updateHeaderuserID();
  
  // 採用 GET, 觸發 GASClient 進行頁面 Schema 載入
  //GASClient.loadSchema(false, 'app');

  // 採用 POST 一趟安全初始化
  GASClient.initAppSchema();
});

/**
 * 更新頂部 Header 用戶資訊與登入狀態
 */
function updateHeaderuserID() {
  // 從 localStorage 讀取已登入的 userID
  const app = AppState.getApp();
  const loggedUser = AppState.getUserID();
  const userName = AppState.getUserName();
  const userRole = AppState.getUserRole();
  const sessionKey = AppState.getSessionKey();

  console.log("[App.js] App: ", app, ", Logged User: ", loggedUser, userName, ", Role:",  userRole, ", Key:", sessionKey);

  // 搜尋 Header 相關的 DOM 節點
  //const userDisplayEl = document.getElementById('header-user-id');
  //const userRoleEl = document.getElementById('header-user-role');
  //const loginBtnEl = document.getElementById('header-login-btn');
  //const logoutBtnEl = document.getElementById('header-logout-btn');

  /*
  if (loggedUser) {
    // 🌟 已登入狀態：顯示 userID 與 Role
    if (userDisplayEl) {
      userDisplayEl.innerText = loggedUser;
      userDisplayEl.style.display = 'inline-block';
    }
    if (userRoleEl) {
      userRoleEl.innerText = userRole ? `(${userRole})` : '';
      userRoleEl.style.display = 'inline-block';
    }
    if (loginBtnEl) loginBtnEl.style.display = 'none';
    if (logoutBtnEl) logoutBtnEl.style.display = 'inline-block';
  } else {
    // 🌟 未登入狀態：清空顯示資訊，回到登入按鈕
    if (userDisplayEl) {
      userDisplayEl.innerText = '';
      userDisplayEl.style.display = 'none';
    }
    if (userRoleEl) {
      userRoleEl.innerText = '';
      userRoleEl.style.display = 'none';
    }
    if (loginBtnEl) loginBtnEl.style.display = 'inline-block';
    if (logoutBtnEl) logoutBtnEl.style.display = 'none';
  }*/
}

/**
 * 登出處理 Helper
 */
function handleLogout() {
  if (typeof UI !== 'undefined' && UI.showLoading) {
    UI.showLoading(true, '登出中，請稍候...');
  }
  
  const app = AppState.getApp();
  const userID = AppState.getUserID();
  const sessionKey = AppState.getSessionKey();

  // 若存在憑證，發送後端作廢 Session
  if (userID && sessionKey && typeof GASClient !== 'undefined') {
    GASClient.request('LOGOUT', {}, { showToast: false });
  }

  // 清空前端所有 Token 與 User 資料
  AppState.clearAuth()

  // 更新 Header 顯示狀態
  updateHeaderuserID();

  // 切換網址列為登入頁
  if(app) {
    window.history.pushState({}, '', '?app=' + app);
  }
  else {
    window.history.pushState({}, '', '');
  }
  
  // 重新載入 Schema
  if (typeof GASClient !== 'undefined') {
    await GASClient.initAppSchema('app', '登出中，請稍候...');
  }
}


//展示用
/*
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
*/
