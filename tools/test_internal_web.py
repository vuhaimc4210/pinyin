#!/usr/bin/env python3
"""
Tool test tự động cho web TTS NỘI BỘ của bạn (mạng nội bộ, hạ tầng tự vận
hành). Dùng Playwright để điều khiển trình duyệt thật: nhập từng từ trong
data.js -> bấm nút tạo giọng -> chờ tải file -> lưu vào audio/<id>.mp3.

KHÔNG dùng tool này để nhắm vào các dịch vụ bên thứ ba (vd: speechgen.io) mà
bạn không sở hữu hạ tầng -- chỉ dùng cho web do chính bạn vận hành.

Cài đặt (chạy 1 lần, trong thư mục gốc dự án):
    python -m venv .venv
    .venv\\Scripts\\Activate.ps1          (PowerShell)
    pip install -r tools/requirements.txt
    playwright install chromium

Cấu hình:
    1. Copy tools/internal-web.config.example.json thành
       tools/internal-web.config.json
    2. Điền baseUrl + CSS selector đúng theo trang web nội bộ của bạn

Chạy:
    python tools/test_internal_web.py

An toàn khi chạy lại nhiều lần: từ nào đã có file trong audio/ sẽ được bỏ
qua. Có delay giữa các từ (mặc định 10s, chỉnh trong config) để tránh gây
tải dồn dập lên server nội bộ của bạn.
"""

import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "audio"
DATA_PATH = ROOT / "data.js"
CONFIG_PATH = Path(__file__).resolve().parent / "internal-web.config.json"


def load_config():
    if not CONFIG_PATH.exists():
        print("[LOI] Chua co file cau hinh.")
        print("   1. Copy tools/internal-web.config.example.json thanh tools/internal-web.config.json")
        print("   2. Dien baseUrl + selector dung theo trang web noi bo cua ban")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_items():
    """Đọc data.js bằng regex đơn giản (không cần Node) để lấy id + hanzi.

    data.js có định dạng cố định kiểu:
      { id: 's001', hanzi: '八', ... }
    Regex dưới đây khớp cả SINGLES lẫn DOUBLES vì cùng cấu trúc id/hanzi.
    """
    text = DATA_PATH.read_text(encoding="utf-8")
    pattern = re.compile(r"id:\s*'([^']+)'\s*,\s*hanzi:\s*'([^']+)'")
    items = [{"id": m.group(1), "hanzi": m.group(2)} for m in pattern.finditer(text)]
    if not items:
        print(f"[LOI] Khong doc duoc item nao tu {DATA_PATH}")
        sys.exit(1)
    return items


def process_item(page, item, config):
    dest_path = AUDIO_DIR / f"{item['id']}.mp3"
    if dest_path.exists():
        print(f"[BO QUA] {item['id']} ({item['hanzi']}) - da co file")
        return {"id": item["id"], "status": "skipped"}

    print(f"\n[BAT DAU] {item['id']} ({item['hanzi']})")

    try:
        selectors = config["selectors"]

        page.goto(config["baseUrl"], wait_until="domcontentloaded")
        print(f"  - Da mo trang {config['baseUrl']}")

        # Trang bi F5 lai moi tu nen giong da chon bi reset, phai chon lai
        select_voice(page, config)

        page.fill(selectors["textInput"], item["hanzi"])
        print("  - Da nhap chu vao o nhap")

        # Nghỉ sau khi nhập chữ, trước khi bấm nút tạo giọng (mô phỏng người
        # dùng thật gõ xong mới bấm / chờ trang xử lý validate ô nhập)
        delay_after_fill = config.get("delayAfterFillMs", 0)
        if delay_after_fill:
            time.sleep(delay_after_fill / 1000)

        with page.expect_download(timeout=config["downloadTimeoutMs"]) as download_info:
            page.click(selectors["generateButton"])
            print("  - Da bam nut tao giong")

            if selectors.get("downloadButton"):
                wait_sel = selectors.get("waitForSelectorBeforeDownload")
                if wait_sel:
                    page.wait_for_selector(wait_sel, timeout=config["downloadTimeoutMs"])
                page.click(selectors["downloadButton"])
                print("  - Da bam nut tai rieng")

            # Nếu trang liệt kê kết quả trong 1 khu vực (vd: #result_area),
            # kết quả vừa tạo là phần tử con đầu tiên. Chờ cố định 3s cho
            # trang xử lý xong rồi bấm link tải (href chứa id, vd: prj=<id>).
            result_area = selectors.get("resultArea")
            if result_area:
                first_item_selector = f"{result_area} > div:first-child"

                time.sleep(3)

                result_id = page.evaluate(
                    "(sel) => { const el = document.querySelector(sel); return el ? el.id : null; }",
                    first_item_selector,
                )

                if not result_id:
                    raise RuntimeError(f"Khong tim thay ket qua nao trong {result_area}")
                print(f"  - Tim thay ket qua moi: id={result_id}")

                page.click(f'{first_item_selector} a[href*="prj={result_id}"]')
                print("  - Da bam nut tai xuong")

        download = download_info.value
        download.save_as(str(dest_path))

        print(f"[OK] {item['id']} ({item['hanzi']}) - da luu {dest_path.relative_to(ROOT)}")
        return {"id": item["id"], "status": "ok"}
    except Exception as err:  # noqa: BLE001
        print(f"[LOI] {item['id']} ({item['hanzi']}) - {err}")
        return {"id": item["id"], "status": "error", "error": str(err)}


def select_voice(page, config):
    voice_name = config.get("voiceName")
    selectors = config["selectors"]
    if not voice_name or not selectors.get("openVoiceDialog"):
        return

    time.sleep(1)
    page.click(selectors["openVoiceDialog"])
    print("  - Da mo hop thoai chon giong")

    time.sleep(1)
    page.fill(selectors["voiceSearchInput"], voice_name)
    print(f"  - Da nhap ten giong: {voice_name}")

    time.sleep(1)
    page.press(selectors["voiceSearchInput"], "Enter")
    print("  - Da nhan Enter de tim kiem")

    time.sleep(1)

    # Scope theo dung data-value = voice_name vi danh sach giong chi an/hien
    # bang CSS (khong xoa khoi DOM), neu bam selector chung se khop nhieu dong.
    select_button_selector = f'li[data-value="{voice_name}"] {selectors["voiceSelectButton"]}'
    page.hover(select_button_selector)
    print("  - Da hover vao nut Select")

    time.sleep(1)
    page.click(select_button_selector)
    print("  - Da click vao nut Select")
    print(f"Da chon giong: {voice_name}\n")


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[LOI] Chua cai Playwright.")
        print("   Chay: pip install -r tools/requirements.txt && playwright install chromium")
        sys.exit(1)

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    config = load_config()
    items = load_items()

    print(f"Bat dau test web noi bo ({config['baseUrl']}) cho {len(items)} tu...")
    print(
        f"Delay giua cac tu: {config['delayMs']}ms | "
        f"Delay sau khi nhap truoc khi bam generate: {config.get('delayAfterFillMs', 0)}ms | "
        f"Headless: {config['headless']}\n"
    )

    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=config["headless"])
        context = browser.new_context(accept_downloads=True)
        page = context.new_page()

        for item in items:
            result = process_item(page, item, config)
            results.append(result)
            if result["status"] != "skipped":
                time.sleep(config["delayMs"] / 1000)

        browser.close()

    ok = sum(1 for r in results if r["status"] == "ok")
    skipped = sum(1 for r in results if r["status"] == "skipped")
    failed = [r for r in results if r["status"] == "error"]

    print("\n=== Tong ket ===")
    print(f"Thanh cong: {ok} | Da co san: {skipped} | Loi: {len(failed)}")
    if failed:
        print('\nCac tu loi (chay lai "python tools/test_internal_web.py" se tu thu lai):')
        for f in failed:
            print(f"  - {f['id']}: {f['error']}")


if __name__ == "__main__":
    main()
