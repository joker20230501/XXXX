# Việc Làm Bản Đồ - LBS Job & Talent Matcher (Vietnam)

針對越南在地企業與勞工設計的「LBS 地圖視覺化」與「薪資透明化」招募媒合系統。

---

## 專案結構 (Project Architecture)

```text
├── backend/                  # Node.js (TypeScript) + Express + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma     # 資料庫結構模型
│   │   └── seed.ts           # 越南在地測試資料 (胡志明市/平陽工業區)
│   ├── src/
│   │   ├── controllers/      # 認證、職缺地圖、人才庫、智慧媒合
│   │   ├── middleware/       # JWT 驗證與 Zod 薪資/技能校驗
│   │   ├── routes/           # RESTful API 路由
│   │   ├── utils/geo.ts      # PostGIS 距離計算與隱私模糊化演算法
│   │   └── server.ts         # 後端入口
│   ├── Dockerfile
│   └── package.json
├── mobile_flutter/           # Flutter (Dart) 跨平台行動端 APP
│   ├── lib/
│   │   ├── config/           # 越南常用技能標籤與常數
│   │   ├── models/           # 資料模型 (Job, WorkerProfile)
│   │   ├── screens/          # 地圖首頁、結構化履歷、發布職缺、智慧推薦
│   │   ├── services/         # 後端 API 串接
│   │   └── main.dart         # APP 進入點
│   ├── android/              # Android 原生設定檔 (含 Google Maps API Key 配置點)
│   ├── ios/                  # iOS 原生設定檔 (含隱私權限說明)
│   └── pubspec.yaml
└── docker-compose.yml        # 一鍵啟動 PostGIS 資料庫與後端服務
```

---

## 快速啟動指南 (Quick Start)

### 1. 後端與資料庫啟動
```bash
# 1. 啟動 PostGIS 與 Node.js 後端容器
docker compose up -d

# 2. 或是以本地 Node.js 啟動
cd backend
npm install
npx prisma migrate dev --name init
npm run seed     # 寫入越南測試資料
npm run dev      # 啟動於 http://localhost:3000
```

### 2. 行動端 APP 啟動 (Flutter)
```bash
cd mobile_flutter
flutter pub get

# 連接 Android/iOS 手機或模擬器執行
flutter run

# 產出 Android 實機安裝檔 (.apk)
flutter build apk --release
```
