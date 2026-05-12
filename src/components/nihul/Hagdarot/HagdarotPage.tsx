import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../../store/useStore';
import {
  Landmark, Save, Users, UserPlus, Pencil, Trash2,
  ShieldAlert, RotateCcw, AlertTriangle, Building2,
} from 'lucide-react';
import type { User, UserRole, Supplier } from '../../../types';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';

// ─── Role labels ───────────────────────────────────────────────────────────────
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
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Landmark className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">חיבור נדרים פלוס</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>שם החנות</Label>
          <Input
            value={settings.storeName}
            onChange={e => updateSettings({ storeName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>קוד מוסד</Label>
          <p className="text-xs text-muted-foreground">מזהה הישיבה בנדרים פלוס</p>
          <Input
            dir="ltr"
            value={mosadId}
            onChange={e => setMosadId(e.target.value)}
            placeholder="לדוגמה: 7011179"
          />
        </div>
        <div className="space-y-1.5">
          <Label>כתובת API</Label>
          <p className="text-xs text-muted-foreground">כתובת ה-API של נדרים פלוס</p>
          <Input
            dir="ltr"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="https://matara.pro/nedarimplus/..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>קוד מאצ'ינג</Label>
          <p className="text-xs text-muted-foreground">נדרש רק לשליפת מגייסים ויעדים. אם אין לך, השאר ריק.</p>
          <Input
            dir="ltr"
            value={matchId}
            onChange={e => setMatchId(e.target.value)}
            placeholder="מזהה התאמה (אופציונלי)"
          />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'שומר...' : saved ? '✓ נשמר!' : 'שמור הגדרות'}
        </Button>
      </div>
    </Card>
  );
}

// ─── User Dialog ───────────────────────────────────────────────────────────────
function UserDialog({
  open, onClose, editUser,
}: { open: boolean; onClose: () => void; editUser?: User }) {
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
          <DialogTitle className="flex items-center gap-2">
            {editUser
              ? <><Pencil className="w-5 h-5" /> עריכת משתמש</>
              : <><UserPlus className="w-5 h-5" /> הוספת משתמש חדש</>}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>שם מלא</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="שם..." />
          </div>
          <div className="space-y-1.5">
            <Label>תפקיד</Label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="admin">מנהל ראשי</option>
              <option value="manager">מנהל</option>
              <option value="kupa">קופה</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>שם משתמש</Label>
            <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>סיסמה</Label>
            <Input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="לפחות 4 תווים" />
          </div>
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

  const roleVariant = (role: UserRole): 'default' | 'secondary' | 'outline' => {
    if (role === 'admin')   return 'default';
    if (role === 'manager') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">ניהול משתמשים</h3>
        </div>
        <Button size="sm" onClick={() => setDlg({ open: true })} className="gap-1.5">
          <UserPlus className="w-4 h-4" /> הוסף משתמש
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">שם</TableHead>
            <TableHead className="text-right">משתמש</TableHead>
            <TableHead className="text-right">תפקיד</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => {
            const isMe = u.id === currentUser?.id;
            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.name}
                  {isMe && <span className="text-xs text-muted-foreground mr-1">אני</span>}
                </TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">{u.username}</TableCell>
                <TableCell>
                  <Badge variant={roleVariant(u.role)}>{roleLabels[u.role]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7"
                      onClick={() => setDlg({ open: true, edit: u })}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {!isMe && (
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => { if (window.confirm(`למחוק את ${u.name}?`)) deleteUser(u.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">אין משתמשים</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <UserDialog open={dlg.open} onClose={() => setDlg({ open: false })} editUser={dlg.edit} />
    </Card>
  );
}

// ─── Suppliers Section ─────────────────────────────────────────────────────────
function SuppliersSection() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [dlg,  setDlg]  = useState<{ open: boolean; edit?: Supplier }>({ open: false });
  const [form, setForm] = useState({ name: '', type: 'purchase' as 'purchase' | 'commission', phone: '', contactInfo: '' });

  const openAdd  = () => { setForm({ name: '', type: 'purchase', phone: '', contactInfo: '' }); setDlg({ open: true }); };
  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, type: s.type as 'purchase' | 'commission', phone: s.phone ?? '', contactInfo: s.contactInfo ?? '' });
    setDlg({ open: true, edit: s });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (dlg.edit) updateSupplier(dlg.edit.id, form);
    else addSupplier(form);
    setDlg({ open: false });
  };

  return (
    <>
      <Card className="p-4 shadow-soft">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">ניהול ספקים וסוכנים</h3>
          </div>
          <Button size="sm" onClick={openAdd} className="gap-1.5">
            <Building2 className="w-4 h-4" /> הוסף ספק
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">טלפון</TableHead>
              <TableHead className="text-right">סוג</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground" dir="ltr">{s.phone}</TableCell>
                <TableCell>
                  <Badge variant={s.type === 'commission' ? 'secondary' : 'outline'}>
                    {s.type === 'commission' ? 'קומיסיון' : 'קניה'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => { if (window.confirm(`למחוק את ${s.name}?`)) deleteSupplier(s.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">אין ספקים</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dlg.open} onOpenChange={o => !o && setDlg({ open: false })}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" /> {dlg.edit ? 'עריכת ספק' : 'הוספת ספק'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label>שם ספק</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="שם..." />
            </div>
            <div className="space-y-1.5">
              <Label>סוג</Label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as 'purchase' | 'commission' }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="purchase">קניה</option>
                <option value="commission">קומיסיון</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>טלפון</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} dir="ltr" placeholder="050-..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlg({ open: false })}>ביטול</Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> {dlg.edit ? 'שמור' : 'הוסף ספק'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Reset System (5-step + 60s countdown, matches Lovable exactly) ───────────
const RESET_CODE = 'RESET-7777';
const COUNTDOWN_SECONDS = 60;
type ResetStep = 'idle' | 'confirm1' | 'confirm2' | 'code' | 'confirm3' | 'countdown' | 'resetting';

function ResetSystem() {
  const [step,        setStep]        = useState<ResetStep>('idle');
  const [codeInput,   setCodeInput]   = useState('');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancelReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setStep('idle');
    setCodeInput('');
    setSecondsLeft(COUNTDOWN_SECONDS);
  }, []);

  const startCountdown = useCallback(() => {
    setStep('countdown');
    setSecondsLeft(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (step === 'countdown' && secondsLeft === 0) performReset();
  }, [step, secondsLeft]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const performReset = () => {
    setStep('resetting');
    localStorage.clear();
    setTimeout(() => window.location.reload(), 1500);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * 100;

  const Overlay = ({ open, children }: { open: boolean; children: React.ReactNode }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80" />
        <div className="relative z-50 bg-background rounded-lg shadow-lg border p-6 w-full max-w-md mx-4" dir="rtl" onClick={e => e.stopPropagation()}>
          {children}
        </div>
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

      {/* Step 1 */}
      <Overlay open={step === 'confirm1'}>
        <div className="flex items-center gap-2 mb-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-bold">האם אתה בטוח?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          פעולה זו תמחק את <strong>כל הנתונים</strong> במערכת — מוצרים, הזמנות, מכירות, חיובים והגדרות.
          לא ניתן לשחזר את הנתונים לאחר האיפוס.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setStep('idle')}>ביטול</Button>
          <Button variant="destructive" onClick={() => setStep('confirm2')}>כן, אני בטוח</Button>
        </div>
      </Overlay>

      {/* Step 2 */}
      <Overlay open={step === 'confirm2'}>
        <div className="flex items-center gap-2 mb-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-bold">האם אתה באמת בטוח?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          זוהי אזהרה אחרונה. כל הנתונים יימחקו לצמיתות. אין דרך חזרה!
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setStep('idle')}>ביטול</Button>
          <Button variant="destructive" onClick={() => setStep('code')}>כן, אני באמת בטוח</Button>
        </div>
      </Overlay>

      {/* Step 3: Code entry */}
      <Overlay open={step === 'code'}>
        <div className="flex items-center gap-2 mb-2 text-destructive">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-lg font-bold">הזן קוד אישור מיוחד</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          כדי לאשר את האיפוס, הזן את הקוד:{' '}
          <strong className="text-foreground font-mono text-lg">{RESET_CODE}</strong>
        </p>
        <Input
          dir="ltr"
          value={codeInput}
          onChange={e => setCodeInput(e.target.value.toUpperCase())}
          placeholder="הזן קוד אישור..."
          className="text-center font-mono text-lg tracking-widest mb-4"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setStep('idle'); setCodeInput(''); }}>ביטול</Button>
          <Button
            variant="destructive"
            disabled={!codeInput.trim()}
            onClick={() => {
              if (codeInput.trim() === RESET_CODE) setStep('confirm3');
              else { setCodeInput(''); }
            }}
          >
            אישור
          </Button>
        </div>
      </Overlay>

      {/* Step 4: Final confirm */}
      <Overlay open={step === 'confirm3'}>
        <div className="flex items-center gap-2 mb-2 text-destructive">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-lg font-bold">אישור סופי — אתה בטוח?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          לאחר לחיצה על "התחל איפוס" תתחיל ספירה לאחור של דקה אחת.
          תוכל לבטל את האיפוס בכל רגע במהלך הספירה לאחור.
          לאחר סיום הספירה — כל הנתונים יימחקו לצמיתות.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { setStep('idle'); setCodeInput(''); }}>ביטול</Button>
          <Button variant="destructive" onClick={startCountdown}>התחל איפוס</Button>
        </div>
      </Overlay>

      {/* Step 5: Countdown */}
      <Overlay open={step === 'countdown' || step === 'resetting'}>
        <div className="text-center">
          <h2 className="text-lg font-bold text-destructive flex items-center justify-center gap-2 mb-6">
            {step === 'resetting' ? (
              <><RotateCcw className="w-6 h-6 animate-spin" />מאפס את המערכת...</>
            ) : (
              <><AlertTriangle className="w-6 h-6 animate-pulse" />המערכת תאופס בעוד</>
            )}
          </h2>

          {step === 'countdown' && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke="hsl(var(--destructive))"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold font-mono text-destructive">
                    {fmtTime(secondsLeft)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">לחץ על "בטל איפוס" כדי לעצור את התהליך</p>
              <Button
                variant="outline"
                size="lg"
                onClick={cancelReset}
                className="w-full border-primary text-primary hover:bg-primary/10 text-lg font-bold"
              >
                ❌ בטל איפוס
              </Button>
            </div>
          )}

          {step === 'resetting' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <RotateCcw className="w-12 h-12 text-destructive animate-spin" />
              <p className="text-muted-foreground">מוחק את כל הנתונים...</p>
            </div>
          )}
        </div>
      </Overlay>
    </>
  );
}

type HagTab = 'nedarim' | 'users' | 'suppliers';

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HagdarotPage() {
  const [active, setActive] = useState<HagTab>('nedarim');

  const hagTabs: { value: HagTab; emoji: string; label: string }[] = [
    { value: 'nedarim',   emoji: '🔗', label: 'נדרים פלוס' },
    { value: 'users',     emoji: '👥', label: 'משתמשים'    },
    { value: 'suppliers', emoji: '🏭', label: 'ספקים'       },
  ];

  return (
    <div className="max-w-5xl mx-auto" dir="rtl">

      {/* ── Section selector ── */}
      <div style={{
        background: '#eef0f8', borderRadius: 16, padding: 5,
        width: 'fit-content', marginBottom: 20,
        display: 'flex', gap: 4,
      }}>
        {hagTabs.map(t => (
          <button
            key={t.value}
            onClick={() => setActive(t.value)}
            style={{
              padding: '8px 20px', borderRadius: 12, border: 'none',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all .2s', fontFamily: "'Heebo', sans-serif",
              background: active === t.value ? '#fff'    : 'transparent',
              color:      active === t.value ? '#1a1a2e' : '#9fa8da',
              boxShadow:  active === t.value ? '0 2px 8px rgba(30,49,102,0.12)' : 'none',
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {active === 'nedarim'   && <NedarimSettings />}
      {active === 'users'     && <UsersManagement />}
      {active === 'suppliers' && <SuppliersSection />}

    </div>
  );
}
