# Fabric Inspection PWA

一個基於 Quasar PWA + Supabase 的驗布系統，支援離線作業和資料同步。

## 功能特色

### 🏭 布捲管理
- 條碼掃描/輸入搜尋布捲
- 布捲基本資訊顯示（BL#、PO#、Style、Color、Lot、Roll#等）
- 長度資訊管理（Total、Need Inspect、Pass Condition、Inspected）
- 布捲狀態追蹤（pending、inspecting、completed）

### 🔍 檢驗作業
- **Spec Check**: 規格檢查（重量、長度、寬度、濕度、斜度等）
- **Quality Check**: 品質檢查（外觀、手感、顏色、包裝等）
- **Defect Record**: 缺陷記錄（支援多語言缺陷代碼）
- 數字鍵盤快速輸入
- 即時計算差異百分比

### 📱 PWA 功能
- 離線作業支援
- 資料本地快取（IndexedDB）
- 自動同步機制
- 安裝到桌面
- 推播通知

### 🔄 同步機制
- 離線資料佇列（Outbox）
- 網路恢復自動同步
- 衝突解決（Server-wins）
- 雙向同步（Push/Pull）

## 技術架構

### 前端
- **Quasar Framework**: Vue 3 + TypeScript
- **IndexedDB**: 離線資料儲存（使用 Dexie）
- **Service Worker**: 離線快取和背景同步
- **Workbox**: PWA 工具庫

### 後端
- **Supabase**: PostgreSQL 資料庫 + Edge Functions
- **Row Level Security**: 資料安全控制
- **Real-time**: 即時資料同步

## 資料庫結構

### 主要資料表
- `rolls`: 布捲基本資訊
- `inspections`: 檢驗記錄
- `defects`: 缺陷記錄
- `defect_codes`: 缺陷代碼（支援多語言）
- `sync_logs`: 同步記錄

### 離線儲存
- `outbox`: 待同步資料佇列
- 本地快取所有主要資料表

## 安裝與執行

### 環境需求
- Node.js 18+
- npm 或 yarn

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

### 建置 PWA
```bash
npm run build
```

### 建置並預覽
```bash
npm run build
npx serve dist/pwa
```

## 使用流程

### 1. 布捲清單頁面
1. 輸入或掃描條碼搜尋布捲
2. 查看布捲基本資訊和長度資訊
3. 點擊 "Roll Start" 開始檢驗

### 2. 檢驗作業頁面
1. **Spec Check**: 輸入標準值和實測值
2. **Quality Check**: 選擇各項品質檢查結果
3. **Defect Record**: 記錄發現的缺陷
4. 點擊 "Save" 儲存或 "Roll Finish" 完成檢驗

### 3. 離線作業
- 系統會自動快取資料到本地
- 離線時可正常進行檢驗作業
- 網路恢復後自動同步資料

## 配置說明

### Supabase 設定（.env）
建立 `.env`（或 `.env.local`），填入：
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
開發伺服器會自動讀取並注入到前端程式碼。

### PWA 設定
在 `src-pwa/manifest.json` 中自訂：
- 應用程式名稱和描述
- 圖示和主題色彩
- 顯示模式

## 部署

### Supabase 部署
1. 建立 Supabase 專案
2. 執行資料庫遷移
3. 部署 Edge Functions

### PWA 部署
1. 建置應用程式：`npm run build`
2. 部署 `dist/pwa` 目錄到靜態網站託管服務
3. 確保 HTTPS 支援（PWA 要求）

## 開發注意事項

### 資料同步
- 使用 `_dirty` 標記追蹤本地變更
- 使用 `rowversion` 處理衝突
- 支援冪等操作（clientMutationId）

### 離線支援
- 所有 CRUD 操作都支援離線
- 使用 IndexedDB 作為主要儲存
- Service Worker 處理快取策略

### 錯誤處理
- 網路錯誤自動重試
- 同步失敗保留在 outbox
- 使用者友善的錯誤提示

## 授權

MIT License

## 聯絡資訊

如有問題或建議，請聯絡開發團隊。