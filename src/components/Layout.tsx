import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import KupaPage from './kupa/KupaPage';
import NihulPage from './nihul/NihulPage';
import { formatTime, formatHebrew, formatWeekday, formatParasha } from '../lib/hebrewDate';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { LogOut } from 'lucide-react';

// ── Hebrew clock ──
function HeaderClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtGregNumeric = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

  const fmtGregMonthName = (d: Date) => {
    const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    return months[d.getMonth()];
  };

  return (
    <div className="flex items-center justify-center gap-3 w-full" dir="rtl">
      {/* ימין: יום + פרשה */}
      <div className="flex flex-col items-end text-right leading-tight">
        <span className="text-sm font-bold text-foreground whitespace-nowrap">{formatWeekday(now)}</span>
        <span className="text-xs text-accent font-semibold whitespace-nowrap">{formatParasha(now)}</span>
      </div>
      {/* שעון גדול */}
      <span className="font-mono font-bold tabular-nums text-3xl tracking-tight bg-gradient-to-b from-primary to-accent bg-clip-text text-transparent px-2">
        {formatTime(now)}
      </span>
      {/* שמאל: תאריך עברי + לועזי */}
      <div className="flex flex-col items-start text-left leading-tight">
        <span className="text-sm font-bold text-accent whitespace-nowrap">{formatHebrew(now)}</span>
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          <span dir="ltr">{fmtGregNumeric(now)}</span> · {fmtGregMonthName(now)}
        </span>
      </div>
    </div>
  );
}

type TabValue = 'kupa' | 'nihul';

const TABS: { value: TabValue; emoji: string; label: string }[] = [
  { value: 'kupa',  emoji: '🛒', label: 'קופה'  },
  { value: 'nihul', emoji: '⚙️', label: 'ניהול' },
];

export default function Layout() {
  const currentUser = useStore(s => s.currentUser);
  const storeName   = useStore(s => s.settings.storeName);
  const logout      = useStore(s => s.logout);

  const [activeTab,   setActiveTab]   = useState<TabValue>('kupa');
  const [logoutOpen,  setLogoutOpen]  = useState(false);
  const [logoutPwd,   setLogoutPwd]   = useState('');
  const [logoutError, setLogoutError] = useState('');

  const canManage = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  const roleLabel = currentUser?.role === 'admin'   ? 'מנהל ראשי'
                  : currentUser?.role === 'manager' ? 'מנהל'
                  : 'קופה';

  const confirmLogout = () => {
    if (!logoutPwd) { setLogoutError('יש להזין סיסמה'); return; }
    if (logoutPwd !== currentUser?.password) { setLogoutError('סיסמה שגויה'); return; }
    setLogoutOpen(false); setLogoutPwd(''); setLogoutError('');
    logout();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', direction: 'rtl' }}>

      {/* ── Header ── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e4e8f0',
        padding: '0 24px', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(26,35,126,0.07)', flexShrink: 0,
      }}>
        {/* Right: logo + store name */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/icon.png" alt="לוגו" style={{ height: 46, width: 'auto' }} />
          <div style={{ marginRight: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1e3166', letterSpacing: '0.3px', fontFamily: "'Heebo', sans-serif" }}>
              {storeName}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500, marginTop: 2, fontFamily: "'Heebo', sans-serif" }}>
              {roleLabel} · {currentUser?.name}
            </div>
          </div>
        </div>

        {/* Center: clock */}
        <HeaderClock />

        {/* Left: logout button */}
        <button
          onClick={() => { setLogoutPwd(''); setLogoutError(''); setLogoutOpen(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 700, color: '#666',
            border: '1.5px solid #e0e4f0', borderRadius: 12,
            padding: '8px 16px', background: '#fff', cursor: 'pointer',
            transition: 'all .2s', fontFamily: "'Heebo', sans-serif",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#9fa8da'; (e.currentTarget as HTMLButtonElement).style.color = '#1e3166'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e0e4f0'; (e.currentTarget as HTMLButtonElement).style.color = '#666'; }}
        >
          → התנתק
        </button>
      </header>

      {/* ── Tabs bar (managers/admins only) ── */}
      {canManage && (
        <div style={{
          background: '#fff', borderBottom: '1px solid #eaecf5',
          display: 'flex', justifyContent: 'center', padding: 10, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 4, background: '#eef0f8', borderRadius: 16, padding: 5 }}>
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 44px', borderRadius: 12, border: 'none',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'all .2s', fontFamily: "'Heebo', sans-serif",
                  background: activeTab === tab.value ? '#1e3166' : 'transparent',
                  color:      activeTab === tab.value ? '#fff'    : '#9fa8da',
                  boxShadow:  activeTab === tab.value ? '0 4px 14px rgba(30,49,102,0.3)' : 'none',
                }}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
        <div style={{ display: activeTab === 'kupa'  ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>
          <KupaPage />
        </div>
        {canManage && (
          <div style={{ display: activeTab === 'nihul' ? 'flex' : 'none', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <NihulPage />
          </div>
        )}
      </div>

      {/* ── Logout dialog ── */}
      <Dialog open={logoutOpen} onOpenChange={o => { if (!o) { setLogoutOpen(false); setLogoutPwd(''); setLogoutError(''); } }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" /> אישור התנתקות
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">לאישור ההתנתקות, נא להזין את הסיסמה.</p>
            <div className="space-y-1.5">
              <Label>סיסמה</Label>
              <Input
                type="password"
                value={logoutPwd}
                onChange={e => { setLogoutPwd(e.target.value); setLogoutError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') confirmLogout(); }}
                autoFocus
              />
              {logoutError && <p className="text-sm text-destructive">{logoutError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLogoutOpen(false); setLogoutPwd(''); setLogoutError(''); }}>ביטול</Button>
            <Button onClick={confirmLogout} variant="destructive">התנתק</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
