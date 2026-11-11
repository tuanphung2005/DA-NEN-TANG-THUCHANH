# Bài 5 – Chat realtime với Firebase + Cloudinary

Ứng dụng React Native (Firebase Realtime Database) hỗ trợ chat 1-1 và chat nhóm:
trạng thái đang gõ, đã gửi/đã xem, hoạt động gần nhất, thu hồi tin, cảm xúc,
gửi ảnh qua Cloudinary, thông báo thật và badge chưa đọc.

Toàn bộ icon chức năng dùng `lucide-react-native` (Camera, Image, MapPin, Send,
Copy, Undo2, Users, Heart, Bell…). Cảm xúc 👍❤️😂😮😢 giữ nguyên vì là nội dung tin nhắn.

## 1. Cấu hình Firebase

1. Tạo project tại [Firebase Console](https://console.firebase.google.com), thêm app Android/iOS.
2. Bật **Authentication → Sign-in method → Email/Password**.
3. Bật **Realtime Database**.
4. Dán cấu hình app vào `firebaseConfig` trong `src/services/firebase.ts`.
5. Mở tab **Rules**, dán toàn bộ `database.rules.json` rồi **Publish**.
   File đã khai báo sẵn `.indexOn: ["createdAt"]` cho `messages/{convId}`.

## 2. Cấu hình Cloudinary (unsigned upload)

1. Tạo tài khoản Cloudinary → copy **Cloud name**.
2. Vào **Settings → Upload → Upload presets → Add upload preset**:
   - **Signing mode: Unsigned**
   - (tuỳ chọn) Folder: `chat`
3. Mở `src/services/uploadService.ts`, thay:
   ```ts
   const CLOUD_NAME = 'YOUR_CLOUD_NAME';
   const UPLOAD_PRESET = 'YOUR_UNSIGNED_PRESET';
   ```
4. Không đặt API key/secret trong app. Code chỉ gọi
   `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload` với `upload_preset`.

Ảnh được thu nhỏ bằng `maxWidth/maxHeight: 1024` của `react-native-image-picker`
trước khi upload; database chỉ lưu `imageUrl` (secure_url).

## 3. Cài đặt và chạy

`react-native-image-picker` và `@react-native-clipboard/clipboard` là native module
nên phải build lại app (không chỉ reload JS):

```sh
npm install
npm run android
# iOS: bundle exec pod install && npm run ios
```

iOS đã khai báo `NSCameraUsageDescription` và `NSPhotoLibraryUsageDescription`
trong `ios/thuchanh_danentang/Info.plist`. Android không cần quyền camera
(thư viện dùng intent hệ thống).

## 4. Dữ liệu

```
users/{uid}:              { name, email, online, lastSeen }
conversations/{convId}:   { type, name, members, createdBy, createdAt,
                            lastMessage, lastSenderId, lastSenderName,
                            lastType, updatedAt }
messages/{convId}/{msgId}:{ senderId, senderName, type, text, imageUrl,
                            latitude, longitude, createdAt, recalled,
                            reactions: { uid: emoji } }
userChats/{uid}/{convId}: { type, title, peerId, lastMessage, lastSenderId,
                            lastSenderName, lastType, updatedAt, unread }
readStatus/{convId}/{uid}: timestamp đọc cuối
typing/{convId}/{uid}:     true
active/{uid}:              convId đang mở (dọn bằng onDisconnect)
notifications/{uid}/{id}:  { type, convId, fromUid, text, createdAt, read }
```

Gửi tin dùng **một** `update(ref(db), {...})` nhiều đường dẫn: tin nhắn,
`lastMessage`, `userChats` của mọi thành viên; unread tăng bằng `increment(1)`.
Thu hồi chỉ đánh dấu `recalled: true` và cập nhật lại preview nếu là tin cuối.

## 5. Mã nguồn chính

- `src/services/auth.ts` – đăng ký/đăng nhập/đăng xuất, presence + `lastSeen` + `onDisconnect`.
- `src/services/users.ts` – danh bạ realtime.
- `src/services/chatService.ts` – cuộc trò chuyện, gửi tin, phân trang, typing,
  đã đọc, thu hồi, cảm xúc, `userChats`.
- `src/services/groupService.ts` – tạo nhóm + thông báo thêm thành viên.
- `src/services/notificationService.ts` – ghi/đọc thông báo, badge, `active/{uid}`.
- `src/services/uploadService.ts` – chọn/chụp ảnh + upload Cloudinary.
- `src/screens/CreateGroup` – màn hình tạo nhóm.
- `src/screens/Notifications` – thông báo thật, đánh dấu đã đọc.

Mọi `onValue` đều trả hàm huỷ và được gọi trong cleanup của `useEffect`.

## 6. Kịch bản kiểm thử / chụp ảnh

Chạy 3 máy (hoặc 2 máy + đổi tài khoản):

1. A gõ trong chat 1-1 → B thấy “đang soạn tin…”, tự tắt sau 3 giây.
2. B mở chat → A thấy tin cuối “Đã xem kèm giờ”; B không mở → “Đã gửi”.
3. B tắt app → A thấy “Hoạt động X phút trước”.
4. Nhấn giữ tin của A → Thu hồi → cả hai máy hiện “Tin nhắn đã được thu hồi”;
   nếu là tin cuối, Home cũng đổi theo.
5. Nhấn giữ tin → thả ❤️ / 👍 → hiện dưới bong bóng kèm số lượng.
6. Bấm Camera → Chụp ảnh / Chọn từ thư viện → bong bóng tạm có loading → ảnh;
   tắt mạng để thấy nút **Thử lại**.
7. Danh bạ → **Tạo nhóm** → chọn ≥ 2 người → nhóm hiện tên người gửi, số online.
8. Gửi tin khi B đang ở màn khác → badge Thông báo của B tăng; mở thông báo →
   đúng cuộc trò chuyện và badge giảm.
9. Kéo lên đầu chat để tải thêm 20 tin cũ, danh sách không nhảy.

## 7. Luật bảo mật (tóm tắt)

- `messages/{cid}`: chỉ thành viên trong `conversations/{cid}/members` được đọc;
  chỉ được tạo tin với `senderId == auth.uid`.
- `messages/{cid}/{msgId}/recalled`: chỉ người gửi (`senderId`) được ghi.
- `reactions/{uid}`: chỉ chính `uid` được ghi cảm xúc của mình.
- `typing/{cid}/{uid}`: chỉ chính `uid` và phải là thành viên.
- `userChats/{uid}`: chỉ đọc của mình; thành viên cuộc trò chuyện được ghi
  unread/preview cho người nhận (phục vụ multi-path update).
- `notifications/{uid}`: chỉ đọc của mình; người tạo phải là thành viên cuộc trò chuyện.
- `conversations/{cid}`: chỉ tạo được khi `members` chứa `auth.uid`; sau khi tạo
  chỉ thành viên mới ghi được các trường preview.

Ví dụ thao tác bị từ chối (Rules Playground):

- Location: `messages/<convId>/<msgId>`; Auth: một user **không** thuộc conversation.
- Kiểu: `read` → **Denied** (`PERMISSION_DENIED`), vì không thoả
  `root.child('conversations/'+$cid+'/members/'+auth.uid).exists()`.
- Thử `write` vào `typing/<convId>/<uidKhác>` cũng bị từ chối vì `auth.uid != $uid`.

Chi tiết báo cáo: xem `BAO_CAO.md`.

## 8. Phần chưa làm (điểm cộng)

Không triển khai các mục nâng cao: quản trị nhóm (đổi tên/thêm/xóa/rời nhóm),
reply-quote, hồ sơ đổi tên/ảnh đại diện, notifee, tìm kiếm trong hội thoại.
