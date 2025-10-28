# 🏭 Fabric Inspection PWA2

基於 **Quasar PWA + SQL Server** 的現代化驗布系統，支援離線作業和即時資料同步。

![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)
![Quasar](https://img.shields.io/badge/Quasar-2.x-1976D2?style=flat&logo=quasar)
![SQL Server](https://img.shields.io/badge/SQL_Server-Microsoft-CC2927?style=flat&logo=microsoft-sql-server)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat&logo=pwa)

## ✨ 主要功能

- 🏭 **布捲管理**: 條碼掃描、基本資訊顯示、狀態追蹤
- 🔍 **檢驗作業**: 規格檢查、品質檢查、缺陷記錄
- 📱 **PWA 功能**: 離線作業、本地快取、自動同步
- ⌨️ **平板優化**: 數字鍵盤、觸控支援

## 🏗️ 技術架構

### 📱 前端架構
- **Quasar Framework**: Vue 3 + TypeScript + Vite
- **IndexedDB**: 離線資料儲存 (Dexie.js)
- **Service Worker**: 離線快取和背景同步
- **PWA**: 可安裝到桌面的 Web App

### 🖥️ 後端架構
- **Node.js Express**: RESTful API 伺服器
- **SQL Server**: 企業級資料庫
- **mssql**: SQL Server 連接驅動
- **CORS**: 跨域請求支援

### 🔄 離線優先設計
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 PWA      │    │   後端 API      │    │   SQL Server    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ IndexedDB   │ │◄──►│ │ Express.js  │ │◄──►│ │ 資料庫      │ │
│ │ (Dexie.js)  │ │    │ │ REST API    │ │    │ │ rolls       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │ inspections │ │
│ ┌─────────────┐ │    │                 │    │ │ defects     │ │
│ │ Outbox      │ │    │                 │    │ │ defect_codes│ │
│ │ (同步佇列)   │ │    │                 │    │ └─────────────┘ │
│ └─────────────┘ │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 💾 資料同步機制
- **離線優先**: 所有操作先寫入本地 IndexedDB
- **Outbox 佇列**: 待同步資料暫存機制
- **雙向同步**: Push (推送到伺服器) + Pull (從伺服器拉取)
- **衝突解決**: 使用 `rowversion` 和 `_dirty` 標記
- **自動重試**: 網路恢復後自動同步

## 🚀 快速開始

### 環境需求
- Node.js 18+
- SQL Server 遠端連線

### 安裝與啟動

1. **安裝依賴**
```bash
npm install
cd backend && npm install
```

2. **配置環境變數**

建立 `backend/.env`：
```env
DB_SERVER=*******
DB_PORT=*******
DB_DATABASE=*******
DB_USER=*******
DB_PASSWORD=*******
```

3. **啟動系統步驟**

```bash
# 終端機 1: 啟動後端
cd backend
node server.js

# 終端機 2: 啟動前端
npx quasar dev -m pwa
```

## 📖 使用流程

1. **布捲清單**: 輸入條碼搜尋布捲 → 查看資訊 → 開始檢驗
2. **檢驗作業**: 規格檢查 → 品質檢查 → 缺陷記錄 → 完成檢驗
3. **離線作業**: 自動快取 → 離線操作 → 網路恢復自動同步

## 🗃️ 資料庫結構

- **`rolls`**: 布捲基本資訊
- **`inspections`**: 檢驗記錄
- **`defects`**: 缺陷記錄
- **`defect_codes`**: 缺陷代碼
- **`sync_logs`**: 同步記錄

## 🔧 故障排除

1. **後端連線失敗**: 檢查 SQL Server 連線設定和防火牆
2. **前端空白頁面**: 確認 檔案中的 `VITE_API_BASE_URL` 設定
3. **同步失敗**: 檢查網路連線和後端 API 狀態
4. **平板觸控問題**: 確認 CSS 媒體查詢設定

