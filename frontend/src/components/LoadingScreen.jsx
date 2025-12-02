import { MessageCircle } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 animate-pulse-soft">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          
          {/* Loading ring */}
          <div className="absolute inset-0 w-20 h-20 mx-auto">
            <svg className="w-full h-full animate-spin" style={{ animationDuration: '2s' }} viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(99, 102, 241, 0.3)"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="180 360"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-display font-bold text-white mt-6 mb-2">
          กำลังโหลด...
        </h1>
        <p className="text-gray-400 text-sm">
          กำลังเชื่อมต่อกับ Facebook
        </p>
      </div>
    </div>
  );
}
