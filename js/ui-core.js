/**
 * UI 核心控制與繪製工廠
 */
const UI = {
  // 全域狀態管理
  activeTabs: {},
  refreshIntervalId: null,
  remainingSeconds: 0,
  totalIntervalSeconds: 60,
  lastFetchTimestamp: 0,
  lastUpdatedStr: '',
  onRefreshCallbackName: null,
  visibilityListenersBound: false,

  /**
   * 頁面渲染入口
   */
  render(containerId, schema) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(schema)) return;

    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
    container.innerHTML = '';

    schema.forEach(item => {
      if (item.type === 'tabBlock') {
        const tabsHeader = this.createTabsHeader(item.category, item.tabs);
        if (tabsHeader) container.appendChild(tabsHeader);
      } else {
        const el = this.createComponent(item);
        if (el) container.appendChild(el);
      }
    });

    Object.keys(this.activeTabs).forEach(category => {
      this.filterGroups(category, this.activeTabs[category]);
    });
  },

  /**
   * 屬性綁定輔助函數
   */
  bindTabCategory(element, item) {
    if (item.category) element.dataset.category = item.category;
    if (item.groupId) element.dataset.groupId = item.groupId;
    return element;
  },

  /**
   * 核心元件分流工廠
   */
  createComponent(item) {
    if (!item || !item.type) return null;
    let element = null;

    switch (item.type) {
      // 區塊與容器
      case 'header':      element = this.createHeader(item); break;
      case 'card':        element = this.createCard(item); break;
      case 'cardGroup':   element = this.createCardGroup(item); break;
      case 'form':        element = this.createForm(item); break;

      // 文字與標籤
      case 'title':
      case 'subtitle':
      case 'text':
      case 'quote':       element = this.createTextItem(item); break;
      case 'badge':       element = this.createBadge(item); break;
      case 'badgeGroup':  element = this.createBadgeGroup(item); break;

      // 按鈕
      case 'button':      element = this.createButton(item); break;
      case 'buttonGroup': element = this.createButtonGroup(item); break;

      // 展示與高階模組
      case 'searchBar':    element = this.createSearchBar(item); break;
      case 'kpiGroup':     element = this.createKPIGroup(item); break;
      case 'timeline':     element = this.createTimeline(item); break;
      case 'mediaPreview': element = this.createMediaPreview(item); break;
      case 'refreshTimer': element = this.createRefreshTimer(item); break;
      case 'spacer':       element = this.createSpacer(item); break;
      case 'divider':      element = this.createDivider(item); break;
      case 'actionCard':   element = this.createActionCard(item); break;
      case 'accordion':    element = this.createAccordion(item); break;
      case 'carousel':     element = this.createCarousel(item); break;

      default:
        console.warn(`[UI Engine] 未知元件類型: ${item.type}`);
        return null;
    }

    if (element) {
      this.bindTabCategory(element, item);
    }
    return element;
  }
};
