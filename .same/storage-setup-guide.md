# Supabase Storage 設定指南

## 📦 圖片儲存升級說明

此專案已從 base64 圖片儲存升級到 **Supabase Storage**，提供更好的效能和可擴展性。

---

## ✅ 已完成的改進

### 1. **程式碼更新**
- ✓ `src/lib/supabase.ts` - 新增 `uploadImage()` 和 `deleteImage()` 函數
- ✓ `src/app/page.tsx` - 整合 Supabase Storage 上傳流程
- ✓ `src/app/admin/dashboard/page.tsx` - 支援顯示 Storage URL 圖片

### 2. **儲存方式變更**
| 項目 | 舊方式 (Base64) | 新方式 (Storage) |
|------|----------------|------------------|
| 儲存位置 | 資料庫內 | Supabase Storage |
| 圖片大小限制 | ~1MB | 幾乎無限制 |
| 載入速度 | 慢 (需解碼) | 快 (CDN) |
| 資料庫大小 | 快速增長 | 僅儲存 URL |
| 成本 | 高 | 低 |

---

## 🚀 設定步驟

### **Step 1: 建立 Storage Bucket**

1. 前往 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 左側選單點選 **Storage**
4. 點擊 **New bucket**
5. 填寫設定：
   ```
   Bucket Name: slot-images
   Public bucket: ✅ (勾選)
   File size limit: 5 MB (建議)
   Allowed MIME types: image/*
   ```
6. 點擊 **Create bucket**

### **Step 2: 設定 Storage Policies**

1. 在 Storage 頁面，點擊 `slot-images` bucket
2. 點擊 **Policies** 頁籤
3. 點擊 **New Policy**
4. 複製並執行以下 SQL（或使用 SQL Editor）：

```sql
-- 允許所有人上傳圖片 (INSERT)
CREATE POLICY "Allow public upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'slot-images'
);

-- 允許所有人讀取圖片 (SELECT)
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'slot-images'
);

-- 允許刪除圖片 (DELETE) - 可選
CREATE POLICY "Allow public delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'slot-images'
);
```

### **Step 3: 驗證設定**

在專案目錄執行測試：

```bash
cd luxury-slot-app-2
bun run dev
```

然後：
1. 打開應用程式
2. 進行一次完整的抽獎流程並上傳圖片
3. 檢查 Supabase Storage 是否出現新圖片
4. 進入管理員後台查看圖片是否正常顯示

---

## 🔍 驗證清單

- [ ] Supabase 專案已建立
- [ ] `slot-images` bucket 已建立並設為 public
- [ ] Storage policies 已設定（INSERT, SELECT, DELETE）
- [ ] `.env.local` 已配置 Supabase 憑證
- [ ] 測試上傳圖片成功
- [ ] 管理員後台可正常顯示/下載圖片
- [ ] Zeabur 環境變數已同步更新

---

## 📝 程式碼說明

### **上傳圖片流程**

```typescript
// 1. 用戶選擇圖片 → 儲存 File 物件
const [uploadedFile, setUploadedFile] = useState<File | null>(null);

// 2. 抽獎完成後上傳到 Supabase Storage
const imageUrl = await uploadImage(uploadedFile);

// 3. 儲存圖片 URL 到資料庫
await saveEntry({
  ...entryData,
  image: imageUrl  // 儲存 Storage URL 而非 base64
});
```

### **圖片 URL 格式**

```
https://zdeeehmsfidndsxxvksv.supabase.co/storage/v1/object/public/slot-images/entries/1732876543210_abc123.jpg
```

---

## 🛡️ 安全性建議

### **生產環境建議**

如果您想要更嚴格的權限控制，可以修改 policies：

```sql
-- 僅允許已驗證用戶上傳
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'slot-images'
  AND auth.role() = 'authenticated'
);
```

---

## 🔧 常見問題

### **Q1: 圖片上傳失敗**
- 檢查 bucket 是否設為 public
- 確認 Storage policies 已正確設定
- 查看瀏覽器 console 錯誤訊息

### **Q2: 舊的 base64 圖片怎麼處理？**
- 新圖片會自動使用 Storage
- 舊的 base64 圖片仍可正常顯示
- 可選擇性執行資料遷移（需自行開發）

### **Q3: Zeabur 部署後圖片無法顯示**
- 確認 Zeabur 環境變數已設定
- 檢查 Supabase 專案狀態（是否暫停）
- 確認 Storage bucket 為 public

### **Q4: 圖片儲存成本**
- Supabase 免費方案：1GB Storage
- 超過後：$0.021/GB/月
- 建議限制單張圖片大小 < 5MB

---

## 📊 監控與維護

### **儲存空間檢查**

1. Supabase Dashboard → Settings → Usage
2. 查看 Storage 使用量
3. 定期清理過期圖片（需自行開發）

### **清理範例**

```typescript
// 刪除超過 30 天的圖片（範例）
export async function cleanupOldImages() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldEntries = await getEntries();
  const oldImages = oldEntries
    .filter(e => new Date(e.timestamp) < thirtyDaysAgo)
    .map(e => e.image);

  for (const imageUrl of oldImages) {
    await deleteImage(imageUrl);
  }
}
```

---

## 🎉 完成！

您的應用程式現在使用 Supabase Storage 來儲存圖片，享受更快的載入速度和更低的成本！

---

**需要協助？**
- [Supabase Storage 官方文件](https://supabase.com/docs/guides/storage)
- [Storage Policies 指南](https://supabase.com/docs/guides/storage/security/access-control)
