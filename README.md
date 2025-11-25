# PageMonitor – Facebook Comment Reply Dashboard

เว็บแอปสำหรับรวมคอมเมนต์จาก Facebook Fan Page ไว้ในหน้าจอเดียว คุณสามารถดูว่าแฟนเพจคนไหนไปคอมเมนต์โพสต์อะไร เมื่อไร พร้อมรูปโปรไฟล์ และตอบกลับได้ทันทีโดยไม่ต้องเปิด Facebook

## ฟีเจอร์หลัก
- รายชื่อเพจที่โทเคนของคุณเข้าถึงได้ พร้อมรูป profile
- รายการโพสต์ล่าสุดของเพจที่เลือก พร้อมลิงก์เปิดโพสต์บน Facebook
- คอมเมนต์ทั้งหมดแบบเรียลไทม์ รวมชื่อ รูป และเวลาที่คอมเมนต์
- กล่อง Reply ในแต่ละคอมเมนต์ กดตอบกลับได้ทันที
- ระบบ Toast แจ้งผลสำเร็จ/ผิดพลาด และ Error Banner พร้อมปุ่มรีลอง

## โครงสร้างโปรเจ็กต์
- `server/src`      – โค้ด Express + helper เชื่อม Facebook Graph
- `server/public`   – ไฟล์ HTML/CSS/JS ที่เสิร์ฟโดยตรงจาก Node.js

## การเตรียมสภาพแวดล้อม
1. ต้องมี Node.js 18+ และ npm
2. สร้างไฟล์ environment
   ```bash
   cp server/.env.example server/.env
   ```
3. เติมค่า `FACEBOOK_USER_ACCESS_TOKEN` ด้วย **long-lived User Access Token** ที่มีสิทธิ์
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`

## คำสั่งสำคัญ
ติดตั้ง dependency (ฝั่ง client เสิร์ฟด้วย Node.js แล้ว ไม่ต้อง build แยก)
```bash
npm install
```

โหมดพัฒนา (nodemon reload อัตโนมัติ)
```bash
npm run dev
# เปิดเบราว์เซอร์ไปที่ http://localhost:4000
```

โหมด production
```bash
npm start
```

## การทำงานร่วมกับ Facebook Graph API
- Backend จะใช้ user token เรียก `/me/accounts` เพื่อดึงเพจและ cache page access token
- เรียก `/PAGE_ID/posts` สำหรับโพสต์, `/POST_ID/comments` สำหรับคอมเมนต์ พร้อม `from{id,name,picture}`
- การตอบกลับใช้ `POST /COMMENT_ID/comments` ด้วย page access token ที่ดึงแบบ on-demand

> หากได้รับ error code 190 (token หมดอายุ) ระบบจะล้าง cache ให้อัตโนมัติ แต่คุณต้องออก token ใหม่แล้วรีสตาร์ตเซิร์ฟเวอร์

## ข้อควรทราบ
- โปรดอย่าเผยแพร่ Page/User access token ในฝั่ง client
- เมื่อต้องการ deploy ให้เตรียม `.env` บนเครื่องปลายทางแล้วรัน `npm start` เพื่อให้ Express เสิร์ฟไฟล์ใน `server/public`
- โค้ดทั้งหมดใช้ ASCII ตามมาตรฐานและมีคอมเมนต์เฉพาะส่วนที่จำเป็น