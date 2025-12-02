# Facebook Page Comments Manager

เว็บแอปพลิเคชันสำหรับแสดงและตอบกลับคอมเมนต์จาก Facebook Page โดยไม่ต้องเปิด Facebook

## คุณสมบัติ

- ✅ แสดงโพสต์ที่มีคอมเมนต์เข้ามา
- ✅ แสดงข้อมูลคอมเมนต์พร้อมรูปโปรไฟล์
- ✅ แสดงชื่อผู้คอมเมนต์และเวลาที่คอมเมนต์
- ✅ ตอบกลับคอมเมนต์ได้ทันทีโดยไม่ต้องเปิด Facebook
- ✅ UI สวยงามและใช้งานง่าย
- ✅ รองรับการแสดงผลบนมือถือ

## ความต้องการของระบบ

- Node.js 18.0 หรือสูงกว่า
- npm หรือ yarn
- Facebook Page Access Token
- Facebook Page ID

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ `.env.local` จาก `.env.local.example`:
```bash
cp .env.local.example .env.local
```

3. ตั้งค่า Facebook API credentials ใน `.env.local`:

### วิธีรับ Facebook Page Access Token:

1. ไปที่ [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. เลือก App ของคุณ (หรือสร้างใหม่)
3. คลิก "Get Token" → "Get Page Access Token"
4. เลือก Page ที่ต้องการ
5. คัดลอก Access Token ไปใส่ใน `.env.local`

### วิธีหา Facebook Page ID:

1. ไปที่ Facebook Page ของคุณ
2. คลิก "About" ในเมนูด้านซ้าย
3. เลื่อนลงไปหา "Page ID" ในส่วน "Page Info"
4. หรือใช้ Graph API Explorer เพื่อดู Page ID

## การรันแอปพลิเคชัน

รันในโหมด development:
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## การ Build สำหรับ Production

```bash
npm run build
npm start
```

## โครงสร้างโปรเจกต์

```
├── app/
│   ├── api/
│   │   ├── posts/
│   │   │   └── route.ts          # API สำหรับดึงโพสต์และคอมเมนต์
│   │   └── comments/
│   │       └── reply/
│   │           └── route.ts      # API สำหรับตอบกลับคอมเมนต์
│   ├── globals.css               # สไตล์ CSS ทั้งหมด
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # หน้าหลัก
├── components/
│   ├── CommentItem.tsx           # คอมโพเนนต์แสดงคอมเมนต์
│   └── PostCard.tsx              # คอมโพเนนต์แสดงโพสต์
├── .env.local.example            # ตัวอย่างไฟล์ environment variables
├── package.json
└── README.md
```

## การใช้งาน

1. เปิดเว็บแอปพลิเคชัน
2. ระบบจะดึงโพสต์ที่มีคอมเมนต์เข้ามาอัตโนมัติ
3. ดูคอมเมนต์แต่ละรายการพร้อมรูปโปรไฟล์และเวลา
4. พิมพ์ข้อความตอบกลับในช่องข้อความ
5. คลิกปุ่ม "ตอบกลับ" เพื่อส่งคำตอบ

## สิทธิ์ที่ต้องการจาก Facebook API

- `pages_read_engagement` - สำหรับอ่านโพสต์และคอมเมนต์
- `pages_manage_posts` - สำหรับตอบกลับคอมเมนต์

## หมายเหตุ

- Access Token มีอายุจำกัด ต้องสร้างใหม่เมื่อหมดอายุ
- สำหรับใช้งานจริง ควรใช้ Long-lived Access Token
- ข้อมูลจะถูกดึงจาก Facebook API ทุกครั้งที่รีเฟรชหน้าเว็บ

## การแก้ไขปัญหา

### ไม่สามารถดึงข้อมูลได้
- ตรวจสอบว่า Access Token ยังไม่หมดอายุ
- ตรวจสอบว่า Page ID ถูกต้อง
- ตรวจสอบสิทธิ์ของ Access Token

### ไม่สามารถตอบกลับได้
- ตรวจสอบว่า Access Token มีสิทธิ์ `pages_manage_posts`
- ตรวจสอบว่า Page Access Token ไม่ใช่ User Access Token

## License

MIT
