# Facebook Comment Manager

เว็บแอปพลิเคชันสำหรับแสดงและตอบกลับคอมเมนต์จาก Facebook Page โดยตรง โดยไม่ต้องเปิด Facebook

## ✨ ฟีเจอร์

- 📊 แสดงโพสต์ทั้งหมดที่มีคอมเมนต์
- 💬 ดูคอมเมนต์พร้อมรูปโปรไฟล์และชื่อผู้แสดงความคิดเห็น
- 🕐 แสดงเวลาที่คอมเมนต์ (เช่น "5 นาทีที่แล้ว", "2 ชั่วโมงที่แล้ว")
- 💌 ตอบกลับคอมเมนต์ได้ทันทีในเว็บ
- 🖼️ แสดงรูปภาพในโพสต์และคอมเมนต์
- 📱 รองรับการใช้งานบนมือถือ (Responsive Design)
- 🔄 รีเฟรชข้อมูลแบบเรียลไทม์

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Facebook App

#### ขั้นตอนการสร้าง Facebook App และรับ Access Token:

1. **สร้าง Facebook App**
   - ไปที่ [Facebook Developers](https://developers.facebook.com/apps/)
   - คลิก "Create App" (สร้างแอป)
   - เลือก "Business" → "Next"
   - ตั้งชื่อแอปและกรอกข้อมูลที่จำเป็น

2. **เพิ่ม Facebook Login Product**
   - ใน Dashboard ของแอป เลือก "Add Product"
   - เลือก "Facebook Login" และทำการตั้งค่า

3. **ตั้งค่า Permissions**
   - ไปที่ "App Review" → "Permissions and Features"
   - ขอ permissions ต่อไปนี้:
     - `pages_show_list` - ดูรายการเพจ
     - `pages_read_engagement` - อ่านคอมเมนต์
     - `pages_manage_posts` - จัดการโพสต์
     - `pages_manage_engagement` - ตอบกลับคอมเมนต์

4. **รับ Page Access Token**
   
   **วิธีที่ 1: ใช้ Graph API Explorer (สำหรับทดสอบ)**
   - ไปที่ [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
   - เลือกแอปของคุณจากดรอปดาวน์
   - คลิก "Generate Access Token"
   - เลือก permissions ที่จำเป็น
   - คัดลอก Access Token
   
   **วิธีที่ 2: ใช้ Access Token Tool**
   - ไปที่ [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
   - คัดลอก "Page Access Token" ของเพจที่ต้องการ

5. **หา Page ID**
   - ไปที่เพจ Facebook ของคุณ
   - คลิก "About" (เกี่ยวกับ)
   - เลื่อนลงไปจะเห็น "Page ID" หรือ
   - ดูที่ URL: `facebook.com/YourPageName` → ใช้ Graph API: `https://graph.facebook.com/YourPageName` จะได้ ID

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env` และใส่ข้อมูลของคุณ:

```env
FACEBOOK_PAGE_ID=your_actual_page_id
FACEBOOK_ACCESS_TOKEN=your_actual_page_access_token
PORT=3000
```

**⚠️ สำคัญ:**
- Page Access Token นี้มีอายุจำกัด (60 วัน) สำหรับ token แบบปกติ
- สำหรับการใช้งานจริง ควรใช้ Long-Lived Token หรือ System User Token
- ไม่ควร commit ไฟล์ `.env` เข้า git

### 4. รันแอปพลิเคชัน

```bash
npm start
```

หรือสำหรับ development mode (รีสตาร์ทอัตโนมัติเมื่อมีการแก้ไขโค้ด):

```bash
npm run dev
```

แอปจะรันที่: `http://localhost:3000`

## 📖 การใช้งาน

1. **เปิดเว็บบราวเซอร์** และไปที่ `http://localhost:3000`

2. **ดูโพสต์และคอมเมนต์** - เว็บจะแสดงโพสต์ทั้งหมดที่มีคอมเมนต์พร้อมข้อมูล:
   - เนื้อหาโพสต์
   - รูปภาพ (ถ้ามี)
   - จำนวนคอมเมนต์
   - รายชื่อผู้แสดงความคิดเห็น
   - เวลาที่คอมเมนต์

3. **ตอบกลับคอมเมนต์** - คลิกปุ่ม "ตอบกลับ" ที่คอมเมนต์ใดก็ได้:
   - จะเปิด popup สำหรับพิมพ์คำตอบ
   - พิมพ์ข้อความที่ต้องการตอบ
   - คลิก "ส่งคำตอบ" หรือกด Ctrl+Enter
   - คำตอบจะถูกส่งไปที่ Facebook ทันที

4. **รีเฟรชข้อมูล** - คลิกปุ่ม "รีเฟรช" เพื่ออัพเดทคอมเมนต์ใหม่

## 🏗️ โครงสร้างโปรเจค

```
facebook-comment-manager/
├── server/
│   └── index.js          # Express server และ Facebook API integration
├── public/
│   ├── index.html        # หน้า HTML หลัก
│   ├── style.css         # Styling
│   └── app.js            # JavaScript สำหรับ frontend
├── .env                  # Environment variables (ไม่ commit)
├── .env.example          # ตัวอย่าง environment variables
├── package.json          # Dependencies
└── README.md            # เอกสารนี้
```

## 🔌 API Endpoints

### GET `/api/posts`
ดึงข้อมูลโพสต์ที่มีคอมเมนต์

**Response:**
```json
{
  "success": true,
  "posts": [...],
  "count": 10
}
```

### GET `/api/posts/:postId/comments`
ดึงคอมเมนต์ของโพสต์เฉพาะ

### POST `/api/comments/:commentId/reply`
ตอบกลับคอมเมนต์

**Request Body:**
```json
{
  "message": "ข้อความตอบกลับ"
}
```

### GET `/api/page-info`
ดึงข้อมูลเพจ

### GET `/api/health`
ตรวจสอบสถานะเซิร์ฟเวอร์

## 🔐 ความปลอดภัย

- **อย่า** commit ไฟล์ `.env` เข้า git repository
- **อย่า** แชร์ Access Token กับผู้อื่น
- สำหรับ production ควรใช้ HTTPS
- ควรตั้งค่า rate limiting สำหรับ API
- ควรเพิ่ม authentication สำหรับผู้ใช้งานเว็บ

## 🛠️ การแก้ปัญหา

### ปัญหา: "Please configure FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN"
- ตรวจสอบว่าไฟล์ `.env` มีข้อมูลครบถ้วน
- ตรวจสอบว่า Page ID และ Access Token ถูกต้อง
- รีสตาร์ทเซิร์ฟเวอร์หหลังแก้ไขไฟล์ `.env`

### ปัญหา: "Error loading posts" หรือ Facebook API Error
- ตรวจสอบว่า Access Token ยังไม่หมดอายุ
- ตรวจสอบว่าแอป Facebook มี permissions ที่จำเป็น
- ตรวจสอบว่า Page ID ถูกต้อง
- ลองสร้าง Access Token ใหม่

### ปัญหา: ไม่สามารถตอบกลับคอมเมนต์ได้
- ตรวจสอบว่ามี permission `pages_manage_engagement`
- ตรวจสอบว่าใช้ Page Access Token (ไม่ใช่ User Access Token)
- ตรวจสอบว่าแอป Facebook อยู่ใน "Development Mode" หรือได้รับการอนุมัติแล้ว

### ปัญหา: Access Token หมดอายุบ่อย
- ใช้ Long-Lived Page Access Token (อายุ 60 วัน)
- หรือใช้ System User Token (ไม่มีวันหมดอายุ)
- ตั้งค่า token refresh mechanism

## 📝 สร้าง Long-Lived Access Token

```bash
# 1. แลก Short-Lived User Token เป็น Long-Lived User Token
curl -i -X GET "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"

# 2. ใช้ Long-Lived User Token เพื่อขอ Page Access Token
# Page Access Token ที่ได้จะเป็นแบบ long-lived โดยอัตโนมัติ
```

## 🌟 ฟีเจอร์เพิ่มเติมที่อาจพัฒนาต่อ

- [ ] Real-time notifications สำหรับคอมเมนต์ใหม่
- [ ] ค้นหาและกรองคอมเมนต์
- [ ] สถิติและ analytics
- [ ] ตอบกลับแบบส่วนตัว (Private Reply)
- [ ] จัดการหลายเพจในที่เดียว
- [ ] Auto-reply ด้วย AI
- [ ] Export ข้อมูลคอมเมนต์
- [ ] แท็กและจัดหมวดหมู่คอมเมนต์

## 📄 License

MIT License - ใช้งานได้ฟรี

## 👨‍💻 การพัฒนาเพิ่มเติม

หากต้องการปรับแต่งหรือเพิ่มฟีเจอร์:

1. **Backend** - แก้ไขไฟล์ `server/index.js`
2. **Frontend UI** - แก้ไขไฟล์ `public/index.html` และ `public/style.css`
3. **Frontend Logic** - แก้ไขไฟล์ `public/app.js`

## 🔗 ลิงก์ที่เป็นประโยชน์

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook for Developers](https://developers.facebook.com/)
- [Page Access Tokens](https://developers.facebook.com/docs/pages/access-tokens)
- [Facebook Permissions Reference](https://developers.facebook.com/docs/permissions/reference)

---

สร้างด้วย ❤️ สำหรับการจัดการคอมเมนต์ Facebook Page ให้ง่ายขึ้น
