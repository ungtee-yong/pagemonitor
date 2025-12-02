# 🗨️ Facebook Page Comments Manager

เว็บแอปพลิเคชันสำหรับจัดการคอมเมนต์ Facebook Page - ดูและตอบกลับคอมเมนต์ได้ทันทีโดยไม่ต้องเปิด Facebook

![Preview](https://via.placeholder.com/800x400/1e1b4b/ffffff?text=FB+Comments+Manager)

## ✨ Features

- 📱 **ดูโพสต์ทั้งหมด** - แสดงโพสต์จากเพจพร้อมจำนวนคอมเมนต์
- 💬 **ดูคอมเมนต์** - ดูรายการคอมเมนต์พร้อมรูปโปรไฟล์และชื่อผู้คอมเมนต์
- ⚡ **ตอบกลับทันที** - ตอบคอมเมนต์ได้ทันทีจากเว็บแอปนี้
- ❤️ **กดไลค์** - กดไลค์คอมเมนต์ได้
- 🔄 **รีเฟรช** - อัปเดตคอมเมนต์ใหม่ล่าสุด
- 🎨 **UI สวยงาม** - ดีไซน์ทันสมัย ใช้งานง่าย

## 🚀 Quick Start

### 1. สร้าง Facebook App

1. ไปที่ [Facebook Developers](https://developers.facebook.com/apps/)
2. กด **Create App** → เลือก **Business**
3. ตั้งชื่อแอป แล้วกด **Create**
4. ไปที่ **Settings** > **Basic** และคัดลอก **App ID** และ **App Secret**
5. เพิ่ม **Facebook Login** product และตั้งค่า:
   - Valid OAuth Redirect URIs: `http://localhost:5173/`
6. ไปที่ **App Review** > **Permissions and Features** และขอสิทธิ์:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_engagement`
   - `pages_read_user_content`

### 2. ตั้งค่า Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# แก้ไขไฟล์ .env และใส่ค่า FACEBOOK_APP_ID และ FACEBOOK_APP_SECRET

# Frontend
cp frontend/.env.example frontend/.env
# แก้ไขไฟล์ .env และใส่ค่า VITE_FACEBOOK_APP_ID
```

### 3. ติดตั้ง Dependencies

```bash
npm install
npm run install:all
```

### 4. รัน Development Server

```bash
npm run dev
```

หรือรันแยก:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server
│   │   └── routes/
│   │       └── facebook.js   # Facebook API routes
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── PageSelector.jsx
│   │   │   ├── PostList.jsx
│   │   │   ├── CommentPanel.jsx
│   │   │   ├── LoginScreen.jsx
│   │   │   └── LoadingScreen.jsx
│   │   ├── hooks/
│   │   │   └── useFacebook.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
│
└── package.json
```

## 🔧 Tech Stack

### Backend
- **Express.js** - Web framework
- **Axios** - HTTP client
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **Axios** - HTTP client

## 🔒 Required Permissions

แอปนี้ต้องการ permissions ต่อไปนี้จาก Facebook:

| Permission | Description |
|------------|-------------|
| `pages_show_list` | ดูรายการเพจที่คุณจัดการ |
| `pages_read_engagement` | อ่านข้อมูล engagement ของเพจ |
| `pages_manage_engagement` | จัดการ engagement (ตอบคอมเมนต์, ไลค์) |
| `pages_read_user_content` | อ่านคอมเมนต์จากผู้ใช้ |

## 🌐 Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `FACEBOOK_APP_ID` | Facebook App ID |
| `FACEBOOK_APP_SECRET` | Facebook App Secret |
| `PORT` | Server port (default: 3001) |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (.env)

| Variable | Description |
|----------|-------------|
| `VITE_FACEBOOK_APP_ID` | Facebook App ID |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/facebook/exchange-token` | แลก access token |
| GET | `/api/facebook/pages` | ดึงรายการเพจ |
| GET | `/api/facebook/posts/:pageId` | ดึงโพสต์ของเพจ |
| GET | `/api/facebook/comments/:postId` | ดึงคอมเมนต์ของโพสต์ |
| POST | `/api/facebook/reply/:commentId` | ตอบกลับคอมเมนต์ |
| POST | `/api/facebook/like/:commentId` | ไลค์คอมเมนต์ |
| POST | `/api/facebook/hide/:commentId` | ซ่อน/แสดงคอมเมนต์ |
| DELETE | `/api/facebook/comment/:commentId` | ลบคอมเมนต์ |

## 🎨 Screenshots

### หน้าเข้าสู่ระบบ
เข้าสู่ระบบด้วย Facebook อย่างปลอดภัย

### หน้าหลัก
ดูโพสต์และคอมเมนต์ในหน้าเดียว พร้อมตอบกลับได้ทันที

## 📄 License

MIT License

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

Made with ❤️ for Facebook Page managers
