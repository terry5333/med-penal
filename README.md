# med-penal

MVP: 長期服藥管理 LINE Bot（Firebase 版）

## MVP 範圍（已選定 3 項）
1. 智慧用藥提醒（多時段）
2. 一鍵已服藥打卡（Flex Message）
3. 服藥紀錄統計（週報）

## 本地開發
```
npm install
npm run dev
```

## 部署（Vercel）
1. 將此 repo 連結到 Vercel 專案。
2. 在 Vercel 專案設定新增環境變數（與下方一致）。
3. 部署後到 LINE Developer Console 設定 Webhook URL：
   `https://<your-vercel-domain>/api/line/webhook`
4. 使用 Scheduler（或外部排程）定時呼叫：
   `https://<your-vercel-domain>/api/reminders/dispatch`（需 `PANEL_TOKEN`）

## 環境變數
```
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_CHANNEL_SECRET=...
PANEL_TOKEN=... # 用於 /api/reminders/dispatch

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 主要 API
- `POST /api/line/webhook`：LINE Webhook（用藥打卡）
- `POST /api/reminders/dispatch`：排程推播（請搭配 Scheduler）
- `POST /api/intakes`：手動補登
- `GET /api/reports/weekly?userId=...`：週報統計

## 資料表（Firestore）
- `medications`
- `schedules`
- `intakes`

詳見 `docs/mvp.md`。
