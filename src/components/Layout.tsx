import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, Settings } from 'lucide-react';
import KupaPage from './kupa/KupaPage';
import NihulPage from './nihul/NihulPage';

function HebrewClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div className="text-center">
      <div className="text-2xl font-bold tracking-widest text-white">{timeStr}</div>
      <div className="text-xs text-blue-200 mt-0.5">{dateStr}</div>
    </div>
  );
}

export default function Layout() {
  const currentUser = useStore(s => s.currentUser);
  const logout = useStore(s => s.logout);
  const storeName = useStore(s => s.settings.storeName);
  const [activeTab, setActiveTab] = useState<'kupa' | 'nihul'>('kupa');

  const canSeeNihul = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-[#1a2e6e] text-white shadow-lg">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          {/* Right: store name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
              <span className="text-[#1a2e6e] font-bold text-xl">ח</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg leading-tight">{storeName}</div>
              <div className="text-xs text-blue-200">{currentUser?.email || currentUser?.name}</div>
            </div>
          </div>

          {/* Center: clock */}
          <HebrewClock />

          {/* Left: logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition text-sm border border-blue-400 hover:border-white rounded-lg px-3 py-1.5"
          >
            התנתק
            <span>→</span>
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 flex justify-center py-2 shadow-sm">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('kupa')}
            className={`flex items-center gap-2 px-8 py-2 rounded-lg font-semibold text-sm transition ${
              activeTab === 'kupa'
                ? 'bg-white text-[#1a2e6e] shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingCart size={16} />
            קופה
          </button>
          {canSeeNihul && (
            <button
              onClick={() => setActiveTab('nihul')}
              className={`flex items-center gap-2 px-8 py-2 rounded-lg font-semibold text-sm transition ${
                activeTab === 'nihul'
                  ? 'bg-white text-[#1a2e6e] shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={16} />
              ניהול
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 w-full">
        {activeTab === 'kupa' && <KupaPage />}
        {activeTab === 'nihul' && canSeeNihul && <NihulPage />}
      </main>
    </div>
  );
}
