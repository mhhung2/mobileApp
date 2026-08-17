/**
 * Tab 導覽與分類過濾模組
 */
Object.assign(UI, {
  createTabsHeader(category, tabs) {
    if (!category || !Array.isArray(tabs) || tabs.length === 0) return null;

    if (!this.activeTabs[category]) {
      this.activeTabs[category] = tabs[0].id || 'all';
    }

    const tabContainer = document.createElement('div');
    tabContainer.className = 'tab-container';
    tabContainer.dataset.tabCategory = category;

    tabs.forEach(tab => {
      const btn = document.createElement('button');
      const isActive = (tab.id === this.activeTabs[category]);
      btn.className = `tab-btn ${isActive ? 'active' : ''}`;
      btn.innerText = tab.label;
      btn.onclick = (e) => this.switchTab(category, tab.id, e.target);
      tabContainer.appendChild(btn);
    });

    return tabContainer;
  },

  switchTab(category, groupId, targetBtn) {
    this.activeTabs[category] = groupId;

    const parentContainer = targetBtn.closest('.tab-container');
    if (parentContainer) {
      const buttons = parentContainer.querySelectorAll('.tab-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      targetBtn.classList.add('active');
    }

    this.filterGroups(category, groupId);
  },

  filterGroups(category, groupId) {
    const categoryElements = document.querySelectorAll(`[data-category="${category}"]`);
    categoryElements.forEach(el => {
      el.style.display = (groupId === 'all' || el.dataset.groupId === groupId) ? '' : 'none';
    });

    const activeSearchInputs = document.querySelectorAll(
      `[data-category="${category}"]:not([style*="display: none"]) .search-input, .search-bar-container:not([data-category]) .search-input`
    );
    activeSearchInputs.forEach(input => input.dispatchEvent(new Event('input')));
  }
});
