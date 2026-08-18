/**
 * GAS 連接與資料傳輸 API 客戶端
 */
const GASClient = {
  // 替換為您的 GAS Web App 發布 URL
  baseUrl: typeof GAS_WEB_APP_URL !== 'undefined' ? GAS_WEB_APP_URL : '',

  /**
   * 1. 核心載入介面 Schema (取代原本 app.js 的 loadForm)
   * @param {boolean} silent - 是否靜默更新 (true 時不顯示全螢幕 Loading)
   * @param {string} containerId - 渲染的主容器 ID (預設 'app')
   */
  async loadFormSchema(silent = false, containerId = 'app') {
    const container = document.getElementById(containerId);

    // 非靜默載入時顯示 UI Loading 提示
    if (!silent && typeof UI !== 'undefined' && UI.showLoading) {
      UI.showLoading(true, '系統介面載入中...');
    }

    // 自動讀取 URL 網址列參數 (?type=leave 等)
    const urlParams = new URLSearchParams(window.location.search);
    const queryParamsString = urlParams.toString();
    const requestUrl = queryParamsString ? `${this.baseUrl}?${queryParamsString}` : this.baseUrl;

    try {
      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);

      const result = await response.json();

      if (!silent && typeof UI !== 'undefined' && UI.showLoading) {
        UI.showLoading(false);
      }

      if (result.success && result.schema) {
        // 初始化 AppState (變數與動態 Function)
        if ((result.variables || result.functions) && typeof AppState !== 'undefined') {
          AppState.init(result.variables, result.functions);
        }

        // 觸發 UI 繪製
        if (typeof UI !== 'undefined' && UI.render) {
          UI.render(containerId, result.schema);
        }

        return result;
      } else {
        throw new Error(result.message || '無法載入表單架構');
      }

    } catch (error) {
      console.error('[GASClient] loadFormSchema 失敗:', error);

      if (!silent) {
        if (typeof UI !== 'undefined' && UI.showLoading) UI.showLoading(false);
        if (container) {
          container.innerHTML = `
            <div style="padding: 30px; text-align: center; color: #ff3b30;">
              <h4>⚠️ 載入失敗</h4>
              <p>${error.message || error}</p>
              <button onclick="GASClient.loadFormSchema(false, '${containerId}')" style="padding: 8px 16px; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 10px;">重新載入</button>
            </div>`;
        }
      } else {
        if (typeof UI !== 'undefined' && UI.showToast) {
          UI.showToast('背景自動更新失敗：' + error.message, 'danger');
        }
      }
      return { success: false, error: error.message };
    }
  },

  /**
   * 2. 通用 POST 數據傳送請求
   */
  async request(action, data = {}, options = {}) {
    const { showToast = false, loadingMessage = null, onStart, onComplete } = options;
    
    if (typeof onStart === 'function') {
      try {
        onStart();
      } catch (e) {
        console.error('[GASClient] onStart 執行失敗:', e);
      }
    }

    if (loadingMessage && typeof UI !== 'undefined' && UI.showLoading) {
      UI.showLoading(true, loadingMessage);
    }

    const payload = {
      action: action,
      sheetName: options.sheetName || null,
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

      if (showToast && options.successMessage && typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(options.successMessage, 'success');
      }

      return result;

    } catch (err) {
      console.error(`[GASClient Request Error] Action: ${action}`, err);
      if (showToast && typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(`操作失敗: ${err.message}`, 'danger');
      }
      return { success: false, error: err.message };
    } finally {
      if (typeof UI !== 'undefined' && UI.showLoading) UI.showLoading(false);
      // 觸發外部 UI 回呼（如：關閉按鈕轉圈）
      if (typeof onComplete === 'function') {
        try {
          onComplete();
        } catch (e) {
          console.error('[GASClient] onComplete 執行失敗:', e);
        }
      }
    }
  },

  // ----------------------------------------------------
  // 快捷 Helper 函數 (方便前端/動態按鈕點擊時呼叫)
  // ----------------------------------------------------

  async log(actionName, details = {}, user = null) {
    const currentUser = user || (typeof AppState !== 'undefined' ? AppState.getVar('currentUser', 'System') : 'System');
    return this.request('log', { user: currentUser, action: actionName, details: details }, { showToast: false });
  },

  async append(sheetName, rowData, successMsg = '新增資料成功！') {
    return this.request('append', { rowData }, { sheetName, successMessage: successMsg, loadingMessage: '資料寫入中...' });
  },

  async update(sheetName, targetId, idColIndex, updatedRowData, successMsg = '更新成功！') {
    return this.request('update', { targetId, idColIndex, updatedRowData }, { sheetName, successMessage: successMsg, loadingMessage: '更新中...' });
  },

  async delete(sheetName, targetId, idColIndex, successMsg = '已成功刪除！') {
    return this.request('delete', { targetId, idColIndex }, { sheetName, successMessage: successMsg, loadingMessage: '刪除中...' });
  }
};
