# 🚀 Supabase Storage 快速設定

## 當前狀態
✅ 程式碼已完成 Supabase Storage 整合
⏳ **需要您手動設定 Storage Bucket**

---

## 📦 3 分鐘快速設定

### Step 1: 建立 Storage Bucket
1. 前往 https://app.supabase.com
2. 選擇您的專案：`zdeeehmsfidndsxxvksv`
3. 左側選單 → **Storage**
4. 點擊 **New bucket** 按鈕
5. 設定：
   - Name: `slot-images`
   - Public bucket: ✅ **務必勾選**
   - 點擊 **Create bucket**

### Step 2: 設定存取權限
1. 點擊剛建立的 `slot-images` bucket
2. 進入 **Policies** 頁籤
3. 點擊 **New Policy** → 選擇 **For full customization**
4. 複製以下 SQL 並執行：

```sql
-- 允許上傳
CREATE POLICY "Allow public upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'slot-images');

-- 允許讀取
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'slot-images');

-- 允許刪除
CREATE POLICY "Allow public delete" ON storage.objects
FOR DELETE USING (bucket_id = 'slot-images');
```

或者使用 UI 分別建立 3 個 Policy：
- **Policy 1 (INSERT)**: 勾選 `INSERT`，Target roles: `public`
- **Policy 2 (SELECT)**: 勾選 `SELECT`，Target roles: `public`
- **Policy 3 (DELETE)**: 勾選 `DELETE`，Target roles: `public`

### Step 3: 測試
```bash
bun run dev
```
進行一次完整抽獎並上傳圖片，檢查：
- Storage 中是否出現圖片
- 管理員後台能否正常顯示

---

## ✅ 完成後的好處

| 功能 | 升級前 | 升級後 |
|------|--------|--------|
| 圖片儲存 | 資料庫 (base64) | Supabase Storage (CDN) |
| 載入速度 | 慢 | 快 3-5 倍 |
| 檔案大小限制 | ~1MB | 5MB+ |
| 資料庫負擔 | 高 | 低 |

---

## 🔍 疑難排解

**圖片上傳失敗？**
- 確認 bucket 名稱是 `slot-images`
- 確認 Public bucket 已勾選
- 確認 3 個 policies 都已建立

**管理員後台看不到圖片？**
- 檢查瀏覽器 Console 錯誤訊息
- 確認 Supabase 專案沒有暫停
- 確認環境變數正確

---

📖 **詳細文件**: `.same/storage-setup-guide.md`
