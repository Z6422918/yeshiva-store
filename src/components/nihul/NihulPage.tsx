import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Receipt, Package, Wallet, Settings } from 'lucide-react';
import IsakaotPage from './Isakaot/IsakaotPage';
import MitzraimPage from './Mitzraim/MitzraimPage';
import KesafimPage from './Kesafim/KesafimPage';
import HagdarotPage from './Hagdarot/HagdarotPage';

type NihulTab = 'isakaot' | 'mitzraim' | 'kesafim' | 'hagdarot';

const tabs = [
  { id: 'isakaot' as NihulTab, label: 'עסקאות', icon: Receipt },
  { id: 'mitzraim' as NihulTab, label: 'מוצרים', icon: Package },
  { id: 'kesafim' as NihulTab, label: 'כספים', icon: Wallet },
  { id: 'hagdarot' as NihulTab, label: 'הגדרות', icon: Settings, adminOnly: true },
];

export default function NihulPage() {
  const currentUser = useStore(s => s.currentUser);
  const [active, setActive] = useState<NihulTab>('isakaot');

  const visibleTabs = tabs.filter(t => !t.adminOnly || currentUser?.role === 'admin');

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="bg-white rounded-xl shadow flex overflow-hidden">
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition border-b-2 ${
                active === tab.id
                  ? 'border-blue-700 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {active === 'isakaot' && <IsakaotPage />}
      {active === 'mitzraim' && <MitzraimPage />}
      {active === 'kesafim' && <KesafimPage />}
      {active === 'hagdarot' && currentUser?.role === 'admin' && <HagdarotPage />}
    </div>
  );
}
