/**
 * 全域變數與動態函數管理中心
 */
const AppState = {
  variables: {},
  functions: {},

  // 1. 存入後端傳回的資料
  init(variables = {}, functions = {}) {
    // 儲存全域變數
    this.variables = { ...this.variables, ...variables };

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
  },

  // 2. 讀取全域變數
  getVar(key, defaultValue = null) {
    return this.variables[key] !== undefined ? this.variables[key] : defaultValue;
  },

  // 3. 設定/更新全域變數
  setVar(key, value) {
    this.variables[key] = value;
  },

  // 4. 呼叫動態函數
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
