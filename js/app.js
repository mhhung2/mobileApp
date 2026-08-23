/**
 * 應用程式初始化進入點
 */
document.addEventListener('DOMContentLoaded', () => {
  AppState.initAuth();
  GASClient.initAppSchema();  // 採用 POST 一趟安全初始化
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
}

/**
 * 登出處理 Helper
 */
async function handleLogout() {
  if (typeof UI !== 'undefined' && UI.showLoading) {
    UI.showLoading(true, '登出中，請稍候...');
  }
  const app = AppState.getApp();
  const userID = AppState.getUserID();
  const sessionKey = AppState.getSessionKey();
  // 若存在憑證，發送後端作廢 Session
  if (app & userID && sessionKey && typeof GASClient !== 'undefined') {
    GASClient.request('DESTROY_SESSION', {}, { showToast: false });
  }
  clearAuth();
  // 重新載入 Schema
  if (typeof GASClient !== 'undefined') {
    await GASClient.initAppSchema('app', '登出中，請稍候...');
  }
}

function clearAuth(){
  AppState.clearAuth(); // 清空前端所有 Token 與 User 資料
  const app = AppState.getApp();
  app? window.history.pushState({}, '', '?app=' + app) : window.history.pushState({}, '', ''); // 切換網址列為登入頁
}

