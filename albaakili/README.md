# البعقيلي للحجاب — Luxury Modest Fashion

موقع كتالوج احترافي لمتجر البعقيلي للحجاب، مبني بـ Node.js + Express بدون قاعدة بيانات.

## التشغيل السريع

```bash
cd albaakili
npm install
npm start
```

ثم افتح: **http://localhost:3000**

## بيانات الدخول الافتراضية

- البريد: `admin@albaakili.com`
- كلمة المرور: `admin123`
- لوحة التحكم: http://localhost:3000/admin

## هيكل المشروع

```
albaakili/
├── public/          ← الواجهة الأمامية
│   ├── index.html   ← الصفحة الرئيسية
│   ├── products.html
│   ├── product.html
│   ├── about.html
│   ├── contact.html
│   ├── offers.html
│   ├── admin.html   ← لوحة التحكم
│   ├── css/style.css
│   └── js/
├── data/            ← قاعدة البيانات (JSON)
│   ├── products.json
│   ├── categories.json
│   ├── settings.json
│   ├── messages.json
│   └── offers.json
├── uploads/         ← صور المنتجات المرفوعة
└── server.js        ← الخادم الرئيسي
```

## API المتاح

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | /api/products | جلب المنتجات |
| POST | /api/products | إضافة منتج (admin) |
| PUT | /api/products/:id | تعديل منتج (admin) |
| DELETE | /api/products/:id | حذف منتج (admin) |
| GET | /api/categories | التصنيفات |
| GET | /api/offers | العروض |
| POST | /api/messages | إرسال رسالة |
| GET | /api/messages | الرسائل (admin) |
| GET | /api/settings/public | إعدادات الموقع العامة |
| PUT | /api/settings | تعديل الإعدادات (admin) |
| POST | /api/upload | رفع صورة (admin) |

## إضافة الشعار

ضع شعار المتجر في: `public/assets/logo.png`

## المتغيرات البيئية

```
PORT=3000  (افتراضي)
```
