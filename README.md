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
- **Tự động đọc khi học**: bật mặc định (Tôi → Học). Người dùng cũ được bật một lần khi cập nhật (đánh dấu bằng trường `ap`); tắt đi thì giữ nguyên, kể cả khi đồng bộ cloud.
- **Bỏ hai cài đặt "Ẩn từ chức năng" và "Ẩn từ hiếm"**: người học học hết toàn bộ từ trong cấp độ đã chọn (từ chức năng vẫn được xếp xuống cuối mỗi cấp).
- `sw.js` tăng lên `vv-v10` để máy đã cài nhận `words.js` mới.

## Bản v3.2 – tab Nghe (🎧)
- Thanh dưới có thêm tab **Nghe**: khung phát playlist YouTube (nhúng bằng iframe, dùng `youtube-nocookie.com`) dính ở trên, nội dung của video đang phát cuộn bên dưới. Đổi ID playlist ở hằng `NPL` trong `js/app.js`.
- Nội dung mỗi video nằm ở `listen/t/NN.txt` (NN = thứ tự video trong playlist), xem `listen/README.md`. Đổi PDF sang txt bằng `python3 tools/pdf_to_txt.py <thư mục PDF>`.
- Chạm một từ trong nội dung để nghe phát âm. Nút **Ẩn/Hiện** để nghe trước, xem nội dung sau. App nhớ video đang nghe.
- Vào tab Nghe thì nhạc nền tự tắt, rời tab thì bật lại (nếu đang bật).
- Video cần mạng và có thể có quảng cáo (do chủ kênh bật). Nội dung `.txt` được cache nên đọc lại được khi offline.
- `sw.js` lên `vv-v11`.

## Bản v3.3 – Nghe: nội dung chạy đồng bộ với video
- Nội dung bên dưới video **sáng dòng đang nói và tự cuộn theo** (đọc giờ phát qua YouTube IFrame API). Chạm vào **giờ ở đầu dòng** để tua video tới câu đó. Tự cuộn tạm dừng 6 giây khi bạn tự vuốt; nút **🔄 Tự cuộn** để bật/tắt hẳn.
- Nguồn giờ, ưu tiên từ cao xuống thấp: (1) mốc bạn ghim, (2) dòng có `[m:ss]` trong file `.txt`, (3) **ước lượng** theo độ dài chữ + độ dài video (giờ có dấu `~`). File `.txt` thô chưa có giờ thì chỉ ở mức (3) nên sẽ lệch dần.
- **📍 Ghim** (chỉnh tay nhanh): bấm 📍 → vừa nghe vừa chạm giờ ở đầu câu đang được đọc → app ghim câu đó vào giây hiện tại và nội suy lại các câu quanh nó (chỉ cần ghim vài điểm, ví dụ đầu mỗi Track). Mốc lưu trong máy theo từng video; **↺ Xoá mốc** để bỏ.
- **Giờ chuẩn cho cả 47 video**: `pip install yt-dlp` rồi `python3 tools/align_yt.py` – lấy phụ đề tự động của từng video trong playlist, khớp với chữ của bạn và ghi `[m:ss]` vào `listen/t/NN.txt`. Dòng không khớp được vẫn nội suy.
- `tools/clean_subs.py`: chuẩn hoá bộ phụ đề thô (UTF-16, dính dấu `"`, đoạn dài, đầu file tiếng Việt) thành `listen/t/NN.txt` – mỗi dòng ~1 câu.
- Vá lỗi có sẵn: khi Firebase không tải được (hoặc ngoại tuyến), `refresh()` chạy trước khi `tab`/`V` được khai báo làm app đứng ở màn hình "Đang tải…". Nay khai báo sớm và có kiểm tra.
- `sw.js` lên `vv-v12` (thêm `js/sync.js`).
- Tab Nghe: che 2 góc dưới của khung video (nút sao chép liên kết và logo YouTube) bằng tấm chắn trong suốt `.vx` (css/style.css) để không chạm nhầm ra ngoài app. `sw.js` lên `vv-v13`.
- Che thêm góc trên trái khung video (avatar kênh + tiêu đề) bằng `.vx.t`; nút tiếng/CC/cài đặt bên phải vẫn dùng được. `sw.js` lên `vv-v14`.
- Tab Nghe: tắt nút phóng to toàn màn hình của YouTube (`fs:0`) vì ở chế độ đó iframe tách khỏi các tấm chắn `.vx`, avatar/tiêu đề/logo lại bấm được. `sw.js` lên `vv-v15`.

## Bản v3.4 – tab Nghe gọn hơn
- **Nút phóng to video riêng của app** (góc dưới bên phải khung video, thay cho nút toàn màn hình của YouTube đã bị che). Android/iPad dùng toàn màn hình thật và khoá xoay ngang; iPhone (không có Fullscreen API) phóng to bằng CSS và tự xoay ngang. Bấm lại nút (hoặc Esc) để thu nhỏ.
- **Tên video ngắn gọn** dưới "Video X/47": `Luyện Nghe Bài X`; riêng video 6–9 (loại vừa nghe vừa đọc) là `Luyện Nghe Và Đọc Bài X`. Sửa danh sách loại này ở hằng `NRD` trong `js/app.js`.
- **Bỏ dòng tiêu đề video** (kiểu "Luyện nghe tiếng Anh thụ động…") khỏi 44 file `listen/t/NN.txt`; `tools/clean_subs.py` không ghi lại dòng này nữa. Lưu ý: số dòng trong file đã đổi nên các mốc 📍 ghim cũ của người dùng (nếu có) sẽ tự bị bỏ qua.
- Thêm tấm chắn giữa hàng dưới khung video để chặn nút **Video khác** của YouTube; khi phóng to các tấm chắn tự to ra theo giao diện YouTube.
- `sw.js` lên `vv-v18`.
- **Cả 47 video đã có giờ chuẩn** `[m:ss.s]` ở đầu mọi dòng (lấy từ 47 file `.srt`, khớp từng dòng với nội dung), nên không cần ghim 📍 thủ công nữa. `js/sync.js` giờ đọc được phần lẻ giây.

## Bản v3.5 – tab Nghe chia 2 mục
- Đầu tab Nghe có 2 nút chuyển mục: **⏱ Nghe 5 phút** (Quick Listening) và **🎧 Nghe sâu** (Deep Listening). App nhớ mục đang nghe và video đang nghe của **từng mục** riêng (`vvm`, `vvlq`, `vvl`).
- **Nghe 5 phút**: playlist `PLnGTZv-nqOPqy42APYZywQIch__nFugFx` (45 video), phụ đề ở `listen/q/NN.txt`. Đủ **45/45** file sub (bộ `aub2` thiếu video 18, 21, 24 nên được bổ sung riêng từ 3 file `.srt` sạch, có dấu câu thật). Ba video này chưa có ID trong `NM.q.ids` nên ghép theo thứ tự playlist.
- **Nghe sâu**: playlist cũ (47 video), phụ đề `listen/t/NN.txt` **thay hoàn toàn** bằng bộ `sub` mới (đủ 47 file). Nội dung giờ là chữ của chính file sub (không còn tên người nói / tiêu đề Track từ PDF; Track/Exercise vẫn hiện thành tiêu đề nhỏ).
- Hằng `NM` trong `js/app.js` giữ playlist + thư mục + danh sách ID video của mục 5 phút; nếu thứ tự playlist khác thứ tự file thì app tự ghép sub theo ID video.
- `tools/srt_to_txt.py`: dựng lại `listen/q|t/NN.txt` từ file `.srt` (gộp phụ đề cuốn chiếu bị lặp, bỏ chấm câu/chữ hoa giả, giờ `[m:ss.s]`, video > 1 giờ dùng `[h:mm:ss.s]`).
- Mốc 📍 ghim cũ của mục Nghe sâu bị bỏ qua vì số dòng trong file đã đổi.
- `sw.js` lên `vv-v19`.

## Bản v3.6 – khung phát video sạch (tab Nghe)
- **Khung video chỉ còn video**: không còn tiêu đề, avatar kênh, logo YouTube, nút sao chép liên kết, "Video khác"/gợi ý cuối video. Cách làm: iframe chạy `controls:0`, **không nhận chạm** (`pointer-events:none`) và được dựng **cao hơn khung nhìn** rồi bị `.vb` cắt phần dư, nên mọi thứ YouTube vẽ ở mép trên/dưới nằm ngoài vùng thấy được (hàm `fit()` trong `js/vplayer.js`). Các tấm chắn `.vx` cũ đã bỏ.
- **Điều khiển riêng của app** (`js/vplayer.js`, class `VPlayer`): chạm vào video để phát/tạm dừng · thanh tua kéo được (có phần đã tải) + giờ hiện tại/tổng · nút **CC** bật/tắt phụ đề · nút **⚙** mở cài đặt: **Tốc độ phát**, **Chất lượng video**, **Phụ đề** (chọn ngôn ngữ) và **Cỡ chữ phụ đề** · nút **phóng to** (giữ nguyên logic cũ). Thanh điều khiển tự ẩn sau 3 giây khi đang phát; đang tạm dừng thì luôn hiện.
- Tốc độ, chất lượng, phụ đề, ngôn ngữ phụ đề, cỡ chữ được nhớ trong máy (`vvsp`, `vvq`, `vvcc`, `vvcl`, `vvcf`) và áp lại cho mỗi video.
- Lưu ý: YouTube coi việc chọn chất lượng là "gợi ý" (`setPlaybackQuality`) nên có thể không đổi ngay hoặc không đổi được trên một số máy; app sẽ báo nếu thấy YouTube vẫn giữ mức khác. Bật/tắt phụ đề dùng module `captions` của YouTube (không có trong tài liệu chính thức, nếu YouTube đổi có thể phải chỉnh lại).
- Dự phòng iPhone: nếu bấm phát mà 1,5 giây sau video vẫn chưa chạy (iOS đòi chạm thẳng vào video), app tự mở khoá iframe để chạm vào nút phát của YouTube; video chạy là khoá lại.
- Hết video thì che màn hình gợi ý của YouTube bằng nền của app, chạm để xem lại. Video lỗi/không nhúng được thì báo "Video này không phát được".
- Thêm `js/vplayer.js` vào danh sách cache; `sw.js` lên `vv-v20`.
