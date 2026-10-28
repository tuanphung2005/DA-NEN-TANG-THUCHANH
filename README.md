This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Bài 5 – Chat realtime với Firebase

## 1. Cấu hình Firebase

1. Tạo project tại [Firebase Console](https://console.firebase.google.com), thêm app Android/iOS.
2. Bật **Authentication → Sign-in method → Email/Password**.
3. Bật **Realtime Database** (chọn chế độ Locked mode).
4. Dán cấu hình app vào `firebaseConfig` trong `src/services/firebase.ts`.
5. Mở tab **Rules** của Realtime Database, dán nội dung `firebase.rules.json` rồi Publish.

Luật bảo mật: chỉ người đã đăng nhập mới đọc được danh bạ; mỗi người chỉ sửa hồ sơ của mình; chỉ thành viên của một cuộc trò chuyện mới đọc/ghi được cuộc trò chuyện đó. Không đọc được danh sách toàn bộ tin nhắn.

## 2. Cài đặt và chạy

`@react-native-community/geolocation` là native module nên cần build lại app (không chỉ reload JS):

```sh
npm install
npm run android
# iOS: bundle exec pod install && npm run ios
```

## 3. Thử hai người dùng

Đăng ký 2 tài khoản trên 2 máy/emulator, đăng nhập ở cả hai, mở **Danh bạ** và nhắn tin. Trạng thái online cập nhật realtime; tắt app/mất mạng sẽ tự chuyển offline.

Trên emulator Android, đặt vị trí giả trong **Extended Controls → Location** để thử nút gửi vị trí.

## 4. Cấu trúc

- `src/services/firebase.ts`: khởi tạo Firebase app, auth, database.
- `src/services/auth.ts`: đăng ký, đăng nhập, đăng xuất, presence online.
- `src/services/users.ts`: danh bạ realtime.
- `src/services/chat.ts`: cuộc trò chuyện, tin nhắn, unread, vị trí.

Dữ liệu:

```
users/{uid}: { name, email, online }
userConvs/{uid}/{conversationId}: true
conversations/{conversationId}:
  members: { uidA: true, uidB: true }
  lastMessage, lastSenderId, lastTime
  unread: { uid: number }
  messages/{messageId}: { senderId, type, text?, latitude?, longitude?, createdAt }
```

# Getting Started


> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
