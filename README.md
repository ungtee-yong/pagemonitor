# Page Monitor

เว็บสำหรับทีมแอดมินเพจที่ต้องการไล่ดูโพสต์ที่มีคอมเมนต์, เห็นว่าใครคอมเมนต์อะไรเมื่อไรพร้อมรูปโปรไฟล์ และตอบกลับได้ทันทีโดยไม่ต้องเปิด Facebook โดยตรง

## สถาปัตยกรรม

- `server/` – Node.js + Express ทำหน้าที่เป็น proxy ให้กับ Facebook Graph API และซ่อน Page Access Token เอาไว้ฝั่งเซิร์ฟเวอร์ พร้อม cache ในหน่วยความจำเพื่อลดจำนวน call
- `client/` – React + Vite แสดงรายการโพสต์ (ซ้าย) และคอมเมนต์ของโพสต์ที่เลือก (ขวา) พร้อมแบบฟอร์มตอบกลับ

## สิ่งที่ต้องเตรียม

1. Node.js 20 ขึ้นไป
2. Facebook Page Access Token ที่มีสิทธิ์อ่านคอมเมนต์และตอบกลับ (`pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, `pages_manage_posts`, `pages_manage_engagement`)
3. ระบุ `FACEBOOK_PAGE_ID` ของเพจ

สร้างไฟล์ `server/.env` จากตัวอย่าง

```bash
cp server/.env.example server/.env
# แล้วแก้ค่า FACEBOOK_PAGE_ID และ FACEBOOK_ACCESS_TOKEN
```

## การรันบนเครื่อง

```bash
# ติดตั้ง dependencies
cd server && npm install
cd ../client && npm install

# รันพร้อมกัน (ใช้เทอร์มินัลแยก)
cd server && npm run dev      # เริ่ม backend ที่พอร์ต 4000
cd client && npm run dev      # เริ่ม frontend ที่พอร์ต 5173
```

Vite ถูกตั้ง proxy `/api` ไปหา `http://localhost:4000`, ดังนั้น frontend จะคุยกับ backend ได้ทันทีโดยไม่โดน CORS

### โปรดักชัน

- Backend: `cd server && npm run start`
- Frontend build ไฟล์นิ่ง: `cd client && npm run build` แล้วนำโฟลเดอร์ `client/dist` ไปเสิร์ฟด้วย reverse proxy / CDN

## API ที่มีให้

| Method & Path | คำอธิบาย |
| --- | --- |
| `GET /api/posts?limit=15` | คืนรายการโพสต์ล่าสุด พร้อมข้อมูลสรุปคอมเมนต์ |
| `GET /api/posts/:postId/comments?after=<cursor>` | คืนคอมเมนต์ของโพสต์ (รองรับ cursor pagination) |
| `POST /api/comments/:commentId/reply` | ส่งข้อความตอบกลับคอมเมนต์ที่ระบุ |

ทุกคำขอต้องแนบ Page Access Token (ฝั่ง server ทำให้ให้เรียบร้อย) และจะโยน error ขึ้นมาหาก Facebook API ตอบ error กลับมา

## เช็กลิสต์ทดสอบ

- `cd client && npm run lint` – ตรวจ style/Hook rules
- `cd client && npm run build` – ยืนยันว่า UI build ผ่าน
- ทดสอบตอบกลับจริงด้วย account ที่มีสิทธิ์เพจ (ระวังอัตราส่งข้อความของ Facebook)
- สังเกต log จาก `server` ว่า error ถูกจับและส่งกลับด้วย JSON เสมอ