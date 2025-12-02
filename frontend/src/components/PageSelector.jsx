import { ChevronDown, Users, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function PageSelector({ pages, selectedPage, onSelectPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!pages || pages.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">ไม่พบเพจที่คุณจัดการ</p>
        <p className="text-sm text-gray-500 mt-1">
          กรุณาตรวจสอบว่าบัญชีของคุณเป็นผู้ดูแลเพจ
        </p>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          {selectedPage?.picture?.data?.url ? (
            <img 
              src={selectedPage.picture.data.url} 
              alt={selectedPage.name}
              className="w-12 h-12 rounded-xl ring-2 ring-white/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="text-left">
            <p className="text-white font-medium">
              {selectedPage?.name || 'เลือกเพจ'}
            </p>
            {selectedPage?.fan_count && (
              <p className="text-sm text-gray-400">
                {selectedPage.fan_count.toLocaleString()} ผู้ติดตาม
              </p>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-50 animate-slide-up">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                onSelectPage(page);
                setIsOpen(false);
              }}
              className={`w-full p-4 flex items-center gap-4 hover:bg-white/10 transition-colors ${
                selectedPage?.id === page.id ? 'bg-white/10' : ''
              }`}
            >
              {page.picture?.data?.url ? (
                <img 
                  src={page.picture.data.url} 
                  alt={page.name}
                  className="w-10 h-10 rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-300" />
                </div>
              )}
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{page.name}</p>
                <p className="text-xs text-gray-400">{page.category}</p>
              </div>
              {selectedPage?.id === page.id && (
                <Check className="w-5 h-5 text-green-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
