# 🚀 Dynamic UI Framework

一個輕量、無第三方套件依賴（Vanilla JS）、專為跨平台與行動端（Mobile-First）設計的 JSON 驅動動態 UI 渲染引擎。

只需要從後端（如 Node.js、Google Apps Script 或 REST API）傳遞 JSON 配置，即可快速建構出具備原生手感的現代化 Dashboards、動態表單與互動介面。

---

## 📌 目錄 (Table of Contents)

* ✨ 核心功能特色
* 🚀 快速開始 (Quick Start)
* 📦 可用 UI 模組與 JSON 配置指南
* 1. 頂部標頭 (Header)


* 2. 卡片 (Card)


* 3. 可摺疊卡片組 (Card Group)


* 4. 跨平台手勢輪播 (Carousel)


* 5. 摺疊手風琴 (Accordion)


* 6. 數據指標組 (KPI Group)


* 7. 時間軸 (Timeline)


* 8. 即時搜尋列 (Search Bar)


* 9. 動態表單引擎 (Form)


* 10. 萬用行動卡片 (Action Card)


* 11. 基礎文字與標籤 (Text & Badges)


* 12. 按鈕與按鈕組 (Button & ButtonGroup)


* 13. 媒體預覽 (Media Preview)


* 14. 自動倒數刷新定時器 (Refresh Timer)


* 15. 間距與分隔線 (Spacer & Divider)




* 📢 全域控制 API (Global JS Methods)
* 📄 授權條款 (License)

---

## ✨ 核心功能特色

* 🎨 **JSON 聲明式渲染**：無需編寫複雜的 HTML DOM 操作，畫面結構完全由 JSON 決定。
* 📱 **跨平台極致體驗**：
* Carousel 支援電腦端滑鼠拖曳（Mouse Drag）、左右導航鍵與自動輪播（Autoplay）。
* 針對 iOS Safari / WebKit 最佳化平滑滾動與觸控手勢，防止動畫鎖死。


* ⚡ **高效能與安全性**：
* SearchBar 內建 300ms 防抖（Debounce）與中文選字輸入優化。
* Form 提交防重複發送（Debounce & Submitting State）鎖定機制。
* 全面採用安全 DOM API，防止 XSS 攻擊。


* 🧩 **模組靈活嵌套**：Accordion 或 Carousel 內部可無限混搭 Form、KPI、Timeline、MediaPreview 等子元件。

---

## 🚀 快速開始 (Quick Start)

將以下範例儲存為 index.html，並確保引用的 CSS 與 JS 模組路徑正確：

---

## 📦 可用 UI 模組與 JSON 配置指南

### 1. 頂部標頭 (Header) header

用於頁面或大區塊頂部的標題區。

配置範例：
{
"type": "header",
"title": "勤務與現場巡檢管理",
"subtitle": "今日系統運作狀態正常",
"badge": "即時更新",
"badgeVariant": "success",
"align": "left"
}

---

### 2. 卡片 (Card) card

通用基礎卡片容器，支援傳統單純圖文或嵌套 items 複數 UI 子元件。

配置範例：
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

---

### 3. 可摺疊卡片組 (Card Group) cardGroup

將多張卡片歸類在一起外殼容器，支援點擊 Header 折疊或展開。

配置範例：
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

---

### 4. 跨平台手勢輪播 (Carousel) carousel

支援圖片/文字卡片輪播，電腦端滑鼠拖曳、iOS 觸控防鎖定與自動播放。

配置範例：
{
"type": "carousel",
"peek": true,
"autoplay": true,
"autoplayInterval": 3500,
"showDots": true,
"slides": [
{
"image": "[https://example.com/photo.jpg](https://www.google.com/search?q=https://example.com/photo.jpg)",
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

---

### 5. 摺疊手風琴 (Accordion) accordion

適用於 FAQ、SOP 步驟或條列式清單，支援動態混搭全 UI 元件。

配置範例：
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

---

### 6. 數據指標組 (KPI Group) kpiGroup

網格化關鍵數據展示卡片。

配置範例：
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

---

### 7. 時間軸 (Timeline) timeline

事件時間軸歷程展示模組。

配置範例：
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

---

### 8. 即時搜尋列 (Search Bar) searchBar

內建 300ms 防抖 (Debounce) 與中文選字優化的即時卡片過濾器。

配置範例：
{
"type": "searchBar",
"placeholder": "搜尋卡片標題或關鍵字...",
"targetGroup": "groupA",
"category": "team"
}

---

### 9. 動態表單引擎 (Form) form

自動構建表單、防重複提交鎖定，並支援在欄位間插入裝飾 UI。

配置範例：
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

---

### 10. 萬用行動卡片 (Action Card) actionCard

用於首頁 Hero 區塊、空狀態 (Empty State) 或引導操作。

配置範例：
{
"type": "actionCard",
"icon": "🚀",
"title": "尚未完成今日開更登記",
"text": "請點擊下方按鈕進行安全簽到與裝備核對。",
"buttonText": "立即開更簽到",
"buttonVariant": "primary",
"onClick": "handleStartShift"
}

---

### 11. 基礎文字與標籤 (Text & Badges)

配置範例：
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

---

### 12. 按鈕 (Button) 與 按鈕組 (ButtonGroup)

配置範例：
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

---

### 13. 媒體預覽 (Media Preview) mediaPreview

配置範例：
{
"type": "mediaPreview",
"src": "[https://example.com/image.jpg](https://www.google.com/search?q=https://example.com/image.jpg)",
"caption": "急救箱耗材標準擺放照片"
}

---

### 14. 自動倒數刷新定時器 (Refresh Timer) refreshTimer

配置範例：
{
"type": "refreshTimer",
"intervalSeconds": 60,
"buttonText": "立即更新",
"onRefresh": "loadDashboardData"
}

---

### 15. 間距與分隔線 (Spacer & Divider)

配置範例：
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

---

## 📢 全域控制 API (Global JS Methods)

除了 JSON 聲明式渲染外，可透過 JavaScript 全域物件 UI 觸發動態互動：

JS 呼叫範例：
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

---

## 📄 授權條款 (License)

本專案基於 MIT License 授權釋出，可自由商用、修改與分發。
