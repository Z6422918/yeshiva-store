import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, Settings, LogOut } from 'lucide-react';
import KupaPage from './kupa/KupaPage';
import NihulPage from './nihul/NihulPage';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const time = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const weekday = now.toLocaleDateString('he-IL', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="text-center select-none">
      <div className="text-3xl font-black tracking-widest text-gray-800" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {time}
      </div>
      <div className="text-xs font-medium mt-0.5" style={{ color: '#c8890a' }}>
        {weekday} {dateStr}
      </div>
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
    <div className="min-h-screen flex flex-col bg-[#f4f6fb]" dir="rtl">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6 py-3 flex items-center justify-between">

          {/* Right: logo + store name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: '#1e3166' }}>
              <span className="text-white font-black text-lg">ח</span>
            </div>
            <div className="text-right">
              <div className="font-black text-lg text-gray-900 leading-tight">{storeName}</div>
              <div className="text-xs text-gray-400 font-medium">{currentUser?.name} · {currentUser?.role === 'admin' ? 'מנהל ראשי' : currentUser?.role === 'manager' ? 'מנהל' : 'קופה'}</div>
            </div>
          </div>

          {/* Center: clock */}
          <LiveClock />

          {/* Left: logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150"
          >
            התנתק
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex justify-center py-2.5">
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('kupa')}
              className={`flex items-center gap-2 px-10 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === 'kupa'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <ShoppingCart size={15} />
              קופה
            </button>
            {canSeeNihul && (
              <button
                onClick={() => setActiveTab('nihul')}
                className={`flex items-center gap-2 px-10 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === 'nihul'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Settings size={15} />
                ניהול
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'kupa' && <KupaPage />}
        {activeTab === 'nihul' && canSeeNihul && <div className="flex-1 overflow-hidden flex"><NihulPage /></div>}
      </main>
    </div>
  );
}
