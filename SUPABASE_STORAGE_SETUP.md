# 🚀 Supabase Storage 完整設定指南

## 概述

本應用程式已整合 **Supabase Storage** 來儲存用戶上傳的圖片，相比 base64 儲存方式有以下優勢：

✅ **更快的載入速度** - 使用 CDN 分發
✅ **更小的資料庫大小** - 只儲存 URL，不儲存圖片數據
✅ **更大的檔案支援** - 支援 5MB+ 的圖片
✅ **自動回退機制** - 如果 Storage 未設定，自動使用 base64

---

## 📋 設定步驟

### **第一步：建立 Supabase 專案**

1. 前往 https://supabase.com
2. 點擊 **Start your project**
3. 使用 GitHub 或 Email 註冊/登入
4. 點擊 **New project**
5. 填寫專案資訊：
   - **Name**: `lucky-draw-slot` (或任何名稱)
   - **Database Password**: 設定一個強密碼（請記住）
   - **Region**: 選擇最近的區域（建議：Singapore 或 Tokyo）
6. 點擊 **Create new project**
7. 等待 1-2 分鐘讓專案初始化

### **第二步：取得 API 金鑰**

1. 專案建立完成後，點擊左側 **Settings** → **API**
2. 複製以下兩個值：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. 在專案目錄中，編輯 `.env.local` 檔案：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://你的專案ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
   ```

### **第三步：建立資料庫表格**

1. 點擊左側 **SQL Editor**
2. 點擊 **New query**
3. 複製並貼上以下 SQL：

```sql
-- 建立 entries 表格
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  username TEXT NOT NULL,
  amount TEXT NOT NULL,
  image TEXT,
  prize INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS entries_timestamp_idx ON entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries(created_at DESC);

-- 啟用 Row Level Security (可選，建議生產環境啟用)
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 允許所有操作的政策（測試用，生產環境請調整）
CREATE POLICY "Allow all operations" ON entries
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. 點擊 **Run** 執行 SQL

### **第四步：建立 Storage Bucket**

1. 點擊左側 **Storage**
2. 點擊 **Create a new bucket**
3. 填寫設定：
   - **Name**: `slot-images` （必須是這個名稱！）
   - **Public bucket**: ✅ **務必勾選**
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: `image/*`
4. 點擊 **Create bucket**

### **第五步：設定 Storage 權限**

#### 方法 A：使用 SQL（推薦）

1. 點擊左側 **SQL Editor**
2. 點擊 **New query**
3. 複製並貼上以下 SQL：

```sql
-- 允許所有人上傳圖片
CREATE POLICY "Allow public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'slot-images');

-- 允許所有人讀取圖片
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'slot-images');

-- 允許所有人刪除圖片（可選）
CREATE POLICY "Allow public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'slot-images');
```

4. 點擊 **Run** 執行 SQL

#### 方法 B：使用 UI（替代方案）

1. 在 Storage 頁面，點擊 `slot-images` bucket
2. 點擊 **Policies** 頁籤
3. 點擊 **New Policy** → **For full customization**
4. 建立三個政策：

**政策 1 - INSERT (上傳)**
- Policy name: `Allow public upload`
- Allowed operation: `INSERT`
- Target roles: `public`
- USING expression: `bucket_id = 'slot-images'`

**政策 2 - SELECT (讀取)**
- Policy name: `Allow public read`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'slot-images'`

**政策 3 - DELETE (刪除)**
- Policy name: `Allow public delete`
- Allowed operation: `DELETE`
- Target roles: `public`
- USING expression: `bucket_id = 'slot-images'`

### **第六步：重啟開發伺服器**

```bash
cd drslot
bun run dev
```

---

## ✅ 測試與驗證

### 測試上傳功能

1. 在瀏覽器中打開 http://localhost:3000
2. 完成抽獎流程：
   - 輸入帳號
   - 選擇金額
   - **上傳圖片** ← 重點測試步驟
   - 進行抽獎
3. 檢查瀏覽器 Console（F12）：
   - 應該看到 `Uploading image to Supabase Storage...`
   - 應該看到 `Image uploaded: Storage URL`（成功）或 `Base64 fallback`（失敗）

### 驗證 Storage 中的圖片

1. 回到 Supabase Dashboard
2. 點擊 **Storage** → `slot-images`
3. 應該可以看到 `entries/` 資料夾
4. 裡面有剛上傳的圖片檔案（格式：`1234567890_abc123.jpg`）

### 驗證資料庫記錄

1. 點擊 **Table Editor** → `entries`
2. 查看最新的記錄
3. `image` 欄位應該是 Storage URL：
   ```
   https://xxxxx.supabase.co/storage/v1/object/public/slot-images/entries/1234567890_abc123.jpg
   ```

---

## 🔍 疑難排解

### ❌ 問題：圖片上傳失敗，使用 base64 fallback

**可能原因：**
1. Supabase 專案未正確設定
2. Storage bucket 未建立或名稱錯誤
3. Storage policies 未設定
4. 環境變數錯誤

**解決方法：**
1. 確認 `.env.local` 中的 URL 和 Key 正確
2. 確認 bucket 名稱是 `slot-images`
3. 確認 bucket 已設為 **Public**
4. 確認 3 個 policies 都已建立
5. 重啟開發伺服器

### ❌ 問題：圖片在管理後台無法顯示

**可能原因：**
1. Supabase 專案已暫停（免費方案 7 天不活動會暫停）
2. Storage URL 格式錯誤
3. CORS 設定問題

**解決方法：**
1. 檢查 Supabase 專案狀態，如果暫停請點擊 **Resume**
2. 檢查圖片 URL 是否正確
3. 確認 bucket 是 **Public**

### ❌ 問題：環境變數更新後沒有生效

**解決方法：**
```bash
# 停止開發伺服器（Ctrl+C）
# 重新啟動
bun run dev
```

---

## 📊 功能對比

| 功能 | Base64 (舊) | Supabase Storage (新) |
|------|------------|----------------------|
| 儲存位置 | 資料庫內 | Supabase Storage CDN |
| 圖片大小限制 | ~1MB | 5MB+ |
| 載入速度 | 慢（需解碼） | 快（直接從 CDN） |
| 資料庫大小 | 快速增長 | 僅儲存 URL（極小） |
| 成本 | 高 | 低 |
| 自動回退 | - | ✅ 支援 |

---

## 🔒 生產環境建議

### 安全性加強

如果要部署到生產環境，建議修改 Storage Policies：

```sql
-- 僅允許已驗證用戶上傳
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'slot-images'
  AND auth.role() = 'authenticated'
);
```

### 檔案大小限制

在 `src/lib/supabase.ts` 中，可以加入檔案大小檢查：

```typescript
export async function uploadImage(file: File): Promise<string | null> {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  if (file.size > MAX_FILE_SIZE) {
    console.error('File size exceeds 5MB');
    alert('圖片檔案過大，請選擇小於 5MB 的圖片');
    return null;
  }

  // ... 其餘上傳邏輯
}
```

---

## 📈 監控與維護

### 檢查儲存空間使用量

1. Supabase Dashboard → **Settings** → **Usage**
2. 查看 **Storage** 使用量
3. 免費方案：1GB
4. 超過後：$0.021/GB/月

### 定期清理舊圖片（可選）

如果需要節省空間，可以定期清理舊圖片。範例腳本請參考 `.same/storage-setup-guide.md`

---

## ✅ 設定完成檢查清單

- [ ] Supabase 專案已建立
- [ ] 已取得 Project URL 和 anon key
- [ ] `.env.local` 已更新並重啟伺服器
- [ ] `entries` 資料表已建立
- [ ] `slot-images` bucket 已建立並設為 public
- [ ] Storage policies 已設定（INSERT, SELECT, DELETE）
- [ ] 測試上傳圖片成功
- [ ] 圖片在 Storage 中可見
- [ ] 資料庫中的 `image` 欄位是 Storage URL
- [ ] 管理後台可正常顯示圖片

---

## 🎉 完成！

恭喜！您的應用程式現在已成功整合 Supabase Storage。

圖片會自動上傳到 Storage，享受更快的載入速度和更低的成本！

**需要協助？**
- [Supabase Storage 官方文件](https://supabase.com/docs/guides/storage)
- [Storage Policies 指南](https://supabase.com/docs/guides/storage/security/access-control)
