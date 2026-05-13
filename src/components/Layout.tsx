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
import { cn } from '../lib/utils';

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
      <span className="font-mono font-bold tabular-nums text-3xl md:text-4xl tracking-tight bg-gradient-to-b from-primary to-accent bg-clip-text text-transparent px-2">
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
    <div className="h-screen flex flex-col overflow-hidden" dir="rtl">

      {/* ── Header ── */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-soft shrink-0 z-40">
        <div className="container py-3 flex items-center gap-4">

          {/* Right: logo + store name */}
          <div className="flex items-center gap-3 shrink-0">
            <img src="/icon.png" alt="לוגו" className="h-11 w-auto rounded-xl" />
            <div>
              <h1 className="text-xl font-bold leading-tight">{storeName}</h1>
              <p className="text-xs text-muted-foreground">{roleLabel} · {currentUser?.name}</p>
            </div>
          </div>

          {/* Center: clock */}
          <div className="flex-1 min-w-0">
            <HeaderClock />
          </div>

          {/* Left: logout */}
          <Button
            variant="ghost" size="sm" className="gap-2 shrink-0"
            onClick={() => { setLogoutPwd(''); setLogoutError(''); setLogoutOpen(true); }}
          >
            <LogOut className="w-4 h-4" /> התנתק
          </Button>
        </div>
      </header>

      {/* ── Tabs bar (managers/admins only) ── */}
      {canManage && (
        <div className="border-b bg-card/60 shrink-0">
          <div className="container py-2">
            <div className="grid bg-muted p-1 rounded-lg grid-cols-2 max-w-xs h-10 mx-auto">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "rounded-md text-sm font-medium transition-smooth flex items-center justify-center gap-2",
                    activeTab === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 min-h-0 overflow-hidden flex">
        <div style={{ display: activeTab === 'kupa' ? 'flex' : 'none' }} className="flex-1 min-h-0 flex-col">
          <KupaPage />
        </div>
        {canManage && (
          <div style={{ display: activeTab === 'nihul' ? 'flex' : 'none' }} className="flex-1 min-h-0 overflow-hidden">
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
