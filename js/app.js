/**
 * 應用程式初始化進入點
 */
document.addEventListener('DOMContentLoaded', () => {
  //初始化頂部 Header 狀態
  console.log("before APP.JS onloaded");
  updateHeaderuserID();
  
  // 觸發 GASClient 進行頁面 Schema 載入
  GASClient.loadFormSchema(false, 'app');
});

/**
 * 更新頂部 Header 用戶資訊與登入狀態
 */
function updateHeaderuserID() {
  // 從 localStorage 讀取已登入的 userID
  const loggedUser = localStorage.getItem('loggedUser');
  const userRole = localStorage.getItem('userRole') || '';

  console.log("[App.js] Logged User: ", loggedUser, " Role:",  userRole)

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
function handleLogout(isDirectToLoginPage = true) {
  localStorage.removeItem('loggedUser');
  localStorage.removeItem('userRole');

  // 切換網址列為登入頁
  window.history.pushState({}, '', '?page=login');
  
  // 更新 Header 並重新載入 Schema
  console.log("App.js Inside handleLOGOUT");
  updateHeaderuserID();
  if(isDirectToLoginPage) GASClient.loadFormSchema(false, 'app');
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
