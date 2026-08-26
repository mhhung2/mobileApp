/**
 * UI.Timer - 無 UI 多目標靈活計時器模組
 */
class UITimer {
  constructor(config = {}) {
    // 基礎設定
    this.mode = config.mode || 'countdown'; // 'countdown' (倒數) | 'countup' (計數)
    this.startSeconds = config.startSeconds !== undefined ? config.startSeconds : (this.mode === 'countdown' ? 60 : 0);
    this.endSeconds = config.endSeconds !== undefined ? config.endSeconds : (this.mode === 'countdown' ? 0 : null); // 結束秒數

    // 多目標秒數與 Callback 設定
    // 格式支援：[{ second: 30, callback: fn }, { second: 10, callback: fn }]
    this.targets = Array.isArray(config.targets) ? config.targets : [];
    
    // 相容單一 targetSeconds 舊寫法
    if (config.targetSeconds !== undefined && config.onTarget) {
      this.targets.push({ second: config.targetSeconds, callback: config.onTarget });
    }

    // 全域 回調函數
    this.onTick = config.onTick || null; // 每秒觸發 (seconds, timerInstance)
    this.onEnd = config.onEnd || null;   // 到達結束秒數觸發 (seconds, timerInstance)

    // 內部狀態
    this.currentSeconds = this.startSeconds;
    this.intervalId = null;
    this.lastTimestamp = 0;
    this.isRunning = false;
    
    // 記錄已觸發過的 targets (避免重複觸發)
    this.triggeredTargets = new Set();

    // 視窗切換 / Focus 監聽綁定
    this._handleAppResume = this._handleAppResume.bind(this);
    this._bindVisibilityEvents();

    if (config.autoStart !== false) {
      this.start();
    }
  }

  /**
   * 啟動 / 恢復計時器
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = Date.now();

    // 立即觸發一次 onTick 供外部初始化 UI
    if (typeof this.onTick === 'function') {
      this.onTick(this.currentSeconds, this);
    }

    this.intervalId = setInterval(() => this._tick(), 1000);
  }

  /**
   * 暫停計時器
   */
  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 重置計時器 (Reset)
   * @param {number} [newStartSeconds] 可選：重新指定起始秒數
   */
  reset(newStartSeconds) {
    this.pause();
    if (newStartSeconds !== undefined) {
      this.startSeconds = newStartSeconds;
    }
    this.currentSeconds = this.startSeconds;
    this.triggeredTargets.clear(); // 清空已觸發標記
    this.lastTimestamp = Date.now();

    if (typeof this.onTick === 'function') {
      this.onTick(this.currentSeconds, this);
    }
  }

  /**
   * 核心每秒遞進邏輯
   */
  _tick() {
    if (!this.isRunning) return;

    this.lastTimestamp = Date.now();

    if (this.mode === 'countdown') {
      this.currentSeconds--;
    } else {
      this.currentSeconds++;
    }

    // 1. 觸發每秒 onTick
    if (typeof this.onTick === 'function') {
      this.onTick(this.currentSeconds, this);
    }

    // 2. 檢查所有目標秒數 (Multi-Targets)
    this._checkTargets();

    // 3. 檢查結束秒數 (onEnd)
    if (this.endSeconds !== null) {
      const isEnded = this.mode === 'countdown' 
        ? this.currentSeconds <= this.endSeconds 
        : this.currentSeconds >= this.endSeconds;

      if (isEnded) {
        this.pause();
        if (typeof this.onEnd === 'function') {
          this.onEnd(this.currentSeconds, this);
        }
      }
    }
  }

  /**
   * 比對並觸發 Target Callbacks
   */
  _checkTargets() {
    this.targets.forEach((targetObj, idx) => {
      if (this.triggeredTargets.has(idx)) return; // 觸發過就跳過

      const targetSec = targetObj.second;
      const isHit = this.mode === 'countdown'
        ? this.currentSeconds <= targetSec
        : this.currentSeconds >= targetSec;

      if (isHit) {
        this.triggeredTargets.add(idx); // 標記為已觸發
        if (typeof targetObj.callback === 'function') {
          targetObj.callback(this.currentSeconds, this);
        }
      }
    });
  }

  /**
   * 背景切換 / Focus 返回校正邏輯
   */
  _bindVisibilityEvents() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this._handleAppResume();
    });
    window.addEventListener('focus', this._handleAppResume);
  }

  _handleAppResume() {
    if (!this.isRunning) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastTimestamp) / 1000);
    if (elapsedSeconds <= 0) return;

    // 計算經過時間
    if (this.mode === 'countdown') {
      this.currentSeconds -= elapsedSeconds;
    } else {
      this.currentSeconds += elapsedSeconds;
    }

    this.lastTimestamp = now;

    // 背景返回後，補觸發期間錯過的所有 Target 回調
    this._checkTargets();

    // 檢查是否已達到結束條件
    if (this.endSeconds !== null) {
      const isEnded = this.mode === 'countdown' 
        ? this.currentSeconds <= this.endSeconds 
        : this.currentSeconds >= this.endSeconds;

      if (isEnded) {
        this.currentSeconds = this.endSeconds;
        this.pause();
        if (typeof this.onTick === 'function') this.onTick(this.currentSeconds, this);
        if (typeof this.onEnd === 'function') this.onEnd(this.currentSeconds, this);
        return;
      }
    }

    if (typeof this.onTick === 'function') {
      this.onTick(this.currentSeconds, this);
    }
  }
}

// 註冊到全域 UI
UI.Timer = UITimer;
