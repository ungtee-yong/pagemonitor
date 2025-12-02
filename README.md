# Facebook Page Comment Command Center

เว็บแอปเล็ก ๆ สำหรับแสดงคอมเมนต์จาก Facebook Page แยกตามโพสต์ พร้อมข้อมูลคนคอมเมนต์ เวลาที่ตอบ และสามารถพิมพ์ตอบกลับได้จากหน้าเดียวโดยไม่ต้องเปิด Facebook โดยตรง

## โครงสร้างโปรเจกต์

```
server/   # Express API สำหรับเชื่อมต่อ Facebook Graph API หรือโหมด mock
web/      # Frontend React (Vite) สำหรับแดชบอร์ดแสดงโพสต์และคอมเมนต์
```

## ความสามารถหลัก

- ดึงโพสต์ล่าสุดที่มีคอมเมนต์ พร้อมจำนวนคอมเมนต์และภาพโพสต์ (ถ้ามี)
- แสดงรายละเอียดคอมเมนต์: ชื่อ, รูปโปรไฟล์, เวลาที่คอมเมนต์, ลิงก์ไปยังโพสต์/คอมเมนต์บน Facebook
- ตอบกลับคอมเมนต์ได้ทันทีจาก UI เดียว ส่งผ่าน Facebook Graph API
- สลับระหว่างข้อมูลจริง (Live) กับข้อมูลจำลอง (Mock) สำหรับทดสอบได้ง่าย ๆ
- มีระบบรีเฟรชอัตโนมัติทุก 1 นาที + ปุ่มดึงข้อมูลทันที

## สิ่งที่ต้องมี

- Node.js 18+ และ npm 9+
- Facebook Page Access Token (สิทธิ์ `pages_read_engagement`, `pages_manage_posts`, `pages_manage_engagement`)
- Facebook App Secret (ถ้าต้องการเปิดใช้ `appsecret_proof` เพื่อเพิ่มความปลอดภัย)

## การติดตั้งและรันระบบ

1. **Backend (Express API)**
   ```bash
   cd server
   cp .env.example .env   # แก้ไขค่าตามข้อมูลเพจของคุณ
   npm install
   npm run dev            # รันที่พอร์ต 4000 (ค่าเริ่มต้น)
   ```

   ตัวแปรในไฟล์ `.env`:
   - `PORT` – พอร์ตของ API (ค่าเริ่มต้น 4000)
   - `FACEBOOK_PAGE_ID` – ID ของเพจ
   - `FACEBOOK_PAGE_ACCESS_TOKEN` – Page Access Token ที่มีสิทธิ์ตอบคอมเมนต์
   - `FACEBOOK_APP_SECRET` – (ถ้ามี) ใช้สร้าง `appsecret_proof`
   - `FACEBOOK_USE_MOCK_DATA` – ตั้ง `true` เพื่อใช้ข้อมูลจำลองจาก `src/mock/posts.json`

2. **Frontend (Vite + React)**
   ```bash
   cd web
   npm install
   npm run dev            # รัน Vite dev server ที่พอร์ต 5173
   ```

   Vite ถูกตั้งค่า proxy `/api` ไปยัง `http://localhost:4000` อยู่แล้ว จึงสามารถพัฒนาแบบ full-stack ได้โดยเปิดสองเทอร์มินัล

## API ภายในระบบ

- `GET /api/facebook/posts?limit=10` – ดึงโพสต์ล่าสุดพร้อมคอมเมนต์ (รองรับพารามิเตอร์ `limit`, `since`, `until`, `after`)
- `POST /api/facebook/comments/:commentId/reply` – ส่งข้อความตอบกลับคอมเมนต์

เมื่อไม่มีการตั้งค่า token หรือเปิด `FACEBOOK_USE_MOCK_DATA=true` API จะตอบกลับข้อมูลจำลอง ทำให้สามารถทดสอบ UI ได้ทันที

## แนวทางต่อยอด

- เพิ่มตัวกรองลงชื่อผู้คอมเมนต์ หรือค้นหาคำสำคัญในคอมเมนต์
- เก็บประวัติการตอบกลับ ลงฐานข้อมูลภายในเพื่อ audit
- เชื่อมต่อ Webhook ของ Facebook เพื่อรับคอมเมนต์แบบ real-time แทนการ polling
- เพิ่มระบบแจ้งเตือน (เช่น Email/LINE) เมื่อมีคอมเมนต์ใหม่จากลูกค้า VIP

## ไลเซนส์

โค้ดใน repository นี้ปล่อยภายใต้ไลเซนส์ MIT คุณสามารถนำไปปรับใช้ต่อได้ตามต้องการ
