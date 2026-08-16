#!/usr/bin/env node
/**
 * Tự động gọi API speechgen.io để lấy file phát âm chuẩn (mp3) cho từng từ
 * trong data.js, lưu vào thư mục audio/ với tên = <id>.mp3 (khớp field `id`
 * của từng từ trong data.js -> web sẽ tự nhận và phát file này).
 *
 * Cách dùng:
 *   1. Copy .env.example thành .env, điền SPEECHGEN_EMAIL / SPEECHGEN_TOKEN
 *      (lấy trong trang hồ sơ speechgen.io, mục "Khóa bí mật").
 *   2. Chạy:  node tools/fetch-audio.js
 *
 * An toàn khi chạy lại nhiều lần: từ nào đã có file trong audio/ sẽ được
 * bỏ qua (không gọi lại API, không tốn credit lần 2). Nếu lần chạy trước
 * bị lỗi giữa chừng, chỉ cần chạy lại lệnh trên, script tự tiếp tục các
 * từ còn thiếu.
 *
 * Yêu cầu: Node.js >= 18 (dùng fetch() có sẵn, không cần cài thêm gói nào).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'audio');
const DELAY_MS = 500; // nghỉ giữa các request để tránh bị rate-limit

// ---- Đọc file .env thủ công (không phụ thuộc package ngoài) ----
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const EMAIL = env.SPEECHGEN_EMAIL;
const TOKEN = env.SPEECHGEN_TOKEN;
const VOICE = env.SPEECHGEN_VOICE || 'Xiaoyin';

if (!EMAIL || !TOKEN) {
  console.error('❌ Thiếu SPEECHGEN_EMAIL hoặc SPEECHGEN_TOKEN.');
  console.error('   1. Copy .env.example thành .env');
  console.error('   2. Điền email + "Khóa bí mật" lấy trong trang hồ sơ speechgen.io');
  process.exit(1);
}

const { SINGLES, DOUBLES } = require('../data.js');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestTTS(text) {
  const body = new URLSearchParams({
    token: TOKEN,
    email: EMAIL,
    voice: VOICE,
    text,
    format: 'mp3',
    speed: '1', // để tốc độ gốc — việc làm chậm khi luyện tập xử lý ở phía web (playbackRate)
  });

  const res = await fetch('https://speechgen.io/index.php?r=api/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (String(data.status) !== '1' || !data.file) {
    throw new Error(`API báo lỗi: ${JSON.stringify(data)}`);
  }
  return data.file; // URL file mp3 kết quả
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tải file lỗi HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function processItem(item) {
  const destPath = path.join(AUDIO_DIR, `${item.id}.mp3`);
  if (fs.existsSync(destPath)) {
    console.log(`⏭  ${item.id} (${item.hanzi}) — đã có file, bỏ qua`);
    return { id: item.id, status: 'skipped' };
  }
  try {
    const fileUrl = await requestTTS(item.hanzi);
    await downloadFile(fileUrl, destPath);
    console.log(`✅ ${item.id} (${item.hanzi}) — đã lưu ${path.relative(ROOT, destPath)}`);
    return { id: item.id, status: 'ok' };
  } catch (err) {
    console.error(`❌ ${item.id} (${item.hanzi}) — lỗi: ${err.message}`);
    return { id: item.id, status: 'error', error: err.message };
  }
}

async function main() {
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const items = [...SINGLES, ...DOUBLES];
  console.log(`Bắt đầu lấy audio cho ${items.length} từ, giọng "${VOICE}"...\n`);

  const results = [];
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
    if (result.status !== 'skipped') await sleep(DELAY_MS);
  }

  const ok = results.filter((r) => r.status === 'ok').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const failed = results.filter((r) => r.status === 'error');

  console.log(`\n=== Tổng kết ===`);
  console.log(`Thành công: ${ok} | Đã có sẵn: ${skipped} | Lỗi: ${failed.length}`);
  if (failed.length) {
    console.log('\nCác từ lỗi (chạy lại "node tools/fetch-audio.js" sẽ tự thử lại các từ này):');
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }
}

main();
