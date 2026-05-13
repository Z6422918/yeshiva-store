import { useState } from 'react';
import { useStore } from '../../store/useStore';
import IsakaotPage from './Isakaot/IsakaotPage';
import MitzraimPage from './Mitzraim/MitzraimPage';
import KesafimPage from './Kesafim/KesafimPage';
import HagdarotPage from './Hagdarot/HagdarotPage';
import { cn } from '../../lib/utils';

type NihulTab = 'mitzraim' | 'isakaot' | 'kesafim' | 'hagdarot';

const tabs: { id: NihulTab; label: string; emoji: string; adminOnly?: boolean }[] = [
  { id: 'mitzraim', label: 'מוצרים', emoji: '📦' },
  { id: 'isakaot',  label: 'עסקאות', emoji: '📊' },
  { id: 'kesafim',  label: 'כספים',  emoji: '💰' },
  { id: 'hagdarot', label: 'הגדרות', emoji: '⚙️', adminOnly: true },
];

export default function NihulPage() {
  const currentUser = useStore(s => s.currentUser);
  const [active, setActive] = useState<NihulTab>('mitzraim');

  const visibleTabs = tabs.filter(t => !t.adminOnly || currentUser?.role === 'admin');

  return (
    <div className="flex flex-1 overflow-hidden" dir="rtl">

      {/* ── Right sidebar menu ── */}
      <nav className="w-48 shrink-0 bg-card border-l border-border p-3 flex flex-col gap-1 overflow-y-auto">
        {visibleTabs.map(tab => (
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
            <span className="text-base">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Content area ── */}
      <div className="flex-1 min-w-0 overflow-y-auto p-5 bg-secondary/30">
        {active === 'mitzraim' && <MitzraimPage />}
        {active === 'isakaot'  && <IsakaotPage />}
        {active === 'kesafim'  && <KesafimPage />}
        {active === 'hagdarot' && currentUser?.role === 'admin' && <HagdarotPage />}
      </div>

    </div>
  );
}
