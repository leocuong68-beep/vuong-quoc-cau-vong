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
