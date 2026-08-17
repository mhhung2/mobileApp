src/

├── css/

│   ├── base.css            # 1. 全域變數、Reset、容器與基礎元件（Header, Tab, Spacer, Divider）

│   ├── form.css            # 2. 表單 Engine（Control, Select, Switch, File, Button）

│   ├── display.css         # 3. 數據展示（Card, KPI, Timeline, MediaPreview, ActionCard）

│   └── interactive.css     # 4. 高階互動元件（SearchBar, Accordion, Carousel, Modal, Toast, Timer）

└── js/

    ├── ui-core.js          # 核心主引擎（UI 宣告、State 管理、Render 入口、createComponent 工廠）
    
    └── components/
    
        ├── ui-display.js   # 基礎與數據展示模組（Header, Card, Text, Badge, KPI, Timeline, ActionCard）
        
        ├── ui-form.js      # 表單 Engine 模組（createForm、各類 Input 處理、Debounce 防重複提交）
        
        ├── ui-interactive.js # 複合與互動模組（SearchBar, Accordion, Carousel, RefreshTimer, Modal, Toast）
        
        └── ui-tabs.js      # Tab 分頁與 Group 篩選模組
        
