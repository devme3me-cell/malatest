# 📋 Luxury Slot App - 待辦事項

## ✅ 已完成

- [x] 設定 Supabase 連線
- [x] 建立資料庫 schema (entries table)
- [x] 實作管理員後台
- [x] 上傳圖片功能
- [x] 抽獎輪盤系統
- [x] 推送到 GitHub
- [x] 部署到 Zeabur
- [x] **升級圖片儲存到 Supabase Storage**
  - [x] 實作 uploadImage() 函數
  - [x] 實作 deleteImage() 函數
  - [x] 更新前端上傳流程
  - [x] 建立 Storage 設定文件

## 🔄 進行中

- [ ] **Supabase Storage 設定**（需用戶手動操作）
  - [ ] 在 Supabase Dashboard 建立 `slot-images` bucket
  - [ ] 設定 Storage policies (INSERT, SELECT, DELETE)
  - [ ] 測試圖片上傳功能
  - [ ] 驗證管理員後台圖片顯示

## 📌 待處理

### 高優先級
1. [ ] **Zeabur 環境變數設定**
   - 確保 NEXT_PUBLIC_SUPABASE_URL 已設定
   - 確保 NEXT_PUBLIC_SUPABASE_ANON_KEY 已設定
   - 測試生產環境資料同步

2. [ ] **資料顯示驗證**
   - 檢查 Zeabur 部署是否顯示抽獎記錄
   - 驗證管理員後台資料載入

### 中優先級
3. [ ] **效能優化**
   - [ ] 新增圖片壓縮（上傳前）
   - [ ] 實作圖片快取機制
   - [ ] 優化大量資料載入

4. [ ] **資料遷移**（可選）
   - [ ] 將舊的 base64 圖片遷移到 Storage
   - [ ] 清理資料庫中的 base64 資料

### 低優先級
5. [ ] **維護工具**
   - [ ] 建立定期清理舊圖片的腳本
   - [ ] 新增儲存空間監控
   - [ ] 實作自動備份功能

## 🎯 下一步建議

1. **立即執行**：按照 `.same/storage-setup-guide.md` 設定 Supabase Storage bucket
2. **驗證功能**：完成一次完整的抽獎流程並上傳圖片
3. **檢查部署**：確認 Zeabur 環境變數已設定並重新部署
4. **監控使用**：定期檢查 Supabase Storage 使用量

## 📝 備註

- 圖片上傳已從 base64 升級到 Supabase Storage
- 新的上傳流程更快速且節省資料庫空間
- 舊的 base64 圖片仍可正常顯示（向下相容）
- 免費方案提供 1GB Storage 空間

---

**最後更新**: 2025-11-29
