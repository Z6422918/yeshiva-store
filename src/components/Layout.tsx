import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, Settings, LogOut } from 'lucide-react';
import KupaPage from './kupa/KupaPage';
import NihulPage from './nihul/NihulPage';
import { cn } from '../lib/utils';
import { formatTime, formatHebrew, formatWeekday, formatParasha } from '../lib/hebrewDate';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

// ── Hebrew clock component (matches Lovable's HeaderClock exactly) ──
function HeaderClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtGregNumeric = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

  const fmtGregMonthName = (d: Date) => {
    const months = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
    return months[d.getMonth()];
  };

  return (
    <div className="flex items-center justify-center gap-3 w-full" dir="rtl">
      {/* Right: weekday + parasha */}
      <div className="flex flex-col items-end text-right leading-tight">
        <span className="text-sm font-bold text-foreground">{formatWeekday(now)}</span>
        <span className="text-xs font-semibold" style={{ color: 'hsl(var(--accent))' }}>{formatParasha(now)}</span>
      </div>
      {/* Center: big clock with gradient text */}
      <span
        className="font-mono font-bold tabular-nums text-3xl md:text-4xl tracking-tight px-2"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--accent)))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {formatTime(now)}
      </span>
      {/* Left: Hebrew date + Gregorian */}
      <div className="flex flex-col items-start text-left leading-tight">
        <span className="text-sm font-bold" style={{ color: 'hsl(var(--accent))' }}>{formatHebrew(now)}</span>
        <span className="text-xs font-medium text-muted-foreground">
          <span dir="ltr">{fmtGregNumeric(now)}</span> · {fmtGregMonthName(now)}
        </span>
      </div>
    </div>
  );
}

const tabs = [
  { value: "kupa", label: "קופה", icon: ShoppingCart },
  { value: "nihul", label: "ניהול", icon: Settings },
] as const;

type TabValue = "kupa" | "nihul";

export default function Layout() {
  const currentUser = useStore(s => s.currentUser);
  const storeName = useStore(s => s.settings.storeName);
  const logout = useStore(s => s.logout);
  const [activeTab, setActiveTab] = useState<TabValue>("kupa");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPwd, setLogoutPwd] = useState('');
  const [logoutError, setLogoutError] = useState('');

  const canManage = currentUser?.role === 'manager' || currentUser?.role === 'admin';
  const roleLabel = currentUser?.role === 'admin' ? 'מנהל ראשי' : currentUser?.role === 'manager' ? 'מנהל' : 'קופה';

  const confirmLogout = () => {
    if (!logoutPwd) { setLogoutError('יש להזין סיסמה'); return; }
    if (logoutPwd !== currentUser?.password) { setLogoutError('סיסמה שגויה'); return; }
    setLogoutOpen(false);
    setLogoutPwd('');
    setLogoutError('');
    logout();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" dir="rtl">

      {/* ── Header ── */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-soft shrink-0 z-40">
        <div className="w-full px-6 py-3 flex items-center gap-4">

          {/* Right: logo + store name */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold leading-tight">{storeName}</h1>
              <img
                src="/favicon.png"
                alt=""
                aria-hidden="true"
                className="opacity-90 shrink-0"
                style={{ height: '20px', width: '176px', objectFit: 'contain' }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {roleLabel} • {currentUser?.name}
            </p>
          </div>

          {/* Center: Hebrew clock */}
          <div className="flex-1 min-w-0">
            <HeaderClock />
          </div>

          {/* Left: logout button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setLogoutPwd(''); setLogoutError(''); setLogoutOpen(true); }}
            className="gap-2 shrink-0"
          >
            <LogOut className="w-4 h-4" /> התנתק
          </Button>

        </div>
      </header>

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

      {/* ── Main content ── */}
      <main className="px-4 py-4 flex-1 min-h-0 flex flex-col overflow-hidden">

        {/* Tab bar — only for managers/admins */}
        {canManage && (
          <div className="grid w-full mx-auto mb-4 h-11 rounded-lg bg-muted p-1 grid-cols-2 max-w-md shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  activeTab === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* All tabs always rendered, hidden via CSS to preserve state */}
        <div className={cn("flex-1 min-h-0", activeTab === "kupa" ? "flex flex-col" : "hidden")}>
          <KupaPage />
        </div>
        {canManage && (
          <div className={cn("flex-1 min-h-0 overflow-hidden flex", activeTab === "nihul" ? "" : "hidden")}>
            <NihulPage />
          </div>
        )}
      </main>
    </div>
  );
}
