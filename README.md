# 🏭 Fabric Inspection PWA2

一個基於 **Quasar PWA + SQL Server** 的現代化驗布系統，專為工業環境設計，支援離線作業和即時資料同步。

![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)
![Quasar](https://img.shields.io/badge/Quasar-2.x-1976D2?style=flat&logo=quasar)
![SQL Server](https://img.shields.io/badge/SQL_Server-Microsoft-CC2927?style=flat&logo=microsoft-sql-server)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa)

## ✨ 功能特色

### 🏭 布捲管理
- 條碼掃描/手動輸入搜尋布捲
- 布捲基本資訊顯示（BL#、PO#、Style、Color、Lot、Roll#等）
- 長度資訊管理（Total、Need Inspect、Pass Condition、Inspected）
- 布捲狀態追蹤（pending、inspecting、completed）
- AVG POINT 自動計算

### 🔍 檢驗作業
- **Spec Check**: 規格檢查（重量、長度、寬度、濕度、斜度等）
- **Quality Check**: 品質檢查（外觀、手感、顏色、包裝等）
- **Defect Record**: 缺陷記錄（支援多語言缺陷代碼）
- 數字鍵盤快速輸入（支援平板觸控）
- 即時計算差異百分比

### PWA 功能
- 離線作業支援
- 資料本地快取（IndexedDB）
- 自動同步機制
- 安裝到桌面
- 推播通知支援

### 🔄 同步機制
- 離線資料佇列（Outbox）
- 網路恢復自動同步
- 衝突解決（Server-wins）
- 雙向同步（Push/Pull）

## 🏗️ 技術架構

### 🎯 前端技術棧
- **Quasar Framework**: Vue 3 + TypeScript + Vite
- **IndexedDB**: 離線資料儲存（使用 Dexie.js）
- **Service Worker**: 離線快取和背景同步
- **Workbox**: PWA 工具庫
- **Tailwind CSS**: 快速樣式開發

### 🗄️ 後端技術棧
- **Node.js Express**: RESTful API 伺服器
- **SQL Server**: 企業級資料庫
- **mssql**: SQL Server 連接驅動
- **CORS**: 跨域請求支援

### 🔄 分離式架構
- ✅ **前後端完全分離**，可獨立部署
- ✅ **離線優先設計**，適合工廠環境
- ✅ **自動同步機制**，確保數據一致性
- ✅ **PWA 特性**，接近原生 App 體驗

## 🗃️ 資料庫結構

### 📊 SQL Server 資料表
- **`rolls`**: 布捲基本資訊（條碼、BL#、PO#、規格等）
- **`inspections`**: 檢驗記錄（規格檢查、品質檢查）
- **`defects`**: 缺陷記錄（缺陷代碼、位置、等級）
- **`defect_codes`**: 缺陷代碼（支援中英柬三語）
- **`sync_logs`**: 同步記錄

### 💾 IndexedDB 離線儲存
- **`outbox`**: 待同步資料佇列
- **本地快取**: 所有主要資料表的本地副本
- **同步狀態**: `_dirty` 標記追蹤變更

## 🚀 快速開始

### 📋 環境需求
- **Node.js**: 18+ (建議使用 20.x LTS)
- **npm**: 6.13.4+ 或 **yarn**: 1.21.1+
- **SQL Server**: 遠端資料庫連線

### ⚡ 安裝與啟動

1. **安裝前端依賴**
```bash
npm install
```

2. **後端啟動**
```bash
cd backend
npm install
```

3. **配置環境變數**
建立 `backend/.env`：
```env
PORT=***
DB_SERVER=your-sql-server-ip
DB_PORT=your-sql-server-port
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
DB_ENCRYPT=false
DB_TRUST_CERT=true
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080
```

建立 `.env`（根目錄）：
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

4. **啟動後端伺服器**
```bash
cd backend
node server.js
```

5. **啟動前端 PWA**
```bash
npx quasar dev -m pwa
```



## 📖 使用流程

### 1️⃣ 布捲清單頁面
1. 📱 輸入或掃描條碼搜尋布捲
2. 📋 查看布捲基本資訊和長度資訊
3. ▶️ 點擊 "Roll Start" 開始檢驗

### 2️⃣ 檢驗作業頁面
1. **📏 Spec Check**: 輸入標準值和實測值
2. **✅ Quality Check**: 選擇各項品質檢查結果
3. **❌ Defect Record**: 記錄發現的缺陷
4. 💾 點擊 "Save" 儲存或 "Roll Finish" 完成檢驗

### 3️⃣ 離線作業
- 💾 系統會自動快取資料到本地
- 🌐 離線時可正常進行檢驗作業
- 🔄 網路恢復後自動同步資料

## ⚙️ 配置說明

### 🔐 SQL Server 設定
在 `backend/.env` 中配置資料庫連線：
```env
DB_SERVER=*******
DB_PORT=*******
DB_DATABASE=*******
DB_USER=*******
DB_PASSWORD=*******

```

**最簡單的啟動方式：**
```bash
# 終端機 1: 啟動後端
cd backend
node server.js

# 終端機 2: 啟動前端
npx quasar dev -m pwa
```


### 📱 PWA 設定
在 `src-pwa/manifest.json` 中自訂：
- 🏷️ 應用程式名稱和描述
- 🎨 圖示和主題色彩
- 📱 顯示模式（standalone、fullscreen）
- 🌐 語言設定

## 🚀 部署

### 🗄️ SQL Server 部署
1. 確保 SQL Server 可遠端連線
2. 執行資料庫 Schema 建立
3. 配置防火牆和網路設定

### 📱 PWA 部署
1. 建置應用程式：`npm run build`
2. 部署 `dist/pwa` 目錄到靜態網站託管服務
3. 確保 HTTPS 支援（PWA 要求）

### 🖥️ 後端部署
1. 建置後端：`cd backend && npm install --production`
2. 啟動服務：`node server.js`
3. 使用 PM2 或 systemd 管理程序

## 💡 開發注意事項

### 🔄 資料同步
- 使用 `_dirty` 標記追蹤本地變更
- 使用 `rowversion` 處理衝突
- 支援冪等操作（clientMutationId）

### 🌐 離線支援
- 所有 CRUD 操作都支援離線
- 使用 IndexedDB 作為主要儲存
- Service Worker 處理快取策略

### ❌ 錯誤處理
- 🔄 網路錯誤自動重試
- 📦 同步失敗保留在 outbox
- 👤 使用者友善的錯誤提示

### 📱 平板優化
- 🎯 觸控目標最小 48px
- ⌨️ 數字鍵盤支援平板輸入
- 📐 響應式設計適配不同螢幕

## 🔧 故障排除

### 常見問題
1. **後端連線失敗**: 檢查 SQL Server 連線設定和防火牆
2. **同步失敗**: 檢查網路連線和後端 API 狀態
3. **平板觸控問題**: 確認 CSS 媒體查詢設定
