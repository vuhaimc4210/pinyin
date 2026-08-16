#!/usr/bin/env node
/**
 * Tool test tự động cho web TTS NỘI BỘ của bạn (mạng nội bộ, hạ tầng tự vận
 * hành). Dùng Playwright để điều khiển trình duyệt thật: nhập từng từ trong
 * data.js -> bấm nút tạo giọng -> chờ tải file -> lưu vào audio/<id>.mp3.
 *
 * KHÔNG dùng tool này để nhắm vào các dịch vụ bên thứ ba (vd: speechgen.io)
 * mà bạn không sở hữu hạ tầng — chỉ dùng cho web do chính bạn vận hành.
 *
 * Cài đặt (chạy 1 lần):
 *   npm init -y
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * Cấu hình:
 *   1. Copy tools/internal-web.config.example.js thành tools/internal-web.config.js
 *   2. Điền baseUrl + CSS selector đúng theo trang web nội bộ của bạn
 *      (xem hướng dẫn lấy selector bằng DevTools trong file config mẫu)
 *
 * Chạy:
 *   node tools/test-internal-web.js
 *
 * An toàn khi chạy lại nhiều lần: từ nào đã có file trong audio/ sẽ được bỏ
 * qua. Có delay giữa các từ (mặc định 10s, chỉnh trong config) để tránh gây
 * tải dồn dập lên server nội bộ của bạn.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'audio');
const CONFIG_PATH = ['internal-web.config.js', 'internal-web.config.json']
  .map((name) => path.join(__dirname, name))
  .find((p) => fs.existsSync(p));

if (!CONFIG_PATH) {
  console.error('❌ Chưa có file cấu hình.');
  console.error('   1. Copy tools/internal-web.config.example.js (hoặc .json) thành tools/internal-web.config.js (hoặc .json)');
  console.error('   2. Điền baseUrl + selector đúng theo trang web nội bộ của bạn');
  process.exit(1);
}

const config = require(CONFIG_PATH);

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (err) {
  console.error('❌ Chưa cài Playwright.');
  console.error('   Chạy:  npm install -D playwright && npx playwright install chromium');
  process.exit(1);
}

const { SINGLES, DOUBLES } = require('../data.js');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processItem(page, item) {
  const destPath = path.join(AUDIO_DIR, `${item.id}.mp3`);
  if (fs.existsSync(destPath)) {
    console.log(`⏭  ${item.id} (${item.hanzi}) — đã có file, bỏ qua`);
    return { id: item.id, status: 'skipped' };
  }

  console.log(`\n▶ ${item.id} (${item.hanzi}) — bắt đầu`);

  try {
    await page.goto(config.baseUrl, { waitUntil: 'domcontentloaded' });
    console.log(`  • Đã mở trang ${config.baseUrl}`);

    // Trang bị F5 lại mỗi từ nên giọng đã chọn bị reset, phải chọn lại
    await selectVoice(page);

    // Nhập từ cần đọc
    await page.fill(config.selectors.textInput, item.hanzi);
    console.log(`  • Đã nhập chữ vào ô nhập`);

    // Nghỉ sau khi nhập chữ, trước khi bấm nút tạo giọng
    if (config.delayAfterFillMs) {
      await sleep(config.delayAfterFillMs);
    }

    // Chuẩn bị lắng nghe sự kiện tải file (phải đăng ký TRƯỚC khi bấm nút,
    // vì browser có thể bắt đầu tải ngay khi bấm generate)
    const downloadPromise = page.waitForEvent('download', {
      timeout: config.downloadTimeoutMs,
    });

    // Bấm nút tạo giọng nói
    await page.click(config.selectors.generateButton);
    console.log(`  • Đã bấm nút tạo giọng`);

    // Nếu trang có bước bấm nút tải riêng
    if (config.selectors.downloadButton) {
      if (config.selectors.waitForSelectorBeforeDownload) {
        await page.waitForSelector(config.selectors.waitForSelectorBeforeDownload, {
          timeout: config.downloadTimeoutMs,
        });
      }
      await page.click(config.selectors.downloadButton);
      console.log(`  • Đã bấm nút tải riêng`);
    }

    // Nếu trang liệt kê kết quả trong 1 khu vực (vd: #result_area), kết quả
    // vừa tạo là phần tử con đầu tiên. Chờ cố định 3s cho trang xử lý xong
    // rồi bấm link tải (href chứa id, vd: prj=<id>).
    if (config.selectors.resultArea) {
      const firstItemSelector = `${config.selectors.resultArea} > div:first-child`;

      await sleep(3000);

      const resultId = await page.evaluate((sel) => {
        const firstItem = document.querySelector(sel);
        return firstItem ? firstItem.id : null;
      }, firstItemSelector);

      if (!resultId) {
        throw new Error(`Không tìm thấy kết quả nào trong ${config.selectors.resultArea}`);
      }
      console.log(`  • Tìm thấy kết quả mới: id=${resultId}`);

      await page.click(`${firstItemSelector} a[href*="prj=${resultId}"]`);
      console.log(`  • Đã bấm nút tải xuống`);
    }

    const download = await downloadPromise;
    await download.saveAs(destPath);

    console.log(`✅ ${item.id} (${item.hanzi}) — đã lưu ${path.relative(ROOT, destPath)}`);
    return { id: item.id, status: 'ok' };
  } catch (err) {
    console.error(`❌ ${item.id} (${item.hanzi}) — lỗi: ${err.message}`);
    return { id: item.id, status: 'error', error: err.message };
  }
}

async function selectVoice(page) {
  const { voiceName, selectors } = config;
  if (!voiceName || !selectors.openVoiceDialog) return;

  await sleep(1000);
  await page.click(selectors.openVoiceDialog);
  console.log('  • Đã mở hộp thoại chọn giọng');

  await sleep(1000);
  await page.fill(selectors.voiceSearchInput, voiceName);
  console.log(`  • Đã nhập tên giọng: ${voiceName}`);

  await sleep(1000);
  await page.press(selectors.voiceSearchInput, 'Enter');
  console.log('  • Đã nhấn Enter để tìm kiếm');

  await sleep(1000);

  // Scope theo đúng data-value = voiceName vì danh sách giọng chỉ ẩn/hiện
  // bằng CSS (không xoá khỏi DOM), nếu bấm selector chung sẽ khớp nhiều dòng.
  const selectButtonSelector = `li[data-value="${voiceName}"] ${selectors.voiceSelectButton}`;
  await page.hover(selectButtonSelector);
  console.log('  • Đã hover vào nút Select');

  await sleep(1000);
  await page.click(selectButtonSelector);
  console.log('  • Đã click vào nút Select');
  console.log(`Đã chọn giọng: ${voiceName}\n`);
}

async function main() {
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const items = [...SINGLES, ...DOUBLES];
  console.log(`Bắt đầu test web nội bộ (${config.baseUrl}) cho ${items.length} từ...`);
  console.log(
    `Delay giữa các từ: ${config.delayMs}ms | ` +
    `Delay sau khi nhập trước khi bấm generate: ${config.delayAfterFillMs || 0}ms | ` +
    `Headless: ${config.headless}\n`
  );

  const browser = await chromium.launch({ headless: config.headless });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const results = [];
  for (const item of items) {
    const result = await processItem(page, item);
    results.push(result);
    if (result.status !== 'skipped') await sleep(config.delayMs);
  }

  await browser.close();

  const ok = results.filter((r) => r.status === 'ok').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const failed = results.filter((r) => r.status === 'error');

  console.log(`\n=== Tổng kết ===`);
  console.log(`Thành công: ${ok} | Đã có sẵn: ${skipped} | Lỗi: ${failed.length}`);
  if (failed.length) {
    console.log('\nCác từ lỗi (chạy lại "node tools/test-internal-web.js" sẽ tự thử lại):');
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }
}

main();
