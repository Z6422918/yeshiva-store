import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Receipt, Package, Wallet, Settings } from 'lucide-react';
import IsakaotPage from './Isakaot/IsakaotPage';
import MitzraimPage from './Mitzraim/MitzraimPage';
import KesafimPage from './Kesafim/KesafimPage';
import HagdarotPage from './Hagdarot/HagdarotPage';

type NihulTab = 'mitzraim' | 'isakaot' | 'kesafim' | 'hagdarot';

const NAVY = '#1e3166';

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
    <div className="flex flex-1 overflow-hidden" dir="rtl">

      {/* ══ SIDE NAV (RIGHT in RTL) ══ */}
      <div
        className="flex-shrink-0 flex flex-col gap-1 p-2"
        style={{
          width: 156,
          background: '#fff',
          borderLeft: '1px solid #eaecf5',
          boxShadow: '-2px 0 12px rgba(26,35,126,0.05)',
        }}
      >
        {visibleTabs.map(tab => {
          const { Icon } = tab;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="flex items-center gap-2.5 w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
              style={
                isActive
                  ? { background: '#eef0fb', color: NAVY }
                  : { background: 'transparent', color: '#aab' }
              }
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.cssText += 'background:#f4f6fb;color:#1e3166;'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.cssText = 'background:transparent;color:#aab;'; }}
            >
              <Icon size={16} style={{ flexShrink: 0, color: isActive ? NAVY : '#bbc' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 overflow-y-auto p-5" style={{ background: '#f0f2f8' }}>
        {active === 'mitzraim' && <MitzraimPage />}
        {active === 'isakaot' && <IsakaotPage />}
        {active === 'kesafim' && <KesafimPage />}
        {active === 'hagdarot' && currentUser?.role === 'admin' && <HagdarotPage />}
      </div>

    </div>
  );
}
