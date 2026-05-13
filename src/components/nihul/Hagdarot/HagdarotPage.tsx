import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../../store/useStore';
import { RotateCcw, AlertTriangle, ShieldAlert, Landmark, Users } from 'lucide-react';
import type { User, UserRole } from '../../../types';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Label } from '../../ui/label';

// ─── Constants ─────────────────────────────────────────────────────────────────
const NAVY = '#1e3166';
const TH_COLOR = '#9fa8da';
const F = "'Heebo', sans-serif";

const sCard: React.CSSProperties = {
  background: '#fff', borderRadius: 18, padding: 20, marginBottom: 16,
  border: '1px solid #eaecf5', boxShadow: '0 2px 12px rgba(26,35,126,0.06)',
};
const sTitle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 15, fontWeight: 900, color: NAVY, marginBottom: 8,
  fontFamily: F,
};
const sSub: React.CSSProperties = {
  fontSize: 11, color: '#bbb', marginTop: 2, fontFamily: F,
};
const sRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '11px 0', borderBottom: '1px solid #f4f6fb',
};
const sLabel: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: '#333', fontFamily: F,
};
const sInput: React.CSSProperties = {
  border: '1.5px solid #e0e4f0', borderRadius: 11, padding: '8px 13px',
  fontSize: 13, fontFamily: F, color: '#333', outline: 'none',
  width: 200, textAlign: 'right',
};
const btnNavy: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '10px 18px', borderRadius: 12, border: 'none',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
  background: NAVY, color: '#fff',
  boxShadow: '0 4px 12px rgba(30,49,102,0.25)', fontFamily: F,
};
const btnLight: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', borderRadius: 10, border: '1.5px solid #d5d9ef',
  fontSize: 12, fontWeight: 700, cursor: 'pointer',
  background: '#fff', color: '#5c6bc0', fontFamily: F,
};
const thStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, color: TH_COLOR, textAlign: 'right', fontFamily: F,
};
const roleLabels: Record<UserRole, string> = {
  kupa: 'קופה', manager: 'מנהל', admin: 'מנהל ראשי',
};

// ─── Nedarim Settings ──────────────────────────────────────────────────────────
function NedarimSettings() {
  const { settings, updateSettings } = useStore();
  const [mosadId, setMosadId] = useState(settings.nedarimInstitutionCode ?? '');
  const [apiUrl,  setApiUrl]  = useState('');
  const [matchId, setMatchId] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleSave = () => {
    setSaving(true);
    updateSettings({ nedarimInstitutionCode: mosadId.trim() });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div style={sCard}>
      <div style={sTitle}><Landmark className="w-5 h-5" style={{ color: '#c8890a' }} /> חיבור לנדרים פלוס</div>
      <p style={{ fontSize: 12, color: TH_COLOR, marginBottom: 16, fontFamily: F }}>
        הזן את כתובת ה-API של נדרים פלוס וקוד המוסד שלך. ההגדרות נשמרות בענן ומסונכרנות לכל המשתמשים במערכת.
      </p>
      <div style={{ ...sRow }}>
        <div><div style={sLabel}>שם החנות</div></div>
        <input style={sInput} value={settings.storeName} onChange={e => updateSettings({ storeName: e.target.value })} />
      </div>
      <div style={{ ...sRow }}>
        <div><div style={sLabel}>כתובת ה-API של נדרים פלוס</div></div>
        <input style={{ ...sInput, direction: 'ltr', textAlign: 'left', width: 280 }} value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://matara.pro/nedarimplus/..." />
      </div>
      <div style={{ ...sRow }}>
        <div><div style={sLabel}>קוד מוסד (MosadId)</div></div>
        <input style={{ ...sInput, direction: 'ltr', textAlign: 'left' }} value={mosadId} onChange={e => setMosadId(e.target.value)} placeholder="7011179" />
      </div>
      <div style={{ ...sRow, borderBottom: 'none' }}>
        <div>
          <div style={sLabel}>קוד מאצ'ינג (MatchId)</div>
          <div style={sSub}>נדרש רק לשליפת מגייסים ויעדים. אם אין לך, השאר ריק.</div>
        </div>
        <input style={{ ...sInput, direction: 'ltr', textAlign: 'left' }} value={matchId} onChange={e => setMatchId(e.target.value)} placeholder="מזהה התאמה (אופציונלי)" />
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={handleSave} disabled={saving} style={btnNavy}>
          💾 {saving ? 'שומר...' : saved ? '✓ נשמר!' : 'שמור הגדרות נדרים פלוס'}
        </button>
      </div>
    </div>
  );
}

// ─── User Dialog ───────────────────────────────────────────────────────────────
function UserDialog({ open, onClose, editUser }: { open: boolean; onClose: () => void; editUser?: User }) {
  const { addUser, updateUser } = useStore();
  const [form, setForm] = useState({
    name:     editUser?.name     ?? '',
    username: editUser?.username ?? '',
    password: editUser?.password ?? '',
    role:    (editUser?.role     ?? 'kupa') as UserRole,
  });

  useEffect(() => {
    if (open) setForm({
      name:     editUser?.name     ?? '',
      username: editUser?.username ?? '',
      password: editUser?.password ?? '',
      role:    (editUser?.role     ?? 'kupa') as UserRole,
    });
  }, [open, editUser]);

  const handleSave = () => {
    if (!form.name.trim() || !form.username.trim()) return;
    if (editUser) updateUser(editUser.id, form);
    else addUser(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{editUser ? '✏️ עריכת משתמש' : '👤 הוספת משתמש חדש'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>שם מלא</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="שם..." /></div>
          <div className="space-y-1.5"><Label>תפקיד</Label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="admin">מנהל ראשי</option>
              <option value="manager">מנהל</option>
              <option value="kupa">קופה</option>
            </select></div>
          <div className="space-y-1.5"><Label>אימייל / שם משתמש</Label>
            <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} dir="ltr" placeholder="user@example.com" /></div>
          <div className="space-y-1.5"><Label>סיסמה</Label>
            <Input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="לפחות 4 תווים" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>{editUser ? 'שמור' : '+ צור משתמש'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Users Management ──────────────────────────────────────────────────────────
function UsersManagement() {
  const { users, updateUser, deleteUser, currentUser } = useStore();
  const [dlg, setDlg] = useState<{ open: boolean; edit?: User }>({ open: false });
  const [tick, setTick] = useState(0);

  const colGrid = '1fr 1fr 130px 220px';

  return (
    <div style={sCard}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={sTitle}><Users className="w-5 h-5" style={{ color: NAVY }} /> ניהול משתמשים</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTick(t => t + 1)} style={btnLight} title="רענן">
            <RotateCcw className="w-3.5 h-3.5" /> רענן
          </button>
          <button onClick={() => setDlg({ open: true })} style={btnNavy}>👤+ הוספת משתמש חדש</button>
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: colGrid, gap: 0, background: '#f8f9fd', borderRadius: 10, padding: '8px 12px', marginBottom: 4 }}>
        {['שם', 'אימייל', 'תפקיד', 'פעולות'].map(h => (
          <div key={h} style={thStyle}>{h}</div>
        ))}
      </div>

      {users.map(u => {
        const isMe = u.id === currentUser?.id;
        return (
          <div key={u.id + tick} style={{ display: 'grid', gridTemplateColumns: colGrid, gap: 0, alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #f4f6fb' }}>
            {/* שם */}
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: F }}>
              {u.name}{isMe && <span style={{ fontSize: 10, color: TH_COLOR, marginRight: 5 }}>אני</span>}
            </div>
            {/* אימייל */}
            <div style={{ fontSize: 12, color: TH_COLOR, fontFamily: F, direction: 'ltr', textAlign: 'right' }}>{u.username}</div>
            {/* תפקיד — select */}
            <div>
              <select
                value={u.role}
                onChange={e => updateUser(u.id, { role: e.target.value as UserRole })}
                style={{ border: '1.5px solid #e0e4f0', borderRadius: 8, padding: '4px 8px', fontSize: 12, fontFamily: F, color: NAVY, background: '#f8f9fd', cursor: 'pointer' }}
              >
                <option value="admin">מנהל ראשי</option>
                <option value="manager">מנהל</option>
                <option value="kupa">קופה</option>
              </select>
            </div>
            {/* פעולות */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setDlg({ open: true, edit: u })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', background: '#eef0fb', color: '#5c6bc0', fontSize: 11, fontWeight: 700, fontFamily: F }}
              >
                ✏️ עריכה / איפוס סיסמה
              </button>
              {!isMe && (
                <button
                  onClick={() => { if (window.confirm(`למחוק את ${u.name}?`)) deleteUser(u.id); }}
                  style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#ffebee', color: '#e57373', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                  title="מחק"
                >🗑</button>
              )}
            </div>
          </div>
        );
      })}

      <UserDialog open={dlg.open} onClose={() => setDlg({ open: false })} editUser={dlg.edit} />
    </div>
  );
}

// ─── Reset System ──────────────────────────────────────────────────────────────
const RESET_CODE = 'RESET-7777';
const COUNTDOWN_SECONDS = 60;
type ResetStep = 'idle' | 'confirm1' | 'confirm2' | 'code' | 'confirm3' | 'countdown' | 'resetting';

function ResetSystem() {
  const [step, setStep]               = useState<ResetStep>('idle');
  const [codeInput, setCodeInput]     = useState('');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancelReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setStep('idle'); setCodeInput(''); setSecondsLeft(COUNTDOWN_SECONDS);
  }, []);

  const startCountdown = useCallback(() => {
    setStep('countdown'); setSecondsLeft(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => { if (step === 'countdown' && secondsLeft === 0) performReset(); }, [step, secondsLeft]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const performReset = () => { setStep('resetting'); localStorage.clear(); setTimeout(() => window.location.reload(), 1500); };
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * 100;

  const Overlay = ({ open, children }: { open: boolean; children: React.ReactNode }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80" />
        <div className="relative z-50 bg-background rounded-lg shadow-lg border p-6 w-full max-w-md mx-4" dir="rtl" onClick={e => e.stopPropagation()}>{children}</div>
      </div>
    );
  };

  return (
    <>
      <Card className="p-6 shadow-soft border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-bold text-destructive">איפוס מערכת</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          איפוס מלא ימחק את כל הנתונים במערכת: מוצרים, הזמנות, מכירות, חיובים, הגדרות ועוד.
          <strong className="text-destructive"> פעולה זו בלתי הפיכה!</strong>
        </p>
        <Button variant="destructive" onClick={() => setStep('confirm1')} className="gap-2">
          <RotateCcw className="w-4 h-4" /> איפוס מלא של המערכת
        </Button>
      </Card>

      <Overlay open={step === 'confirm1'}>
        <div className="flex items-center gap-2 mb-2 text-destructive"><AlertTriangle className="w-5 h-5" /><h2 className="text-lg font-bold">האם אתה בטוח?</h2></div>
        <p className="text-sm text-muted-foreground mb-4">פעולה זו תמחק את <strong>כל הנתונים</strong> במערכת. לא ניתן לשחזר.</p>
        <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setStep('idle')}>ביטול</Button><Button variant="destructive" onClick={() => setStep('confirm2')}>כן, אני בטוח</Button></div>
      </Overlay>

      <Overlay open={step === 'confirm2'}>
        <div className="flex items-center gap-2 mb-2 text-destructive"><AlertTriangle className="w-5 h-5" /><h2 className="text-lg font-bold">האם אתה באמת בטוח?</h2></div>
        <p className="text-sm text-muted-foreground mb-4">זוהי אזהרה אחרונה. כל הנתונים יימחקו לצמיתות. אין דרך חזרה!</p>
        <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setStep('idle')}>ביטול</Button><Button variant="destructive" onClick={() => setStep('code')}>כן, אני באמת בטוח</Button></div>
      </Overlay>

      <Overlay open={step === 'code'}>
        <div className="flex items-center gap-2 mb-2 text-destructive"><ShieldAlert className="w-5 h-5" /><h2 className="text-lg font-bold">הזן קוד אישור מיוחד</h2></div>
        <p className="text-sm text-muted-foreground mb-4">כדי לאשר את האיפוס, הזן את הקוד: <strong className="text-foreground font-mono text-lg">{RESET_CODE}</strong></p>
        <Input dir="ltr" value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase())} placeholder="הזן קוד אישור..." className="text-center font-mono text-lg tracking-widest mb-4" autoFocus />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setStep('idle'); setCodeInput(''); }}>ביטול</Button>
          <Button variant="destructive" disabled={!codeInput.trim()} onClick={() => { if (codeInput.trim() === RESET_CODE) setStep('confirm3'); else setCodeInput(''); }}>אישור</Button>
        </div>
      </Overlay>

      <Overlay open={step === 'confirm3'}>
        <div className="flex items-center gap-2 mb-2 text-destructive"><AlertTriangle className="w-6 h-6" /><h2 className="text-lg font-bold">אישור סופי</h2></div>
        <p className="text-sm text-muted-foreground mb-4">לאחר לחיצה תתחיל ספירה לאחור של דקה. תוכל לבטל במהלכה.</p>
        <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => { setStep('idle'); setCodeInput(''); }}>ביטול</Button><Button variant="destructive" onClick={startCountdown}>התחל איפוס</Button></div>
      </Overlay>

      <Overlay open={step === 'countdown' || step === 'resetting'}>
        <div className="text-center">
          <h2 className="text-lg font-bold text-destructive flex items-center justify-center gap-2 mb-6">
            {step === 'resetting' ? <><RotateCcw className="w-6 h-6 animate-spin" />מאפס...</> : <><AlertTriangle className="w-6 h-6 animate-pulse" />המערכת תאופס בעוד</>}
          </h2>
          {step === 'countdown' && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--destructive))" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                    strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold font-mono text-destructive">{fmtTime(secondsLeft)}</span>
                </div>
              </div>
              <Button variant="outline" size="lg" onClick={cancelReset} className="w-full border-primary text-primary hover:bg-primary/10 text-lg font-bold">❌ בטל איפוס</Button>
            </div>
          )}
          {step === 'resetting' && <div className="flex flex-col items-center gap-4 py-8"><RotateCcw className="w-12 h-12 text-destructive animate-spin" /><p className="text-muted-foreground">מוחק...</p></div>}
        </div>
      </Overlay>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HagdarotPage() {
  return (
    <div dir="rtl" style={{ maxWidth: 860, margin: '0 auto' }}>
      <NedarimSettings />
      <UsersManagement />
      <ResetSystem />
    </div>
  );
}
