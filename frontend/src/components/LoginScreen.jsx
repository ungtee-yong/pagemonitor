import { Facebook, MessageCircle, Shield, Zap, Users } from 'lucide-react';

export default function LoginScreen({ onLogin, error }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            FB Comments Manager
          </h1>
          <p className="text-gray-400">
            จัดการคอมเมนต์เพจ Facebook ของคุณได้ง่ายและรวดเร็ว
          </p>
        </div>

        {/* Features */}
        <div className="glass rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">ตอบกลับทันที</h3>
                <p className="text-sm text-gray-400">ตอบคอมเมนต์ได้รวดเร็วโดยไม่ต้องเปิด Facebook</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">ดูข้อมูลแฟนเพจ</h3>
                <p className="text-sm text-gray-400">เห็นรูปโปรไฟล์และชื่อผู้คอมเมนต์ชัดเจน</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">ปลอดภัย</h3>
                <p className="text-sm text-gray-400">เข้าสู่ระบบผ่าน Facebook โดยตรง ไม่เก็บรหัสผ่าน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            onClick={onLogin}
            className="w-full py-4 px-6 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-500/30 hover-lift"
          >
            <Facebook className="w-5 h-5" />
            เข้าสู่ระบบด้วย Facebook
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            เราจะขอสิทธิ์เข้าถึงเพจที่คุณจัดการเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}
