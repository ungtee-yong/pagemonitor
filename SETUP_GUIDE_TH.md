# คู่มือการติดตั้งแบบละเอียด (ภาษาไทย)

## ขั้นตอนที่ 1: เตรียม Facebook App

### 1.1 สร้าง Facebook App

1. เปิดเว็บ [Facebook Developers](https://developers.facebook.com/apps/)
2. คลิกปุ่ม **"Create App"** (สีเขียว)
3. เลือกประเภทแอป: **"Business"** → คลิก **"Next"**
4. กรอกข้อมูล:
   - **App Name**: ตั้งชื่อตามใจชอบ เช่น "Comment Manager"
   - **App Contact Email**: อีเมลของคุณ
5. คลิก **"Create App"**
6. ทำการยืนยันตัวตนตามที่ระบบร้องขอ

### 1.2 ตั้งค่า Products

1. ในหน้า Dashboard ของ App
2. หาส่วน **"Add Products to Your App"**
3. หา **"Facebook Login"** → คลิก **"Set Up"**
4. เลือก **"Web"** เป็น platform
5. ใส่ URL: `http://localhost:3000`
6. บันทึกการตั้งค่า

### 1.3 ขอ Permissions

**สำหรับการใช้งานในโหมด Development (ทดสอบ):**

Permissions เหล่านี้สามารถใช้งานได้ทันทีโดยไม่ต้อง review:
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_manage_engagement`

**สำหรับการใช้งานจริง (Production):**

1. ไปที่ **"App Review"** → **"Permissions and Features"**
2. ค้นหาและคลิก **"Request"** สำหรับ permissions ต่อไปนี้:
   - `pages_show_list` - ดูรายการเพจ
   - `pages_read_engagement` - อ่านโพสต์และคอมเมนต์
   - `pages_manage_posts` - จัดการโพสต์
   - `pages_manage_engagement` - ตอบกลับคอมเมนต์
3. กรอกเหตุผลและวิธีใช้งาน
4. รอการอนุมัติจาก Facebook (อาจใช้เวลา 2-5 วันทำการ)

## ขั้นตอนที่ 2: หา Page ID

### วิธีที่ 1: จากหน้าเพจ

1. เปิดหน้า Facebook Page ของคุณ
2. คลิกแท็บ **"About"** (เกี่ยวกับ)
3. เลื่อนลงไปด้านล่างจะเห็น **"Page ID"**
4. คัดลอกตัวเลขนั้นมา

### วิธีที่ 2: จาก URL

1. ดู URL ของเพจคุณ เช่น `https://www.facebook.com/mypage`
2. เปิดเว็บบราวเซอร์และไปที่:
   ```
   https://graph.facebook.com/mypage
   ```
3. จะเห็น `"id": "123456789"` - นี่คือ Page ID ของคุณ

## ขั้นตอนที่ 3: สร้าง Access Token

### วิธีที่ 1: ใช้ Graph API Explorer (แนะนำสำหรับการทดสอบ)

1. ไปที่ [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. ที่มุมขวาบน:
   - **Meta App**: เลือกแอปที่คุณสร้าง
   - **User or Page**: เลือก **"Get Page Access Token"**
3. คลิกปุ่ม **"Generate Access Token"**
4. เลือก Page ที่ต้องการ
5. อนุญาต Permissions ที่ขึ้นมา
6. คัดลอก Access Token ที่ปรากฏ

**หมายเหตุ**: Token นี้จะหมดอายุใน 1-2 ชั่วโมง (Short-Lived Token)

### วิธีที่ 2: สร้าง Long-Lived Token (แนะนำสำหรับการใช้งานจริง)

#### ขั้นตอน A: รับ User Access Token

1. ไปที่ [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. เลือก App ของคุณ
3. เลือก Permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_manage_engagement`
4. คลิก **"Generate Access Token"**
5. คัดลอก User Token ที่ได้

#### ขั้นตอน B: แปลงเป็น Long-Lived User Token

เปิด Terminal และรันคำสั่ง (แทนที่ค่าต่างๆ):

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"
```

หา **App ID** และ **App Secret**:
- ไปที่ Dashboard ของ App
- เลือก **"Settings"** → **"Basic"**
- คัดลอก **App ID** และ **App Secret**

คำสั่งจะคืนค่า Long-Lived User Token มาให้

#### ขั้นตอน C: ขอ Page Access Token

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_LONG_LIVED_USER_TOKEN"
```

จะได้ JSON มา หา Page ที่ต้องการและคัดลอก `access_token` ของ Page นั้น

**Token นี้จะเป็น Long-Lived Page Access Token** ที่ใช้งานได้นานถึง 60 วัน

## ขั้นตอนที่ 4: ติดตั้งโปรเจค

### 4.1 ติดตั้ง Node.js

ถ้ายังไม่มี Node.js:
1. ดาวน์โหลดจาก [nodejs.org](https://nodejs.org/)
2. ติดตั้งตามขั้นตอน
3. ตรวจสอบการติดตั้ง:
   ```bash
   node --version
   npm --version
   ```

### 4.2 ติดตั้ง Dependencies

เปิด Terminal/Command Prompt ในโฟลเดอร์โปรเจค:

```bash
npm install
```

### 4.3 ตั้งค่า Environment Variables

1. คัดลอกไฟล์ตัวอย่าง:
   ```bash
   cp .env.example .env
   ```

2. เปิดไฟล์ `.env` ด้วย Text Editor

3. แก้ไขค่าต่างๆ:
   ```env
   FACEBOOK_PAGE_ID=123456789012345
   FACEBOOK_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PORT=3000
   ```

4. บันทึกไฟล์

## ขั้นตอนที่ 5: รันแอปพลิเคชัน

### เริ่มต้นเซิร์ฟเวอร์

```bash
npm start
```

คุณจะเห็นข้อความ:
```
Server is running on http://localhost:3000
API configured: true
```

### เปิดเว็บบราวเซอร์

1. เปิดเว็บบราวเซอร์ (Chrome, Firefox, Safari, Edge)
2. ไปที่ `http://localhost:3000`
3. ถ้าทุกอย่างถูกต้อง คุณจะเห็นหน้าเว็บที่แสดงโพสต์และคอมเมนต์

## การแก้ปัญหาที่พบบ่อย

### ❌ "Please configure FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN"

**สาเหตุ**: ยังไม่ได้ตั้งค่า .env หรือตั้งค่าผิด

**วิธีแก้**:
1. ตรวจสอบว่ามีไฟล์ `.env` ในโฟลเดอร์หลัก
2. เปิดไฟล์และตรวจสอบว่ามีค่าครบถ้วน
3. ไม่ควรมีช่องว่างหน้าหรือหลังเครื่องหมาย `=`
4. บันทึกไฟล์และรีสตาร์ทเซิร์ฟเวอร์

### ❌ Error: "Invalid OAuth access token"

**สาเหตุ**: Access Token หมดอายุหรือไม่ถูกต้อง

**วิธีแก้**:
1. สร้าง Access Token ใหม่ (ตามขั้นตอนที่ 3)
2. อัพเดทไฟล์ `.env`
3. รีสตาร์ทเซิร์ฟเวอร์

### ❌ Error: "Unsupported get request" หรือ Permissions Error

**สาเหตุ**: แอป Facebook ไม่มี Permissions ที่จำเป็น

**วิธีแก้**:
1. ตรวจสอบว่า App มี permissions ครบทั้ง 4 ตัว
2. ใน Graph API Explorer ตอน Generate Token ให้เลือก permissions ทั้งหมด
3. ลอง Generate Token ใหม่

### ❌ ไม่สามารถตอบกลับคอมเมนต์ได้

**สาเหตุ**: ไม่มี permission `pages_manage_engagement`

**วิธีแก้**:
1. ตรวจสอบว่าใช้ **Page Access Token** (ไม่ใช่ User Token)
2. ตรวจสอบว่า Token มี permission `pages_manage_engagement`
3. ลองสร้าง Token ใหม่และเลือก permissions ที่จำเป็นทั้งหมด

### ❌ "Cannot GET /api/posts" หรือ 404 Error

**สาเหตุ**: เซิร์ฟเวอร์ไม่ทำงาน

**วิธีแก้**:
1. ตรวจสอบว่ารัน `npm start` แล้ว
2. ดูว่ามี error ใน Terminal หรือไม่
3. ลองรีสตาร์ทเซิร์ฟเวอร์

## เคล็ดลับเพิ่มเติม

### 🔄 Auto-Restart เมื่อแก้โค้ด

ใช้ development mode:
```bash
npm run dev
```

เซิร์ฟเวอร์จะรีสตาร์ทอัตโนมัติเมื่อคุณแก้ไขโค้ด

### 🔍 ดู Logs

ถ้ามีปัญหา ดู logs ใน Terminal ที่รันเซิร์ฟเวอร์

### 🌐 ใช้งานจากเครื่องอื่น (LAN)

1. หา IP Address ของเครื่องคุณ
   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ifconfig
   ```

2. เปลี่ยน PORT ในไฟล์ `server/index.js`:
   ```javascript
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server is running on http://0.0.0.0:${PORT}`);
   });
   ```

3. เปิดจากเครื่องอื่นด้วย IP เช่น `http://192.168.1.100:3000`

## ทดสอบ Access Token

ทดสอบว่า Token ใช้งานได้:

```bash
curl "https://graph.facebook.com/v18.0/me?access_token=YOUR_ACCESS_TOKEN"
```

ถ้าได้ข้อมูลกลับมา แสดงว่า Token ใช้งานได้

ทดสอบดึงโพสต์:

```bash
curl "https://graph.facebook.com/v18.0/YOUR_PAGE_ID/posts?access_token=YOUR_ACCESS_TOKEN"
```

## การใช้งานในเซิร์ฟเวอร์จริง (Production)

1. ใช้ HTTPS (SSL Certificate)
2. ตั้งค่า Environment Variables บนเซิร์ฟเวอร์
3. ใช้ Process Manager เช่น PM2:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name facebook-comment-manager
   ```
4. ตั้งค่า Firewall
5. ใช้ Reverse Proxy (Nginx, Apache)

---

หากมีปัญหาเพิ่มเติม สามารถดูที่:
- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Access Token Debug Tool](https://developers.facebook.com/tools/debug/accesstoken/)
