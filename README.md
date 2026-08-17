# 🚀 Dynamic UI Framework

[![License: MIT](https://img.shields.org/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.org/badge/Vanilla_JS-ES6+-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.org/badge/CSS3-Flexbox_%26_Grid-blue)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![PRs Welcome](https://img.shields.org/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

一個輕量、無外套套件依賴（Vanilla JS）、專為跨平台與行動端（Mobile-First）設計的 **JSON 驅動動態 UI 渲染引擎**。

只需要從後端（如 Node.js、Google Apps Script 或 REST API）傳遞 JSON 配置，即可快速建構出具備原生手感的現代化 Dashboards、表單與互動介面。

---

## 📌 目錄 (Table of Contents)

- [✨ 核心功能特色](#-核心功能特色)
- [📂 專案架構 (Project Structure)](#-專案架構-project-structure)
- [🚀 快速開始 (Quick Start)](#-快速開始-quick-start)
- [🧩 模組說明與 JSON 配置指南](#-模組說明與-json-配置指南)
  - [1. 頂部標頭 (Header)](#1-頂部標頭-header)
  - [2. 行動引導卡片 (ActionCard)](#2-行動引導卡片-actioncard)
  - [3. 跨平台輪播卡片 (Carousel)](#3-跨平台輪播卡片-carousel)
  - [4. 摺疊手風琴 (Accordion)](#4-摺疊手風琴-accordion)
  - [5. 數據指標組 (KPIGroup)](#5-數據指標組-kpigroup)
  - [6. 動態表單引擎 (Form)](#6-動態表單引擎-form)
- [📢 全域 API (Global APIs)](#-全域-api-global-apis)
- [🛠️ 貢獻指南 (Contributing)](#️-貢獻指南-contributing)
- [📄 授權條款 (License)](#-授權條款-license)

---

## ✨ 核心功能特色

* 🎨 **JSON 聲明式渲染**：無需編寫複雜的 HTML DOM 操作，畫面結構完全由 JSON 決定。
* 📱 **跨平台極致體驗**：
  * **Carousel** 支援電腦端滑鼠拖曳（Mouse Drag）、左右導航鍵與自動輪播（Autoplay）。
  * 針對 **iOS Safari / WebKit** 最佳化平滑滾動與觸控手勢，防止動畫鎖死。
* ⚡ **高效能與安全性**：
  * `SearchBar` 內建 300ms 防抖（Debounce）與中文選字輸入優化。
  * `Form` 提交防重複發送（Debounce & Submitting State）鎖定機制。
  * 全面採用安全 DOM API，防止 XSS 攻擊。
* 🧩 **模組靈活嵌套**：Accordion 或 Carousel 內部可無限混搭 Form、KPI、Timeline、MediaPreview 等子元件。

---

## 📂 專案架構 (Project Structure)

本專案採用**職責分離 (Separation of Concerns)** 設計，方便維護與模組擴充：

```text
src/
├── css/
│   ├── base.css            # 1. 全域變數 (:root)、Reset、Header、Spacer 與 Divider
│   ├── form.css            # 2. 表單控制項、Input、Select、Switch、File 與 Button 樣式
│   ├── display.css         # 3. 數據展示（Card, KPI, Timeline, MediaPreview, ActionCard）
│   └── interactive.css     # 4. 高階互動元件（SearchBar, Accordion, Carousel, Modal, Toast, RefreshTimer）
└── js/
    ├── ui-core.js          # 核心主引擎（UI 全域物件、State 管理、render 入口與工廠分流）
    └── components/
        ├── ui-tabs.js      # Tab 頁籤分類與 Group 動態過濾模組
        ├── ui-display.js   # 基礎與數據展示模組（Card, Text, Badge, KPI, Timeline...）
        ├── ui-form.js      # Form 表單引擎與提交控制模組
        └── ui-interactive.js # 複合互動模組（SearchBar, Accordion, Carousel, Modal, Toast, RefreshTimer）


---

## 🚀 快速開始 (Quick Start)

### 1. 複製儲存庫 (Clone)

```bash
git clone [https://github.com/your-username/dynamic-ui-framework.git](https://github.com/your-username/dynamic-ui-framework.git)
cd dynamic-ui-framework


### 2. 引入 HTML 檔案

依照依賴順序載入 CSS 與 JS 檔案（**`ui-core.js` 必須最先載入**）：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dynamic UI Demo</title>

  <!-- 1. CSS 樣式引入 -->
  <link rel="stylesheet" href="src/css/base.css">
  <link rel="stylesheet" href="src/css/form.css">
  <link rel="stylesheet" href="src/css/display.css">
  <link rel="stylesheet" href="src/css/interactive.css">
</head>
<body>

  <!-- UI 渲染容器 -->
  <div class="mobile-container" id="app"></div>

  <!-- 2. JS 模組引入 (ui-core.js 優先) -->
  <script src="src/js/ui-core.js"></script>
  <script src="src/js/components/ui-tabs.js"></script>
  <script src="src/js/components/ui-display.js"></script>
  <script src="src/js/components/ui-form.js"></script>
  <script src="src/js/components/ui-interactive.js"></script>

  <script>
    // 定義 JSON 結構
    const schema = [
      { type: 'header', title: '勤務巡檢與現場管理', align: 'left' },
      { type: 'actionCard', icon: '🚀', title: '歡迎使用', text: '請完成今日各更次巡檢作業。' }
    ];

    // 初始化渲染
    UI.render('app', schema);
  </script>
</body>
</html>

## 📦 可用 UI 模組與 JSON 配置指南 (完整模組與全參數規格)

---

### 1. 頂部標頭 (Header) `header`
用於頁面或大區塊頂部的標題區。

```json
{
  "type": "header",
  "title": "勤務與現場巡檢管理",
  "subtitle": "今日系統運作狀態正常",
  "badge": "即時更新",
  "badgeVariant": "success",
  "align": "left"
}
```

---

### 2. 卡片 (Card) `card`
通用基礎卡片容器，支援傳統單純圖文或嵌套 `items` 複數 UI 子元件。

```json
{
  "type": "card",
  "title": "基礎卡片標題",
  "content": "這是純文字內容...",
  "category": "team",
  "groupId": "groupA",
  "items": [
    { "type": "badge", "text": "重點", "variant": "danger" },
    { "type": "text", "text": "卡片內部的詳細說明文字。" }
  ]
}
```

---

### 3. 可摺疊卡片組 (Card Group) `cardGroup`
將多張卡片歸類在一起外殼容器，支援點擊 Header 折疊或展開。

```json
{
  "type": "cardGroup",
  "title": "大埔更支援人力管理",
  "collapsed": false,
  "category": "shift",
  "groupId": "taipo",
  "cards": [
    {
      "title": "隊員 A 勤務狀態",
      "items": [{ "type": "text", "text": "已齊集完畢。" }]
    }
  ]
}
```

---

### 4. 跨平台手勢輪播 (Carousel) `carousel`
支援圖片/文字卡片輪播，電腦端滑鼠拖曳、iOS 觸控防鎖定與自動播放。

```json
{
  "type": "carousel",
  "peek": true,
  "autoplay": true,
  "autoplayInterval": 3500,
  "showDots": true,
  "slides": [
    {
      "image": "https://example.com/photo.jpg",
      "caption": "巡檢現場照片"
    },
    {
      "items": [
        { "type": "badge", "text": "重點巡檢", "variant": "danger" },
        { "type": "title", "text": "現場紀錄說明" },
        { "type": "text", "text": "裝備全數確認正常無缺漏。" }
      ]
    }
  ]
}
```

---

### 5. 摺疊手風琴 (Accordion) `accordion`
適用於 FAQ、SOP 步驟或條列式清單，支援動態混搭全 UI 元件。

```json
{
  "type": "accordion",
  "singleExpand": true,
  "openFirst": false,
  "items": [
    {
      "title": "急救箱裝備核對標準",
      "icon": "🚑",
      "badge": "SOP",
      "badgeVariant": "danger",
      "open": true,
      "items": [
        { "type": "title", "text": "耗材清點細則" },
        { "type": "text", "text": "請於每日勤務開更前完成急救箱清點。" },
        { "type": "quote", "variant": "warning", "text": "注意：過期耗材需立即更換。" }
      ]
    }
  ]
}
```

---

### 6. 數據指標組 (KPI Group) `kpiGroup`
網格化關鍵數據展示卡片。

```json
{
  "type": "kpiGroup",
  "cols": 2,
  "items": [
    {
      "label": "火更 HKR 人力",
      "value": "100%",
      "color": "#34c759",
      "statusText": "已齊人",
      "status": "success",
      "change": "+2 人"
    }
  ]
}
```

---

### 7. 時間軸 (Timeline) `timeline`
事件時間軸歷程展示模組。

```json
{
  "type": "timeline",
  "events": [
    {
      "time": "08:30 AM",
      "status": "success",
      "items": [
        { "type": "title", "text": "開更裝備檢查完成" },
        { "type": "text", "text": "人員全數到齊並完成簽到。" }
      ]
    },
    {
      "time": "09:15 AM",
      "status": "warning",
      "badge": "大埔更",
      "badgeVariant": "warning",
      "title": "車輛通訊測試",
      "subtitle": "無線電頻道 #3",
      "text": "訊號正常，電池備用 2 組。"
    }
  ]
}
```

---

### 8. 即時搜尋列 (Search Bar) `searchBar`
內建 300ms 防抖 (Debounce) 與中文選字優化的即時卡片過濾器。

```json
{
  "type": "searchBar",
  "placeholder": "搜尋卡片標題或關鍵字...",
  "targetGroup": "groupA",
  "category": "team"
}
```

---

### 9. 動態表單引擎 (Form) `form`
自動構建表單、防重複提交鎖定，並支援在欄位間插入裝飾 UI。

```json
{
  "type": "form",
  "submitText": "提交表單",
  "showReset": true,
  "resetText": "清除重置",
  "onSubmit": "handleFormSubmit",
  "onReset": "handleFormReset",
  "fields": [
    {
      "type": "select",
      "name": "shiftType",
      "label": "更別選擇",
      "required": true,
      "defaultValue": "hkr",
      "options": [
        { "label": "火更 HKR", "value": "hkr" },
        { "label": "大埔更", "value": "taipo" }
      ]
    },
    {
      "type": "textarea",
      "name": "remark",
      "label": "異常說明",
      "placeholder": "請輸入...",
      "rows": 3,
      "maxLength": 200,
      "required": false
    },
    {
      "type": "radio",
      "name": "checkResult",
      "label": "檢查結果",
      "inline": true,
      "defaultValue": "pass",
      "options": [
        { "label": "合格", "value": "pass" },
        { "label": "需維護", "value": "fail" }
      ]
    },
    {
      "type": "switch",
      "name": "isEmergency",
      "label": "開啟緊急通知",
      "defaultValue": true,
      "value": "true"
    },
    {
      "type": "file",
      "name": "photo",
      "label": "現場照片",
      "accept": "image/*",
      "multiple": false
    },
    {
      "type": "number_text",
      "name": "itemCount",
      "label": "耗材數量",
      "placeholder": "0"
    },
    {
      "type": "text",
      "name": "checkDate",
      "label": "檢查日期",
      "defaultValue": "2026-04-05"
    },
    {
      "type": "hidden",
      "name": "version",
      "defaultValue": "v1.0.2"
    },
    { "type": "spacer", "height": 8 },
    { "type": "divider", "variant": "dashed" },
    { "type": "quote", "variant": "warning", "text": "注意：提交後資料將不可更改。" }
  ]
}
```

---

### 10. 萬用行動卡片 (Action Card) `actionCard`
用於首頁 Hero 區塊、空狀態 (Empty State) 或引導操作。

```json
{
  "type": "actionCard",
  "icon": "🚀",
  "title": "尚未完成今日開更登記",
  "text": "請點擊下方按鈕進行安全簽到與裝備核對。",
  "buttonText": "立即開更簽到",
  "buttonVariant": "primary",
  "onClick": "handleStartShift"
}
```

---

### 11. 基礎文字與標籤 (Text & Badges)

```json
{ "type": "title", "text": "大標題文字" }
{ "type": "subtitle", "text": "副標題說明文字" }
{ "type": "text", "text": "一般內文區塊..." }
{
  "type": "quote",
  "text": "重點提示文字...",
  "variant": "info"
}
{ "type": "badge", "text": "進行中", "variant": "primary" }
{
  "type": "badgeGroup",
  "align": "left",
  "badges": [
    { "text": "火更 HKR", "variant": "primary" },
    { "text": "已齊人", "variant": "success" },
    { "text": "重要 SOP", "variant": "danger" }
  ]
}
```

---

### 12. 按鈕 (Button) 與 按鈕組 (ButtonGroup)

```json
{
  "type": "button",
  "text": "提交審核",
  "variant": "primary",
  "disabled": false,
  "onClick": "handleSubmit"
}
{
  "type": "buttonGroup",
  "align": "right",
  "buttons": [
    { "text": "取消", "variant": "secondary", "onClick": "handleCancel" },
    { "text": "確認儲存", "variant": "primary", "onClick": "handleSave" }
  ]
}
```

---

### 13. 媒體預覽 (Media Preview) `mediaPreview`

```json
{
  "type": "mediaPreview",
  "src": "https://example.com/image.jpg",
  "caption": "急救箱耗材標準擺放照片"
}
```

---

### 14. 自動倒數刷新定時器 (Refresh Timer) `refreshTimer`

```json
{
  "type": "refreshTimer",
  "intervalSeconds": 60,
  "buttonText": "立即更新",
  "onRefresh": "loadDashboardData"
}
```

---

### 15. 間距與分隔線 (Spacer & Divider)

```json
{
  "type": "spacer",
  "height": 16,
  "width": 12,
  "inline": false
}
{
  "type": "divider",
  "variant": "solid",
  "color": "#e5e5ea",
  "margin": 12
}
```

---

## 📢 全域控制 API (Global JS Methods)

```javascript
UI.showModal({
  title: '確認提交紀錄',
  message: '確定要提交目前的巡檢數據嗎？',
  isConfirm: true,
  position: 'center',
  confirmText: '確認提交',
  confirmVariant: 'primary',
  cancelText: '取消',
  onConfirm: () => {
    UI.showToast('提交成功！', 'success');
  }
});

UI.closeModal();
UI.showToast('資料已順利同步至伺服器', 'success', 3000);
UI.showLoading(true, '數據讀取中...');
UI.showLoading(false);
```
