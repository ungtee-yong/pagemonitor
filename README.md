# 📱 Facebook Page Comments Manager

เว็บแอปพลิเคชันสำหรับแสดงและตอบกลับคอมเมนต์จาก Facebook Page โดยไม่ต้องเปิด Facebook โดยตรง

## ✨ ฟีเจอร์

- 📋 แสดงโพสต์ทั้งหมดที่มีคอมเมนต์
- 👤 แสดงข้อมูลผู้คอมเมนต์ (ชื่อ, รูปโปรไฟล์)
- ⏰ แสดงเวลาที่คอมเมนต์
- 💬 ตอบกลับคอมเมนต์ได้ทันที
- 🔄 รีเฟรชข้อมูลได้ตลอดเวลา
- 📱 Responsive Design รองรับทั้ง Desktop และ Mobile

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies สำหรับ backend
npm install

# ติดตั้ง dependencies สำหรับ frontend
cd client
npm install
cd ..
```

หรือใช้คำสั่งเดียว:

```bash
npm run install-all
```

### 2. ตั้งค่า Facebook App

#### ขั้นตอนที่ 1: สร้าง Facebook App

1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. สร้าง App ใหม่
3. เพิ่ม "Facebook Login" product
4. เพิ่ม "Pages" product

#### ขั้นตอนที่ 2: ตั้งค่า App

1. ไปที่ **Settings > Basic** และบันทึก:
   - **App ID**
   - **App Secret**

2. เพิ่ม **Valid OAuth Redirect URIs**:
   - `http://localhost:3000` (สำหรับ development)

#### ขั้นตอนที่ 3: สร้าง Access Token

1. ไปที่ **Tools > Graph API Explorer**
2. เลือก App ของคุณ
3. เลือก Page ที่ต้องการใช้งาน
4. Request permissions:
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `pages_read_user_content`
   - `pages_manage_metadata`
5. Generate Access Token
6. ใช้ [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/) เพื่อแปลงเป็น Long-lived Token

#### ขั้นตอนที่ 4: หา Page ID

1. ไปที่หน้า Facebook Page ของคุณ
2. ดู source code หรือใช้ Graph API Explorer
3. Page ID จะอยู่ใน URL หรือใช้ Graph API: `/{page-name}?fields=id`

### 3. ตั้งค่า Environment Variables

1. คัดลอกไฟล์ `.env.example` เป็น `.env`:

```bash
cp .env.example .env
```

2. แก้ไขไฟล์ `.env` และใส่ข้อมูลของคุณ:

```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_ACCESS_TOKEN=your_long_lived_access_token_here

PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 4. ตั้งค่า Frontend

สร้างไฟล์ `.env` ในโฟลเดอร์ `client`:

```bash
cd client
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
cd ..
```

## 🏃 การรันแอปพลิเคชัน

### Development Mode

เปิด 2 terminal windows:

**Terminal 1 - Backend:**
```bash
npm start
# หรือ
npm run dev  # ใช้ nodemon สำหรับ auto-reload
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

แอปพลิเคชันจะรันที่:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production Mode

1. Build frontend:
```bash
npm run build
```

2. รัน backend (จะ serve static files จาก client/build):
```bash
NODE_ENV=production npm start
```

## 📁 โครงสร้างโปรเจกต์

```
.
├── server.js              # Backend Express server
├── package.json           # Backend dependencies
├── .env                   # Environment variables (ไม่ควร commit)
├── .env.example           # ตัวอย่าง environment variables
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Frontend dependencies
└── README.md              # เอกสารนี้
```

## 🔧 API Endpoints

### `GET /api/posts-with-comments`
ดึงโพสต์ทั้งหมดที่มีคอมเมนต์ พร้อมข้อมูลคอมเมนต์

**Response:**
```json
{
  "data": [
    {
      "id": "post_id",
      "message": "Post content",
      "created_time": "2024-01-01T00:00:00+0000",
      "permalink_url": "https://facebook.com/...",
      "comments": [
        {
          "id": "comment_id",
          "message": "Comment text",
          "created_time": "2024-01-01T00:00:00+0000",
          "from": {
            "id": "user_id",
            "name": "User Name",
            "picture": {
              "data": {
                "url": "https://..."
              }
            }
          },
          "like_count": 0
        }
      ]
    }
  ]
}
```

### `POST /api/comments/:commentId/replies`
ตอบกลับคอมเมนต์

**Request Body:**
```json
{
  "message": "Reply message"
}
```

**Response:**
```json
{
  "success": true,
  "reply": {
    "id": "reply_id"
  }
}
```

### `GET /api/health`
ตรวจสอบสถานะ API

## ⚠️ ข้อควรระวัง

1. **Access Token**: ต้องใช้ Long-lived Access Token ที่มีอายุยาวนาน
2. **Permissions**: ต้องขอ permissions ที่จำเป็นจาก Facebook
3. **Rate Limits**: Facebook API มี rate limits ควรระวังการเรียก API บ่อยเกินไป
4. **Security**: อย่า commit ไฟล์ `.env` ที่มี credentials จริง

## 🐛 Troubleshooting

### ไม่สามารถดึงข้อมูลได้
- ตรวจสอบว่า Access Token ยังใช้งานได้
- ตรวจสอบว่า Page ID ถูกต้อง
- ตรวจสอบว่า App มี permissions ที่จำเป็น

### ไม่สามารถตอบกลับได้
- ตรวจสอบว่า Access Token มี permission `pages_manage_posts`
- ตรวจสอบว่า Page เป็นของ App นี้

### CORS Error
- ตรวจสอบว่า `CLIENT_URL` ใน `.env` ตรงกับ URL ที่ frontend รันอยู่

## 📝 License

MIT

## 🤝 Contributing

ยินดีรับ contributions! กรุณา fork และสร้าง pull request
