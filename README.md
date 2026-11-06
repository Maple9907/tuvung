# Học Từ Vựng

Ứng dụng web trên điện thoại giúp bạn học từ vựng tiếng Anh mỗi ngày: nhẹ, nhanh, học được cả khi không có mạng.

## Tính năng

- **5.000 từ vựng thông dụng** từ A1 đến C1, kèm phiên âm, nghĩa tiếng Việt, ví dụ và bản dịch ví dụ.
- **Flashcard thông minh**: chạm để lật thẻ, nghe phát âm, và ứng dụng tự lên lịch ôn lại đúng lúc bạn sắp quên (lặp lại ngắt quãng).
- **6 chế độ chơi** để luyện từ theo cách vui hơn.
- **Thiên hà từ vựng 3D**: mỗi từ đã học là một ngôi sao, càng học nhiều thiên hà càng sáng.
- **Âm thanh hiệu ứng** tự tạo bằng code (đúng/sai, combo, lật thẻ, hoàn thành, lên cấp), tắt/bật trong mục Tôi.
- **Điểm kinh nghiệm, chuỗi ngày học và cấp độ** để giữ động lực.
- **Màn hình đăng nhập đầu tiên**: Google, email/mật khẩu hoặc **tài khoản khách**.
- **Bảng xếp hạng**: đăng nhập bằng Google hoặc email để đồng bộ tiến độ giữa các thiết bị và thi đua cùng mọi người.
- **Tài khoản khách (online)**: dùng đăng nhập ẩn danh của Firebase nên vẫn đồng bộ, chơi online và có tên trên bảng xếp hạng. Có thể liên kết Google/email sau (Tôi → Tài khoản) để giữ tiến độ. Nếu không kết nối được, app tự chuyển sang chế độ khách ngoại tuyến (vẫn xem được bảng xếp hạng).
- **Nhạc nền**: nhạc êm tự tạo bằng code (không cần file mp3, chạy offline). Nút 🎵 trên thanh trên để bật/tắt, chỉnh âm lượng trong Tôi → Âm thanh. Nhạc bắt đầu sau lần chạm đầu tiên (quy định của trình duyệt) và tự tạm dừng khi bạn thoát khỏi app.
- **Cài về máy**: nút "⬇ Cài về máy" trên thanh trên (tự ẩn khi đã cài). Android/Chrome cài trực tiếp; iPhone hiện hướng dẫn Safari → Chia sẻ → Thêm vào MH chính. Cần mở bằng https.
- **Giao diện gọn cho điện thoại**: mỗi màn hình vừa khít một khung hình, thẻ học tự co theo chiều cao màn hình, mục Tôi chia thành 4 tab (Học, Âm thanh, Tài khoản, Xếp hạng).

Chưa đăng nhập vẫn học bình thường, tiến độ được lưu ngay trên máy.

## Tên hiển thị

Tên không được trùng (không phân biệt hoa/thường, khoảng trắng thừa được gộp), kiểm tra ngay khi gõ. Mỗi tên được giữ chỗ trong `names/<tên>` của Realtime Database. Mỗi tài khoản đổi tên tối đa 1 lần / 24 giờ (ô đổi tên bị làm mờ trong thời gian đó).

**Sau khi cập nhật, cần đăng lại Rules**: `firebase deploy --only database` hoặc dán nội dung `database.rules.json` vào Firebase Console → Realtime Database → Rules → Publish.

## Cấu hình Firebase cho tài khoản khách

Vào Firebase Console → **Authentication → Sign-in method → Anonymous → Enable**. Không cần sửa `database.rules.json`: tài khoản khách cũng là người dùng đã xác thực (`auth != null`), còn bảng xếp hạng cho phép đọc công khai.

## Đăng nhập / đăng ký bằng email

- Form có 2 tab **Đăng nhập** / **Đăng ký**, kiểm tra ngay trên form (email hợp lệ, mật khẩu ≥ 6 ký tự, nhập lại mật khẩu), nút hiện/ẩn mật khẩu và trạng thái "Đang xử lý…" (khoá nút để không bấm trùng). Lỗi hiện ngay trong form, không còn popup của trình duyệt.
- Tab Đăng ký kiểm tra email đã đăng ký chưa khi rời ô email; nếu Firebase đang bật **Email enumeration protection** thì việc kiểm tra sớm này không có kết quả, nhưng bấm **Tạo tài khoản** vẫn báo "Email đã được đăng ký" kèm nút chuyển sang đăng nhập.
- Cần bật **Authentication → Sign-in method → Email/Password** trong Firebase Console.


## Bản v3 – thay đổi lõi học (giữ nguyên đăng nhập, Firebase, bảng xếp hạng, nhạc, thiên hà)
- Lịch ôn: SM-2 → FSRS (js/vendor/fsrs.mjs, MIT). Thẻ cũ tự quy đổi khi ôn lần kế tiếp, tiến độ cũ giữ nguyên (words.js giữ thứ tự cũ).
- Từ mới được kiểm tra ngay (đúng 2 lần mới vào lịch ôn); ôn tập tự chấm đúng/sai.
- Game không đổi lịch khi đúng; sai thì từ ôn sớm hơn. XP game giảm.
- Three.js/Firebase tải động: lỗi CDN không làm kẹt phần học.
- Dữ liệu: `python3 tools/build_data.py` (pip install wordfreq) rồi `python3 tools/patch_app.py` chỉ dùng để dựng lại từ bản gốc.

## Bản v3.1 – vá lỗi sau khi đối chiếu với bản main
- **Lỗi `LS`**: trạng thái từng từ trong phiên học không bao giờ được xoá, nên app mở liên tục nhiều ngày sẽ bỏ qua bước chấm lịch của thẻ ôn. Nay xoá mỗi khi dựng lại hàng đợi, và hàng đợi đã xong của ngày hôm trước sẽ được dựng lại.
- **Phiên âm**: trả về phiên âm Anh-Anh gốc (v3 từng đổi 4.034 từ sang kiểu Mỹ, lệch với giọng đọc mặc định en-GB). `tools/ipa.py` đã bỏ, `build_data.py` giữ phiên âm gốc.
- **Khởi động**: three.js và Firebase tải song song, mạng treo chờ tối đa 8 giây (trước đó 16 giây).
- `sw.js` tăng lên `vv-v10` để máy đã cài nhận `words.js` mới.
