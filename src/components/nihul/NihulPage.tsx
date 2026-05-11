import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Receipt, Package, Wallet, Settings } from 'lucide-react';
import IsakaotPage from './Isakaot/IsakaotPage';
import MitzraimPage from './Mitzraim/MitzraimPage';
import KesafimPage from './Kesafim/KesafimPage';
import HagdarotPage from './Hagdarot/HagdarotPage';
import { cn } from '../../lib/utils';

type NihulTab = 'mitzraim' | 'isakaot' | 'kesafim' | 'hagdarot';

const tabs: { id: NihulTab; label: string; Icon: typeof Package; adminOnly?: boolean }[] = [
  { id: 'mitzraim', label: 'מוצרים', Icon: Package },
  { id: 'isakaot', label: 'עסקאות', Icon: Receipt },
  { id: 'kesafim', label: 'כספים', Icon: Wallet },
  { id: 'hagdarot', label: 'הגדרות', Icon: Settings, adminOnly: true },
];

export default function NihulPage() {
  const currentUser = useStore(s => s.currentUser);
  const [active, setActive] = useState<NihulTab>('mitzraim');

  const visibleTabs = tabs.filter(t => !t.adminOnly || currentUser?.role === 'admin');

  return (
    <div className="flex gap-6 flex-1 overflow-hidden" dir="rtl">

      {/* ── Right sidebar menu ── */}
      <nav className="w-48 shrink-0 space-y-1 pt-1">
        {visibleTabs.map(tab => {
          const { Icon } = tab;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-smooth text-right",
                active === tab.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── Content area ── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {active === 'mitzraim' && <MitzraimPage />}
        {active === 'isakaot' && <IsakaotPage />}
        {active === 'kesafim' && <KesafimPage />}
        {active === 'hagdarot' && currentUser?.role === 'admin' && <HagdarotPage />}
      </div>

    </div>
  );
}
