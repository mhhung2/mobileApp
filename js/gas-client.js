/**
 * GAS 連接與資料傳輸 API 客戶端
 */
const GASClient = {
  // 替換為您的 GAS Web App 發布 URL
  baseUrl: GAS_WEB_APP_URL,

  /**
   * 核心 POST 傳送方法
   * @param {string} action - 後端路由 Action (如 'log', 'append', 'update', 'delete')
   * @param {Object} data - 傳遞給後端的資料數據
   * @param {Object} options - 選項 (如 customSheet, showToast)
   */
  async request(action, data = {}, options = {}) {
    const { showToast = true, loadingMessage = null } = options;

    if (loadingMessage && typeof UI !== 'undefined') {
      UI.showToast(loadingMessage, 'info', 2000);
    }

    const payload = {
      action: action,
      sheetName: options.sheetName || null,
      data: data,
      timestamp: new Date().toISOString()
    };

    try {
      // 關鍵：選用 text/plain;charset=utf-8 避開 CORS preflight OPTIONS 阻擋
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || '後端處理失敗');
      }

      if (showToast && options.successMessage && typeof UI !== 'undefined') {
        UI.showToast(options.successMessage, 'success');
      }

      return result;

    } catch (err) {
      console.error(`[GASClient Error] Action: ${action}`, err);
      if (typeof UI !== 'undefined') {
        UI.showToast(`連線失敗: ${err.message}`, 'danger');
      }
      return { success: false, error: err.message };
    }
  },

  // ----------------------------------------------------
  // 快捷 Helper 函數 (方便前端按鈕與功能直接呼叫)
  // ----------------------------------------------------

  /**
   * 寫入 Log 紀錄 (對應 DB_Logs)
   */
  async log(actionName, details = {}, user = null) {
    const currentUser = user || (typeof AppState !== 'undefined' ? AppState.getVar('currentUser', 'System') : 'System');
    return this.request('log', {
      user: currentUser,
      action: actionName,
      details: details
    }, { showToast: false });
  },

  /**
   * 新增一筆資料 (Append)
   */
  async append(sheetName, rowData, successMsg = '新增資料成功！') {
    return this.request('append', { rowData }, {
      sheetName,
      successMessage: successMsg,
      loadingMessage: '資料寫入中...'
    });
  },

  /**
   * 修改一筆資料 (Update)
   */
  async update(sheetName, targetId, idColIndex, updatedRowData, successMsg = '更新成功！') {
    return this.request('update', { targetId, idColIndex, updatedRowData }, {
      sheetName,
      successMessage: successMsg,
      loadingMessage: '更新中...'
    });
  },

  /**
   * 刪除一筆資料 (Delete)
   */
  async delete(sheetName, targetId, idColIndex, successMsg = '已成功刪除！') {
    return this.request('delete', { targetId, idColIndex }, {
      sheetName,
      successMessage: successMsg,
      loadingMessage: '刪除中...'
    });
  },

  /**
   * 從 GAS 取得最新的 UI Schema 或 Sheet 資料 (GET)
   */
  async fetchSchema(formType = 'default') {
    try {
      const response = await fetch(`${this.baseUrl}?type=${encodeURIComponent(formType)}`);
      return await response.json();
    } catch (err) {
      console.error('[GASClient] 讀取 Schema 失敗:', err);
      return { success: false, error: err.message };
    }
  }
};
