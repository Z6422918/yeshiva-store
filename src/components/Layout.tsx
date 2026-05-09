import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, LayoutDashboard, LogOut, Clock } from 'lucide-react';
import KupaPage from './kupa/KupaPage';
import NihulPage from './nihul/NihulPage';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2 backdrop-blur-sm border border-white/20">
      <Clock size={14} className="text-indigo-200" />
      <div className="text-center">
        <div className="text-lg font-bold tracking-widest text-white leading-none">{time}</div>
        <div className="text-[10px] text-indigo-200 mt-0.5">{date}</div>
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
    <div className="min-h-screen flex flex-col" dir="rtl">

      {/* ── Header ── */}
      <header className="relative overflow-hidden bg-gradient-to-l from-indigo-700 via-violet-700 to-purple-800 shadow-2xl">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 left-20 w-36 h-36 bg-indigo-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 w-full px-6 py-3 flex items-center justify-between">
          {/* Store name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-lg flex items-center justify-center">
              <span className="text-indigo-700 font-black text-xl">ח</span>
            </div>
            <div>
              <div className="font-black text-xl text-white leading-tight tracking-wide">{storeName}</div>
              <div className="text-[11px] text-indigo-200">{currentUser?.name}</div>
            </div>
          </div>

          {/* Clock */}
          <LiveClock />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
          >
            <LogOut size={15} />
            התנתק
          </button>
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="flex justify-center py-2.5 px-4">
          <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5">
            <TabBtn
              active={activeTab === 'kupa'}
              onClick={() => setActiveTab('kupa')}
              icon={<ShoppingCart size={16} />}
              label="קופה"
              color="indigo"
            />
            {canSeeNihul && (
              <TabBtn
                active={activeTab === 'nihul'}
                onClick={() => setActiveTab('nihul')}
                icon={<LayoutDashboard size={16} />}
                label="ניהול"
                color="violet"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'kupa' && <KupaPage />}
        {activeTab === 'nihul' && canSeeNihul && <NihulPage />}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, color }: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; color: 'indigo' | 'violet';
}) {
  const activeClass = color === 'indigo'
    ? 'bg-gradient-to-l from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
    : 'bg-gradient-to-l from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
        active ? activeClass + ' scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-white/70'
      }`}
    >
      {icon}{label}
    </button>
  );
}
