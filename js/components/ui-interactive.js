/**
 * 互動模組（SearchBar, Accordion, Carousel, Timer, Modal, Toast）
 */
Object.assign(UI, {
  createSearchBar(item) {
    const container = document.createElement('div');
    container.className = 'search-bar-container';

    if (item.category) container.dataset.category = item.category;
    if (item.groupId) container.dataset.groupId = item.groupId;

    const wrapper = document.createElement('div');
    wrapper.className = 'search-input-wrapper';
    wrapper.innerHTML = `
      <svg class="search-icon" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'search-input';
    input.placeholder = item.placeholder || '搜尋卡片與內文...';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'search-clear-btn';
    clearBtn.innerText = '✕';

    wrapper.appendChild(input);
    wrapper.appendChild(clearBtn);
    container.appendChild(wrapper);

    let debounceTimer = null;

    const filterCards = () => {
      const rawQuery = input.value.trim().toLowerCase();
      clearBtn.style.display = rawQuery ? 'block' : 'none';

      let scopeContainer = item.targetGroup 
        ? document.querySelector(`[data-group-id="${item.targetGroup}"]`)
        : (container.closest('[data-category]') || document);

      if (!scopeContainer) return;

      const cards = scopeContainer.querySelectorAll('.app-card, .kpi-card, .ui-grid-row');
      cards.forEach(card => {
        const categoryGroup = card.closest('[data-category]');
        if (categoryGroup && categoryGroup.style.display === 'none') {
          card.classList.add('search-hidden');
          return;
        }

        if (!rawQuery) {
          card.classList.remove('search-hidden');
          return;
        }

        const textContent = (card.innerText || card.textContent || '').replace(/\s+/g, ' ').toLowerCase();
        card.classList.toggle('search-hidden', !textContent.includes(rawQuery));
      });

      const cardGroups = scopeContainer.querySelectorAll('.card-group');
      cardGroups.forEach(group => {
        const categoryGroup = group.closest('[data-category]');
        if (categoryGroup && categoryGroup.style.display === 'none') {
          group.classList.add('search-hidden');
          return;
        }

        if (!rawQuery) {
          group.classList.remove('search-hidden');
        } else {
          const visibleChildren = group.querySelectorAll('.app-card:not(.search-hidden), .kpi-card:not(.search-hidden)');
          group.classList.toggle('search-hidden', visibleChildren.length === 0);
        }
      });

      // 自動檢查並隱藏內部所有子項目皆已隱藏的 gridRow
      const gridRows = scopeContainer.querySelectorAll('.ui-grid-row');
      gridRows.forEach(row => {
        const categoryGroup = row.closest('[data-category]');
        if (categoryGroup && categoryGroup.style.display === 'none') {
          row.classList.add('search-hidden');
          return;
        }
      
        if (!rawQuery) {
          row.classList.remove('search-hidden');
        } else {
          // 檢查 gridRow 內是否還有可見的元素
          const visibleChildren = row.querySelectorAll('.app-card:not(.search-hidden), .kpi-card:not(.search-hidden), .item-text:not(.search-hidden)');
          row.classList.toggle('search-hidden', visibleChildren.length === 0);
        }
      });
    };

    const debouncedFilter = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterCards, 300);
    };

    input.addEventListener('input', debouncedFilter);
    input.addEventListener('compositionend', filterCards);

    clearBtn.addEventListener('click', () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      input.value = '';
      filterCards();
      input.focus();
    });

    return container;
  },

  createActionCard(item) {
    const container = document.createElement('div');
    container.className = 'action-card-container';

    if (item.icon) {
      const iconEl = document.createElement('div');
      iconEl.className = 'action-card-icon';
      iconEl.innerText = item.icon;
      container.appendChild(iconEl);
    }

    const titleEl = document.createElement('div');
    titleEl.className = 'action-card-title';
    titleEl.innerText = item.title || '';
    container.appendChild(titleEl);

    if (item.text) {
      const textEl = document.createElement('div');
      textEl.className = 'action-card-text';
      textEl.innerText = item.text;
      container.appendChild(textEl);
    }

    if (item.buttonText) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-inline btn-${item.buttonVariant || 'primary'}`;
      btn.innerText = item.buttonText;
      if (item.onClick && typeof window[item.onClick] === 'function') {
        btn.onclick = window[item.onClick];
      }
      container.appendChild(btn);
    }
    return container;
  },

  createAccordion(item) {
    const container = document.createElement('div');
    container.className = 'app-accordion';

    if (Array.isArray(item.items)) {
      item.items.forEach((acc, index) => {
        const itemEl = document.createElement('div');
        const isOpen = acc.open || (item.openFirst && index === 0);
        itemEl.className = `accordion-item ${isOpen ? 'active' : ''}`;

        const headerEl = document.createElement('div');
        headerEl.className = 'accordion-header';
        
        let iconHTML = acc.icon ? `<span class="accordion-title-icon" style="margin-right:8px;">${acc.icon}</span>` : '';
        let badgeHTML = acc.badge ? `<span class="item-badge badge-${acc.badgeVariant || 'info'}" style="margin-left:8px;margin-bottom:0;">${acc.badge}</span>` : '';

        headerEl.innerHTML = `
          <div style="display:flex;align-items:center;">
            ${iconHTML}
            <span>${acc.title || ''}</span>
            ${badgeHTML}
          </div>
          <span class="accordion-icon">▼</span>
        `;

        const bodyEl = document.createElement('div');
        bodyEl.className = 'accordion-body';

        if (Array.isArray(acc.items)) {
          acc.items.forEach(child => {
            const childEl = this.createComponent(child);
            if (childEl) bodyEl.appendChild(childEl);
          });
        } else {
          if (acc.media || acc.src) {
            bodyEl.appendChild(this.createMediaPreview({
              type: 'mediaPreview',
              src: acc.media || acc.src,
              caption: acc.mediaCaption || acc.caption
            }));
          }
          if (acc.content || acc.text) {
            const textEl = document.createElement('div');
            textEl.className = 'item-text';
            textEl.innerText = acc.content || acc.text;
            bodyEl.appendChild(textEl);
          }
        }

        headerEl.onclick = () => {
          if (item.singleExpand && !itemEl.classList.contains('active')) {
            container.querySelectorAll('.accordion-item').forEach(sib => sib.classList.remove('active'));
          }
          itemEl.classList.toggle('active');
        };

        itemEl.appendChild(headerEl);
        itemEl.appendChild(bodyEl);
        container.appendChild(itemEl);
      });
    }
    return container;
  },

  createCarousel(item) {
    const container = document.createElement('div');
    container.className = `app-carousel-container ${item.peek ? 'peek' : ''}`;

    const track = document.createElement('div');
    track.className = 'carousel-track';

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'carousel-nav-btn prev';
    prevBtn.innerHTML = '❮';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'carousel-nav-btn next';
    nextBtn.innerHTML = '❯';

    const slidesData = item.slides || item.items || [];

    if (Array.isArray(slidesData) && slidesData.length > 0) {
      slidesData.forEach((slideData, idx) => {
        const slideEl = document.createElement('div');
        slideEl.className = 'carousel-slide';

        const contentEl = document.createElement('div');
        contentEl.className = 'carousel-slide-content';

        if (slideData.image || slideData.src) {
          contentEl.appendChild(this.createMediaPreview({
            type: 'mediaPreview',
            src: slideData.image || slideData.src,
            caption: slideData.caption || slideData.title
          }));
        } else {
          const textBody = document.createElement('div');
          textBody.className = 'carousel-text-body';

          if (Array.isArray(slideData.items)) {
            slideData.items.forEach(child => {
              if (child.type === 'mediaPreview') {
                contentEl.appendChild(this.createMediaPreview(child));
              } else {
                const childEl = this.createComponent(child);
                if (childEl) textBody.appendChild(childEl);
              }
            });
          } else {
            if (slideData.title) {
              const titleEl = document.createElement('div');
              titleEl.className = 'item-title';
              titleEl.innerText = slideData.title;
              textBody.appendChild(titleEl);
            }
            if (slideData.text || slideData.content) {
              const textEl = document.createElement('div');
              textEl.className = 'item-text';
              textEl.innerText = slideData.text || slideData.content;
              textBody.appendChild(textEl);
            }
          }

          if (textBody.hasChildNodes()) {
            contentEl.appendChild(textBody);
          }
        }

        slideEl.appendChild(contentEl);
        track.appendChild(slideEl);

        const dot = document.createElement('div');
        dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.onclick = () => {
          const slideWidth = slideEl.clientWidth || (track.clientWidth * (item.peek ? 0.85 : 1));
          scrollToPosition(idx * (slideWidth + 12));
        };
        dotsContainer.appendChild(dot);
      });

      track.addEventListener('scroll', () => {
        const firstChild = track.firstElementChild;
        if (!firstChild) return;
        const slideWidth = firstChild.clientWidth + 12;
        const activeIndex = Math.round(track.scrollLeft / slideWidth);
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
      }, { passive: true });

      let isMouseDown = false;
      let startX, scrollLeft;

      track.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        track.style.scrollSnapType = 'none';
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
      });

      const stopDrag = () => {
        if (!isMouseDown) return;
        isMouseDown = false;
        track.style.scrollSnapType = 'x mandatory';
      };

      track.addEventListener('mouseleave', stopDrag);
      track.addEventListener('mouseup', stopDrag);

      track.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        track.scrollLeft = scrollLeft - (x - startX) * 1.5;
      });

      const scrollToPosition = (targetLeft) => {
        track.style.scrollSnapType = 'none';
        track.scrollTo({ left: targetLeft, behavior: 'smooth' });
        setTimeout(() => {
          track.style.scrollSnapType = 'x mandatory';
        }, 400);
      };

      const scrollNext = () => {
        const firstChild = track.firstElementChild;
        if (!firstChild) return;
        const slideWidth = firstChild.clientWidth + 12;
        const maxScrollLeft = track.scrollWidth - track.clientWidth;

        if (track.scrollLeft >= maxScrollLeft - 15) {
          scrollToPosition(0);
        } else {
          scrollToPosition(track.scrollLeft + slideWidth);
        }
      };

      const scrollPrev = () => {
        const firstChild = track.firstElementChild;
        if (!firstChild) return;
        const slideWidth = firstChild.clientWidth + 12;

        if (track.scrollLeft <= 15) {
          scrollToPosition(track.scrollWidth);
        } else {
          scrollToPosition(track.scrollLeft - slideWidth);
        }
      };

      prevBtn.onclick = scrollPrev;
      nextBtn.onclick = scrollNext;

      const isAutoplay = item.autoplay === true || item.autoPlay === true;
      if (isAutoplay && slidesData.length > 1) {
        let autoplayTimer = null;
        const intervalTime = item.autoplayInterval || item.interval || 3500;

        const startAutoplay = () => {
          stopAutoplay();
          autoplayTimer = setInterval(scrollNext, intervalTime);
        };

        const stopAutoplay = () => {
          if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
          }
        };

        startAutoplay();

        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);

        let userInteractTimeout = null;
        track.addEventListener('touchstart', () => {
          stopAutoplay();
          if (userInteractTimeout) clearTimeout(userInteractTimeout);
        }, { passive: true });

        track.addEventListener('touchend', () => {
          if (userInteractTimeout) clearTimeout(userInteractTimeout);
          userInteractTimeout = setTimeout(startAutoplay, 2000);
        }, { passive: true });
      }
    }

    container.appendChild(track);
    if (slidesData.length > 1) {
      container.appendChild(prevBtn);
      container.appendChild(nextBtn);
      if (item.showDots !== false) container.appendChild(dotsContainer);
    }

    return container;
  },

  createRefreshTimer(item) {
    this.totalIntervalSeconds = item.intervalSeconds || 60;
    this.remainingSeconds = this.totalIntervalSeconds;
    this.onRefreshCallbackName = item.onRefresh;

    if (!this.lastFetchTimestamp) {
      this.lastFetchTimestamp = Date.now();
      const now = new Date();
      this.lastUpdatedStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    const container = document.createElement('div');
    container.className = 'refresh-timer-container';
    container.innerHTML = `
      <span class="refresh-last-updated" id="timer-last-updated">上次更新：${this.lastUpdatedStr}</span>
      <div class="refresh-timer-right">
        <span class="refresh-seconds-text" id="timer-seconds-display">${this.remainingSeconds} 秒後自動更新</span>
        <button type="button" class="refresh-action-btn" id="timer-refresh-btn">
          <svg class="refresh-icon" viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          <span>${item.buttonText || '立即更新'}</span>
        </button>
      </div>
    `;

    const secondsDisplay = container.querySelector('#timer-seconds-display');
    const refreshBtn = container.querySelector('#timer-refresh-btn');
    const refreshIcon = container.querySelector('.refresh-icon');

    this.startCountdownTimer(secondsDisplay, refreshIcon);
    this.bindVisibilityAndFocusEvents(secondsDisplay, refreshIcon);

    refreshBtn.onclick = () => {
      if (this.refreshIntervalId) {
        clearInterval(this.refreshIntervalId);
        this.refreshIntervalId = null;
      }
      this.triggerRefresh(refreshIcon);
    };

    return container;
  },

  startCountdownTimer(secondsDisplay, refreshIcon) {
    if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);

    this.refreshIntervalId = setInterval(() => {
      this.remainingSeconds--;
      const currentSecondsEl = document.getElementById('timer-seconds-display');
      if (currentSecondsEl) {
        currentSecondsEl.innerText = `${this.remainingSeconds} 秒後自動更新`;
      }

      if (this.remainingSeconds <= 0) {
        clearInterval(this.refreshIntervalId);
        this.refreshIntervalId = null;
        this.triggerRefresh(refreshIcon);
      }
    }, 1000);
  },

  bindVisibilityAndFocusEvents(secondsDisplay, refreshIcon) {
    if (this.visibilityListenersBound) return;
    this.visibilityListenersBound = true;

    const handleAppResume = () => {
      if (document.hidden) return;
      const elapsedSeconds = Math.floor((Date.now() - this.lastFetchTimestamp) / 1000);

      if (elapsedSeconds >= this.totalIntervalSeconds) {
        if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);
        this.triggerRefresh(refreshIcon);
      } else {
        this.remainingSeconds = this.totalIntervalSeconds - elapsedSeconds;
        const currentSecondsEl = document.getElementById('timer-seconds-display');
        if (currentSecondsEl) {
          currentSecondsEl.innerText = `${this.remainingSeconds} 秒後自動更新`;
        }
      }
    };

    document.addEventListener('visibilitychange', () => { if (!document.hidden) handleAppResume(); });
    window.addEventListener('focus', handleAppResume);
  },

  triggerRefresh(iconEl) {
    if (iconEl) iconEl.classList.add('spinning');
    this.remainingSeconds = this.totalIntervalSeconds;
    this.lastFetchTimestamp = Date.now();
    const now = new Date();
    this.lastUpdatedStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const lastUpdatedEl = document.getElementById('timer-last-updated');
    if (lastUpdatedEl) lastUpdatedEl.innerText = `上次更新：${this.lastUpdatedStr}`;

    const currentSecondsEl = document.getElementById('timer-seconds-display');
    if (currentSecondsEl) currentSecondsEl.innerText = `${this.remainingSeconds} 秒後自動更新`;

    this.startCountdownTimer(currentSecondsEl, iconEl);

    if (typeof loadForm === 'function') {
      loadForm(true);
    }
  },

  showModal(config = {}) {
    let overlay = document.getElementById('app-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'app-modal-overlay';
      document.body.appendChild(overlay);
    }

    const isConfirm = config.isConfirm || false;
    const position = config.position || (isConfirm ? 'center' : 'bottom');
    const isCenter = position === 'center';

    overlay.className = `modal-overlay ${isCenter ? 'center' : ''}`;

    const container = document.createElement('div');
    container.className = 'modal-container';

    const handleHTML = !isCenter ? `<div class="modal-handle"></div>` : '';
    const showCloseBtn = config.showClose !== false;

    container.innerHTML = `
      ${handleHTML}
      <div class="modal-header">
        <div class="modal-title">${config.title || (isConfirm ? '確認提示' : '')}</div>
        ${showCloseBtn ? `<button class="modal-close-btn" id="modal-close-x">✕</button>` : ''}
      </div>
      <div class="modal-body" id="modal-body-content">
        ${config.message ? `<div class="item-text" style="margin-bottom:12px;">${config.message}</div>` : ''}
      </div>
      <div class="modal-footer" id="modal-footer-content"></div>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(container);

    const bodyContent = container.querySelector('#modal-body-content');
    if (Array.isArray(config.items)) {
      config.items.forEach(item => {
        const el = this.createComponent(item);
        if (el) bodyContent.appendChild(el);
      });
    }

    const footerContent = container.querySelector('#modal-footer-content');
    if (isConfirm || config.confirmText || config.cancelText) {
      const btnGroup = document.createElement('div');
      btnGroup.className = `btn-group align-${config.btnAlign || (isCenter ? 'center' : 'right')}`;
      btnGroup.style.marginTop = '16px';

      if (config.cancelText !== false) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = `btn btn-inline btn-${config.cancelVariant || 'secondary'}`;
        cancelBtn.innerText = config.cancelText || '取消';
        cancelBtn.onclick = () => {
          this.closeModal();
          if (typeof config.onCancel === 'function') config.onCancel();
          if (typeof window[config.onCancel] === 'function') window[config.onCancel]();
        };
        btnGroup.appendChild(cancelBtn);
      }

      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = `btn btn-inline btn-${config.confirmVariant || 'primary'}`;
      confirmBtn.innerText = config.confirmText || '確認';
      confirmBtn.onclick = () => {
        this.closeModal();
        if (typeof config.onConfirm === 'function') config.onConfirm();
        if (typeof window[config.onConfirm] === 'function') window[config.onConfirm]();
      };
      btnGroup.appendChild(confirmBtn);
      footerContent.appendChild(btnGroup);
    }

    const xBtn = container.querySelector('#modal-close-x');
    if (xBtn) {
      xBtn.onclick = () => {
        this.closeModal();
        if (typeof config.onCancel === 'function') config.onCancel();
      };
    }

    overlay.onclick = (e) => {
      if (e.target === overlay && config.allowBackdropClose !== false) {
        this.closeModal();
        if (typeof config.onCancel === 'function') config.onCancel();
      }
    };

    requestAnimationFrame(() => overlay.classList.add('active'));
  },

  closeModal() {
    const overlay = document.getElementById('app-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  showToast(message, variant = 'info', duration = 3000) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      document.body.appendChild(toast);
    }

    toast.className = `toast-container toast-${variant} active`;
    toast.innerHTML = `<div class="toast-content"><span>${message}</span></div>`;

    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  },

  showLoading(show, message = '載入中...') {
    let loader = document.getElementById('app-loader');
    if (show) {
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.className = 'loading-overlay';
        document.body.appendChild(loader);
      }
      loader.innerText = message;
    } else if (loader) {
      loader.remove();
    }
  }
});
