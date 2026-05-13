import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../../store/useStore';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import type { User, UserRole, Supplier } from '../../../types';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Label } from '../../ui/label';

// ─── Constants ─────────────────────────────────────────────────────────────────
const NAVY = '#1e3166';
const TH_COLOR = '#9fa8da';

const sCard: React.CSSProperties = {
  background: '#fff', borderRadius: 18, padding: 20, marginBottom: 16,
  border: '1px solid #eaecf5', boxShadow: '0 2px 12px rgba(26,35,126,0.06)',
};
const sTitle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontSize: 15, fontWeight: 900, color: NAVY, marginBottom: 16,
  paddingBottom: 12, borderBottom: '1px solid #eaecf5',
  fontFamily: "'Heebo', sans-serif",
};
const sRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '11px 0', borderBottom: '1px solid #f4f6fb',
};
const sLabel: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: '#333', fontFamily: "'Heebo', sans-serif",
};
const sSub: React.CSSProperties = {
  fontSize: 11, color: '#bbb', marginTop: 2, fontFamily: "'Heebo', sans-serif",
};
const sInput: React.CSSProperties = {
  border: '1.5px solid #e0e4f0', borderRadius: 11, padding: '8px 13px',
  fontSize: 13, fontFamily: "'Heebo', sans-serif", color: '#333', outline: 'none',
  width: 260, textAlign: 'right',
};
const btnNavy: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '10px 20px', borderRadius: 12, border: 'none',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
  background: NAVY, color: '#fff',
  boxShadow: '0 4px 12px rgba(30,49,102,0.25)',
  fontFamily: "'Heebo', sans-serif",
};
const userRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 0', borderBottom: '1px solid #f4f6fb',
};
const iconBtnStyle = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '5px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
  background: bg, color, fontSize: 12, fontWeight: 700,
  fontFamily: "'Heebo', sans-serif", transition: 'all .2s',
});

const roleLabels: Record<UserRole, string> = {
  kupa: 'קופה', manager: 'מנהל', admin: 'מנהל ראשי',
};
const roleBadgeStyle = (role: UserRole): React.CSSProperties => {
  if (role === 'admin')   return { background: '#f3e5f5', color: '#6a1b9a' };
  if (role === 'manager') return { background: '#eef0fb', color: NAVY };
  return { background: '#e8f5e9', color: '#2e7d32' };
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
      <div style={sTitle}>🏛 חיבור לנדרים פלוס</div>
      <div style={{ ...sRow, borderBottom: '1px solid #f4f6fb' }}>
        <div><div style={sLabel}>שם החנות</div></div>
        <input style={sInput} value={settings.storeName} onChange={e => updateSettings({ storeName: e.target.value })} />
      </div>
      <div style={{ ...sRow, borderBottom: '1px solid #f4f6fb' }}>
        <div><div style={sLabel}>כתובת API של נדרים פלוס</div></div>
        <input style={{ ...sInput, direction: 'ltr', textAlign: 'left' }} value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://matara.pro/nedarimplus/..." />
      </div>
      <div style={{ ...sRow, borderBottom: '1px solid #f4f6fb' }}>
        <div><div style={sLabel}>קוד מוסד (MosadId)</div></div>
        <input style={{ ...sInput, direction: 'ltr', textAlign: 'left' }} value={mosadId} onChange={e => setMosadId(e.target.value)} placeholder="7011179" />
      </div>
      <div style={{ ...sRow, borderBottom: 'none' }}>
        <div><div style={sLabel}>קוד מאצ'ינג (MatchId)</div><div style={sSub}>נדרש רק לשליפת מגייסים ויעדים. אם אין לך, השאר ריק.</div></div>
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
          <div className="space-y-1.5"><Label>שם משתמש</Label>
            <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} dir="ltr" /></div>
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
  const { users, deleteUser, currentUser } = useStore();
  const [dlg, setDlg] = useState<{ open: boolean; edit?: User }>({ open: false });

  return (
    <div style={sCard}>
      <div style={sTitle}>👥 ניהול משתמשים</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setDlg({ open: true })} style={btnNavy}>👤+ הוספת משתמש חדש</button>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 160px', gap: 0, background: '#f8f9fd', borderRadius: 10, padding: '8px 12px', marginBottom: 4 }}>
        {['שם', 'שם משתמש', 'תפקיד', 'פעולות'].map(h => (
          <div key={h} style={{ fontSize: 11, fontWeight: 800, color: TH_COLOR, textAlign: 'right', fontFamily: "'Heebo', sans-serif" }}>{h}</div>
        ))}
      </div>

      {users.map(u => {
        const isMe = u.id === currentUser?.id;
        return (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 160px', gap: 0, alignItems: 'center', ...userRow }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: "'Heebo', sans-serif" }}>
              {u.name}{isMe && <span style={{ fontSize: 10, color: TH_COLOR, marginRight: 5 }}>אני</span>}
            </div>
            <div style={{ fontSize: 12, color: TH_COLOR, fontFamily: "'Heebo', sans-serif", direction: 'ltr', textAlign: 'right' }}>{u.username}</div>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Heebo', sans-serif", ...roleBadgeStyle(u.role) }}>
                {roleLabels[u.role]}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setDlg({ open: true, edit: u })} style={iconBtnStyle('#eef0fb', NAVY)}>✏️ עריכה</button>
              {!isMe && (
                <button onClick={() => { if (window.confirm(`למחוק את ${u.name}?`)) deleteUser(u.id); }} style={iconBtnStyle('#ffebee', '#e53935')}>🗑</button>
              )}
            </div>
          </div>
        );
      })}

      <UserDialog open={dlg.open} onClose={() => setDlg({ open: false })} editUser={dlg.edit} />
    </div>
  );
}

// ─── Suppliers Section ─────────────────────────────────────────────────────────
function SuppliersSection() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [dlg, setDlg] = useState<{ open: boolean; edit?: Supplier }>({ open: false });
  const [form, setForm] = useState({ name: '', type: 'purchase' as 'purchase' | 'commission', phone: '', contactInfo: '' });

  const openAdd  = () => { setForm({ name: '', type: 'purchase', phone: '', contactInfo: '' }); setDlg({ open: true }); };
  const openEdit = (s: Supplier) => { setForm({ name: s.name, type: s.type as 'purchase' | 'commission', phone: s.phone ?? '', contactInfo: s.contactInfo ?? '' }); setDlg({ open: true, edit: s }); };
  const handleSave = () => {
    if (!form.name.trim()) return;
    if (dlg.edit) updateSupplier(dlg.edit.id, form);
    else addSupplier(form);
    setDlg({ open: false });
  };

  return (
    <div style={sCard}>
      <div style={sTitle}>🏭 ניהול ספקים וסוכנים</div>
      <div style={{ marginBottom: 14 }}>
        <button onClick={openAdd} style={btnNavy}>+ הוסף ספק</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px', gap: 0, background: '#f8f9fd', borderRadius: 10, padding: '8px 12px', marginBottom: 4 }}>
        {['שם', 'טלפון', 'סוג', 'פעולות'].map(h => (
          <div key={h} style={{ fontSize: 11, fontWeight: 800, color: TH_COLOR, textAlign: 'right', fontFamily: "'Heebo', sans-serif" }}>{h}</div>
        ))}
      </div>

      {suppliers.map(s => (
        <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px', gap: 0, alignItems: 'center', ...userRow }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: "'Heebo', sans-serif" }}>{s.name}</div>
          <div style={{ fontSize: 12, color: TH_COLOR, fontFamily: "'Heebo', sans-serif", direction: 'ltr', textAlign: 'right' }}>{s.phone}</div>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Heebo', sans-serif",
              ...(s.type === 'commission' ? { background: '#f3e5f5', color: '#6a1b9a' } : { background: '#fff3e0', color: '#e65100' }) }}>
              {s.type === 'commission' ? 'קומיסיון' : 'קניה'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => openEdit(s)} style={iconBtnStyle('#eef0fb', NAVY)}>✏️</button>
            <button onClick={() => { if (window.confirm(`למחוק את ${s.name}?`)) deleteSupplier(s.id); }} style={iconBtnStyle('#ffebee', '#e53935')}>🗑</button>
          </div>
        </div>
      ))}

      {suppliers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: TH_COLOR, fontSize: 13, fontFamily: "'Heebo', sans-serif" }}>אין ספקים</div>
      )}

      <Dialog open={dlg.open} onOpenChange={o => !o && setDlg({ open: false })}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>🏭 {dlg.edit ? 'עריכת ספק' : 'הוספת ספק'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5"><Label>שם ספק</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="שם..." /></div>
            <div className="space-y-1.5"><Label>סוג</Label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'purchase' | 'commission' }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="purchase">קניה</option>
                <option value="commission">קומיסיון</option>
              </select></div>
            <div className="space-y-1.5"><Label>טלפון</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} dir="ltr" placeholder="050-..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlg({ open: false })}>ביטול</Button>
            <Button onClick={handleSave}>💾 {dlg.edit ? 'שמור' : 'הוסף ספק'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
          <span className="text-xl">⚠️</span>
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
        <div className="flex items-center gap-2 mb-2 text-destructive"><span className="text-xl">🔐</span><h2 className="text-lg font-bold">הזן קוד אישור מיוחד</h2></div>
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
    <div dir="rtl">
      <NedarimSettings />
      <UsersManagement />
      <SuppliersSection />
      <ResetSystem />
    </div>
  );
}
