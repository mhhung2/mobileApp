/**
 * 全域變數與動態函數管理中心
 */
const AppState = {
  variables: {},
  functions: {},

  // 初始化及存入後端傳回的資料
  init(variables = {}, functions = {}) {

    this.variables = {...variables};
    this.initAuth();

    //清理上一頁掛載在 window 上的動態函數，防止舊頁面 onLoaded 殘留
    Object.keys(this.functions).forEach(fnName => {
      if (window[fnName] === this.functions[fnName]) {
        delete window[fnName]; // 從全域 window 中移除舊函數
      }
    });

    this.functions = {};

    // 註冊與解析動態函數 (將 JSON 中的 function 程式碼字串轉為可呼叫的函數)
    Object.keys(functions).forEach(fnName => {
      try {
        const fnCode = functions[fnName];
        
        // 透過 Function 建構子安全建立全域函數，並同時掛載到 window[fnName]
        const compiledFn = new Function('data', 'e', fnCode);
        this.functions[fnName] = compiledFn;
        window[fnName] = compiledFn;
      } catch (err) {
        console.error(`[AppState] 解析動態函數 ${fnName} 失敗:`, err);
      }
    });

    // 若 Schema 包含 onLoaded 動態函數，則在渲染完成前/後自動即時執行！
    if (typeof this.functions['onLoaded'] === 'function') {
      try {
        // 傳入當前的 AppState 變數供 onLoaded 呼叫使用
        this.functions['onLoaded'](this.variables);
      } catch (err) {
        console.error('[AppState] 執行 onLoaded 發生錯誤:', err);
      }
    }
  },

  // 初始化 User 身分與 Session
  initAuth() {
    this.variables.app = localStorage.getItem('app') || null;
    this.variables.userID = localStorage.getItem('userID') || null;
    this.variables.userName = localStorage.getItem('userName') || null;
    this.variables.userRole = localStorage.getItem('userRole') || null;
    this.variables.sessionKey = localStorage.getItem('sessionKey') || null;
  },

  // 登入時同步更新 AppState 與 localStorage
  setAuth(app, userID, userName, userRole, sessionKey) {
    this.variables.app = app;
    this.variables.userID = userID;
    this.variables.userName = userName;
    this.variables.userRole = userRole;
    this.variables.sessionKey = sessionKey;
    localStorage.setItem('app', app);
    localStorage.setItem('userID', userID);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('sessionKey', sessionKey);
  },

  // 登出時一併清空
  clearAuth() {
    this.variables.userID = null;
    this.variables.userName = null;
    this.variables.userRole = null;
    this.variables.sessionKey = null;

    localStorage.removeItem('userID');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sessionKey');
  },

  getApp()        {return this.variables.app || localStorage.getItem('app');},
  getSessionKey() {return this.variables.sessionKey || localStorage.getItem('sessionKey');},
  getUserID()     {return this.variables.userID || localStorage.getItem('userID');},
  getUserName()   {return this.variables.userName || localStorage.getItem('userName');},
  getUserRole()   {return this.variables.userRole || localStorage.getItem('userRole');},
  getVar(key, defaultValue = null) {
    return this.variables[key] !== undefined ? this.variables[key] : defaultValue;
  },

  //設定/更新全域變數
  setVar(key, value) {
    this.variables[key] = value;
  },

  // 呼叫動態函數
  callFunc(fnName, ...args) {
    if (typeof this.functions[fnName] === 'function') {
      return this.functions[fnName](...args);
    } else if (typeof window[fnName] === 'function') {
      return window[fnName](...args);
    } else {
      console.warn(`[AppState] 找不到動態函數: ${fnName}`);
    }
  }
};
