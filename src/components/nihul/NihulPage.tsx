import { useState } from 'react';
import { useStore } from '../../store/useStore';
import IsakaotPage from './Isakaot/IsakaotPage';
import MitzraimPage from './Mitzraim/MitzraimPage';
import KesafimPage from './Kesafim/KesafimPage';
import HagdarotPage from './Hagdarot/HagdarotPage';

type NihulTab = 'mitzraim' | 'isakaot' | 'kesafim' | 'hagdarot';

const tabs: { id: NihulTab; label: string; adminOnly?: boolean }[] = [
  { id: 'mitzraim', label: 'מוצרים' },
  { id: 'isakaot', label: 'עסקאות' },
  { id: 'kesafim', label: 'כספים' },
  { id: 'hagdarot', label: 'הגדרות', adminOnly: true },
];

export default function NihulPage() {
  const currentUser = useStore(s => s.currentUser);
  const [active, setActive] = useState<NihulTab>('mitzraim');

  const visibleTabs = tabs.filter(t => !t.adminOnly || currentUser?.role === 'admin');

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0, direction: 'rtl' }}>

      {/* ── Right sidebar menu ── */}
      <nav style={{
        width: 160, flexShrink: 0, background: '#fff',
        borderLeft: '1px solid #eaecf5', padding: '14px 8px',
        display: 'flex', flexDirection: 'column', gap: 4,
        boxShadow: '-2px 0 12px rgba(26,35,126,0.05)',
        overflowY: 'auto',
      }}>
        {visibleTabs.map(tab => {
          const isActive = active === tab.id;
          const iconMap: Record<NihulTab, string> = {
            mitzraim: '📦', isakaot: '📊', kesafim: '💰', hagdarot: '⚙️',
          };
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderRadius: 14, border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all .2s', textAlign: 'right', width: '100%',
                fontFamily: 'inherit',
                background: isActive ? '#eef0fb' : 'transparent',
                color: isActive ? '#1e3166' : '#aab',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = '#f0f2fa'; (e.currentTarget as HTMLButtonElement).style.color = '#1e3166'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#aab'; } }}
            >
              <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{iconMap[tab.id]}</span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── Content area ── */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 20, background: '#f0f2f8' }}>
        {active === 'mitzraim' && <MitzraimPage />}
        {active === 'isakaot' && <IsakaotPage />}
        {active === 'kesafim' && <KesafimPage />}
        {active === 'hagdarot' && currentUser?.role === 'admin' && <HagdarotPage />}
      </div>

    </div>
  );
}
