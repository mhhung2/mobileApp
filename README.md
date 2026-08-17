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
