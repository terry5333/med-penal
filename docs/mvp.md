# MVP 工程實作指南（Firebase 版）

## 架構摘要
- LINE Bot Webhook 接收訊息（打卡）
- Scheduler 呼叫 `/api/reminders/dispatch` 觸發提醒
- Firestore 作為資料庫

## Firestore Collection

### `medications`
| 欄位 | 型態 | 說明 |
| --- | --- | --- |
| `name` | string | 藥名 |
| `dosage` | string | 劑量/備註 |
| `createdAt` | timestamp | 建立時間 |

### `schedules`
| 欄位 | 型態 | 說明 |
| --- | --- | --- |
| `userId` | string | LINE userId |
| `medId` | string | 參照 medications |
| `times` | array<string> | `HH:mm` |
| `daysOfWeek` | array<number> | 0=Sun ~ 6=Sat |
| `active` | boolean | 是否啟用 |

### `intakes`
| 欄位 | 型態 | 說明 |
| --- | --- | --- |
| `userId` | string | LINE userId |
| `medId` | string | 參照 medications |
| `scheduleId` | string | 參照 schedules |
| `status` | string | `pending` / `taken` |
| `scheduledTime` | timestamp | 預定時間 |
| `takenTime` | timestamp | 實際時間 |

## Scheduler 設定建議
- Cloud Scheduler 每分鐘呼叫一次
- Request Body 範例：
```json
{
  "nowIso": "2024-01-01T08:00:00+08:00",
  "timeZone": "Asia/Taipei"
}
```

## LINE Flex Message
由 `lib/line.ts` 的 `buildReminderFlex` 生成。
