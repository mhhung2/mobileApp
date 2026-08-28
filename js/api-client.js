/**
 * 資料傳輸 API 客戶端
 */
const APIClient = {
  baseUrl: typeof GAS_WEB_APP_URL !== 'undefined' ? GAS_WEB_APP_URL : '',

  async request(action, data = {}, options = {}) {
    const { showToast = false, loadingMessage = null, skipLoading = false, onStart, onComplete } = options;
    
    if (typeof onStart === 'function') {
      try {
        onStart();
      } catch (e) {
        console.error('[APIClient] onStart 執行失敗:', e);
      }
    }

    if (!skipLoading && loadingMessage && typeof UI !== 'undefined' && UI.showLoading) {
      UI.showLoading(true, loadingMessage);
    }

    const urlParams = new URLSearchParams(window.location.search);
    var app = urlParams.get('app');
    var userID = null;
    var sessionKey = null;
    var sessionApp = AppState.getApp();
    if(!app || app==sessionApp){
      userID = AppState.getUserID();
      sessionKey = AppState.getSessionKey();
    }
    
    const payload = {
      app: app,
      action: action,
      userID: userID,
      sessionKey: sessionKey,
      options: options,
      data: data,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error || result.message || '後端處理失敗');

      //處理BackEnd 傳回額外資訊
      if (result.newSessionKey) {localStorage.setItem('sessionKey', result.newSessionKey); }
      if (result.isLoggedIn === false) {
        clearAuth();
        if(result.message){
          UI.showToast(result.message, 'warning');
          console.error(result.message);
        }
      }

      if (showToast && options.successMessage && typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(options.successMessage, 'success');
      }

      return result;

    } catch (err) {
      console.error(`[APIClient Request Error] Action: ${action}`, err);
      if (showToast && typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(`操作失敗: ${err.message}`, 'danger');
      }
      return { success: false, error: err.message };
    } finally {
      if (!skipLoading && typeof UI !== 'undefined' && UI.showLoading) {
        UI.showLoading(false);
      }
      // 觸發外部 UI 回呼（如：關閉按鈕轉圈）
      if (typeof onComplete === 'function') {
        try {
          onComplete();
        } catch (e) {
          console.error('[APIClient] onComplete 執行失敗:', e);
        }
      }
    }
  },

  async initApp(containerId = 'app', loadingMessage = '載入系統中...') {

    try {
		const result = await this.requestRender('INIT_APP', {}, {
			containerId: containerId,
			loadingMessage: loadingMessage
		});	

		if (result.success) {
			if(result.app) {
			  AppState.setApp(result.app);
			  window.history.pushState({}, '', '?app=' + result.app);
			  if(result.sysName) document.title = result.sysName;
			}
			else {
			  window.history.pushState({}, '', '');
			}
			if (typeof updateHeaderuserID === 'function') updateHeaderuserID();
		}
		return result;

    } catch (error) {
      console.error('[APIClient] initAppSchema 失敗:', error);
      return { success: false, error: error.message };
    }
  },
  
  async requestRender(action, data = {}, options = {}) {
	const containerId = options.containerId || 'app';
	if(options.containerId) delete options.containerId;
    const container = document.getElementById(containerId);
	const loadingMessage = options.loadingMessage || '載入系統中...';

    if (typeof UI !== 'undefined' && UI.showLoading) {
      UI.showLoading(true, loadingMessage);
    }
	options.showToast = false;
	options.skipLoading = true;

    try {
      const result = await this.request(action, data, options);

      if (result.success) {

        // 初始化變數與動態函數
        if ((result.variables || result.functions) && typeof AppState !== 'undefined') {
          AppState.init(result.variables, result.functions);
        }
        
		if (result.schema && typeof UI !== 'undefined') {
		  UI.render(containerId, result.schema);
		}

        return result;
      } else {
        throw new Error(result.message || '系統錯誤');
      }

    } catch (error) {
      console.error('[APIClient] requestRender 失敗:', error);
      if (typeof UI !== 'undefined' && UI.showLoading) UI.showLoading(false);
      return { success: false, error: error.message };
    } finally {
      if (typeof UI !== 'undefined' && UI.showLoading) {
        UI.showLoading(false);
      }
    }
  },

};
