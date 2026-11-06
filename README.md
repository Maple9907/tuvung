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

