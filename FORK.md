# Vương Quốc Cầu Vồng — bản fork edukiz cho bé Mia

Fork từ https://github.com/timmalich/edukiz (MIT), ngày 12/11/2026.

## Đã đổi so với bản gốc
- Thêm mục **Princess** ở trang chính: lộ trình 39 màn, mở sẵn tất cả (đổi `openAll` trong `PrincessNavPage.vue` để mở khoá dần); mỗi màn tối đa 3 sao.
  - `MakeupGame.vue`: trang điểm (son, phấn má, phấn mắt, nơ cài tóc), 3 cấp.
  - Màn tự làm: `DressUpGame.vue` (thay đồ, 3 cấp), `FeedPonyGame.vue` (cho pony ăn táo, 3 cấp).
  - Màn dạng câu hỏi dùng chung `QuizGame.vue`, nội dung khai báo trong `stages.js`: hình khối, nhận số, màu hoa, đếm, nhiều hơn/ít hơn, quy luật, cộng, trừ, chữ cái.
  - Thêm màn mới: thêm một dòng vào `STAGES` trong `stages.js` (và câu thoại trong `princessLines.js` nếu cần).
- Nhân vật 3D chibi: Mia (7 màu váy), Pony, Tin Tin, Mommy, Daddy trong `public/img/princess/`. Ảnh gốc tạo bằng Recraft; `mia_*.webp`, `crown_*`, `bow_*`, `flower_*` là bản đổi màu từ ảnh màu xanh.
- Nút EN/VI đổi ngôn ngữ cho cả chữ và giọng. Trạng thái lưu ở `state.js` (localStorage: `princess_lang`, `princess_stars`).
- Cho phụ huynh: ở trang lộ trình, bấm vào Mia 7 lần để mở khoá tất cả các màn.
- Tiêu đề menu đổi từ tiếng Đức sang tiếng Anh. 5 trò gốc vẫn dùng âm thanh tiếng Đức ở `public/sounds/de/`.

## Chạy
- Máy cần Node 24 trở lên (bản gốc yêu cầu; Node 22 chạy được với `npm ci --engine-strict=false`).
- Cài: `npm ci`. Build: `npx vite build`. Test: `npx vitest run`.
- Xem thử trong mạng Wi-Fi: `caffeinate -dimsu python3 -m http.server 8080 -d dist` rồi mở `http://<IP của Mac>:8080`.

## Giọng đọc
- File: `public/sounds/<en|vi>/mia/<key>.mp3`; thiếu file thì đọc bằng giọng của máy.
- Danh sách câu (566 câu, có `en` và `vi`): `scripts/princess-lines.json`, tạo lại bằng `node scripts/princess-lines.mjs`.
- Tạo giọng MiniMax "Lovely_Girl": `python3 _tts/tts2.py <lines.json> <en|vi> <thư mục ra>`. Script đọc `MINIMAX_PLAN_API_KEY` từ `~/.config/leo/keys.env`, bỏ qua file đã có, và tự chờ khi bị giới hạn số lần gọi mỗi phút.

## Đóng gói APK (Capacitor 7)
- Cần: JDK 21, Android SDK (platform 35, build-tools 35.0.0), biến `ANDROID_HOME`.
- Lệnh: `npx vite build && npx cap sync android && cd android && ./gradlew assembleDebug`
- File ra: `android/app/build/outputs/apk/debug/app-debug.apk` (bản debug, ký bằng khoá debug; chưa phải bản phát hành).
- Tên file trong `public/sounds/de` có dấu, nên khi build phải đặt `LC_ALL=C.UTF-8` và `-Dsun.jnu.encoding=UTF-8 -Dfile.encoding=UTF-8`.
- `dist/` trên máy này là bản build trước khi có giọng; chạy lại `npx vite build` để có bản mới.
- Khoá ký bản debug nằm ở `android/keystore/debug.keystore`. Phải dùng đúng khoá này (chép vào `~/.android/debug.keystore`) thì APK mới cài đè lên bản cũ được mà không mất sao của bé.
- Mỗi lần ra bản mới: tăng `versionCode` trong `android/app/build.gradle`.

## Cập nhật tự động (từ bản 1.4)
- Game chạy tại https://leocuong68-beep.github.io/vuong-quoc-cau-vong/ (nhánh `gh-pages` của repo `leocuong68-beep/vuong-quoc-cau-vong`; mã nguồn ở nhánh `main`).
- APK từ bản 1.4 chỉ là vỏ mở trang đó: build bằng `VQCV_REMOTE=1 npx cap sync android` rồi `gradle assembleDebug`.
- Ra bản mới: `npx vite build`, chép nội dung `dist/` (kèm file `.nojekyll`) lên nhánh `gh-pages`. Tablet tự lấy bản mới khi mở app có mạng; không cần cài lại APK.

## Học viện Tin Tin (từ 15/11/2026)
- Hồ sơ riêng của Tin Tin: `#/tintin` (giao diện tối, chững chạc). Ở trang của Mia có nút "Tin Tin" để chuyển sang. Máy nào đã mở `#/tintin` thì lần sau mở game sẽ vào thẳng trang của Tin Tin.
- 4 môn: Tiếng Hy Lạp, Tiếng Anh, Toán, Vật lý & Robot. Nội dung ở `src/components/academy/curriculum/<môn>.js`; mỗi bài sinh 10 câu ngẫu nhiên.
- Luật: đúng 8/10 mới qua bài, bài sau mới mở. 10/10 = 3 sao, 9 = 2 sao, 8 = 1 sao. Sao vào ví chỉ khi đạt kết quả tốt hơn trước (ôn bài cũ: 1 sao/môn/ngày).
- Nhiệm vụ ngày: qua mỗi môn 1 bài → mở Minecraft cho hôm nay (+5 sao thưởng). Trạng thái lưu ở localStorage `academy_minecraft_open` (= ngày hôm nay khi đã mở) để nối với máy chủ Minecraft sau.
- Phụ huynh: bấm avatar Tin Tin 7 lần để mở hết các bài. Nút góc trên đổi giọng hướng dẫn Tiếng Việt / Ελληνικά.
- Giọng: hiện dùng giọng có sẵn của máy (Mac có giọng Hy Lạp Melina). File thu sẵn đặt ở `public/sounds/academy/<vi|el|en>/<id>.mp3`, liệt kê trong `public/sounds/academy/manifest.json` (id = hàm `lineId` trong `academySpeech.js`).
- Test nội dung: `npx vitest run tests/unit/academy.spec.js`.

## App macOS "Học viện Tin Tin" (từ 15/11/2026)
- Mã ở `macos/` (Electron 33): cửa sổ mở thẳng `#/tintin` trên GitHub Pages, nên game tự cập nhật, không cần cài lại app.
- Đóng gói (chạy được cả trên Linux): `cd macos && npm i -D electron@33 @electron/packager && npx @electron/packager . "Hoc vien Tin Tin" --platform=darwin --arch=x64 --icon=icon.icns --out=out --app-bundle-id=com.leocuong.hocvientintin`, rồi nén bằng `zip -qry` để giữ symlink.
- App chưa ký Apple: lần đầu mở bằng chuột phải → Open (hoặc System Settings → Privacy & Security → Open Anyway).

## Khóa Minecraft trong app macOS (bản 1.1, 15/11/2026)
- Trang Tin Tin có nút "CHƠI MINECRAFT" (chỉ hiện khi chạy trong app macOS; `window.hocVienApp` do `macos/preload.js` cung cấp). Nút sáng khi xong nhiệm vụ ngày.
- App kiểm tra 2 giây/lần: hôm nay chưa xong nhiệm vụ mà launcher (`Minecraft.app/Contents/MacOS`) hoặc game (`net.minecraft.client.main.Main`) đang chạy thì tắt và mở lại trang học.
- App tự cài LaunchAgent `~/Library/LaunchAgents/com.leocuong.hocvientintin.plist` (chạy khi đăng nhập, tự bật lại nếu bị Force Quit). Thoát app cần mã phụ huynh (mặc định 6868, đổi trong `~/Library/Application Support/Hoc vien Tin Tin/hoc-vien.json`, khóa `parentCode`).
- Gỡ hẳn khóa (Terminal trên MacBook): `launchctl bootout gui/$(id -u)/com.leocuong.hocvientintin; rm ~/Library/LaunchAgents/com.leocuong.hocvientintin.plist`.

## Lớp học của Mia (từ 15/11/2026)
- `#/mia`: cùng khung với Học viện Tin Tin (cùng component, `src/components/academy/profiles.js` chọn hồ sơ theo `route.meta.profile`), giao diện pastel công chúa, chữ Baloo 2.
- 4 môn dễ hơn cho bé mẫu giáo, mỗi câu 3 đáp án: Tiếng Hy Lạp (chữ cái, số, màu, con vật, gia đình), Tiếng Anh (màu, số, con vật, trái cây, cơ thể, chữ A–J), Toán (đếm, tìm số, nhiều/ít, to/nhỏ, hình, quy luật, thêm/bớt đến 5), Khám phá & Robot (ngày/đêm, nóng/lạnh, giác quan, thiên nhiên, nổi/chìm, nam châm, robot 1–2 bước). Nội dung ở `curriculum/mia/`.
- Tiến độ riêng ở localStorage `mia_academy_*`. Xong mỗi môn 1 bài thì Mia "được vương miện" và +5 sao (không có Minecraft).
- Giọng phản ứng bé gái ở `public/sounds/academy/vox_mia/` (Gemini TTS giọng Leda qua fal); hình biểu cảm `img/academy/mia_{think,cheer,wow,oops}.webp`; nền `mia_world.webp`; biểu tượng môn `mia_block_*.webp` (Recraft).
- Trang chính của Mia có nút "📚 Lớp học" để vào.
- Giọng đọc Lớp học của Mia (15/11/2026): 381 câu (vi/el/en) thu bằng MiniMax gói Plan, giọng Lovely_Girl, ở `public/sounds/academy/<vi|el|en>/<id>.mp3`, liệt kê trong `manifest.json`. Thêm/sửa câu: chạy `npx vitest run scripts/collect-mia-lines.spec.js --dir scripts` để lấy danh sách câu (ra `/tmp/mia-lines.json`), chép thành `_tts/mia-school-lines.json` trên Mac rồi chạy `caffeinate -dimsu python3 scripts/tts_mia_school.py` (bỏ qua câu đã có).
