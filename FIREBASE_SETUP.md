# تفعيل Google Sign-In في Firebase

## المشكلة الحالية
الخطأ "The requested action is invalid" يعني أن Google Authentication غير مفعّل في Firebase Console.

## خطوات الحل

### 1. افتح Firebase Console
اذهب إلى: https://console.firebase.google.com/

### 2. اختر مشروعك
اختر مشروع Tuqim Store

### 3. فعّل Google Authentication
1. من القائمة الجانبية، اختر **Authentication**
2. اضغط على تبويب **Sign-in method**
3. ابحث عن **Google** في قائمة Providers
4. اضغط على **Google**
5. فعّل الخيار **Enable**
6. اختر **Project support email** (إيميلك)
7. اضغط **Save**

### 4. أضف Authorized Domains
1. في نفس صفحة Authentication
2. اذهب إلى تبويب **Settings**
3. في قسم **Authorized domains**
4. تأكد من إضافة:
   - `localhost` (للتطوير المحلي)
   - `tuqim-store.netlify.app` (أو domain الإنتاج الخاص بك)

### 5. تحديث متغيرات البيئة
تأكد من أن ملف `.env.local` يحتوي على القيم الصحيحة من Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. أعد تشغيل التطبيق
بعد التعديلات، أعد تشغيل السيرفر:

```bash
npm run dev
```

## ملاحظات مهمة
- تأكد من أن Google Sign-in مفعّل (Enable = ON)
- تأكد من اختيار Support Email
- تأكد من إضافة localhost في Authorized domains
- إذا كنت تستخدم Netlify، أضف domain الإنتاج أيضاً

## إذا استمرت المشكلة
1. تحقق من Console في المتصفح (F12) لرؤية الخطأ الكامل
2. تأكد من أن Firebase SDK محدّث
3. جرب مسح cache المتصفح
4. تأكد من أن الإيميل المستخدم ليس محظوراً
