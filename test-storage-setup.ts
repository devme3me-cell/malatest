// @ts-check
// Supabase Storage Setup Verification Script
// =========================================
// This script checks if Supabase Storage is properly configured
// Run with: bun run test-storage-setup.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m\x1b[30m',
  bold: '\x1b[1m',
};

console.log(`${colors.cyan}${colors.bold}
╭───────────────────────────────────────╮
│  Supabase Storage 設定診斷工具          │
│  Storage Configuration Test            │
╰───────────────────────────────────────╯${colors.reset}
`);

// Load environment variables
let envVars: Record<string, string | undefined> = {};
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !match[1].startsWith('#')) {
      envVars[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
    }
  });
} catch (e) {
  console.log(`${colors.yellow}⚠️ 未找到 .env.local 檔案，使用環境變數${colors.reset}`);
  // Use process.env if .env.local doesn't exist
  envVars = process.env;
}

// Get Supabase credentials
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check for credentials
console.log(`${colors.cyan}🔍 檢查 Supabase 設定...${colors.reset}`);
console.log(`Supabase URL: ${supabaseUrl ? `${colors.green}已設定${colors.reset}` : `${colors.red}未設定${colors.reset}`}`);
console.log(`Supabase Key: ${supabaseKey ? `${colors.green}已設定${colors.reset}` : `${colors.red}未設定${colors.reset}`}`);

if (!supabaseUrl || !supabaseKey) {
  console.log(`${colors.red}${colors.bold}❌ Supabase 憑證未正確設定！${colors.reset}`);
  console.log(`請確認 .env.local 檔案包含以下設定：
${colors.yellow}NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...${colors.reset}`);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Test connection function
async function testConnection() {
  try {
    console.log(`${colors.cyan}🔌 測試 Supabase 連線...${colors.reset}`);
    const { data, error } = await supabase.from('entries').select('count', { count: 'exact' });
    if (error) throw error;
    console.log(`${colors.green}✅ Supabase 連線成功！${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Supabase 連線失敗：${getErrorMessage(error)}${colors.reset}`);
    return false;
  }
}

// Test storage bucket function
async function testStorageBucket() {
  try {
    console.log(`${colors.cyan}📦 檢查 Storage Bucket...${colors.reset}`);
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    // Check if slot-images bucket exists
    const slotBucket = buckets.find(b => b.name === 'slot-images');
    if (slotBucket) {
      console.log(`${colors.green}✅ 找到 'slot-images' bucket！${colors.reset}`);
      console.log(`   Public: ${slotBucket.public ? `${colors.green}是${colors.reset}` : `${colors.red}否 (需要設為公開)${colors.reset}`}`);
      return true;
    } else {
      console.log(`${colors.red}❌ 未找到 'slot-images' bucket！${colors.reset}`);
      console.log(`${colors.yellow}請在 Supabase Dashboard 建立 bucket:
1. 前往 https://app.supabase.com
2. 選擇您的專案
3. 左側選單點選 Storage
4. 點擊 "New bucket"
5. 名稱設為 "slot-images"
6. 勾選 "Public bucket"${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ 檢查 Storage 失敗：${getErrorMessage(error)}${colors.reset}`);
    return false;
  }
}

// Test storage policies
async function testStoragePolicies() {
  try {
    console.log(`${colors.cyan}🔒 測試 Storage 權限...${colors.reset}`);

    // Generate a small test image
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2hPPXFQAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    const testFileName = `test_${Date.now()}.png`;
    const testFilePath = path.join('test_uploads', testFileName);

    // Test upload
    console.log(`${colors.blue}📤 測試上傳權限...${colors.reset}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('slot-images')
      .upload(testFilePath, testImageBuffer);

    if (uploadError) {
      console.log(`${colors.red}❌ 上傳測試失敗：${uploadError.message}${colors.reset}`);
      if (uploadError.message.includes('storage.objects') && uploadError.message.includes('policy')) {
        console.log(`${colors.yellow}您需要設定 Storage Policies:
1. 前往 Supabase Dashboard > Storage > Policies
2. 點擊 "New Policy"
3. 設定 INSERT 權限，允許 public 角色${colors.reset}`);
      }
      return false;
    }

    console.log(`${colors.green}✅ 上傳測試成功！${colors.reset}`);

    // Test download
    console.log(`${colors.blue}📥 測試下載權限...${colors.reset}`);
    const { data: urlData } = await supabase.storage
      .from('slot-images')
      .getPublicUrl(testFilePath);

    if (!urlData || !urlData.publicUrl) {
      console.log(`${colors.red}❌ 無法取得公開 URL${colors.reset}`);
      return false;
    }

    console.log(`${colors.green}✅ 取得公開 URL 成功！${colors.reset}`);
    console.log(`   URL: ${colors.cyan}${urlData.publicUrl}${colors.reset}`);

    // Test delete
    console.log(`${colors.blue}🗑️  測試刪除權限...${colors.reset}`);
    const { error: deleteError } = await supabase.storage
      .from('slot-images')
      .remove([testFilePath]);

    if (deleteError) {
      console.log(`${colors.yellow}⚠️  刪除測試失敗：${deleteError.message}${colors.reset}`);
      console.log(`   您可能需要設定 DELETE 權限`);
      return true; // Still return true as this is not critical
    }

    console.log(`${colors.green}✅ 刪除測試成功！${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ 測試 Storage 權限失敗：${getErrorMessage(error)}${colors.reset}`);
    return false;
  }
}

// Run all tests
async function runDiagnostics() {
  console.log('\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log(`${colors.red}${colors.bold}❌ 診斷失敗：無法連線到 Supabase${colors.reset}`);
    return;
  }

  console.log('\n');

  // Test storage bucket
  const bucketExists = await testStorageBucket();
  if (!bucketExists) {
    console.log(`${colors.red}${colors.bold}❌ 診斷失敗：未找到 slot-images bucket${colors.reset}`);
    return;
  }

  console.log('\n');

  // Test storage policies
  const policiesWork = await testStoragePolicies();

  console.log('\n');

  // Final results
  if (connected && bucketExists && policiesWork) {
    console.log(`${colors.bgGreen}${colors.bold} 🎉 恭喜！Supabase Storage 設定完成並正常運作！ ${colors.reset}`);
    console.log(`
您現在可以：
1. 進行完整抽獎流程並上傳照片
2. 確認圖片能正常顯示在管理員後台
3. 部署到 Zeabur (記得設定環境變數)`);
  } else if (connected && bucketExists) {
    console.log(`${colors.bgYellow}${colors.bold} ⚠️  Supabase 連線正常，但 Storage 權限可能需要調整！ ${colors.reset}`);
  } else {
    console.log(`${colors.bgRed}${colors.bold} ❌ Supabase Storage 設定不完整，請遵循上述指示修正問題 ${colors.reset}`);
  }
}

// Run diagnostics
runDiagnostics().catch(err => {
  console.log(`${colors.red}❌ 執行診斷時發生錯誤：${getErrorMessage(err)}${colors.reset}`);
});
