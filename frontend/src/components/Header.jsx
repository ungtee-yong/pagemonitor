import { LogOut, MessageCircle, User } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="glass-strong sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-white">
                FB Comments Manager
              </h1>
              <p className="text-xs text-gray-400">จัดการคอมเมนต์เพจของคุณ</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {user.picture?.data?.url ? (
                  <img 
                    src={user.picture.data.url} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-2 ring-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                <span className="text-sm text-gray-200 hidden sm:block">
                  {user.name}
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
