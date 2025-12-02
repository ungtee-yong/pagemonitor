# Quick Start Guide 🚀

เริ่มต้นใช้งานเว็บจัดการคอมเมนต์ Facebook ภายใน 5 นาที!

## ขั้นตอนแบบย่อ

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. สร้าง Facebook App
1. ไปที่ https://developers.facebook.com/apps/
2. สร้าง App ใหม่ (เลือกประเภท "Business")
3. เพิ่ม Product: "Facebook Login"

### 3. รับ Access Token
**วิธีง่ายสุด (สำหรับทดสอบ):**
1. ไปที่ https://developers.facebook.com/tools/explorer/
2. เลือก App ของคุณ
3. เลือก "Get Page Access Token"
4. เลือก Page และ Permissions:
   - pages_show_list
   - pages_read_engagement
   - pages_manage_posts
   - pages_manage_engagement
5. คัดลอก Token

### 4. หา Page ID
**วิธีง่ายสุด:**
1. ไปที่หน้า Facebook Page ของคุณ
2. คลิก "About" (เกี่ยวกับ)
3. เลื่อนลงล่างจะเห็น "Page ID"

### 5. ตั้งค่า .env
เปิดไฟล์ `.env` และแก้ไข:
```env
FACEBOOK_PAGE_ID=ใส่_Page_ID_ของคุณ
FACEBOOK_ACCESS_TOKEN=ใส่_Access_Token_ของคุณ
PORT=3000
```

### 6. รันเซิร์ฟเวอร์
```bash
npm start
```

### 7. เปิดเว็บ
เปิดเว็บบราวเซอร์และไปที่:
```
http://localhost:3000
```

## ✅ เสร็จแล้ว!

ตอนนี้คุณสามารถ:
- ✨ ดูโพสต์และคอมเมนต์ทั้งหมด
- 💬 ตอบกลับคอมเมนต์ได้ทันที
- 🔄 รีเฟรชข้อมูลเมื่อต้องการ

## ⚠️ หากมีปัญหา

### Access Token หมดอายุเร็ว?
Token แบบทดสอบจะหมดอายุใน 1-2 ชั่วโมง  
👉 ดูวิธีสร้าง Long-Lived Token ได้ที่ `SETUP_GUIDE_TH.md`

### ไม่เห็นคอมเมนต์?
- ตรวจสอบว่า Page ID ถูกต้อง
- ตรวจสอบว่ามีคอมเมนต์ในเพจจริง
- ลองรีเฟรชหน้าเว็บ

### ไม่สามารถตอบกลับได้?
- ตรวจสอบว่าเลือก Permissions ครบทั้ง 4 ตัว
- ใช้ Page Access Token (ไม่ใช่ User Token)

## 📚 เอกสารเพิ่มเติม

- คู่มือติดตั้งแบบละเอียด: `SETUP_GUIDE_TH.md`
- คู่มือใช้งาน: `README.md`

## 🎉 เริ่มใช้งานได้เลย!

ลองตอบคอมเมนต์แรกของคุณกันเถอะ!
