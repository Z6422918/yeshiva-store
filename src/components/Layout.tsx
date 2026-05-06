import { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogOut, ShoppingCart, Settings } from 'lucide-react';
import KupaPage from './kupa/KupaPage';
import NihulPage from './nihul/NihulPage';

export default function Layout() {
  const currentUser = useStore(s => s.currentUser);
  const logout = useStore(s => s.logout);
  const storeName = useStore(s => s.settings.storeName);
  const [activeTab, setActiveTab] = useState<'kupa' | 'nihul'>(
    currentUser?.role === 'kupa' ? 'kupa' : 'kupa'
  );

  const canSeeNihul = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-bold text-lg">ח</span>
            </div>
            <span className="font-bold text-lg">{storeName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm">שלום, {currentUser?.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-blue-200 hover:text-white transition text-sm"
            >
              <LogOut size={16} />
              יציאה
            </button>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 flex">
          <button
            onClick={() => setActiveTab('kupa')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === 'kupa'
                ? 'border-white text-white'
                : 'border-transparent text-blue-200 hover:text-white'
            }`}
          >
            <ShoppingCart size={18} />
            קופה
          </button>
          {canSeeNihul && (
            <button
              onClick={() => setActiveTab('nihul')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === 'nihul'
                  ? 'border-white text-white'
                  : 'border-transparent text-blue-200 hover:text-white'
              }`}
            >
              <Settings size={18} />
              ניהול
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === 'kupa' && <KupaPage />}
        {activeTab === 'nihul' && canSeeNihul && <NihulPage />}
      </main>
    </div>
  );
}
